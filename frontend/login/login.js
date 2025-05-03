document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const socket = new WebSocket(`ws://localhost:8000/ws/login`);

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const message = {
        email: email,
        password: password
    };


    socket.onopen = () =>{
        socket.send(JSON.stringify(message));
    }

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
 
        if (msg === "error") {
            document.getElementById("error").innerText = data.detail || "Login failed";
        }   
        else {
            sessionStorage.setItem("access_token", msg.access_token);
            sessionStorage.setItem("student_id", msg.student_id);
            window.location.href = "/frontend/student.html";
        }
    };
});