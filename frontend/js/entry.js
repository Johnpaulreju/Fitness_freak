
document.addEventListener('DOMContentLoaded', async function() {
    const userId = localStorage.getItem("userId"); // ✅ Retrieve userId from local storage
    if (!userId) {
        alert("User not logged in! Redirecting...");
        window.location.href = "/login"; // Redirect to login if no userId found
        return;
    }

    
    // You could attach it to the logout button like this:
    document.querySelector('.header-btn').addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        clearLocalStorage();
    });
    let body_type_user;
    let tdee; // Example, replace with actual TDEE from form or DB
    let height; // Example, replace with actual height
    let weight;  // Example, replace with actual weight

    try {
        const response = await fetch(`http://localhost:3000/api/fitness/getFitnessData/${userId}`);
        const data = await response.json();
        console.log("Fetched fitness data:", data);
    
        if (response.ok && data) {
            // Populate form fields
            document.querySelector('.card').classList.add('flipped');
    
            // Populate results section
            document.getElementById("resultAge").textContent = data.age;
            document.getElementById("resultGender").textContent = data.gender;
            document.getElementById("resultHeight").textContent = `${data.height} cm`;
            document.getElementById("resultWeight").textContent = `${data.weight} kg`;
            document.getElementById("resultShoulderWidth").textContent = `${data.shoulderWidth} cm`;
            document.getElementById("resultWaistWidth").textContent = `${data.waistWidth} cm`;
            document.getElementById("resultArmWidth").textContent = `${data.armWidth} cm`;
            document.getElementById("resultChestWidth").textContent = `${data.chestWidth} cm`;
            document.getElementById("resultLegWidth").textContent = `${data.legWidth} cm`;
            height=data.height;
            weight=data.weight;
    
            // Populate body type result
            if (data.bodyType) {
                document.getElementById('bodyTypeResult').textContent = data.bodyType;
                body_type_user = data.bodyType;
    
                // Set body type image
                const bodyTypeImg = document.getElementById('bodyTypeImage');
                const bodyTypeImages = {
                    'Ectomorph': '../assets/img/body_type/ectomorph.png', // Update these paths to your actual images
                    'Mesomorph': '../assets/img/body_type/mesomorph.png',
                    'Endomorph': '../assets/img/body_type/endomorph.png',
                };
    
                if (bodyTypeImages[data.bodyType]) {
                    bodyTypeImg.src = bodyTypeImages[data.bodyType];
                    bodyTypeImg.alt = data.bodyType + " body type";
                } else {
                    // Fallback image or placeholder
                    bodyTypeImg.src = "/images/default-body-type.png";
                    bodyTypeImg.alt = "Body type";
                }
            }
    
            if (document.getElementById('tdeeValue')) {
                document.getElementById('tdeeValue').textContent = data.tdee;
                tdee=data.tdee;
            }
            if (document.getElementById('bmiIndicator')) {
                document.getElementById('bmiIndicator').style.width = `${data.bmi}%`;
            }
            if (document.getElementById('weightStatus')) {
                document.getElementById('weightStatus').textContent = data.weightStatus;
            }
            if (document.getElementById('minWeight')) {
                document.getElementById('minWeight').textContent = data.idealWeightRange.min;
            }
            if (document.getElementById('maxWeight')) {
                document.getElementById('maxWeight').textContent = data.idealWeightRange.max;
            }
    
            // ** Update the Body Proportion Chart **
            const chartBars = document.querySelectorAll("#bodyProportionChart .flex div");
    
            if (chartBars.length === 0) {
                console.error("Chart bars not found.");
                return;
            }
    
            const maxMeasurement = Math.max(
                data.shoulderWidth,
                data.chestWidth,
                data.waistWidth,
                data.armWidth,
                data.legWidth
            );
            console.log("Max measurement:", maxMeasurement);
    
            const measurements = [
                data.shoulderWidth,
                data.chestWidth,
                data.waistWidth,
                data.armWidth,
                data.legWidth
            ];
    
            chartBars.forEach((bar, index) => {
                bar.style.height = `${(measurements[index] / maxMeasurement) * 100}%`;
            });
    
                // Populate Diet & Plan Section
            if (data.targetBodyType && document.getElementById('dietPlan')) {
                // Diet Details
                document.getElementById('dietPlanText').textContent = data.dietPlan || "Not set";
                document.getElementById('caloriesPerDay').textContent = data.caloriesPerDay ? `${data.caloriesPerDay} kcal` : "N/A";
                document.getElementById('proteinIntake').textContent = data.proteinIntake ? `${data.proteinIntake} g` : "N/A";
                document.getElementById('fatIntake').textContent = data.fatIntake ? `${data.fatIntake} g` : "N/A";
                document.getElementById('carbIntake').textContent = data.carbIntake ? `${data.carbIntake} g` : "N/A";

                // Exercise Details
                document.getElementById('targetBodyType').textContent = data.targetBodyType || "Not set";
                document.getElementById('targetWeight').textContent = data.targetWeight ? `${data.targetWeight} kg` : "N/A";
                document.getElementById('workoutPlan').textContent = data.workoutPlan || "Not set";
                document.getElementById('targetTimeframe').textContent = data.targetTimeframe ? `${data.targetTimeframe} days` : "N/A";
                document.getElementById('estimatedWeeksToGoal').textContent = data.estimatedWeeksToGoal ? `${data.estimatedWeeksToGoal} weeks` : "N/A";
                // Line Graph for Projected Weight Trend
                if (data.projectedWeightTrend && data.projectedWeightTrend.length > 0) {
                const ctx = document.getElementById('weightTrendChart').getContext('2d');
                // Destroy any existing chart to avoid overlap
                if (window.weightChart) window.weightChart.destroy();
                window.weightChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                    labels: Array.from({ length: data.estimatedWeeksToGoal + 1 }, (_, i) => `Week ${i}`),
                    datasets: [{
                        label: 'Projected Weight (kg)',
                        data: data.projectedWeightTrend,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                    },
                    options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: 'Weeks' } },
                        y: { title: { display: true, text: 'Weight (kg)' } }
                    }
                    }
                });
                } else {
                console.warn("No projectedWeightTrend data available to render chart.");
                }
            }
            // Pre-select the body type card based on data.targetBodyType
            const bodyTypeCards = document.querySelectorAll('.body-type-card');
            if (data.targetBodyType) {
                bodyTypeCards.forEach(card => {
                const cardBodyType = card.getAttribute('data-body-type');
                if (cardBodyType === data.targetBodyType) {
                    card.classList.add('selected');
                    selectedBodyType = data.targetBodyType; // Set the selectedBodyType variable
                    console.log(`Pre-selected body type: ${selectedBodyType}`);
                }
                });
            }
        
        } else {
            console.error("Failed to fetch fitness data:", data?.error || "Unknown error");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
    
        
    const bodyTypeCards = document.querySelectorAll('.body-type-card');
    let selectedBodyType = '';
    let workoutPlan, dietPlan, estimatedDuration, caloriesPerDay, proteinIntake, fatIntake, carbIntake, estimatedWeeksToGoal, targetWeight, projectedWeightTrend;

    // Assume these are available from form or fetched data


    bodyTypeCards.forEach(card => {
        card.addEventListener('click', async function() { // Added async here
        if (this.classList.contains('selected')) {
            // Deselect it
            this.classList.remove('selected');
            selectedBodyType = '';
            console.log('Deselected body type');
            // Reset calculated fields if needed
            workoutPlan = dietPlan = estimatedDuration = caloriesPerDay = proteinIntake = fatIntake = carbIntake = estimatedWeeksToGoal = targetWeight = projectedWeightTrend = null;
        } else {
            // Remove 'selected' class from all cards
            bodyTypeCards.forEach(c => c.classList.remove('selected'));

            // Add 'selected' class to the clicked card
            this.classList.add('selected');

            // Get the body type from the data attribute
            selectedBodyType = this.getAttribute('data-body-type');
            console.log('Selected body type:', selectedBodyType);

            // Predict Transformation Plan
            try {
            const predictionResponse = await fetch("http://localhost:3000/predictTransformationPlan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentBodyType: body_type_user, targetBodyType: selectedBodyType || "Mesomorph" })
            });
            const predictionResult = await predictionResponse.json();
            console.log("Prediction result:", predictionResult);
            if (predictionResponse.ok) {
                workoutPlan = predictionResult.workoutPlan;
                dietPlan = predictionResult.dietPlan;
                estimatedDuration = predictionResult.estimatedDuration;
                console.log("Predicted Plan:", { workoutPlan, dietPlan, estimatedDuration });

                // Calculate additional fields
                caloriesPerDay = tdee + 250; // Moderate surplus for muscle gain
                proteinIntake = Math.round((caloriesPerDay * 0.35) / 4); // 35% of calories
                fatIntake = Math.round((caloriesPerDay * 0.35) / 9);     // 35% of calories
                carbIntake = Math.round((caloriesPerDay * 0.30) / 4);    // 30% of calories
                estimatedWeeksToGoal = Math.round(estimatedDuration / 7);
                targetWeight = Math.round(22 * ((height / 100) ** 2));   // BMI 22 for Mesomorph
                const weeklyGain = 0.3; // Realistic muscle gain rate
                projectedWeightTrend = Array.from(
                { length: estimatedWeeksToGoal + 1 },
                (_, i) => weight + (weeklyGain * i)
                ).slice(0, estimatedWeeksToGoal + 1);

                const fitnessData = {
                    userId,
                    targetBodyType: selectedBodyType,
                    targetWeight,
                    targetTimeframe: estimatedDuration,
                    workoutPlan,
                    dietPlan,
                    caloriesPerDay,
                    proteinIntake,
                    fatIntake,
                    carbIntake,
                    estimatedWeeksToGoal,
                    projectedWeightTrend
                  };
        
                  try {
                    const response = await fetch("http://localhost:3000/api/fitness/updateFitnessData", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(fitnessData)
                    });
                    const result = await response.json();
                    if (response.ok) {
                      console.log("Fitness data updated successfully!");
                    } else {
                      alert(`Error: ${result.error}`);
                    }
                  } catch (error) {
                    console.error("Error updating fitness data:", error);
                  }

                // console.log("Calculated Fields:", {
                // caloriesPerDay,
                // proteinIntake,
                // fatIntake,
                // carbIntake,
                // estimatedWeeksToGoal,
                // targetWeight,
                // projectedWeightTrend
                // });

                // // Optionally save to database here (see POST method below)
            } else {
                console.error("Prediction failed:", predictionResult.error);
            }
            } catch (error) {
            console.error("Prediction request failed:", error);
            }
        }
        });
    });

    // Body type images mapping
    const bodyTypeImages = {
        'Ectomorph': '../assets/img/body_type/ectomorph.png', // Update these paths to your actual images
        'Mesomorph': '../assets/img/body_type/mesomorph.png',
        'Endomorph': '../assets/img/body_type/endomorph.png',
        // Add other body types as needed
    };

    // Age slider functionality
    const ageSlider = document.getElementById("age");
    const ageValue = document.getElementById("ageValue");

    ageSlider.addEventListener("input", function() {
        ageValue.textContent = this.value;
    });

    // Card flip functionality
    const card = document.querySelector('.card');
    const editButton = document.getElementById('editButton');
    const fitnessForm = document.getElementById('fitnessForm');

    // Function to populate the result card with user data
    function populateResultCard(userData, bodyType) {
        // Set body type and image
        document.getElementById('bodyTypeResult').textContent = bodyType;
        
        // Set body type image
        const bodyTypeImg = document.getElementById('bodyTypeImage');
        if (bodyTypeImages[bodyType]) {
            bodyTypeImg.src = bodyTypeImages[bodyType];
            bodyTypeImg.alt = bodyType + " body type";
        } else {
            // Fallback image or placeholder
            bodyTypeImg.src = '/images/default-body-type.png';
            bodyTypeImg.alt = "Body type";
        }
        
        // Populate user details
        document.getElementById('resultAge').textContent = userData.age + " years";
        document.getElementById('resultGender').textContent = userData.gender;
        document.getElementById('resultHeight').textContent = userData.height + " cm";
        document.getElementById('resultWeight').textContent = userData.weight + " kg";
        document.getElementById('resultShoulderWidth').textContent = userData.shoulderWidth + " cm";
        document.getElementById('resultWaistWidth').textContent = userData.waistWidth + " cm";
        document.getElementById('resultArmWidth').textContent = userData.armWidth + " cm";
        document.getElementById('resultChestWidth').textContent = userData.chestWidth + " cm";
        document.getElementById('resultLegWidth').textContent = userData.legWidth + " cm";
    }

    // Edit button click handler
    editButton.addEventListener('click', async function() {
        card.classList.remove('flipped');
        
        try {
            const response = await fetch(`http://localhost:3000/api/fitness/getFitnessData/${userId}`);
            const data = await response.json();
            console.log("Fetched fitness data:", data);
    
            if (response.ok && data) {
                // Populate age input and display value
                const ageInput = document.getElementById('age');
                const ageValue = document.getElementById('ageValue');
                ageInput.value = data.age;
                ageValue.textContent = data.age;
    
                // Populate gender radio buttons
                document.getElementsByName('gender').forEach(radio => {
                    if (radio.value === data.gender) {
                        radio.checked = true;
                    }
                });
    
                // Populate other input fields
                document.getElementById('height').value = data.height;
                document.getElementById('weight').value = data.weight;
                document.getElementById('shoulderWidth').value = data.shoulderWidth;
                document.getElementById('waistWidth').value = data.waistWidth;
                document.getElementById('armWidth').value = data.armWidth;
                document.getElementById('chestWidth').value = data.chestWidth;
                document.getElementById('legWidth').value = data.legWidth;
            } else {
                console.error("Failed to fetch fitness data.");
            }
        } catch (error) {
            console.error("Error fetching fitness data:", error);
        }
    });
    

    // Form submission handling
    fitnessForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        // Get form values
        const age = parseInt(document.getElementById('age').value);
        const genderElements = document.getElementsByName('gender');
        let gender = '';
        
        for (let i = 0; i < genderElements.length; i++) {
            if (genderElements[i].checked) {
                gender = genderElements[i].value;
                // Capitalize first letter for database consistency (since enum is "Male", "Female", "Other")
                gender = gender.charAt(0).toUpperCase() + gender.slice(1);
                break;
            }
        }
        
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const shoulderWidth = parseFloat(document.getElementById('shoulderWidth').value);
        const waistWidth = parseFloat(document.getElementById('waistWidth').value);
        const armWidth = parseFloat(document.getElementById('armWidth').value);
        const chestWidth = parseFloat(document.getElementById('chestWidth').value);
        const legWidth = parseFloat(document.getElementById('legWidth').value);
        
        // Calculate BMI
        const bmi = weight / ((height / 100) ** 2);
        
        // Determine weight status
        let weightStatus = '';
        let bmiPercentage = 0;
        
        if (bmi < 18.5) {
            weightStatus = 'Underweight';
            bmiPercentage = (bmi / 18.5) * 25;
        } else if (bmi < 25) {
            weightStatus = 'Normal';
            bmiPercentage = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
        } else if (bmi < 30) {
            weightStatus = 'Overweight';
            bmiPercentage = 50 + ((bmi - 25) / (30 - 25)) * 25;
        } else {
            weightStatus = 'Obese';
            bmiPercentage = 75 + Math.min(((bmi - 30) / 10) * 25, 25);
        }
        
        // Update BMI indicator (if you have these elements in your UI)
        if (document.getElementById('bmiIndicator')) {
            document.getElementById('bmiIndicator').style.width = `${bmiPercentage}%`;
        }
        if (document.getElementById('weightStatus')) {
            document.getElementById('weightStatus').textContent = weightStatus;
        }
        
        // Calculate TDEE (very basic calculation)
        let bmr = 0;
        if (gender === 'Male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        
        // Assuming moderate activity level (multiplier 1.55)
        const tdee = Math.round(bmr * 1.55);
        if (document.getElementById('tdeeValue')) {
            document.getElementById('tdeeValue').textContent = tdee;
        }
        
        // Calculate ideal weight range based on BMI between 18.5 and 24.9
        const minWeight = Math.round(18.5 * ((height / 100) ** 2));
        const maxWeight = Math.round(24.9 * ((height / 100) ** 2));
        
        // Use the average of min and max weight as a single number for idealWeightRange
        const idealWeightRange = Math.round((minWeight + maxWeight) / 2);
        
        if (document.getElementById('minWeight')) {
            document.getElementById('minWeight').textContent = minWeight;
        }
        if (document.getElementById('maxWeight')) {
            document.getElementById('maxWeight').textContent = maxWeight;
        }
        
        // Predict the body type
        let predictedBodyType = "";
        try {
            console.log("Sending prediction request...");
            const predictionResponse = await fetch("http://localhost:3000/predictBodyType", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ height, weight, shoulderWidth, waistWidth, armWidth, chestWidth, legWidth })
            });

            const predictionResult = await predictionResponse.json();
            if (predictionResponse.ok) {
                predictedBodyType = predictionResult.predictedBodyType;
                // Make sure the bodyType value matches one of the enum values in your schema
                if (!["Endomorph", "Mesomorph", "Ectomorph"].includes(predictedBodyType)) {
                    predictedBodyType = "Mesomorph"; // Default fallback
                }
                console.log("Predicted Body Type:", predictedBodyType);
            } else {
                console.error("Body type prediction failed:", predictionResult.error);
                alert(`Prediction Error: ${predictionResult.error}`);
                return;
            }
        } catch (error) {
            console.error("Prediction request failed:", error);
            alert("Failed to predict body type.");
            return;
        }

        // Update the details to save to database
        const fitnessData = {
            userId, // Use the correct variable name
            age,
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
            minWeight, // Now this is a single number (average)
            maxWeight,
            bodyType: predictedBodyType // Include the predicted body type
        };
    
        try {
            const response = await fetch("http://localhost:3000/api/fitness/saveFitnessData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fitnessData)
            });
    
            const result = await response.json();
            if (response.ok) {
                console.log("Fitness data saved successfully!");
                
                // Populate the result card with the data
                populateResultCard({
                    age,
                    gender,
                    height,
                    weight,
                    shoulderWidth,
                    waistWidth,
                    armWidth,
                    chestWidth,
                    legWidth
                }, predictedBodyType);
                
                // Flip the card to show results
                card.classList.add('flipped');
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to save fitness data.");
        }
    });
    const chartBars = document.querySelectorAll("#bodyProportionChart .flex div");
    
    if (chartBars.length === 0) {
        console.error("Chart bars not found.");
        return;
    }

    const maxMeasurement = Math.max(
        shoulderWidth,
        chestWidth,
        waistWidth,
        armWidth,
        legWidth
    );
    console.log("Max measurement:", maxMeasurement);

    const measurements = [
        shoulderWidth,
        chestWidth,
        waistWidth,
        armWidth,
        legWidth
    ];

    chartBars.forEach((bar, index) => {
        bar.style.height = `${(measurements[index] / maxMeasurement) * 100}%`;
    });


});
function clearLocalStorage() {
    localStorage.clear();
    // Optional: Redirect to homepage after clearing
    window.location.href = "/";
}
