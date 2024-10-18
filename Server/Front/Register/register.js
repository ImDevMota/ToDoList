const register = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");

register.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const username = usernameInput.value;

    const response = await fetch("http://localhost:5501/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, username })
    });

    if (response.status === 201) {
      window.location.href = "/Server/Front/Login/login.html"; 
    } else {
      const result = await response.text();
      alert(result);
    }
  });