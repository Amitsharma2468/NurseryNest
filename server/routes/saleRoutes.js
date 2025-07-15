const express = require("express");
const {
  addSale,
  getSales,
  getBenefitStats,
  getSalesByDateRange,
  generatePDFReport,
} = require("../controllers/saleController.js");
const { protect } = require("../middleware/auth.js");

const router = express.Router();

router.post("/", protect, addSale);
router.get("/all", protect, getSales);
router.get("/benefit", protect, getBenefitStats);
router.get("/range", protect, getSalesByDateRange);
router.get("/pdf", protect, generatePDFReport);

module.exports = router;
