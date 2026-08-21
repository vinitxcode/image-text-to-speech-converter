const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection (Apna URL .env file me dalein)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/speechApp')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Schema for Saving Stories
const StorySchema = new mongoose.Schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now }
});
const Story = mongoose.model('Story', StorySchema);

// API Routes
app.post('/api/save', async (req, res) => {
    try {
        const newStory = new Story(req.body);
        await newStory.save();
        res.status(201).json({ message: "Story Saved Successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save" });
    }
});

app.get('/api/stories', async (req, res) => {
    const stories = await Story.find().sort({ date: -1 });
    res.json(stories);
});

app.listen(5000, () => console.log("Server running on port 5000"));