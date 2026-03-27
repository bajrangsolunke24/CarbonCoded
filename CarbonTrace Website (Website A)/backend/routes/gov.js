const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();
const { authenticate, authorize, generateToken, generateRefreshToken } = require('../middleware/auth');
const {
  registerLandOnChain,
  issueCreditsOnChain,
  fetchOnChainEvents
} = require('../services/blockchainService');
const {
  pinLandData,
  pinCreditIssuanceData,
} = require('../services/pinataService');
const fs = require('fs');
const FormData = require('form-data');
const upload = require('../middleware/upload');

// Lazy-load models (only when DB is available)
const getModels = () => {
  try { return require('../models'); } catch { return null; }
};

// ─── Auth: Login for GOVERNMENT, NGO, PANCHAYAT ────────────────────────────────
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const db = getModels();
    if (!db) {
      return res.status(503).json({ message: 'Database not available' });
    }

    // Determine which user table to query
    let user = null;
    let userRole = null;

    // Try government first
    user = await db.GovernmentUser.findOne({ where: { email } });
    if (user) { userRole = 'GOVERNMENT'; }

    // Then NGO
    if (!user) {
      user = await db.NgoUser.findOne({ where: { email } });
      if (user) { userRole = 'NGO'; }
    }

    // Then Panchayat
    if (!user) {
      user = await db.PanchayatUser.findOne({ where: { email } });
      if (user) { userRole = 'PANCHAYAT'; }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = { id: user.id, name: user.name || user.org_name, email: user.email, role: userRole };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userPayload = {
      id: user.id,
      name: user.name || user.org_name,
      email: user.email,
      role: userRole,
      state: user.state || null,
      district: user.district || null,
    };
    if (userRole === 'PANCHAYAT') {
      userPayload.village = user.village || null;
      userPayload.taluka = user.taluka || null;
    }
    res.json({
      token,
      refreshToken,
      user: userPayload,
    });
  } catch (err) {
    console.error('[AUTH]', err.message);
    res.status(500).json({ message: 'Authentication service error' });
  }
});

// ─── Auth: Get current user ─────────────────────────────────────────────────────
router.get('/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ─── Dashboard Stats ────────────────────────────────────────────────────────────
router.get('/dashboard/stats', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  try {
    const db = getModels();
    if (!db) return res.json({ totalLands: 0, creditsIssued: 0, pendingRequests: 0, totalPayouts: 0 });

    const [totalLands, pendingRequests, creditCount, payoutResult] = await Promise.all([
      db.RegisteredLand.count(),
      db.LandRequest.count({ where: { status: 'PENDING' } }),
      db.CarbonCreditCount.findByPk(1),
      db.NgoPayment.sum('amount', { where: { status: 'COMPLETED' } }),
    ]);

    res.json({
      totalLands,
      creditsIssued: creditCount ? parseFloat(creditCount.total_issued) : 0,
      pendingRequests,
      totalPayouts: payoutResult || 0,
    });
  } catch (err) {
    console.error('[STATS]', err.message);
    res.json({ totalLands: 10, creditsIssued: 45230, pendingRequests: 4, totalPayouts: 2850000 });
  }
});

// ─── Carbon Credit Count (shared — public read) ────────────────────────────────
router.get('/credits/count', async (req, res) => {
  try {
    const db = getModels();
    if (!db) return res.json({ total_issued: 45230, total_available: 12800, total_sold: 32430 });

    const count = await db.CarbonCreditCount.findByPk(1);
    res.json(count || { total_issued: 0, total_available: 0, total_sold: 0 });
  } catch (err) {
    res.json({ total_issued: 45230, total_available: 12800, total_sold: 32430 });
  }
});

// ─── Registered Lands List ──────────────────────────────────────────────────────
router.get('/lands', authenticate, async (req, res) => {
  try {
    const db = getModels();
    if (!db) return res.json([]);

    const lands = await db.RegisteredLand.findAll({
      order: [['created_at', 'DESC']],
      include: [{ model: db.LandRequest, as: 'landRequest', attributes: ['owner_name', 'area_hectares', 'location_description'] }],
    });
    res.json(lands);
  } catch (err) {
    console.error('[LANDS]', err.message);
    res.json([]);
  }
});

// ─── Land Requests List ─────────────────────────────────────────────────────────
router.get('/land-requests', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  try {
    const db = getModels();
    if (!db) return res.json([]);

    const requests = await db.LandRequest.findAll({
      order: [['created_at', 'DESC']],
      include: [{ model: db.PanchayatUser, as: 'panchayat', attributes: ['name', 'village', 'district'] }],
    });
    res.json(requests);
  } catch (err) {
    console.error('[LAND_REQUESTS]', err.message);
    res.json([]);
  }
});

// ─── Single Land Request Detail ─────────────────────────────────────────────────
router.get('/land-requests/:id', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  try {
    const db = getModels();
    if (!db) return res.status(503).json({ message: 'DB unavailable' });

    const request = await db.LandRequest.findByPk(req.params.id, {
      include: [
        { model: db.PanchayatUser, as: 'panchayat', attributes: ['name', 'village', 'taluka', 'district'] },
        { model: db.LandDocument, as: 'documents' },
        { model: db.RegisteredLand, as: 'registeredLand', required: false },
      ],
    });

    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    console.error('[LAND_REQUEST_DETAIL]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── Document Upload ────────────────────────────────────────────────────────────
router.post('/land-requests/:id/upload-document', authenticate, authorize('GOVERNMENT'), upload.fields([{ name: 'satbara', maxCount: 1 }, { name: 'other_doc', maxCount: 1 }]), async (req, res) => {
  try {
    const db = getModels();
    if (!db) return res.status(503).json({ message: 'DB unavailable' });

    const request = await db.LandRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedDocs = [];

    // Local function to handle Pinata upload
    const uploadToPinata = async (file, docType) => {
      const form = new FormData();
      form.append('file', fs.createReadStream(file.path));
      
      const pinataMetadata = JSON.stringify({ name: `${docType}_${request.id}` });
      form.append('pinataMetadata', pinataMetadata);

      const response = await require('axios').post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        form,
        {
          headers: {
            ...form.getHeaders(),
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_API_SECRET
          }
        }
      );

      fs.unlinkSync(file.path);
      console.log(`[PINATA] Uploaded ${docType}:`, response.data.IpfsHash);
      return response.data.IpfsHash;
    };

    let satbaraCid = null;
    let otherCid = null;

    if (req.files.satbara) {
      satbaraCid = await uploadToPinata(req.files.satbara[0], 'SATBARA');
      uploadedDocs.push(satbaraCid);
    }
    if (req.files.other_doc) {
      otherCid = await uploadToPinata(req.files.other_doc[0], 'OTHER');
      uploadedDocs.push(otherCid);
    }

    let existingDoc = await db.LandDocument.findOne({ where: { land_request_id: request.id } });
    if (existingDoc) {
      existingDoc.satbara_cid = satbaraCid || existingDoc.satbara_cid;
      existingDoc.other_docs_cid = otherCid || existingDoc.other_docs_cid;
      existingDoc.uploaded_at = new Date();
      await existingDoc.save();
    } else {
      await db.LandDocument.create({
        land_request_id: request.id,
        satbara_cid: satbaraCid,
        other_docs_cid: otherCid
      });
    }

    res.json({ success: true, documents: uploadedDocs });
  } catch (err) {
    console.error('[UPLOAD_DOCUMENT]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── NDVI Records for a Land ────────────────────────────────────────────────────
router.get('/lands/:landId/ndvi', authenticate, async (req, res) => {
  try {
    const db = getModels();
    if (!db) return res.json([]);

    const records = await db.NdviRecord.findAll({
      where: { land_id: req.params.landId },
      order: [['recorded_at', 'ASC']],
    });
    res.json(records);
  } catch (err) {
    res.json([]);
  }
});

// ─── Prepare approval — upload land data to Pinata, return CID for MetaMask ─
router.post('/land-requests/:id/prepare-approval', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  const db = getModels();
  if (!db) return res.status(503).json({ message: 'DB unavailable' });
  try {
    const request = await db.LandRequest.findByPk(req.params.id, {
      include: [{ model: db.PanchayatUser, as: 'panchayat', attributes: ['name', 'village', 'district'] }],
    });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    const year = new Date().getFullYear();
    const state = req.body.state || 'MH';
    const maxId = await db.RegisteredLand.max('id') || 0;
    const landIdGov = `GOV-${year}-${state}-${String(maxId + 1).padStart(4, '0')}`;

    const polygon = req.body.polygon_geojson || {
      type: 'Polygon',
      coordinates: [[[73.28, 16.99], [73.30, 16.99], [73.30, 17.01], [73.28, 17.01], [73.28, 16.99]]],
    };

    console.log(`[PINATA] Uploading land data for ${landIdGov}...`);
    const pinResult = await pinLandData({
      land_id_gov: landIdGov,
      owner_name: request.owner_name,
      panchayat_name: request.panchayat?.name || '',
      area_hectares: parseFloat(request.area_hectares),
      location_description: request.location_description,
      allowed_species: req.body.allowed_species || ['Avicennia marina'],
      polygon_geojson: polygon,
      conditions: req.body.conditions || '',
    });

    const ipfsCid = pinResult.cid || 'QmPending';
    if (!pinResult.success) console.warn('[PINATA] Upload failed, using fallback CID');

    res.json({
      success: true,
      land_id_gov: landIdGov,
      ipfs_cid: ipfsCid,
      ipfs_url: pinResult.gatewayUrl || null,
      polygon,
      message: pinResult.success ? `Data pinned to IPFS: ${ipfsCid}` : 'Using fallback CID — Pinata unavailable',
    });
  } catch (err) {
    console.error('[PREPARE_APPROVAL]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── Finalize approval — save tx hash after MetaMask signs ─────────────────
router.patch('/land-requests/:id/approve-with-hash', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  const db = getModels();
  if (!db) return res.status(503).json({ message: 'DB unavailable' });
  try {
    const request = await db.LandRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const { tx_hash, land_id_gov, ipfs_cid, signer_address, polygon } = req.body;

    const land = await db.RegisteredLand.create({
      land_id_gov,
      land_request_id: request.id,
      polygon_geojson: polygon || {
        type: 'Polygon',
        coordinates: [[[73.28, 16.99], [73.30, 16.99], [73.30, 17.01], [73.28, 17.01], [73.28, 16.99]]],
      },
      allowed_species: ['Avicennia marina'],
      conditions: '',
      plantation_doc_cid: ipfs_cid,
      blockchain_hash: tx_hash,
      status: 'ACTIVE',
    });

    await request.update({ status: 'APPROVED' });

    console.log(`[GOV] ✅ Land approved — ID: ${land_id_gov}, IPFS: ${ipfs_cid}, Tx: ${tx_hash}`);

    res.json({
      success: true,
      land_id: land_id_gov,
      land,
      tx_hash,
      ipfs_cid,
      signer_address,
      explorer_url: `https://sepolia.etherscan.io/tx/${tx_hash}`,
      ipfs_url: `https://gateway.pinata.cloud/ipfs/${ipfs_cid}`,
    });
  } catch (err) {
    console.error('[APPROVE_WITH_HASH]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── Reject land request ──────────────────────────────────────────────────────
router.patch('/land-requests/:id/reject', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  const db = getModels();
  if (!db) return res.status(503).json({ message: 'DB unavailable' });
  try {
    const request = await db.LandRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    await request.update({ status: 'REJECTED' });
    res.json({ success: true, message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Prepare credit issuance — upload to Pinata, return CID for MetaMask ─────
router.post('/lands/:landId/prepare-credits', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  const db = getModels();
  if (!db) return res.status(503).json({ message: 'DB unavailable' });
  try {
    const land = await db.RegisteredLand.findOne({
      where: { land_id_gov: req.params.landId },
      include: [{ model: db.LandRequest, as: 'landRequest', attributes: ['area_hectares'] }],
    });
    if (!land) return res.status(404).json({ message: 'Land not found' });

    const area = land.landRequest?.area_hectares || 10;
    const sequestrationRate = parseFloat(process.env.SEQUESTRATION_RATE || 7.5);
    const years = req.body.years || 1;
    const survivalRate = parseFloat(process.env.DEFAULT_SURVIVAL_RATE || 0.85);
    const tCO2PerCredit = parseFloat(process.env.TCO2_PER_CREDIT || 1);

    const carbonTCO2e = area * sequestrationRate * years * survivalRate;
    const creditsCalculated = carbonTCO2e / tCO2PerCredit;

    console.log(`[PINATA] Uploading credit data for ${req.params.landId}...`);
    const pinResult = await pinCreditIssuanceData({
      land_id_gov: req.params.landId,
      credits_calculated: creditsCalculated,
      area_ha: area,
      sequestration_rate: sequestrationRate,
      years,
      survival_rate: survivalRate,
      carbon_tco2e: carbonTCO2e,
    });

    res.json({
      success: true,
      credits_calculated: creditsCalculated,
      ipfs_cid: pinResult.cid || 'QmPending',
      ipfs_url: pinResult.gatewayUrl || null,
      algorithm: {
        area_ha: area,
        sequestration_rate: sequestrationRate,
        years,
        survival_rate: survivalRate,
        carbon_tco2e: carbonTCO2e,
      },
    });
  } catch (err) {
    console.error('[PREPARE_CREDITS]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── Finalize credit issuance — save tx hash after MetaMask signs ────────────
router.post('/lands/:landId/issue-credits-with-hash', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  const db = getModels();
  if (!db) return res.status(503).json({ message: 'DB unavailable' });
  try {
    const land = await db.RegisteredLand.findOne({
      where: { land_id_gov: req.params.landId },
    });
    if (!land) return res.status(404).json({ message: 'Land not found' });

    const { tx_hash, ipfs_cid, credits_calculated, signer_address } = req.body;

    const issuance = await db.CarbonCreditIssuance.create({
      land_id: land.id,
      credits_calculated,
      algorithm_output_json: {
        credits: credits_calculated,
        ipfs_cid,
        tx_hash,
        signed_by: signer_address,
        issued_at: new Date().toISOString(),
      },
      approved_by: req.user.id,
      blockchain_tx_hash: tx_hash,
      issued_at: new Date(),
    });

    const creditCount = await db.CarbonCreditCount.findByPk(1);
    if (creditCount) {
      await creditCount.increment('total_issued', { by: credits_calculated });
      await creditCount.increment('total_available', { by: credits_calculated });
    }

    console.log(`[GOV] ✅ Credits issued — Land: ${req.params.landId}, Credits: ${credits_calculated}, IPFS: ${ipfs_cid}, Tx: ${tx_hash}`);

    res.json({
      success: true,
      credits_calculated,
      tx_hash,
      ipfs_cid,
      explorer_url: `https://sepolia.etherscan.io/tx/${tx_hash}`,
      ipfs_url: `https://gateway.pinata.cloud/ipfs/${ipfs_cid}`,
    });
  } catch (err) {
    console.error('[ISSUE_CREDITS_WITH_HASH]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── Issue carbon credits + on-chain (legacy — backend signs) ─────────────────
router.post('/lands/:landId/issue-credits', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  const db = getModels();
  if (!db) return res.status(503).json({ message: 'DB unavailable' });
  try {
    const land = await db.RegisteredLand.findOne({
      where: { land_id_gov: req.params.landId },
      include: [{ model: db.LandRequest, as: 'landRequest', attributes: ['area_hectares'] }]
    });
    if (!land) return res.status(404).json({ message: 'Land not found' });

    const area             = land.landRequest?.area_hectares || req.body.area_ha || 10;
    const sequestrationRate = parseFloat(process.env.SEQUESTRATION_RATE || 7.5);
    const years            = req.body.years || 1;
    const survivalRate     = parseFloat(process.env.DEFAULT_SURVIVAL_RATE || 0.85);
    const tCO2PerCredit    = parseFloat(process.env.TCO2_PER_CREDIT || 1);

    const carbonTCO2e       = area * sequestrationRate * years * survivalRate;
    const creditsCalculated = carbonTCO2e / tCO2PerCredit;

    const algorithmOutput = {
      area_ha: area, sequestration_rate: sequestrationRate, years,
      survival_rate: survivalRate, carbon_tco2e: carbonTCO2e,
      tco2_per_credit: tCO2PerCredit, credits: creditsCalculated,
      calculated_at: new Date().toISOString()
    };

    const issuance = await db.CarbonCreditIssuance.create({
      land_id: land.id,
      credits_calculated: creditsCalculated,
      algorithm_output_json: algorithmOutput,
      approved_by: req.user.id,
      blockchain_tx_hash: 'PENDING_CHAIN',
      issued_at: new Date()
    });

    const creditCount = await db.CarbonCreditCount.findByPk(1);
    if (creditCount) {
      await creditCount.increment('total_issued', { by: creditsCalculated });
      await creditCount.increment('total_available', { by: creditsCalculated });
    }

    // Fire-and-forget blockchain call
    issueCreditsOnChain(req.params.landId, creditsCalculated)
      .then(async (result) => {
        if (result.success) {
          await db.CarbonCreditIssuance.update({ blockchain_tx_hash: result.txHash }, { where: { id: issuance.id } });
          console.log(`[GOV] Credits on-chain: ${result.txHash}`);
        } else {
          console.error('[GOV] Credit issuance chain failed:', result.error);
        }
      })
      .catch(err => console.error('[GOV] Chain async error:', err.message));

    res.json({
      success: true,
      credits_issued: creditsCalculated,
      algorithm_output: algorithmOutput,
      issuance_id: issuance.id,
      blockchain_status: 'PENDING',
      message: 'Credits issued. Blockchain confirmation in progress.'
    });
  } catch (err) {
    console.error('[ISSUE_CREDITS]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── Blockchain events (audit trail) ─────────────────────────────────────────
router.get('/blockchain/events', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  const result = await fetchOnChainEvents();
  if (!result.success) {
    return res.status(500).json({ message: 'Failed to fetch blockchain events', error: result.error, events: [] });
  }
  res.json(result);
});

// ─── Retry failed blockchain registration ─────────────────────────────────────
router.post('/lands/:landId/blockchain-retry', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  const db = getModels();
  if (!db) return res.status(503).json({ message: 'DB unavailable' });
  try {
    const land = await db.RegisteredLand.findOne({ where: { land_id_gov: req.params.landId } });
    if (!land) return res.status(404).json({ message: 'Land not found' });

    const result = await registerLandOnChain(
      land.land_id_gov,
      land.plantation_doc_cid || 'QmPending',
      land.polygon_geojson
    );
    if (result.success) {
      await land.update({ blockchain_hash: result.txHash });
      return res.json({ success: true, txHash: result.txHash, explorerUrl: result.explorerUrl });
    }
    res.status(500).json({ success: false, error: result.error });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── NGO / Panchayat payout ───────────────────────────────────────────────────
router.post('/payouts', authenticate, authorize('GOVERNMENT'), async (req, res) => {
  const db = getModels();
  if (!db) return res.status(503).json({ message: 'DB unavailable' });
  try {
    const { ngo_id, panchayat_id, land_id, amount, quality_score } = req.body;
    const payment = await db.NgoPayment.create({
      ngo_id: ngo_id || null,
      panchayat_id: panchayat_id || null,
      land_id,
      amount,
      quality_score: quality_score || 85,
      status: 'COMPLETED',
      razorpay_payout_id: `MOCK-${Date.now()}`,
      paid_at: new Date()
    });
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Panchayat: Get own land requests ───────────────────────────────────────
router.get(
  '/panchayat/land-requests',
  authenticate,
  authorize('PANCHAYAT'),
  async (req, res) => {
    try {
      const db = getModels();
      if (!db) return res.json([]);
      const requests = await db.LandRequest.findAll({
        where: { panchayat_id: req.user.id },
        order: [['created_at', 'DESC']],
        include: [{ model: db.RegisteredLand, as: 'registeredLand', attributes: ['land_id_gov'], required: false }],
      });
      res.json(requests);
    } catch (err) {
      console.error('[PANCHAYAT_LAND_REQUESTS]', err.message);
      res.json([]);
    }
  }
);

// ─── Panchayat: Submit land request ─────────────────────────────────────────
router.post(
  '/panchayat/submit-request',
  authenticate,
  authorize('PANCHAYAT'),
  async (req, res) => {
    const db = getModels();
    if (!db) return res.status(503).json({ message: 'Database unavailable. Ensure PostgreSQL is running.' });
    const { owner_name, area_hectares, location_description } = req.body;
    if (!owner_name || !owner_name.trim()) {
      return res.status(400).json({ message: 'Owner name is required.' });
    }
    const area = parseFloat(area_hectares);
    if (isNaN(area) || area < 0.1 || area > 500) {
      return res.status(400).json({ message: 'Area must be between 0.1 and 500 hectares.' });
    }
    if (!location_description || !location_description.trim()) {
      return res.status(400).json({ message: 'Location description is required.' });
    }
    try {
      // owner_aadhaar_hash is required by DB; use placeholder until documents uploaded
      const aadhaarPlaceholder = crypto.createHash('sha256')
        .update(`PENDING-${req.user.id}-${Date.now()}`).digest('hex');
      const request = await db.LandRequest.create({
        panchayat_id: req.user.id,
        owner_name: owner_name.trim(),
        owner_aadhaar_hash: aadhaarPlaceholder,
        area_hectares: area,
        location_description: location_description.trim(),
        status: 'PENDING',
      });
      res.json({ success: true, request });
    } catch (err) {
      console.error('[PANCHAYAT_SUBMIT]', err.message);
      if (err.name === 'SequelizeValidationError') {
        const msgs = err.errors?.map(e => e.message)?.join(', ') || err.message;
        return res.status(400).json({ message: msgs });
      }
      res.status(500).json({ message: err.message });
    }
  }
);

// ─── Panchayat: Get payouts ──────────────────────────────────────────────────
router.get(
  '/payouts/panchayat/:id',
  authenticate,
  authorize('PANCHAYAT'),
  async (req, res) => {
    const db = getModels();
    if (!db) return res.status(503).json({ message: 'DB unavailable' });
    try {
      const payments = await db.NgoPayment.findAll({
        where: { panchayat_id: req.user.id },
        order: [['created_at', 'DESC']],
      });
      res.json(payments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ─── NGO: Submit MRV field data ──────────────────────────────────────────────
router.post(
  '/mrv/submit',
  authenticate,
  authorize('NGO'),
  async (req, res) => {
    const db = getModels();
    if (!db) return res.status(503).json({ message: 'DB unavailable' });
    try {
      const record = await db.NdviRecord.create({
        land_id: req.body.land_id,
        ndvi_value: (req.body.survival_rate || 0) / 100,
        satellite_source: 'FIELD_SURVEY',
        greenery_increase_percent: req.body.survival_rate || 0,
        recorded_at: req.body.monitoring_date || new Date(),
        notes: req.body.notes || null,
      });
      res.json({ success: true, record });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ─── NGO: Get payouts ────────────────────────────────────────────────────────
router.get(
  '/payouts/ngo/:id',
  authenticate,
  authorize('NGO'),
  async (req, res) => {
    const db = getModels();
    if (!db) return res.status(503).json({ message: 'DB unavailable' });
    try {
      const payments = await db.NgoPayment.findAll({
        where: { ngo_id: req.user.id },
        order: [['created_at', 'DESC']],
      });
      res.json(payments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ─── Health ─────────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', portal: 'government' });
});


module.exports = router;
