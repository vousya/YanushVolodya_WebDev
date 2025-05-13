const studentsPerPage = 4;
let currentPage = 1;
let students = [];

async function fetchStudents() {
  const token = sessionStorage.getItem("access_token");
  const response = await fetch("http://127.0.0.1:8000/students", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    });
  const data = await response.json();
  if(response.status === 401){
    window.location.href = "/frontend/index.html";
  };
  students = data.students;
  renderTable();
  renderPagination();
}

function renderTable() {
  if((currentPage-1) * studentsPerPage >= students.length){
    currentPage--;
  }
  const start = (currentPage - 1) * studentsPerPage;
  const pageStudents = students.slice(start, start + studentsPerPage);
  const tbody = document.querySelector('#student-table tbody');
  tbody.innerHTML = pageStudents.map(student => `
    <tr>
      <td>
          <label for="checkbox-${student.student_id}" class="visually-hidden">Select ${student.name}</label>
          <input type="checkbox" id="checkbox-${student.student_id}" class="checkbox">
          <span class="student-id">${student.student_id}</span>
      </td>
      <td>${student.group_name}</td>
      <td>
        <span class="full-name">${student.name}</span>
        <span class="initials">${student.name.split(" ").map(word => word[0]).join(" ").toUpperCase()}</span>
      </td>
      <td>${student.gender}</td>
      <td>${student.birthday.split("-").reverse().join(".")}</td>
      <td>
        <img class="status" alt="status-${student.status ? 'active' : 'inactive'}" 
        src="resources/status-${student.status ? 'active' : 'inactive'}.svg">
      </td>
      <td>
        <button class="edit-btn">
          <img src="resources/edit.svg" alt="edit">
        </button>
        <button class="remove-btn">
          <img src="resources/remove.svg" alt="remove">
        </button>
      </td>
    </tr>
  `).join('');
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    const removeBtn = row.querySelector(".remove-btn");
    const editBtn = row.querySelector(".edit-btn");
    const checkbox = row.querySelector('#student-table input[type="checkbox"]');

    removeBtn.addEventListener("click", function() {
      if (row.cells[0].querySelector("input").checked) {
        open_remove_window(row);
      }
    });

    editBtn.addEventListener("click", function() {
      if (row.cells[0].querySelector("input").checked) {
        open_edit_window(row);
      }
    });

    checkbox.addEventListener('change', update_main_checkbox);
    
  });
}

function renderPagination() {
  let main_checkbox = document.getElementById("main-checkbox");
  if(main_checkbox){
    main_checkbox.checked = false;
  }
  const totalPages = Math.ceil(students.length / studentsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const createButton = (text, page, disabled = false, isActive = false) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.disabled = disabled;
    if (isActive) btn.classList.add('active');
    btn.classList.add('pagination-btn');
    btn.addEventListener('click', () => {
      currentPage = page;
      renderTable();
      renderPagination();
    });
    return btn;
  };

  pagination.appendChild(createButton('←', currentPage - 1, currentPage === 1));

  const range = 1;

  const pages = [];

  const startPage = Math.max(1, currentPage - range);
  const endPage = Math.min(totalPages, currentPage + range);

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  pages.forEach(p => {
    if (p === '...') {
      const span = document.createElement('span');
      span.textContent = '...';
      span.classList.add('dots');
      pagination.appendChild(span);
    } else {
      pagination.appendChild(createButton(p, p, false, p === currentPage));
    }
  });

  pagination.appendChild(createButton('→', currentPage + 1, currentPage === totalPages));
}

async function add_unread_message(msg){
    bell_animation();
    const unread_messages = document.getElementById("unread-messages");
    const unread_message = document.createElement('div');
    unread_message.classList.add("unread-message");

    const usernameDiv = document.createElement("div");
    usernameDiv.classList.add("msg-username");

    const token = sessionStorage.getItem("access_token");
    const response = await fetch(`http://localhost:8000/students/${msg.sender_id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();

    usernameDiv.textContent = result.name;

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("msg-content");
    contentDiv.textContent = msg.text;

    unread_message.appendChild(usernameDiv);
    unread_message.appendChild(contentDiv);
    unread_messages.appendChild(unread_message);
}

let access_token = sessionStorage.getItem("access_token");
if (access_token){
    document.getElementById("login").style.display = "none";

    loadStudentProfile();
    
    const socket = new WebSocket(`ws://localhost:8000/ws/connect`);
    
    const message = {
        access_token: access_token
    };
    
    socket.onopen = () =>{
        socket.send(JSON.stringify(message));
    }

    socket.onmessage = function (event) {
        fetchStudents();
        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (document.getElementById("communication").style.display === "flex"){  
                render_message(msg);
            }
            else{
                console.log("Entered(((");
                add_unread_message(msg);
            }
            console.log("message accepted: ", msg);
        }
    };
}

const add_btn = document.getElementById("add-button");
if (add_btn) {
    add_btn.addEventListener("click", open_add_window);
}

function validate_name() {
    let full_name = document.getElementById("name-add-edit").value;
    let formated_name = full_name.trim().replace(/\s+/g, ' ');

    let error = document.getElementById("error-message-name");

    if (formated_name === "") {
        error.textContent = "Enter full name";
        error.style.display = "block";
        return false;
    }

    if (!/^[A-Za-z]+([ '`-][A-Za-z]+)*$/.test(formated_name)) {
        error.textContent = "Name must be a string";
        error.style.display = "block";
        return false;
    }

    if (formated_name.split(" ").length !== 2) {
        error.textContent = "Name must contain exactly 2 words";
        error.style.display = "block";
        return false;
    }

    error.style.display = "none";
    return true;
}

function validate_date() {
    const today = new Date();
    const date = document.getElementById("date-add-edit").value;
    const error = document.getElementById("error-message-date");

    if (!date) {
        error.textContent = "Please enter a date.";
        error.style.display = "block";
        return false;
    }

    let birthday = new Date(date);
    let too_old = new Date();
    too_old.setFullYear(today.getFullYear() - 80);

    let too_young = new Date();
    too_young.setFullYear(today.getFullYear() - 17);

    if (birthday > today) {
        error.textContent = "Are you from the future?";
        error.style.display = "block";
        return false;
    }

    if (birthday > too_young) {
        error.textContent = "You are too young to be a student.";
        error.style.display = "block";
        return false;
    }

    if (birthday < too_old) {
        error.textContent = "You are too old to be a student.";
        error.style.display = "block";
        return false;
    }

    error.style.display = "none";
    return true;
}

function open_add_window() {
    let title_window = document.getElementById("add-edit-title");
    title_window.textContent = "Add Student";

    let modal = document.getElementById("add-edit-student");

    modal.style.display = "block";

    let group = document.getElementById("group-add-edit");
    let name_input = document.getElementById("name-add-edit");
    let date_input = document.getElementById("date-add-edit");

    name_input.value = "";
    date_input.value = "";
    group.value = "PZ-12";

    const close = document.getElementById("close-add-edit-window");
    const cancel = document.getElementById("cancel-add-edit-btn");
    const add = document.getElementById("action-add-edit-btn");

    const finaliser = () => {
        modal.style.display = "none";

        add.removeEventListener("click", add_student);
        close.removeEventListener("click", finaliser);
        cancel.removeEventListener("click", finaliser);

        name_input.removeEventListener("input", validate_name);
        date_input.removeEventListener('input', validate_date);
    };

    const add_student = () => {
        if (validate_name() && validate_date()) {
            add_row();
            finaliser();
        }
    };

    name_input.addEventListener('input', validate_name);
    date_input.addEventListener('input', validate_date);

    add.addEventListener("click", add_student);
    close.addEventListener("click", finaliser);
    cancel.addEventListener("click", finaliser);
}

function add_row() {
    let group = document.getElementById("group-add-edit").value;
    let full_name_input = document.getElementById("name-add-edit").value;
    let formated_name = full_name_input.trim().replace(/\s+/g, ' ');
    let gender = document.getElementById("gender-add-edit").value;
    let date = document.getElementById("date-add-edit").value;

    let full_name = formated_name.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");

    const student_json = {
        group_name: group,
        name: full_name,
        gender: gender,
        birthday: date,
        status: false
    };
    
    const token = sessionStorage.getItem("access_token");
    fetch(`http://127.0.0.1:8000/students`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(student_json)
    })
    .then(response => {
        if (response.status === 400) {
            alert("⚠️ This student already exists. Please check the details and try again.");
        }
        if(response.status === 401){
            window.location.href = "/frontend/index.html";
        };
        if (!response.ok) {
            throw new Error("Failed to add student");
        }
        return response.json();
    })
    .then(data => {
        fetchStudents();
    })
    .catch(error => {
        console.error("Error:", error);
    });
    
    update_main_checkbox();
}

document.querySelectorAll(".remove-btn").forEach(button => {
    button.addEventListener("click", function() {
        const row = this.closest("tr");
        if (row.cells[0].querySelector("input").checked) {
            open_remove_window(row);
        }
    });
});

function open_remove_window(row) {
    let modal = document.getElementById("remove-student");

    let name = row.querySelector(".full-name").textContent;

    modal.style.display = "block";

    const close = document.getElementById("close-remove-window");
    const cancel = document.getElementById("cancel-remove-btn");
    const remove = document.getElementById("action-remove-btn");

    const remove_student = () => {

        student_id = row.querySelector(".student-id").textContent;

        const token = sessionStorage.getItem("access_token");
        fetch(`http://127.0.0.1:8000/students/${student_id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/json"
            }
        })
        .then(response => {
            if(response.status === 401){
                window.location.href = "/frontend/index.html";
            };
            if (!response.ok) {
                throw new Error("Failed to delete student");
            }
            return response.json();
        })
        .then(data => {
            fetchStudents();
        })
        .catch(error => {
            console.error("Error:", error);
        });

        const table = document.getElementById("student-table");
        const rowIndex = row.rowIndex;
        table.deleteRow(rowIndex);

        modal.style.display = "none";

        remove.removeEventListener("click", remove_student);
    };

    remove.addEventListener("click", remove_student);
    close.addEventListener("click", function() {
        remove.removeEventListener("click", remove_student);
        modal.style.display = "none";
    });
    cancel.addEventListener("click", function() {
        remove.removeEventListener("click", remove_student);
        modal.style.display = "none";
    });

    document.getElementById("remove-text").textContent = "Are you sure you want to delete " + name + "?";
}

document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", function(e) {
        let row = e.target.closest("tr");
        if (row.cells[0].querySelector("input").checked) {
            open_edit_window(row);
        }
    });
});

function open_edit_window(row) {
    let title_window = document.getElementById("add-edit-title");
    title_window.textContent = "Edit Student";

    const modal = document.getElementById("add-edit-student");

    modal.style.display = "block";

    const close = document.getElementById("close-add-edit-window");
    const cancel = document.getElementById("cancel-add-edit-btn");
    const edit = document.getElementById("action-add-edit-btn");

    const row_group = row.children[1].textContent.trim();
    const row_name = row.querySelector(".full-name").textContent.trim();
    const row_gender = row.children[3].textContent.trim();
    const row_date = row.children[4].textContent.trim();
    let formated_date = row_date.split('.').reverse().join('-');

    let group_input = document.getElementById("group-add-edit");
    let name_input = document.getElementById("name-add-edit");
    let date_input = document.getElementById("date-add-edit");
    let gender_input = document.getElementById("gender-add-edit");

    group_input.value = row_group;
    name_input.value = row_name;
    gender_input.value = row_gender;
    date_input.value = formated_date;

    const finaliser = () => {
        edit.removeEventListener("click", edit_row);
        close.removeEventListener("click", finaliser);
        cancel.removeEventListener("click", finaliser);

        name_input.removeEventListener('input', validate_name);
        date_input.removeEventListener('input', validate_date);

        modal.style.display = "none";
    };

    const edit_row = () => {
        if (validate_name() && validate_date()) {

            let formated_name = name_input.value.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
            
            const student_json = {
                group_name: group_input.value,
                name: formated_name,
                gender: gender_input.value,
                birthday: date_input.value,
                status: false
            };
            
            student_id = row.querySelector(".student-id").textContent;

            const token = sessionStorage.getItem("access_token");
            fetch(`http://127.0.0.1:8000/students/${student_id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student_json)
            })
            .then(response => {
                if(response.status === 401){
                    window.location.href = "/frontend/login/index.html";
                };
                if (!response.ok) {
                    throw new Error("Failed to update student");
                }
                return response.json();
            })
            .then(data => {
                console.log("Updated student:", data);
            })
            .catch(error => {
                console.error("Error:", error);
            });

            let formated_date = date_input.value.split('-').reverse().join('.');

            row.children[1].textContent = group_input.value;
            row.querySelector(".full-name").textContent = formated_name;
            row.children[3].textContent = gender_input.value;
            row.children[4].textContent = formated_date;

            finaliser();
        }
    };

    name_input.addEventListener('input', validate_name);
    date_input.addEventListener('input', validate_date);

    edit.addEventListener("click", edit_row);
    close.addEventListener("click", finaliser);
    cancel.addEventListener("click", finaliser);
}

const main_checkbox = document.getElementById("main-checkbox");
if (main_checkbox) {
    main_checkbox.addEventListener("click", function() {
        let is_checked = this.checked;
        document.querySelectorAll('#student-table input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = is_checked;
        });
    });
}

document.querySelectorAll('#student-table input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', update_main_checkbox);
});

function update_main_checkbox() {
    const all_checkboxes = document.getElementsByClassName("checkbox");
    const all_checked = Array.from(all_checkboxes).every(checkbox => checkbox.checked);
    main_checkbox.checked = all_checked;
}

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
        
        const chatListContainer = document.getElementById('chat-list');
        
        chatListContainer.innerHTML = '';

        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            
            chatItem.textContent = chat.name;
            
            chatItem.setAttribute('data-chat-id', chat._id);

            chatItem.addEventListener("click", (event) => {
                const chat = event.target.closest("div");
                load_messages(chat);
            });

            chatListContainer.appendChild(chatItem);
        });
    } catch (error) {
        console.error("Error fetching student data:", error);
    }
}

function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join(' ');
}


function createProfilePic(name) {
    const div = document.createElement('div');
    div.textContent = getInitials(name);
    div.style.width = '40px';
    div.style.height = '40px';
    div.style.borderRadius = '50%';
    div.style.backgroundColor = "blue";
    div.style.color = 'white';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '16px';
    div.style.marginRight = '10px';
    div.style.marginLeft = '10px';
    div.style.flexShrink = '0';
    return div;
}

let participants;
let participants_profiles = {};

function render_message(msg) {
    const student_id = sessionStorage.getItem("student_id");
    const messagesContainer = document.querySelector(".message-container");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    if (msg.sender_id === student_id) {
        messageDiv.classList.add("sent");
    } else {
        messageDiv.classList.add("received");
    }

    let profilePic = participants_profiles[msg.sender_id].cloneNode(true);

    const messageBody = document.createElement("div");
    messageBody.classList.add("message-body");

    const usernameDiv = document.createElement("div");
    usernameDiv.classList.add("username");
    usernameDiv.textContent = participants[msg.sender_id];

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("message-content");
    contentDiv.textContent = msg.text;

    messageBody.appendChild(usernameDiv);
    messageBody.appendChild(contentDiv);

    messageDiv.appendChild(profilePic);
    messageDiv.appendChild(messageBody);
    messagesContainer.appendChild(messageDiv);
}

function render_participants(){
    const chat_participants = document.getElementById("chat-participants");
    chat_participants.innerHTML = '';
    for (const [id, profile] of Object.entries(participants_profiles)) {
        const profile_container = document.createElement("div");
        const profile_pic = profile.cloneNode(true);
        const profile_username = document.createElement("div");
        profile_username.classList.add("username");
        profile_username.textContent = participants[id];
        profile_container.appendChild(profile_pic);
        profile_container.appendChild(profile_username);
        chat_participants.appendChild(profile_container);
    }
}

function create_profile_pics(){
    participants_profiles = {};
    for (const [id, name] of Object.entries(participants)) {
        participants_profiles[id] = createProfilePic(name);
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

    participants = await response.json();
    create_profile_pics();

    response = await fetch(`http://127.0.0.1:8000/messages?chat_id=${chat_id}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
    });
    
    const header = document.getElementById("chat-header-name");
    header.textContent = chat.textContent;
    header.setAttribute('data-chat-id', chat_id);

    let name = document.getElementById("profile-text").textContent;
    document.getElementById("chat-profile-text").textContent = name;
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const messages = await response.json();
    const messagesContainer = document.querySelector(".message-container");

    messagesContainer.innerHTML = '';

    render_participants();

    messages.forEach(msg => {
        render_message(msg);
    });    
}

async function load_page(){
    await load_chats();

    const current_chat = document.querySelector(".chat-item");

    let messages = await load_messages(current_chat);
}


document.getElementById("bell").addEventListener('click', open_chats);

function open_chats(){
    const chats = document.getElementById("communication");
    const unread_messages = document.getElementById("unread-messages");
    unread_messages.innerHTML = '';
    chats.style.display = "flex";
    document.getElementById("home-logo").addEventListener("click", () =>{
        chats.style.display = "none";
    })
    load_page();
}

function bell_animation() {
    const bell = document.getElementById("bell");
    
    bell.classList.remove('swinging');
    void bell.offsetWidth;
    bell.classList.add('swinging');
}

let bell = document.getElementById("bell");
let messages = document.getElementById("unread-messages");
let hideTimeout;

bell.addEventListener("mouseenter", function() {
    clearTimeout(hideTimeout);
    messages.style.display = "block";
});

messages.addEventListener("mouseenter", function() {
    clearTimeout(hideTimeout);
});

bell.addEventListener("mouseleave", function() {
    hideTimeout = setTimeout(() => messages.style.display = "none", 300);
});

messages.addEventListener("mouseleave", function() {
    hideTimeout = setTimeout(() => messages.style.display = "none", 300);
});

let profile = document.getElementById("profile");
let options = document.getElementById("profile-options");

profile.addEventListener("mouseenter", function() {
    clearTimeout(hideTimeout);
    options.style.display = "flex";
});

options.addEventListener("mouseenter", function() {
    clearTimeout(hideTimeout);
});

profile.addEventListener("mouseleave", function() {
    hideTimeout = setTimeout(() => options.style.display = "none", 300);
});

options.addEventListener("mouseleave", function() {
    hideTimeout = setTimeout(() => options.style.display = "none", 300);
});

let burger = document.getElementById("burger");
burger.addEventListener("click", toggleMenu);

function toggleMenu() {
    let navigation = document.getElementById('navigation');
    if (burger.textContent == "☰") {
        navigation.style.display = "block";
        burger.textContent = "✖";
    } else {
        navigation.style.display = "none";
        burger.textContent = "☰";
    }
}

document.getElementById("logout-btn").addEventListener("click", async () => {
    const token = sessionStorage.getItem("access_token");

    const response = await fetch(`http://localhost:8000/logout?token=${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${token}`
        },
        body: new URLSearchParams()
    });

    const result = await response.json();

    sessionStorage.removeItem("access_token");
    window.location.href = "/frontend/index.html"; 
});

async function loadStudentProfile() {
    const profileName = document.getElementById("profile-text");
    const studentId = sessionStorage.getItem("student_id");

    try {
        const token = sessionStorage.getItem("access_token");
        const response = await fetch(`http://localhost:8000/students/${studentId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.name) {
            profileName.textContent = result.name;
        }
    } catch (error) {
        console.error("Error fetching student data:", error);
    }
}

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
            document.getElementById("login").style.display = "none";
            loadStudentProfile();
            fetchStudents();
            socket.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (document.getElementById("communication").style.display === "flex"){  
                    render_message(msg);
                }
                else{
                    console.log("LALALA");
                    add_unread_message(msg.text);
                }
                console.log("message accepted: ", msg);
            }
        }
    };
});

document.getElementById("send-message-btn").addEventListener("click", () => {
    let input = document.getElementById("input-message");
    let message_text = input.value;
    input.value = "";

    const chat = document.getElementById("chat-header-name");
    const chat_id = chat.getAttribute("data-chat-id");
    const sender_id = sessionStorage.getItem("student_id");

    const today = new Date();
    const yyyy_mm_dd = today.getFullYear() + "-" + 
        String(today.getMonth() + 1).padStart(2, '0') + "-" +
        String(today.getDate()).padStart(2, '0');

    const message = {
        text: message_text,
        sender_id: sender_id,
        chat_id: chat_id,
        created_at: yyyy_mm_dd
    }
        
    fetch(`http://localhost:8000/message`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
    })
    .then(response => {
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    })
    .then(data => {
    console.log("Message sent successfully:", data);
    })
    .catch(error => {
    console.error("Failed to send message:", error);
    });
})














let selected_students = []
let chat_participants = []; 
let all_students = []; 

const participantSearch = document.getElementById("participant-search");
const dropdown = document.getElementById("participant-dropdown");
const selectedContainer = document.getElementById("selected-participants");

async function loadParticipants() {
  try {
    const response = await fetch("http://127.0.0.1:8000/students");
    if (!response.ok) throw new Error("Failed to load participants");
    const data = await response.json();
    all_students = data.students;
  } catch (error) {
    console.error(error);
  }
}

function openModal() {
  document.getElementById("create-chat-modal").style.display = "flex";
  participantSearch.value = "";
  dropdown.innerHTML = "";
  dropdown.style.display = "none";
  let current_student = document.getElementById("profile-text").textContent;
  selected_students.push(current_student);
  renderSelectedUsers();
}

document.getElementById("add-chat-cancel-btn").addEventListener("click", () => {
    document.getElementById("create-chat-modal").style.display = "none";
})

participantSearch.addEventListener("input", () => {
    const query = participantSearch.value;
    dropdown.innerHTML = "";
    const filtered = all_students.filter(student =>
        student.name.includes(query) &&
        !selected_students.includes(student.name)
    ).slice(0, 5);


    if (filtered.length > 0 && query !== "") {
        dropdown.style.display = "block";
        filtered.forEach(student => {
            const option = document.createElement("div");
            option.textContent = student.name;
            option.style.padding = "6px";
            option.style.cursor = "pointer";
            option.addEventListener("click", () => selectUser(student));
            dropdown.appendChild(option);
      });
    } else {
        dropdown.style.display = "none";
    }
});

function selectUser(student) {
    selected_students.push(student.name);
    chat_participants.push(student.student_id.toString());
    dropdown.style.display = "none";
    participantSearch.value = "";
    renderSelectedUsers();
}

function renderSelectedUsers() {
  selectedContainer.innerHTML = "";
  selected_students.forEach(name => {
    const tag = document.createElement("div");
    tag.textContent = name;
    tag.classList.add("participant-tag");
    tag.style.padding = "6px 10px";
    tag.style.background = "#cce5ff";
    tag.style.borderRadius = "4px";
    selectedContainer.appendChild(tag);
  });
}

document.getElementById("add-chat").addEventListener("click", async () => {
  await loadParticipants();
  openModal();
});

document.getElementById("add-chat-create-chat-btn").addEventListener("click", () => {
    const token = sessionStorage.getItem("access_token");

    let chat_name = document.getElementById("chat-name").value;

    const today = new Date();
    const yyyy_mm_dd = today.getFullYear() + "-" + 
        String(today.getMonth() + 1).padStart(2, '0') + "-" +
        String(today.getDate()).padStart(2, '0');

    const payload = {
        name: chat_name,
        participants: chat_participants,
        created_at: yyyy_mm_dd
    };
    
    fetch("http://127.0.0.1:8000/chat", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Chat created successfully:', data);
    })
    .catch(error => {
        console.error('Error creating chat:', error);
    });
    document.getElementById("create-chat-modal").style.display = "none";
})