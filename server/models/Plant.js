const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
  plantId: { type: String, required: true, unique: true },
  plantType: { type: String, required: true },
  plantName: { type: String, required: true },
  plantImage: { type: String, required: true },
  remainingPlant: { type: Number, default: 0 },
  costPerPlant: { type: Number, required: true },
  totalSold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Plant = mongoose.models.Plant || mongoose.model('Plant', PlantSchema);
module.exports = Plant;
