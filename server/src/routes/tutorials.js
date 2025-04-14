const express = require('express');
const Tutorial = require('../models/Tutorial');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all published tutorials (public)
router.get('/published', async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ published: true })
      .populate('author', 'username')
      .select('-content')
      .sort('-createdAt');
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tutorials', error: error.message });
  }
});

// Get a single published tutorial by ID (public)
router.get('/published/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, published: true })
      .populate('author', 'username')
      .populate('prerequisites', 'title');
    
    if (!tutorial) {
      return res.status(404).json({ message: 'Tutorial not found' });
    }
    
    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tutorial', error: error.message });
  }
});

// Create a new tutorial (lecturer/admin only)
router.post('/', auth, checkRole('lecturer', 'admin'), async (req, res) => {
  try {
    const tutorial = new Tutorial({
      ...req.body,
      author: req.user._id
    });
    
    await tutorial.save();
    res.status(201).json(tutorial);
  } catch (error) {
    res.status(400).json({ message: 'Error creating tutorial', error: error.message });
  }
});

// Update a tutorial (author/admin only)
router.patch('/:id', auth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    
    if (!tutorial) {
      return res.status(404).json({ message: 'Tutorial not found' });
    }
    
    // Check if user is author or admin
    if (tutorial.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this tutorial' });
    }
    
    // Increment version if content is being updated
    if (req.body.content) {
      req.body.version = tutorial.version + 1;
    }
    
    Object.assign(tutorial, req.body);
    await tutorial.save();
    
    res.json(tutorial);
  } catch (error) {
    res.status(400).json({ message: 'Error updating tutorial', error: error.message });
  }
});

// Delete a tutorial (author/admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    
    if (!tutorial) {
      return res.status(404).json({ message: 'Tutorial not found' });
    }
    
    // Check if user is author or admin
    if (tutorial.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this tutorial' });
    }
    
    await Tutorial.deleteOne({ _id: req.params.id });
    res.json({ message: 'Tutorial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tutorial', error: error.message });
  }
});

// Search tutorials (public)
router.get('/search', async (req, res) => {
  try {
    const { query, difficulty, tags } = req.query;
    const searchQuery = { published: true };
    
    if (query) {
      searchQuery.$text = { $search: query };
    }
    
    if (difficulty) {
      searchQuery.difficulty = difficulty;
    }
    
    if (tags) {
      searchQuery.tags = { $all: tags.split(',') };
    }
    
    const tutorials = await Tutorial.find(searchQuery)
      .populate('author', 'username')
      .select('-content')
      .sort('-createdAt');
      
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ message: 'Error searching tutorials', error: error.message });
  }
});

// Get tutorials by author (lecturer/admin only)
router.get('/author/:authorId', auth, checkRole('lecturer', 'admin'), async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ author: req.params.authorId })
      .populate('author', 'username')
      .sort('-createdAt');
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tutorials', error: error.message });
  }
});

module.exports = router; 