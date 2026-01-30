const express = require('express');
const router = express.Router();

const { uploadMultiple, processAndUploadImages } = require('../utils/images/iamgeProcessing');
const { createLeader, getAllLeaders, getLeaderById, editLeader } = require('../controllers/createLeader');
const { createManifesto, editManifesto } = require('../controllers/manifesto');
const {   addManifestoEngagement, getManifestoEngagements, } = require('../controllers/manifetsoEngegements');
const  Logger  = require('../utils/logger/logger');

// ---------- CREATE LEADER ----------
router.post(
  '/create',
  uploadMultiple,
  processAndUploadImages,
  async (req, res) => {
    try {
      await createLeader(req, res);
    } catch (error) {
      Logger.error('Error creating leader', {
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({ message: 'Failed to create leader' });
    }
  }
);

// ---------- GET ALL LEADERS ----------
router.get('/get', getAllLeaders);

// ---------- GET SINGLE LEADER ----------
router.get('/leaders/:leaderId', getLeaderById);


// ---------- EDIT LEADER ----------
router.put(
  '/leaders/:id',
  uploadMultiple,
  processAndUploadImages,
  async (req, res) => {
    try {
      await editLeader(req, res);
    } catch (error) {
      Logger.error('Error updating leader', {
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({ message: 'Failed to update leader' });
    }
  }
);



router.get('/leaders/test/:leaderId', (req, res) => {
  res.json({ ok: true, leaderId: req.params.leaderId });
});


// ---------- CREATE MANIFESTO ----------
router.post('/manifestos/create', async (req, res) => {
  try {
    await createManifesto(req, res);
  } catch (error) {
    Logger.error('Error creating manifesto', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to create manifesto' });
  }
});

// ---------- EDIT MANIFESTO ----------
router.put('/manifestos/:id', async (req, res) => {
  try {
    await editManifesto(req, res);
  } catch (error) {
    Logger.error('Error editing manifesto', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to edit manifesto' });
  }
});

// ---------- ADD ENGAGEMENT ----------
router.post('/manifestos/:id/engagement', async (req, res) => {
  try {
    req.body.manifesto_id = req.params.id;
    await addManifestoEngagement(req, res);
  } catch (error) {
    Logger.error('Error adding engagement', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to add engagement' });
  }
});

// ---------- GET ENGAGEMENTS ----------
router.get('/manifestos/:id/engagements', async (req, res) => {
  try {
    await getManifestoEngagements(req, res);
  } catch (error) {
    Logger.error('Error fetching engagements', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to fetch engagements' });
  }
});

module.exports = router;
