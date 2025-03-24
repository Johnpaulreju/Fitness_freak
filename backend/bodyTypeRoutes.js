const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const KNN = require("ml-knn"); // ✅ Correct

let knn;
let dataset = [];
let X = [], y = [];
const modelPath = path.join(__dirname, "trained_knn_model.json"); // 🔥 File to save the trained model

// Load dataset from CSV
async function loadDataset(filePath) {
    return new Promise((resolve, reject) => {
        const data = [];
        const bodyTypeMapping = { "Mesomorph": 0, "Endomorph": 1, "Ectomorph": 2 };

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                try {
                    const processedRow = {
                        height: parseFloat(row["Height (cm)"]),
                        weight: parseFloat(row["Weight (kg)"]),
                        shoulderWidth: parseFloat(row["Shoulder Width (cm)"]),
                        waistWidth: parseFloat(row["Waist Width (cm)"]),
                        armWidth: parseFloat(row["Arm Width (cm)"]),
                        chestWidth: parseFloat(row["Chest Width (cm)"]),
                        legWidth: parseFloat(row["Leg Width (cm)"]),
                        bodyType: bodyTypeMapping[row["Body Type (Label)"]] // Convert string to integer
                    };

                    if (Object.values(processedRow).some(v => isNaN(v))) {
                        console.error("❌ Invalid row detected:", row);
                    } else {
                        data.push(processedRow);
                    }
                } catch (error) {
                    console.error("❌ Error processing row:", row, error);
                }
            })
            .on("end", () => resolve(data))
            .on("error", (error) => reject(error));
    });
}


// Initialize dataset
async function initializeDataset() {
    //console.log("🔄 Initializing dataset...");
    dataset = await loadDataset(path.join(__dirname, "bodyType_classification.csv"));
    
    //console.log("📌 Full Dataset:", dataset);
    X = dataset.map(d => [d.height, d.weight, d.shoulderWidth, d.waistWidth, d.armWidth, d.chestWidth, d.legWidth]);
    y = dataset.map(d => d.bodyType);
    //console.log("📌 Processed Features (X):", X);
    //console.log("📌 Processed Labels (y):", y);
    
    //console.log(`Loaded ${dataset.length} records from dataset.`);
    loadTrainedModel();
}

// Train model and save to file
async function trainModel() {
    //console.log("🔄 Starting training...");
    if (X.length === 0 || y.length === 0) {
        console.error("❌ Dataset not properly loaded! X or y is empty.");
        throw new Error("Dataset not properly loaded.");
    }

    //console.log("📌 Training data:", X);
    //console.log("📌 Labels:", y);
    
    knn = new KNN(X, y, { k: 3 });
    //console.log("✅ Model trained successfully!");

    saveTrainedModel();
}

// Predict body type
function predictBodyType(inputData) {
    //console.log("🔄 Predicting body type...");
    if (!knn) {
        console.error("❌ Model not trained yet!");
        throw new Error("Model not trained yet. Train the model first!");
    }

    //console.log("📌 Input Data:", inputData);
    const prediction = knn.predict([inputData]);
    //console.log("📌 Raw Prediction Result:", prediction);
    
    const bodyTypeNames = ["Mesomorph", "Endomorph", "Ectomorph"];
    if (isNaN(prediction[0]) || prediction[0] === undefined) {
        console.error("❌ Prediction failed! Invalid result:", prediction);
        throw new Error("Prediction failed. Model might not be trained correctly.");
    }
    
    //console.log("✅ Final Prediction:", bodyTypeNames[prediction[0]]);
    return bodyTypeNames[prediction[0]];
}

// 🔥 Save trained model to file
function saveTrainedModel() {
    if (!knn) {
        console.error("❌ No trained model to save!");
        return;
    }

    //console.log("🔄 Saving trained model...");
    const modelData = {
        X: JSON.stringify(X),
        y: JSON.stringify(y),
        k: 3
    };
    
    fs.writeFileSync(modelPath, JSON.stringify(modelData));
    //console.log("✅ Trained model saved successfully!");
}

// 🔥 Load trained model from file
function loadTrainedModel() {
    if (fs.existsSync(modelPath)) {
        //console.log("🔄 Loading saved KNN model...");
        const modelData = JSON.parse(fs.readFileSync(modelPath, "utf-8"));
        
        if (!modelData.X || !modelData.y) {
            console.error("❌ Error: Loaded model data is corrupted or missing.");
            return;
        }

        X = JSON.parse(modelData.X);
        y = JSON.parse(modelData.y);
        //console.log("📌 Loaded Training Data (X):", X);
        //console.log("📌 Loaded Labels (y):", y);

        knn = new KNN(X, y, { k: modelData.k });
        //console.log("✅ Model loaded successfully!");
    } else {
        console.warn("⚠️ No saved model found. Please train the model first!");
    }
}

module.exports = {
    initializeDataset,
    trainModel,
    predictBodyType,
};
