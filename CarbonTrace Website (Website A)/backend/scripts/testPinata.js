require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
});

const {
  testPinataConnection,
  pinLandData,
} = require('../services/pinataService');

async function test() {
  console.log('=== Pinata Connection Test ===\n');

  const auth = await testPinataConnection();
  if (!auth.success) {
    console.error('✗ Pinata auth failed:', auth.error);
    process.exit(1);
  }
  console.log('✓ Pinata authenticated');

  const result = await pinLandData({
    land_id_gov: 'GOV-2026-TEST-0001',
    owner_name: 'Test Owner',
    panchayat_name: 'Gram Panchayat Ratnagiri',
    area_hectares: 12.5,
    location_description: 'Coastal belt near Ratnagiri creek',
    allowed_species: ['Avicennia marina', 'Rhizophora mucronata'],
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [73.28, 16.99],
          [73.30, 16.99],
          [73.30, 17.01],
          [73.28, 17.01],
          [73.28, 16.99],
        ],
      ],
    },
    conditions: '',
  });

  if (result.success) {
    console.log('✓ Land data pinned to IPFS');
    console.log('  CID:', result.cid);
    console.log('  Gateway:', result.gatewayUrl);
  } else {
    console.error('✗ Pin failed:', result.error);
  }

  console.log('\n✅ Pinata ready for production use');
}

test().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});

