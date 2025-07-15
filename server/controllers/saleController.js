import Sale from "../models/Sale.js";
import Plant from "../models/Plant.js";
import { v4 as uuidv4 } from "uuid";
import PDFDocument from "pdfkit";

// Create a new sale linked to the authenticated user
export const addSale = async (req, res) => {
  try {
    const { customerName, plantName, quantity, salePricePerPlant } = req.body;
    const userId = req.user._id; // From middleware

    // ✅ Find existing plant by name & userId
    const plant = await Plant.findOne({ plantName, userId });
    if (!plant) return res.status(404).json({ message: "Plant not found" });

    if (plant.remainingPlant < quantity) {
      return res.status(400).json({ message: "Not enough plants in stock" });
    }

    const totalSalePrice = quantity * salePricePerPlant;
    const costPerPlant = plant.costPerPlant;

    // ✅ Create new sale with existing plantId, generate new saleId only
    const sale = new Sale({
      saleId: uuidv4(),
      customerName,
      plantId: plant.plantId, // read-only
      plantName: plant.plantName,
      plantType: plant.plantType,
      plantImage: plant.plantImage,
      quantity,
      salePricePerPlant,
      totalSalePrice,
      costPerPlant,
      userId,
    });

    await sale.save();

    // ✅ Update existing plant's inventory
    plant.remainingPlant -= quantity;
    plant.totalSold += quantity;
    await plant.save();

    res.status(201).json(sale);
  } catch (err) {
    console.error("Error adding sale:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all sales for current user
export const getSales = async (req, res) => {
  try {
    const userId = req.user._id;
    const sales = await Sale.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get benefit stats scoped by user
export const getBenefitStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const sales = await Sale.find({ userId });

    const now = new Date();

    const monthlySales = sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return (
        saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear()
      );
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

// Get sales in date range scoped by user
export const getSalesByDateRange = async (req, res) => {
  try {
    const userId = req.user._id;
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: "Missing date range" });

    const sales = await Sale.find({
      userId,
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

// Generate PDF report scoped by user
export const generatePDFReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const sales = await Sale.find({ userId }).sort({ createdAt: -1 });

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
