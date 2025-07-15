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

  // Associate the plant with a user
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
PlantSchema.index({ plantName: 1, userId: 1 }, { unique: true });
const Plant = mongoose.models.Plant || mongoose.model('Plant', PlantSchema);
module.exports = Plant;
