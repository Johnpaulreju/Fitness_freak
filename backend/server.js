require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { initializeDataset, trainModel, predictBodyType } = require('./bodyTypeRoutes');


const app = express();

// ✅ Allow requests from your frontend
app.use(cors({
  origin: "http://localhost:3000",  // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const PORT = process.env.PORT || 3000;

const authRoutes = require("./routes/authRoutes"); // ✅ Import authentication routes
const fitnessRoutes = require("./routes/fitnessRoutes"); 


// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error(err));



initializeDataset().then(() => {
  console.log("Dataset loaded.");
}).catch(console.error);

app.get('/trainModel', async (req, res) => {
  try {
      await trainModel();
      res.json({ success: true, message: "Model trained successfully!" });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/predictBodyType', (req, res) => {
  console.log("recived",req.body);
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


app.use("/api/auth", authRoutes); // ✅ This will map '/api/auth/register' and '/api/auth/login'
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


app.listen(PORT, () => console.log(`Server running on port => http://localhost:${PORT}`));