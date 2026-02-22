const express = require('express');
const router = express.Router();
const astroController = require('../controllers/astroController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/kundli', optionalProtect, astroController.getKundli);
router.post('/marriage-career', optionalProtect, astroController.getMarriageCareerAnalysis);
router.post('/divisional-charts', protect, astroController.getDivisionalCharts);
router.post('/match', optionalProtect, astroController.getMatchMaking);
router.post('/dosha', optionalProtect, astroController.getDoshaAnalysis);
router.post('/yogini-dasha', optionalProtect, astroController.getYoginiDasha);
router.post('/arudha-lagna', optionalProtect, astroController.getArudhaLagna);
router.get('/astrologers', astroController.getAstrologers);
router.get('/me', protect, astroController.getCurrentAstrologer);
router.put('/me', protect, astroController.updateCurrentAstrologer);
router.get('/astrologers/:id', astroController.getAstrologerById);

// Admin/Manager only
router.post('/astrologers', protect, authorize('admin', 'manager'), astroController.createAstrologer);
router.put('/astrologers/:id', protect, authorize('admin', 'manager'), astroController.updateAstrologer);
router.delete('/astrologers/:id', protect, authorize('admin', 'manager'), astroController.deleteAstrologer);

router.post('/save-profile', protect, astroController.saveBirthDetails);
router.post('/save-chart', protect, astroController.saveSavedChart);
router.delete('/delete-chart/:id', protect, astroController.deleteSavedChart);
router.post('/geocode', astroController.getGeocode);
router.get('/search-locations', astroController.searchLocations);

router.post('/status/toggle', protect, astroController.toggleStatus);
router.get('/sessions', protect, astroController.getSessions);
router.post('/ashtakavarga', optionalProtect, astroController.getAshtakavarga);
router.post('/jaimini-karakas', optionalProtect, astroController.getJaiminiKarakas);

module.exports = router;
