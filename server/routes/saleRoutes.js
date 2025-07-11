// --- routes/saleRoutes.js ---
const express = require("express");
const { addSale, getSales, getBenefitStats, getSalesByDateRange, generatePDFReport } = require("../controllers/saleController.js");
const router = express.Router();

router.post("/", addSale);
router.get("/all", getSales);
router.get("/benefit", getBenefitStats);
router.get("/range", getSalesByDateRange);
router.get("/pdf", generatePDFReport);

module.exports = router;