/**
 * Bhuvan NDVI API Routes
 * 
 * Endpoints for satellite-based vegetation monitoring using ISRO Bhuvan
 */
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getBhuvanService } = require('../services/bhuvanService');

// Lazy-load models
const getModels = () => {
  try { return require('../models'); } catch { return null; }
};

/**
 * GET /api/bhuvan/ndvi/:landId
 * Fetch live NDVI data from Bhuvan for a specific land parcel
 */
router.get('/ndvi/:landId', authenticate, async (req, res) => {
  try {
    const db = getModels();
    const bhuvan = getBhuvanService();

    if (!db) return res.status(503).json({ message: 'Database not available' });
    if (!bhuvan) return res.status(503).json({ message: 'Bhuvan API key not configured' });

    const land = await db.RegisteredLand.findByPk(req.params.landId);
    if (!land) return res.status(404).json({ message: 'Land parcel not found' });

    const geojson = typeof land.polygon_geojson === 'string'
      ? JSON.parse(land.polygon_geojson) : land.polygon_geojson;

    console.log(`[BHUVAN] Scanning NDVI for land ${land.land_id_gov}...`);
    const result = await bhuvan.calculateMeanNdvi(geojson, 3);

    // Store the reading in the database
    if (result.meanNdvi !== null) {
      // Get previous NDVI for comparison
      const lastRecord = await db.NdviRecord.findOne({
        where: { land_id: land.id },
        order: [['recorded_at', 'DESC']],
      });

      const previousNdvi = lastRecord ? parseFloat(lastRecord.ndvi_value) : null;
      const greeneryIncrease = previousNdvi
        ? ((result.meanNdvi - previousNdvi) / previousNdvi * 100).toFixed(2)
        : 0;

      await db.NdviRecord.create({
        land_id: land.id,
        ndvi_value: result.meanNdvi,
        recorded_at: new Date(),
        satellite_source: 'ISRO_BHUVAN',
        greenery_increase_percent: greeneryIncrease,
      });

      console.log(`[BHUVAN] NDVI=${result.meanNdvi} for ${land.land_id_gov} (change: ${greeneryIncrease}%)`);
    }

    res.json({
      landId: land.land_id_gov,
      ...result,
    });
  } catch (err) {
    console.error('[BHUVAN] NDVI scan error:', err.message);
    res.status(500).json({ message: 'NDVI scan failed', error: err.message });
  }
});

/**
 * POST /api/bhuvan/scan-all
 * Trigger a full NDVI scan for all registered land parcels
 * GOV-only endpoint (admin action)
 */
router.post('/scan-all', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  try {
    const db = getModels();
    const bhuvan = getBhuvanService();

    if (!db) return res.status(503).json({ message: 'Database not available' });
    if (!bhuvan) return res.status(503).json({ message: 'Bhuvan API key not configured' });

    const lands = await db.RegisteredLand.findAll({ where: { status: ['ACTIVE', 'VERIFIED'] } });
    console.log(`[BHUVAN] Starting full scan for ${lands.length} land parcels...`);

    const results = [];
    for (const land of lands) {
      try {
        const geojson = typeof land.polygon_geojson === 'string'
          ? JSON.parse(land.polygon_geojson) : land.polygon_geojson;

        const ndviResult = await bhuvan.calculateMeanNdvi(geojson, 2); // Smaller grid for batch

        if (ndviResult.meanNdvi !== null) {
          const lastRecord = await db.NdviRecord.findOne({
            where: { land_id: land.id },
            order: [['recorded_at', 'DESC']],
          });

          const previousNdvi = lastRecord ? parseFloat(lastRecord.ndvi_value) : null;
          const change = previousNdvi
            ? ((ndviResult.meanNdvi - previousNdvi) / previousNdvi * 100).toFixed(2)
            : 0;

          await db.NdviRecord.create({
            land_id: land.id,
            ndvi_value: ndviResult.meanNdvi,
            recorded_at: new Date(),
            satellite_source: 'ISRO_BHUVAN',
            greenery_increase_percent: change,
          });

          results.push({
            landId: land.land_id_gov,
            ndvi: ndviResult.meanNdvi,
            change: `${change}%`,
            status: 'success',
          });
        } else {
          results.push({ landId: land.land_id_gov, status: 'no_data' });
        }
      } catch (err) {
        results.push({ landId: land.land_id_gov, status: 'error', error: err.message });
      }
    }

    const successful = results.filter((r) => r.status === 'success').length;
    console.log(`[BHUVAN] Scan complete: ${successful}/${lands.length} successful`);

    res.json({
      totalScanned: lands.length,
      successful,
      results,
      scannedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[BHUVAN] Full scan error:', err.message);
    res.status(500).json({ message: 'Full scan failed', error: err.message });
  }
});

/**
 * GET /api/bhuvan/ndvi-image/:landId
 * Get NDVI satellite imagery (PNG) for a specific land parcel
 */
router.get('/ndvi-image/:landId', authenticate, async (req, res) => {
  try {
    const db = getModels();
    const bhuvan = getBhuvanService();

    if (!db) return res.status(503).json({ message: 'Database not available' });
    if (!bhuvan) return res.status(503).json({ message: 'Bhuvan API key not configured' });

    const land = await db.RegisteredLand.findByPk(req.params.landId);
    if (!land) return res.status(404).json({ message: 'Land parcel not found' });

    const geojson = typeof land.polygon_geojson === 'string'
      ? JSON.parse(land.polygon_geojson) : land.polygon_geojson;

    const { image, contentType } = await bhuvan.getNdviMapImage(geojson);
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(image));
  } catch (err) {
    console.error('[BHUVAN] NDVI image error:', err.message);
    res.status(500).json({ message: 'Failed to fetch NDVI image', error: err.message });
  }
});

/**
 * GET /api/bhuvan/tile-url
 * Get the Bhuvan WMS tile URL for frontend Leaflet usage
 */
router.get('/tile-url', authenticate, (req, res) => {
  const bhuvan = getBhuvanService();
  if (!bhuvan) return res.status(503).json({ message: 'Bhuvan API key not configured' });

  res.json({
    baseMapTileUrl: bhuvan.getTileUrl(),
    ndviOverlayUrl: bhuvan.getNdviTileUrl(),
  });
});

/**
 * GET /api/bhuvan/status
 * Check Bhuvan service availability
 */
router.get('/status', authenticate, async (req, res) => {
  const bhuvan = getBhuvanService();
  if (!bhuvan) {
    return res.json({ status: 'unconfigured', message: 'BHUVAN_API_KEY not set' });
  }

  try {
    await bhuvan.getCapabilities();
    res.json({ status: 'connected', source: 'ISRO Bhuvan WMS', apiKeyPresent: true });
  } catch (err) {
    res.json({ status: 'error', message: err.message, apiKeyPresent: true });
  }
});

module.exports = router;
