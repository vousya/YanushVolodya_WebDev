document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:8000/token", {
      method: "POST",
      headers: {
          "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ 
          grant_type: "password",
          username: email,
          password: password
      })
      });


    const data = await response.json();

    if (response.ok) {
        sessionStorage.setItem("access_token", data.access_token);
        window.location.href = "/student.html";
    }   
    else {
        document.getElementById("error").innerText = data.detail || "Login failed";
    }
  });