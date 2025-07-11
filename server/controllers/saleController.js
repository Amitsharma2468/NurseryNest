
// --- controllers/saleController.js ---
import Sale from "../models/Sale.js";
import Plant from "../models/Plant.js";
import { v4 as uuidv4 } from "uuid";
import PDFDocument from "pdfkit";

export const addSale = async (req, res) => {
  try {
    const { customerName, plantName, quantity, salePricePerPlant } = req.body;

    const plant = await Plant.findOne({ plantName });
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    if (plant.remainingPlant < quantity)
      return res.status(400).json({ message: "Not enough plants in stock" });

    const totalSalePrice = quantity * salePricePerPlant;
    const costPerPlant = plant.costPerPlant;

    const sale = new Sale({
      saleId: uuidv4(),
      customerName,
      plantId: plant.plantId,
      plantName,
      plantType: plant.plantType,
      plantImage: plant.plantImage,
      quantity,
      salePricePerPlant,
      totalSalePrice,
      costPerPlant,
    });

    await sale.save();

    // Update plant stock
    plant.remainingPlant -= quantity;
    plant.totalSold += quantity;
    await plant.save();

    res.status(201).json(sale);
  } catch (err) {
    console.error("Error adding sale:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBenefitStats = async (req, res) => {
  try {
    const sales = await Sale.find();
    const monthlySales = sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      const now = new Date();
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    });

    const totalBenefit = sales.reduce((acc, s) => {
      const profit = (s.salePricePerPlant - s.costPerPlant) * s.quantity;
      return acc + profit;
    }, 0);

    const monthlyBenefit = monthlySales.reduce((acc, s) => {
      const profit = (s.salePricePerPlant - s.costPerPlant) * s.quantity;
      return acc + profit;
    }, 0);

    res.status(200).json({
      totalBenefit: totalBenefit.toFixed(2),
      monthlyBenefit: monthlyBenefit.toFixed(2),
    });
  } catch (err) {
    console.error("Error fetching benefit stats:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getSalesByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: "Missing date range" });
    const sales = await Sale.find({
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    }).sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const generatePDFReport = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");

    doc.pipe(res);
    doc.fontSize(20).text("Sales Report", { align: "center" });
    doc.moveDown();

    sales.forEach((s, i) => {
      doc
        .fontSize(12)
        .text(`${i + 1}. Sale ID: ${s.saleId}`)
        .text(`Customer: ${s.customerName}`)
        .text(`Plant: ${s.plantName} (${s.plantType})`)
        .text(`Quantity: ${s.quantity}`)
        .text(`Total Price: ৳${s.totalSalePrice}`)
        .text(`Profit: ৳${(s.salePricePerPlant - s.costPerPlant) * s.quantity}`)
        .text(`Date: ${s.createdAt.toDateString()}`)
        .moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};
