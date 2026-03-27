/**
 * Bhuvan NDVI Service
 * 
 * Integrates with ISRO Bhuvan's OGC WMS/WCS endpoints to fetch
 * satellite-based NDVI (Normalized Difference Vegetation Index)
 * for registered land parcels.
 * 
 * Bhuvan WMS endpoint: https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms
 * Bhuvan Thematic WMS: https://bhuvan-ras2.nrsc.gov.in/cgi-bin/mapserv
 * 
 * NDVI Layers available:
 * - ndvi:ndvi_india    (National NDVI composite)
 * - lulc:bhuvan_lulc   (Land use / land cover)
 */

const axios = require('axios');

// Bhuvan WMS base URLs
const BHUVAN_WMS_BASE = 'https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms';
const BHUVAN_RASTER_BASE = 'https://bhuvan-ras2.nrsc.gov.in/cgi-bin/mapserv';

class BhuvanService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Accept': 'application/json, image/png, application/xml',
      },
    });
  }

  /**
   * Calculate bounding box from GeoJSON polygon coordinates
   */
  getBoundingBox(geojson) {
    let polygon;
    try {
      polygon = typeof geojson === 'string' ? JSON.parse(geojson) : geojson;
    } catch { return null; }

    const coords = polygon.coordinates?.[0];
    if (!coords?.length) return null;

    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    for (const [lng, lat] of coords) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }

    // Add small buffer around the bbox (0.01 degrees ≈ 1.1km)
    const buffer = 0.01;
    return {
      minLng: minLng - buffer,
      minLat: minLat - buffer,
      maxLng: maxLng + buffer,
      maxLat: maxLat + buffer,
      bbox: `${minLng - buffer},${minLat - buffer},${maxLng + buffer},${maxLat + buffer}`,
    };
  }

  /**
   * Get NDVI WMS map image for a land parcel
   * Returns a PNG image buffer of the NDVI visualization
   */
  async getNdviMapImage(geojson, width = 512, height = 512) {
    const bb = this.getBoundingBox(geojson);
    if (!bb) throw new Error('Invalid GeoJSON for bounding box calculation');

    const params = {
      service: 'WMS',
      version: '1.1.1',
      request: 'GetMap',
      layers: 'ndvi:ndvi_india',
      styles: '',
      srs: 'EPSG:4326',
      bbox: bb.bbox,
      width,
      height,
      format: 'image/png',
      transparent: true,
      token: this.apiKey,
    };

    try {
      const response = await this.client.get(BHUVAN_WMS_BASE, {
        params,
        responseType: 'arraybuffer',
      });
      return {
        image: response.data,
        contentType: 'image/png',
        bbox: bb,
      };
    } catch (err) {
      console.error('[BHUVAN] WMS GetMap failed:', err.message);
      throw new Error(`Bhuvan WMS request failed: ${err.message}`);
    }
  }

  /**
   * Get NDVI value for a specific geographic point
   * Uses WMS GetFeatureInfo to query the NDVI raster value
   */
  async getNdviAtPoint(lng, lat) {
    const buffer = 0.005;
    const params = {
      service: 'WMS',
      version: '1.1.1',
      request: 'GetFeatureInfo',
      layers: 'ndvi:ndvi_india',
      query_layers: 'ndvi:ndvi_india',
      info_format: 'application/json',
      srs: 'EPSG:4326',
      bbox: `${lng - buffer},${lat - buffer},${lng + buffer},${lat + buffer}`,
      width: 101,
      height: 101,
      x: 50,
      y: 50,
      token: this.apiKey,
    };

    try {
      const response = await this.client.get(BHUVAN_WMS_BASE, { params });
      const features = response.data?.features;
      if (features?.length) {
        const ndviValue = features[0]?.properties?.GRAY_INDEX
          || features[0]?.properties?.ndvi
          || features[0]?.properties?.value;
        return {
          ndvi: ndviValue ? parseFloat(ndviValue) / 255 : null, // Normalize 0-255 to 0-1
          raw: features[0]?.properties,
          source: 'ISRO_BHUVAN',
          queriedAt: new Date().toISOString(),
        };
      }
      return { ndvi: null, raw: null, source: 'ISRO_BHUVAN', queriedAt: new Date().toISOString() };
    } catch (err) {
      console.error('[BHUVAN] GetFeatureInfo failed:', err.message);
      return { ndvi: null, error: err.message, source: 'ISRO_BHUVAN', queriedAt: new Date().toISOString() };
    }
  }

  /**
   * Calculate mean NDVI for a polygon by sampling multiple points
   * Samples a grid of points within the bounding box and averages NDVI values
   */
  async calculateMeanNdvi(geojson, gridSize = 3) {
    const bb = this.getBoundingBox(geojson);
    if (!bb) throw new Error('Invalid GeoJSON');

    const lngStep = (bb.maxLng - bb.minLng) / (gridSize + 1);
    const latStep = (bb.maxLat - bb.minLat) / (gridSize + 1);
    const points = [];

    for (let i = 1; i <= gridSize; i++) {
      for (let j = 1; j <= gridSize; j++) {
        points.push({
          lng: bb.minLng + lngStep * i,
          lat: bb.minLat + latStep * j,
        });
      }
    }

    // Query points in parallel (max 3 concurrent)
    const results = [];
    for (let i = 0; i < points.length; i += 3) {
      const batch = points.slice(i, i + 3);
      const batchResults = await Promise.allSettled(
        batch.map((p) => this.getNdviAtPoint(p.lng, p.lat))
      );
      batchResults.forEach((r) => {
        if (r.status === 'fulfilled' && r.value?.ndvi !== null) {
          results.push(r.value.ndvi);
        }
      });
    }

    if (results.length === 0) {
      return {
        meanNdvi: null,
        sampledPoints: points.length,
        successfulSamples: 0,
        source: 'ISRO_BHUVAN',
        calculatedAt: new Date().toISOString(),
      };
    }

    const mean = results.reduce((s, v) => s + v, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);

    return {
      meanNdvi: parseFloat(mean.toFixed(4)),
      minNdvi: parseFloat(min.toFixed(4)),
      maxNdvi: parseFloat(max.toFixed(4)),
      sampledPoints: points.length,
      successfulSamples: results.length,
      source: 'ISRO_BHUVAN',
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get WMS capabilities — useful for discovering available layers
   */
  async getCapabilities() {
    const params = {
      service: 'WMS',
      version: '1.1.1',
      request: 'GetCapabilities',
      token: this.apiKey,
    };

    try {
      const response = await this.client.get(BHUVAN_WMS_BASE, { params });
      return response.data;
    } catch (err) {
      console.error('[BHUVAN] GetCapabilities failed:', err.message);
      throw err;
    }
  }

  /**
   * Generate Bhuvan WMS tile URL for frontend Leaflet integration
   */
  getTileUrl() {
    return `https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms?service=WMS&version=1.1.1&request=GetMap&layers=india3&srs=EPSG:4326&bbox={bbox}&width=256&height=256&format=image/png&transparent=true&token=${this.apiKey}`;
  }

  /**
   * Generate NDVI overlay tile URL for Leaflet
   */
  getNdviTileUrl() {
    return `https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms?service=WMS&version=1.1.1&request=GetMap&layers=ndvi:ndvi_india&srs=EPSG:4326&bbox={bbox}&width=256&height=256&format=image/png&transparent=true&token=${this.apiKey}`;
  }
}

// Singleton instance
let instance = null;

function getBhuvanService() {
  if (!instance) {
    const apiKey = process.env.BHUVAN_API_KEY;
    if (!apiKey) {
      console.warn('[BHUVAN] No API key found in BHUVAN_API_KEY env var');
      return null;
    }
    instance = new BhuvanService(apiKey);
  }
  return instance;
}

module.exports = { BhuvanService, getBhuvanService };
