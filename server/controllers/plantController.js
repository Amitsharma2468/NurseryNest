const Plant = require('../models/Plant');

// Add a new plant
const { v4: uuidv4 } = require("uuid"); // npm install uuid

exports.addPlant = async (req, res) => {
  try {
    let {
      plantId,
      plantType,
      plantName,
      plantImage,
      remainingPlant,
      costPerPlant,
    } = req.body;

    // Auto-generate plantId if not provided
    if (!plantId) {
      plantId = `plant-${uuidv4().slice(0, 8)}`;
    }

    if (!plantType || !plantName || !plantImage || costPerPlant == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create new plant
    const plant = new Plant({
      plantId,
      plantType,
      plantName,
      plantImage,
      remainingPlant: remainingPlant || 1,
      costPerPlant,
      totalSold: 0,
    });

    await plant.save();

    res.status(201).json(plant);
  } catch (error) {
    console.error("Error adding plant:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.incrementPlant = async (req, res) => {
  try {
    const { plantId } = req.params;

    const plant = await Plant.findOneAndUpdate(
      { plantId },
      { $inc: { remainingPlant: 1 } },
      { new: true }
    );

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    res.json(plant);
  } catch (error) {
    console.error("Error incrementing plant:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all plants
exports.getPlants = async (req, res) => {
  try {
    const plants = await Plant.find();
    res.status(200).json(plants);
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ message: error.message });
  }
};
