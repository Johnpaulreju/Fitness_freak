require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { initializeDataset, trainModel, predictBodyType } = require('./bodyTypeRoutes');
const { predictionInitializeDataset, predictionTrainModels, predictTransformationPlan } = require("./workoutplanPrediction");

const app = express();

// CORS configuration for frontend requests
app.use(cors({
  origin: "http://localhost:3000", // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const PORT = process.env.PORT || 3000;

const authRoutes = require("./routes/authRoutes");
const fitnessRoutes = require("./routes/fitnessRoutes");

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Initialize both datasets
Promise.all([
  initializeDataset().then(() => console.log("Body Type Dataset loaded.")),
  predictionInitializeDataset().then(() => console.log("Transformation Plan Dataset loaded."))
]).catch(console.error);

// Body Type Model Endpoints
app.get('/trainModel', async (req, res) => {
  try {
    await trainModel();
    res.json({ success: true, message: "Body Type Model trained successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/predictBodyType', (req, res) => {
  console.log("Received for body type prediction:", req.body);
  try {
    const requiredFields = ['height', 'weight', 'shoulderWidth', 'waistWidth', 'armWidth', 'chestWidth', 'legWidth'];
    for (const field of requiredFields) {
      if (req.body[field] === undefined) {
        return res.status(400).json({ success: false, error: `Missing field: ${field}` });
      }
    }
    const inputData = requiredFields.map(field => parseFloat(req.body[field]));
    const result = predictBodyType(inputData);
    res.json({ success: true, predictedBodyType: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transformation Plan Model Endpoints
app.get('/trainTransformationModels', async (req, res) => {
  try {
    await predictionTrainModels();
    res.json({ success: true, message: "Transformation Plan Models trained successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/predictTransformationPlan', (req, res) => {
  console.log("Received for transformation plan prediction:", req.body);
  try {
    const { currentBodyType, targetBodyType } = req.body;
    if (!currentBodyType || !targetBodyType) {
      return res.status(400).json({ success: false, error: "Missing currentBodyType or targetBodyType" });
    }
    const result = predictTransformationPlan(currentBodyType, targetBodyType);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/fitness", fitnessRoutes);

// Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/Form.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port => http://localhost:${PORT}`));