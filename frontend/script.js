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

    console.log("Added student JSON:", JSON.stringify(student_json));
    
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
            window.location.href = "/frontend/login/index.html";
        };
        if (!response.ok) {
            throw new Error("Failed to add student");
        }
        return response.json();
    })
    .then(data => {
        console.log("Added student:", data);
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
            console.log("Removing row:", row);
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
                window.location.href = "/frontend/login/index.html";
            };
            if (!response.ok) {
                throw new Error("Failed to delete student");
            }
            return response.json();
        })
        .then(data => {
            console.log("Deleted student:", data);
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
            console.log("Editing row:", row);
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

            console.log("Edited student JSON:", JSON.stringify(student_json));
            
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

document.getElementById("bell").addEventListener('click', bell_animation);

function bell_animation(event) {
    const bell = event.target;
    
    bell.classList.remove('swinging');
    void bell.offsetWidth;
    bell.classList.add('swinging');
    window.location.href = "/frontend/communication/communication.html";
}

let bell = document.getElementById("bell");
let messages = document.getElementById("bell-messages");
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
    console.log(result);

    sessionStorage.removeItem("access_token");
    window.location.href = "/frontend/login/index.html"; 
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

let access_token = sessionStorage.getItem("access_token");
if (access_token){
    document.getElementById("login").style.display = "none";

    loadStudentProfile();
    fetchStudents();

    const socket = new WebSocket(`ws://localhost:8000/ws/connect`);
    
    const message = {
        access_token: access_token
    };

    socket.onopen = () =>{
        socket.send(JSON.stringify(message));
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
        }
    };
});

