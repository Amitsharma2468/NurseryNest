import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema({
  saleId: {
    type: String,
    required: true,
    unique: true, // ✅ Ensure uniqueness like plantId
  },
  customerName: {
    type: String,
    required: true,
  },
  plantId: {
    type: String,
    required: true,
  },
  plantName: {
    type: String,
    required: true,
  },
  plantType: {
    type: String,
    required: true,
  },
  plantImage: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  salePricePerPlant: {
    type: Number,
    required: true,
  },
  totalSalePrice: {
    type: Number,
    required: true,
  },
  costPerPlant: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
export default Sale;
