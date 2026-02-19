const express = require('express');
const router = express.Router();

const { uploadMultiple, processAndUploadImages } = require('../utils/images/imageProcessing');
const { createLeader, getAllLeaders, getLeaderById, editLeader } = require('../controllers/createLeader');
const { createManifesto, editManifesto, getManifestoByLeaderId ,   voteOnManifesto,  getManifestoStats  ,   createManifestoComment ,  getManifestoComments  }=require('../controllers/manifesto');
const { likeLeader, dislikeLeader, incrementLeaderViews, followLeader, getLeaderStats } = require('../controllers/leaderViews');


// ================================
// LEADERS
// ================================

// CREATE LEADER
router.post('/leaders/create', uploadMultiple, processAndUploadImages, createLeader);

// GET ALL LEADERS
router.get('/leaders', getAllLeaders);

// GET SINGLE LEADER
router.get('/:leaderId', getLeaderById);

// EDIT LEADER
router.put('/leaders/:id', uploadMultiple, processAndUploadImages, editLeader);

// ================================
// LEADER INTERACTIONS
// ================================

router.post('/like', likeLeader);
router.post('/dislike', dislikeLeader);
router.post('/view', incrementLeaderViews);
router.post('/follow', followLeader);
router.get('/:leader_id/stats', getLeaderStats);

// ================================
// MANIFESTOS
// ================================

// CREATE MANIFESTO
router.post('/manifestos/create', createManifesto);

// EDIT MANIFESTO
router.put('/manifestos/:manifesto_id', editManifesto);

// GET MANIFESTO BY LEADER ID
router.get('/manifestos/leader/:leader_id', getManifestoByLeaderId);



router.post('/manifestos/:manifesto_id/vote', voteOnManifesto);

// Get manifesto vote statistics
router.get('/manifestos/:manifesto_id/stats', getManifestoStats);


router.post('/manifestos/:manifesto_id/coment'   ,  createManifestoComment )


 router.get('/manifestos/:manifesto_id/coments'  ,   getManifestoComments)


module.exports = router;
