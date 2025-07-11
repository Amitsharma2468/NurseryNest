const Plant = require('../models/Plant');

// Add a new plant
exports.addPlant = async (req, res) => {
  try {
    const {
      plantId,
      plantType,
      plantName,
      plantImage,
      remainingPlant,
      costPerPlant,
    } = req.body;

    // Validate required fields
    if (!plantId || !plantType || !plantName || !plantImage || costPerPlant == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if plantId already exists
    const existingPlant = await Plant.findOne({ plantId });
    if (existingPlant) {
      return res.status(400).json({ message: 'Plant ID already exists' });
    }

    // Create and save new plant
    const plant = new Plant({
      plantId,
      plantType,
      plantName,
      plantImage,
      remainingPlant: remainingPlant || 0,
      costPerPlant,
      totalSold: 0,
    });

    await plant.save();

    res.status(201).json(plant);
  } catch (error) {
    console.error('Error adding plant:', error);
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
