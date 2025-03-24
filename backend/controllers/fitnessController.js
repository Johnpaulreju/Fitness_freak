const User = require("../models/User"); // Import the User model


exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params; // Assuming userID is passed as a URL parameter
        console.log("Fetching user details for userId:", userId);
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Server error" });
    }
};



// Update fitness details in User model
exports.saveFitnessData = async (req, res) => {
    console.log("Received request body:", req.body);
    try {
        const {
            userId, // This corresponds to userId in the User model
            ageValue,
            gender,
            height,
            weight,
            shoulderWidth,
            waistWidth,
            armWidth,
            chestWidth,
            legWidth,
            bmi,
            weightStatus,
            tdee,
            minWeight,
            maxWeight,
            bodyType
        } = req.body;

        // Find and update user data
        const updatedUser = await User.findOneAndUpdate(
            { userId: userId },
            {
                $set: {
                    age: ageValue,
                    gender,
                    height,
                    weight,
                    shoulderWidth,
                    waistWidth,
                    armWidth,
                    chestWidth,
                    legWidth,
                    bmi,
                    weightStatus,
                    tdee,
                    "idealWeightRange.min": minWeight,
                    "idealWeightRange.max": maxWeight,
                    bodyType
                }
            },
            { new: true, upsert: false }
        );
        

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Fitness data updated successfully!", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update fitness data." });
    }
};
