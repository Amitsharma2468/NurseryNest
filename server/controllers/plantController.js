const Plant = require("../models/Plant");
const { v4: uuidv4 } = require("uuid");

// Add a new plant
exports.addPlant = async (req, res) => {
  try {
    let {
      plantType,
      plantName,
      plantImage,
      remainingPlant,
      costPerPlant,
    } = req.body;

    if (!plantType || !plantName || !plantImage || costPerPlant == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Always generate a new unique plantId on server side:
    const plantId = `plant-${uuidv4()}`;

    const plant = new Plant({
      plantId,
      plantType,
      plantName,
      plantImage,
      remainingPlant: remainingPlant || 1,
      costPerPlant,
      totalSold: 0,
      userId: req.user._id, // link to logged-in user
    });

    await plant.save();
    res.status(201).json(plant);
  } catch (error) {
    console.error("Error adding plant:", error);
    res.status(500).json({ message: error.message });
  }
};

// Increment plant quantity by 1
exports.incrementPlant = async (req, res) => {
  try {
    const { plantId } = req.params;

    const plant = await Plant.findOneAndUpdate(
      { plantId, userId: req.user._id },
      { $inc: { remainingPlant: 1 } },
      { new: true }
    );

    if (!plant) {
      return res.status(404).json({ message: "Plant not found or unauthorized" });
    }

    res.json(plant);
  } catch (error) {
    console.error("Error incrementing plant:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all plants for the authenticated user
exports.getPlants = async (req, res) => {
  try {
    const plants = await Plant.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(plants);
  } catch (error) {
    console.error("Error fetching plants:", error);
    res.status(500).json({ message: error.message });
  }
};
