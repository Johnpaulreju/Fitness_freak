const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const KNN = require("ml-knn");

let knnWorkout, knnDiet, knnDuration;
let dataset = [];
let X = [];
let yWorkout = [], yDiet = [], yDuration = [];
const modelPath = path.join(__dirname, "trained_knn_models.json");

async function loadDataset(filePath) {
    return new Promise((resolve, reject) => {
        const data = [];
        const bodyTypeMapping = { "Endomorph": 0, "Mesomorph": 1, "Ectomorph": 2 };
        const workoutMapping = {
            "Strength & Weight Lifting 5x/week": 0,
            "Endurance & HIIT 4x/week": 1,
            "Cardio & Flexibility 4x/week": 2,
            "Strength & Cardio 5x/week": 3,
            "Full-body Circuit Training 3x/week": 4 // Added new workout plan
            // Add more workout plans from your dataset if needed
        };
        const dietMapping = {
            "High Protein, Low Carb": 0,
            "High Carb, Moderate Protein": 1,
            "Balanced Diet with Fiber Focus": 2,
            "Low Fat, High Protein": 3,
            "High Protein, Caloric Surplus": 4
            // Add more diet plans if your dataset includes others
        };

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                try {
                    const processedRow = {
                        currentBodyType: bodyTypeMapping[row["Current Body Type"]],
                        targetBodyType: bodyTypeMapping[row["Target Body Type"]],
                        workoutPlan: workoutMapping[row["Workout Plan"]],
                        dietPlan: dietMapping[row["Diet Plan"]],
                        duration: parseInt(row["Estimated Duration (Days)"])
                    };

                    if (Object.values(processedRow).some(v => v === undefined || isNaN(v))) {
                        console.error("❌ Invalid row detected:", row);
                    } else {
                        data.push(processedRow);
                    }
                } catch (error) {
                    console.error("❌ Error processing row:", row, error);
                }
            })
            .on("end", () => {
                console.log(`Loaded ${data.length} valid rows from dataset.`);
                resolve(data);
            })
            .on("error", (error) => reject(error));
    });
}

async function predictionInitializeDataset() {
    dataset = await loadDataset(path.join(__dirname, "workout_diet_plan.csv"));
    X = dataset.map(d => [d.currentBodyType, d.targetBodyType]);
    yWorkout = dataset.map(d => d.workoutPlan);
    yDiet = dataset.map(d => d.dietPlan);
    yDuration = dataset.map(d => d.duration);

    console.log(`Processed ${dataset.length} records for training.`);
    loadTrainedModels();
}

async function predictionTrainModels() {
    if (X.length === 0 || yWorkout.length === 0 || yDiet.length === 0 || yDuration.length === 0) {
        console.error("❌ Dataset not properly loaded!");
        throw new Error("Dataset not properly loaded.");
    }

    knnWorkout = new KNN(X, yWorkout, { k: 3 });
    knnDiet = new KNN(X, yDiet, { k: 3 });
    knnDuration = new KNN(X, yDuration, { k: 3 });

    console.log("✅ Models trained successfully!");
    saveTrainedModels();
}

function predictTransformationPlan(currentBodyType, targetBodyType) {
    if (!knnWorkout || !knnDiet || !knnDuration) {
        console.error("❌ Models not trained yet!");
        throw new Error("Models not trained yet. Train the models first!");
    }

    const bodyTypeMapping = { "Endomorph": 0, "Mesomorph": 1, "Ectomorph": 2 };
    const inputData = [
        bodyTypeMapping[currentBodyType],
        bodyTypeMapping[targetBodyType]
    ];

    if (inputData.some(v => v === undefined)) {
        console.error("❌ Invalid input data:", { currentBodyType, targetBodyType });
        throw new Error("Invalid body type input.");
    }

    const workoutPrediction = knnWorkout.predict([inputData])[0];
    const dietPrediction = knnDiet.predict([inputData])[0];
    const durationPrediction = knnDuration.predict([inputData])[0];

    const workoutNames = [
        "Strength & Weight Lifting 5x/week",
        "Endurance & HIIT 4x/week",
        "Cardio & Flexibility 4x/week",
        "Strength & Cardio 5x/week",
        "Full-body Circuit Training 3x/week" // Added corresponding name
    ];
    const dietNames = [
        "High Protein, Low Carb",
        "High Carb, Moderate Protein",
        "Balanced Diet with Fiber Focus",
        "Low Fat, High Protein",
        "High Protein, Caloric Surplus"
    ];

    const result = {
        workoutPlan: workoutNames[workoutPrediction] || "Unknown",
        dietPlan: dietNames[dietPrediction] || "Unknown",
        estimatedDuration: durationPrediction
    };

    console.log("✅ Prediction:", result);
    return result;
}

function saveTrainedModels() {
    if (!knnWorkout || !knnDiet || !knnDuration) {
        console.error("❌ No trained models to save!");
        return;
    }

    const modelData = {
        X: JSON.stringify(X),
        yWorkout: JSON.stringify(yWorkout),
        yDiet: JSON.stringify(yDiet),
        yDuration: JSON.stringify(yDuration),
        k: 3
    };

    fs.writeFileSync(modelPath, JSON.stringify(modelData));
    console.log("✅ Trained models saved successfully!");
}

function loadTrainedModels() {
    if (fs.existsSync(modelPath)) {
        console.log("🔄 Loading saved KNN models...");
        const modelData = JSON.parse(fs.readFileSync(modelPath, "utf-8"));

        if (!modelData.X || !modelData.yWorkout || !modelData.yDiet || !modelData.yDuration) {
            console.error("❌ Error: Loaded model data is corrupted or missing.");
            return;
        }

        X = JSON.parse(modelData.X);
        yWorkout = JSON.parse(modelData.yWorkout);
        yDiet = JSON.parse(modelData.yDiet);
        yDuration = JSON.parse(modelData.yDuration);

        knnWorkout = new KNN(X, yWorkout, { k: modelData.k });
        knnDiet = new KNN(X, yDiet, { k: modelData.k });
        knnDuration = new KNN(X, yDuration, { k: modelData.k });
        console.log("✅ Models loaded successfully!");
    } else {
        console.warn("⚠️ No saved models found. Please train the models first!");
    }
}

module.exports = {
    predictionInitializeDataset,
    predictionTrainModels,
    predictTransformationPlan
};