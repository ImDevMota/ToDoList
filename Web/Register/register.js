const register = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const randomNumber = Math.floor(Math.random() * 1000);

register.addEventListener("submit", async (e) => { // set localstore userId 
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const username = usernameInput.value;
    const userId = `${usernameInput.value}-${randomNumber}`;

    localStorage.setItem("username", username);
    localStorage.setItem("user_id", userId);

    const response = await fetch("http://localhost:5501/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, userId, password, username })
    });

    if (response.status === 201) {
      window.location.href = "/Web/Login/login.html"; 
    } else {
      const result = await response.text();
      alert(result);
    }
  });