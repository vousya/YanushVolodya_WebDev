async function load_chats() {
    const studentId = sessionStorage.getItem("student_id");

    try {
        const token = sessionStorage.getItem("access_token");
        const response = await fetch(`http://localhost:8000/chats?access_token=${token}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const chats = await response.json();
        console.log(chats);
        
        const chatListContainer = document.getElementById('chat-list');
        
        chatListContainer.innerHTML = '';

        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            
            chatItem.textContent = chat.name;
            
            chatItem.setAttribute('data-chat-id', chat._id);

            chatListContainer.appendChild(chatItem);
        });
    } catch (error) {
        console.error("Error fetching student data:", error);
    }
}

async function load_messages(chat) {
    const token = sessionStorage.getItem("access_token");
    const chat_id = chat.getAttribute("data-chat-id");

    let response = await fetch(`http://127.0.0.1:8000/participants?chat_id=${chat_id}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const participants = await response.json()

    response = await fetch(`http://127.0.0.1:8000/messages?chat_id=${chat_id}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
    });
    
    const header = document.getElementById("chat-header");
    header.textContent = chat.textContent;

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const messages = await response.json();
    const messagesContainer = document.querySelector(".messages");
    const student_id = sessionStorage.getItem("student_id");

    messagesContainer.innerHTML = '';

    messages.forEach(msg => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
    
        if (msg.sender_id === student_id) {
            messageDiv.classList.add("sent");
        } else {
            messageDiv.classList.add("received");
        }
    
        const usernameDiv = document.createElement("div");
        usernameDiv.classList.add("username");
        let username = participants[msg.sender_id];
        console.log(username);
        usernameDiv.textContent = username;
    
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("message-content");
        contentDiv.textContent = msg.text;
    
        messageDiv.appendChild(usernameDiv);
        messageDiv.appendChild(contentDiv);
    
        messagesContainer.appendChild(messageDiv);
    });
    
    
}

async function load_page(){
    await load_chats();

    const current_chat = document.querySelector(".chat-item");

    let messages = await load_messages(current_chat);
    console.log(messages);
}

load_page();