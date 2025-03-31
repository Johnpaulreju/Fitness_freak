document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    // ✅ Handle Login Form Submission
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const loginEmail = document.getElementById("loginEmail").value;
            const loginPassword = document.getElementById("loginPassword").value;

            try {
                const response = await fetch("http://localhost:3000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
                    mode: "cors"
                });

                const data = await response.json();
                console.log("Server Response:", data);

                if (response.ok) {
                    localStorage.setItem("userId", data.userId); // ✅ Store userId in local storage
                    window.location.href = "/form"; // ✅ Redirect to /form
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error("Error during login:", error);
                alert("Login failed. Please try again.");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
    
            const registerUsername = document.getElementById("registerUsername").value;
            const registerEmail = document.getElementById("registerEmail").value;
            const registerPassword = document.getElementById("registerPassword").value;

            try {
                const response = await fetch("http://localhost:3000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: registerEmail,
                        password: registerPassword,
                        userDetails: { username: registerUsername }
                    }),
                    mode: "cors"
                });
    
                const data = await response.json();
                console.log("Server Response:", data); // ✅ Debugging
    
                if (response.ok) {
                    alert("User Registered Successfully! Please Login.");
                    window.location.href = "/login"; // Redirect to login page
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error("Error during registration:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
    
});
  
const wrapper = document.querySelector('.wrapper')
const registerLink = document.querySelector('.register-link')
const loginLink = document.querySelector('.login-link')

registerLink.onclick = () => {
    wrapper.classList.add('active')
}

loginLink.onclick = () => {
    wrapper.classList.remove('active')
}

