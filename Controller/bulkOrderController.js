const Bulk = require('../Models/bulkOrderModel');

// Create a new bulk record
exports.createBulk = async (req, res) => {
  try {
    const newBulk = new Bulk(req.body);
    await newBulk.save();
    res.status(201).json({ message: 'Bulk record created successfully', data: newBulk });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all bulk records
exports.getAllBulks = async (req, res) => {
  try {
    const bulks = await Bulk.find();
    res.status(200).json(bulks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific bulk record by ID
exports.getBulkById = async (req, res) => {
  try {
    const bulk = await Bulk.findById(req.params.id);
    if (!bulk) {
      return res.status(404).json({ message: 'Bulk record not found' });
    }
    res.status(200).json(bulk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a bulk record by ID
exports.updateBulk = async (req, res) => {
  try {
    const updatedBulk = await Bulk.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedBulk) {
      return res.status(404).json({ message: 'Bulk record not found' });
    }
    res.status(200).json({ message: 'Bulk record updated successfully', data: updatedBulk });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a bulk record by ID
exports.deleteBulk = async (req, res) => {
  try {
    const deletedBulk = await Bulk.findByIdAndDelete(req.params.id);
    if (!deletedBulk) {
      return res.status(404).json({ message: 'Bulk record not found' });
    }
    res.status(200).json({ message: 'Bulk record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
