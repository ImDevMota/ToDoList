const login = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

login.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    const response = await fetch("http://localhost:5501/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    }); 

    if (response.status === 200) {
        window.location.href = "/Web/List/list.html"; 
    } else {
        const result = await response.text();
        alert(result);
    }
});