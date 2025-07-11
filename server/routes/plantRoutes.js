const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');

router.post('/', plantController.addPlant);
router.get('/', plantController.getPlants);
router.patch("/:plantId/increment", plantController.incrementPlant);


module.exports = router;
