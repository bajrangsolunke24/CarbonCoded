'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/** Hash an Aadhaar number — never store raw */
const aadhaarHash = (num) => crypto.createHash('sha256').update(num).digest('hex');

module.exports = {
  async up(queryInterface) {
    const hash = (pw) => bcrypt.hashSync(pw, 10);
    const now = new Date();

    // ─── 1. Government Users (3) ──────────────────────────────────────────────
    await queryInterface.bulkInsert('government_users', [
      { id: 1, name: 'Rajesh Kumar', email: 'rajesh@gov.in', password_hash: hash('admin123'), role: 'GOVERNMENT', district: 'Mumbai', state: 'Maharashtra', created_at: now, updated_at: now },
      { id: 2, name: 'Priya Nair', email: 'priya@gov.in', password_hash: hash('admin123'), role: 'GOVERNMENT', district: 'Thiruvananthapuram', state: 'Kerala', created_at: now, updated_at: now },
      { id: 3, name: 'Amit Shah', email: 'amit@gov.in', password_hash: hash('admin123'), role: 'GOVERNMENT', district: 'Ahmedabad', state: 'Gujarat', created_at: now, updated_at: now },
    ]);

    // ─── 2. NGO Users (5) ─────────────────────────────────────────────────────
    await queryInterface.bulkInsert('ngo_users', [
      { id: 1, name: 'Shankar Iyer', email: 'coastal@ngo.in', password_hash: hash('ngo123'), org_name: 'Coastal Green Foundation', bank_account: '9876543210123456', ifsc: 'SBIN0001234', created_at: now, updated_at: now },
      { id: 2, name: 'Meera Deshmukh', email: 'mangrove@ngo.in', password_hash: hash('ngo123'), org_name: 'Mangrove Mission India', bank_account: '8765432109876543', ifsc: 'HDFC0002345', created_at: now, updated_at: now },
      { id: 3, name: 'Arjun Rao', email: 'ecorestore@ngo.in', password_hash: hash('ngo123'), org_name: 'EcoRestore NGO', bank_account: '7654321098765432', ifsc: 'ICIC0003456', created_at: now, updated_at: now },
      { id: 4, name: 'Fatima Khan', email: 'bluecarbon@ngo.in', password_hash: hash('ngo123'), org_name: 'Blue Carbon Trust', bank_account: '6543210987654321', ifsc: 'AXIS0004567', created_at: now, updated_at: now },
      { id: 5, name: 'Vikram Joshi', email: 'vanaraksha@ngo.in', password_hash: hash('ngo123'), org_name: 'VanaRaksha Society', bank_account: '5432109876543210', ifsc: 'BARB0005678', created_at: now, updated_at: now },
    ]);

    // ─── 3. Panchayat Users (8) ───────────────────────────────────────────────
    await queryInterface.bulkInsert('panchayat_users', [
      { id: 1, name: 'Gram Panchayat Ratnagiri', email: 'ratnagiri@panch.in', password_hash: hash('panch123'), village: 'Ratnagiri', taluka: 'Ratnagiri', district: 'Ratnagiri', bank_account: '1111222233334444', ifsc: 'SBIN0006789', created_at: now, updated_at: now },
      { id: 2, name: 'Gram Panchayat Sindhudurg', email: 'sindhudurg@panch.in', password_hash: hash('panch123'), village: 'Malvan', taluka: 'Malvan', district: 'Sindhudurg', bank_account: '2222333344445555', ifsc: 'SBIN0007890', created_at: now, updated_at: now },
      { id: 3, name: 'Gram Panchayat Kannur', email: 'kannur@panch.in', password_hash: hash('panch123'), village: 'Payyannur', taluka: 'Payyannur', district: 'Kannur', bank_account: '3333444455556666', ifsc: 'FDRL0008901', created_at: now, updated_at: now },
      { id: 4, name: 'Gram Panchayat Kasaragod', email: 'kasaragod@panch.in', password_hash: hash('panch123'), village: 'Manjeshwar', taluka: 'Manjeshwar', district: 'Kasaragod', bank_account: '4444555566667777', ifsc: 'FDRL0009012', created_at: now, updated_at: now },
      { id: 5, name: 'Gram Panchayat Kutch', email: 'kutch@panch.in', password_hash: hash('panch123'), village: 'Mandvi', taluka: 'Mandvi', district: 'Kutch', bank_account: '5555666677778888', ifsc: 'BARB0010123', created_at: now, updated_at: now },
      { id: 6, name: 'Gram Panchayat Surat', email: 'surat@panch.in', password_hash: hash('panch123'), village: 'Hazira', taluka: 'Choryasi', district: 'Surat', bank_account: '6666777788889999', ifsc: 'BARB0011234', created_at: now, updated_at: now },
      { id: 7, name: 'Gram Panchayat Alibaug', email: 'alibaug@panch.in', password_hash: hash('panch123'), village: 'Alibaug', taluka: 'Alibaug', district: 'Raigad', bank_account: '7777888899990000', ifsc: 'SBIN0012345', created_at: now, updated_at: now },
      { id: 8, name: 'Gram Panchayat Murud', email: 'murud@panch.in', password_hash: hash('panch123'), village: 'Murud', taluka: 'Murud', district: 'Raigad', bank_account: '8888999900001111', ifsc: 'SBIN0013456', created_at: now, updated_at: now },
    ]);

    // ─── 4. Land Requests (10 — all APPROVED for seeding) ─────────────────────
    const landRequests = [];
    const owners = [
      { name: 'Ramesh Patil', aadhaar: '123456789012', area: 12.5, loc: 'Coastal belt near Ratnagiri creek', pid: 1 },
      { name: 'Suresh Naik', aadhaar: '234567890123', area: 8.3, loc: 'Mangrove zone Sindhudurg shore', pid: 2 },
      { name: 'Lakshmi Menon', aadhaar: '345678901234', area: 15.0, loc: 'Payyannur backwater mangroves', pid: 3 },
      { name: 'Abdul Rashid', aadhaar: '456789012345', area: 6.7, loc: 'Manjeshwar tidal forest area', pid: 4 },
      { name: 'Bharat Solanki', aadhaar: '567890123456', area: 20.0, loc: 'Mandvi coastal salt marsh', pid: 5 },
      { name: 'Jaya Patel', aadhaar: '678901234567', area: 11.2, loc: 'Hazira creek mangrove belt', pid: 6 },
      { name: 'Manoj Sawant', aadhaar: '789012345678', area: 9.8, loc: 'Alibaug south coast tidal zone', pid: 7 },
      { name: 'Sunita Jadhav', aadhaar: '890123456789', area: 14.5, loc: 'Murud-Janjira mangrove stretch', pid: 8 },
      { name: 'Ganesh Shetty', aadhaar: '901234567890', area: 7.4, loc: 'Ratnagiri north mangrove patch', pid: 1 },
      { name: 'Kavita Nair', aadhaar: '012345678901', area: 18.6, loc: 'Kannur estuary mangrove zone', pid: 3 },
    ];
    for (let i = 0; i < owners.length; i++) {
      landRequests.push({
        id: i + 1,
        panchayat_id: owners[i].pid,
        owner_name: owners[i].name,
        owner_aadhaar_hash: aadhaarHash(owners[i].aadhaar),
        area_hectares: owners[i].area,
        location_description: owners[i].loc,
        status: 'APPROVED',
        created_at: new Date(now.getTime() - (30 - i) * 86400000),
        updated_at: now,
      });
    }
    await queryInterface.bulkInsert('land_requests', landRequests);

    // ─── 5. Registered Lands (10) — with real-looking coastal GeoJSON ─────────
    const states = ['MH', 'MH', 'KL', 'KL', 'GJ', 'GJ', 'MH', 'MH', 'MH', 'KL'];
    const coords = [
      [[73.28, 16.99], [73.30, 16.99], [73.30, 17.01], [73.28, 17.01], [73.28, 16.99]],     // Ratnagiri
      [[73.45, 16.02], [73.47, 16.02], [73.47, 16.04], [73.45, 16.04], [73.45, 16.02]],     // Sindhudurg
      [[75.20, 12.02], [75.22, 12.02], [75.22, 12.04], [75.20, 12.04], [75.20, 12.02]],     // Kannur
      [[75.06, 12.50], [75.08, 12.50], [75.08, 12.52], [75.06, 12.52], [75.06, 12.50]],     // Kasaragod
      [[69.35, 22.83], [69.37, 22.83], [69.37, 22.85], [69.35, 22.85], [69.35, 22.83]],     // Kutch
      [[72.63, 21.10], [72.65, 21.10], [72.65, 21.12], [72.63, 21.12], [72.63, 21.10]],     // Surat
      [[72.87, 18.64], [72.89, 18.64], [72.89, 18.66], [72.87, 18.66], [72.87, 18.64]],     // Alibaug
      [[73.02, 18.32], [73.04, 18.32], [73.04, 18.34], [73.02, 18.34], [73.02, 18.32]],     // Murud
      [[73.32, 17.05], [73.34, 17.05], [73.34, 17.07], [73.32, 17.07], [73.32, 17.05]],     // Ratnagiri N
      [[75.35, 11.87], [75.37, 11.87], [75.37, 11.89], [75.35, 11.89], [75.35, 11.87]],     // Kannur S
    ];
    const speciesList = [
      ['Avicennia marina', 'Rhizophora mucronata'],
      ['Sonneratia alba', 'Avicennia marina'],
      ['Rhizophora mucronata', 'Bruguiera gymnorrhiza'],
      ['Avicennia officinalis', 'Ceriops tagal'],
      ['Avicennia marina', 'Salicornia brachiata'],
      ['Rhizophora mucronata', 'Avicennia marina', 'Teak'],
      ['Avicennia marina', 'Bamboo'],
      ['Sonneratia caseolaris', 'Avicennia marina'],
      ['Rhizophora apiculata', 'Avicennia marina'],
      ['Bruguiera cylindrica', 'Rhizophora mucronata', 'Avicennia marina'],
    ];
    const statuses = ['ACTIVE', 'VERIFIED', 'ACTIVE', 'VERIFIED', 'ACTIVE', 'PENDING_VERIFICATION', 'ACTIVE', 'VERIFIED', 'ACTIVE', 'VERIFIED'];

    const registeredLands = coords.map((c, i) => ({
      id: i + 1,
      land_id_gov: `GOV-2024-${states[i]}-${String(i + 1).padStart(4, '0')}`,
      land_request_id: i + 1,
      polygon_geojson: JSON.stringify({ type: 'Polygon', coordinates: [c] }),
      plantation_doc_cid: `QmFake${crypto.randomBytes(20).toString('hex').slice(0, 40)}`,
      allowed_species: `{${speciesList[i].map(s => `"${s}"`).join(',')}}`,
      conditions: 'Maintain minimum 70% canopy cover. No commercial logging. Annual survival audit required.',
      blockchain_hash: `0x${crypto.randomBytes(32).toString('hex')}`,
      status: statuses[i],
      created_at: new Date(now.getTime() - (25 - i) * 86400000),
      updated_at: now,
    }));
    await queryInterface.bulkInsert('registered_lands', registeredLands);

    // ─── 6. NDVI Records (20 — 2 per land, showing improvement) ──────────────
    const ndviRecords = [];
    let ndviId = 1;
    for (let landIdx = 0; landIdx < 10; landIdx++) {
      const baseNdvi = 0.18 + Math.random() * 0.12;
      for (let m = 0; m < 2; m++) {
        const ndvi = baseNdvi + m * (0.15 + Math.random() * 0.2);
        ndviRecords.push({
          id: ndviId++,
          land_id: landIdx + 1,
          ndvi_value: Math.min(ndvi, 0.85).toFixed(4),
          recorded_at: new Date(now.getTime() - (12 - m * 6) * 30 * 86400000),
          satellite_source: 'ISRO_BHUVAN',
          greenery_increase_percent: m === 0 ? 0 : ((ndvi - baseNdvi) / baseNdvi * 100).toFixed(2),
          created_at: now,
          updated_at: now,
        });
      }
    }
    await queryInterface.bulkInsert('ndvi_records', ndviRecords);

    // ─── 7. Carbon Credit Count (shared) ──────────────────────────────────────
    await queryInterface.bulkInsert('carbon_credit_count', [{
      id: 1,
      total_issued: 45230,
      total_available: 12800,
      total_sold: 32430,
      last_updated: now,
      created_at: now,
      updated_at: now,
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('carbon_credit_count', null, {});
    await queryInterface.bulkDelete('ndvi_records', null, {});
    await queryInterface.bulkDelete('registered_lands', null, {});
    await queryInterface.bulkDelete('land_requests', null, {});
    await queryInterface.bulkDelete('panchayat_users', null, {});
    await queryInterface.bulkDelete('ngo_users', null, {});
    await queryInterface.bulkDelete('government_users', null, {});
  },
};
