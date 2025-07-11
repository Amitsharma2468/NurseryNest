// --- models/Sale.js ---
import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema({
  saleId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  plantId: { type: String, required: true },
  plantName: { type: String, required: true },
  plantType: { type: String, required: true },
  plantImage: { type: String },
  quantity: { type: Number, required: true },
  salePricePerPlant: { type: Number, required: true },
  totalSalePrice: { type: Number, required: true },
  costPerPlant: { type: Number, required: true }, // pulled from plant table
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);