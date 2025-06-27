const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());  // Body parser

// ✅ MongoDB Connection
mongoose.connect('mongodb+srv://emergencyUser:Emergency123@emergencycluster.aupcvfq.mongodb.net/emergencyDB?retryWrites=true&w=majority&appName=EmergencyCluster')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

// ✅ Emergency Schema
const EmergencySchema = new mongoose.Schema({
    name: String,
    message: String,
    emergencyType: String,
    latitude: Number,
    longitude: Number,
    status: { type: String, default: 'pending' }, // pending | allocated | resolved
    ambulance: { type: String, default: null },
    ambulanceLocation: {
        latitude: Number,
        longitude: Number
    }
}, { timestamps: true });

const Emergency = mongoose.model('Emergency', EmergencySchema);

// ✅ API Endpoints

// ➕ Create Emergency (PC1 sends)
app.post('/api/emergency', async (req, res) => {
    try {
        const data = req.body;
        const emergency = new Emergency(data);
        await emergency.save();
        res.status(201).send({ success: true, id: emergency._id });
    } catch (err) {
        res.status(500).send({ success: false, error: err.message });
    }
});

// 📄 Get Pending Emergencies (PC2 fetches)
app.get('/api/emergency/pending', async (req, res) => {
    try {
        const pending = await Emergency.find({ status: 'pending' });
        res.send(pending);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// ✅ Allocate Ambulance (PC2)
app.post('/api/emergency/allocate/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ambulance } = req.body;
        const emergency = await Emergency.findByIdAndUpdate(id, {
            status: 'allocated',
            ambulance
        }, { new: true });
        res.send(emergency);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 📍 Update Ambulance Location (Ambulance device sends)
app.post('/api/emergency/update-location/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude } = req.body;
        const emergency = await Emergency.findByIdAndUpdate(id, {
            ambulanceLocation: { latitude, longitude }
        }, { new: true });
        res.send(emergency);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 🔍 Get Emergency Details (User and Ambulance track)
app.get('/api/emergency/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const emergency = await Emergency.findById(id);
        res.send(emergency);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 🚀 Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
