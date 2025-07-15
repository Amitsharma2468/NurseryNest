const express = require("express");
const router = express.Router();
const plantController = require("../controllers/plantController");
const { protect } = require("../middleware/auth");

router.post("/", protect, plantController.addPlant);
router.get("/", protect, plantController.getPlants);
router.patch("/:plantId/increment", protect, plantController.incrementPlant);

module.exports = router;
