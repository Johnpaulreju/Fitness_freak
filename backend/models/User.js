const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Hashed password

  // User Physical Details
  age: { type: Number, default: null },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
  height: { type: Number, default: null }, // in cm
  weight: { type: Number, default: null }, // in kg
  shoulderWidth: { type: Number, default: null }, // in cm
  waistWidth: { type: Number, default: null }, // in cm
  armWidth: { type: Number, default: null }, // in cm
  chestWidth: { type: Number, default: null }, // in cm
  legWidth: { type: Number, default: null }, // in cm

  // Fitness & Activity Level
  bodyFatPercentage: { type: Number, default: null }, 
  currentActivityLevel: { type: String, default: "Sedentary" }, 
  currentWorkoutRoutine: { type: String, default: "" },
  currentDietType: { type: String, default: "Balanced" },

  // Derived Fields (Calculated by the System)
  bodyType: { type: String, enum: ["Endomorph", "Mesomorph", "Ectomorph"], default: null },
  bmi: { type: Number, default: null },
  weightStatus: { type: String, enum: ["Underweight", "Normal", "Overweight", "Obese"], default: null },
  tdee: { type: Number, default: null },
  idealWeightRange: {
    min: { type: Number, default: null },
    max: { type: Number, default: null }
  },
  

  // Goal Selection (User’s Desired Outcome)
  targetBodyType: { type: String, default: "" },
  targetWeight: { type: Number, default: null },
  targetTimeframe: { type: Number, default: null }, // Weeks or months

  // Suggested Plan (Generated by System)
  workoutPlan: { type: String, default: "" }, 
  dietPlan: { type: String, default: "" }, 
  caloriesPerDay: { type: Number, default: null },
  proteinIntake: { type: Number, default: null },
  fatIntake: { type: Number, default: null },
  carbIntake: { type: Number, default: null },

  // Predictive Analysis Output
  estimatedWeeksToGoal: { type: Number, default: null },
  projectedWeightTrend: { type: Number, default: null },
  progressTracker: { type: Object, default: {} }, // Weekly tracking as JSON
});

module.exports = mongoose.model("User", UserSchema);
