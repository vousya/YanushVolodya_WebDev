const add_btn = document.getElementById("add-button");
if (add_btn){
    add_btn.addEventListener("click", open_add_window);
}

function validate_name() {
    let full_name = document.getElementById("name-add-edit").value;
    let formated_name = full_name.trim().replace(/\s+/g, ' ');

    let error = document.getElementById("error-message-name");

    if(formated_name === ""){
        error.textContent = "Enter full name";
        error.style.display = "block";
        return false;
    }

    if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(formated_name)) {
        error.textContent = "Name must be a string";
        error.style.display = "block";
        return false;
    }

    if (formated_name.split(" ").length !== 2){
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


function open_add_window(){
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
    }

    const add_student = () => {
        if (validate_name() && validate_date()){
            add_row();
            finaliser();
        }
    }

    name_input.addEventListener('input', validate_name);
    date_input.addEventListener('input', validate_date);

    add.addEventListener("click", add_student);
    close.addEventListener("click", finaliser);
    cancel.addEventListener("click", finaliser);
}

function add_row() {
    let table = document.getElementById("student-table").getElementsByTagName('tbody')[0];

    let group = document.getElementById("group-add-edit").value;
    let full_name_input = document.getElementById("name-add-edit").value;
    let formated_name = full_name_input.trim().replace(/\s+/g, ' ');
    let gender = document.getElementById("gender-add-edit").value;
    let date = document.getElementById("date-add-edit").value;

    let initials = formated_name.split(" ").map(word => word[0]).join(" ").toUpperCase();

    let full_name = formated_name.split(" ").map(word => word.charAt(0).toUpperCase() +
     word.slice(1).toLowerCase()).join(" ");

    let parts = date.split("-");
    let normal_date = parts[2] + "." + parts[1] + "." + parts[0];

    let new_row = table.insertRow();
    
    new_row.innerHTML = `
    <td><input type="checkbox" class="checkbox"></td>
    <td>${group}</td>
    <td>
        <span class="full-name">${full_name}</span>
        <span class="initials">${initials}</span>
    </td>
    <td>${gender}</td>
    <td>${normal_date}</td>
    <td>
        <img class="status" src="resources/status-inactive.svg">
    </td>
    <td>
        <button class="edit-btn">
           <img src="resources/edit.svg">
        </button>
        <button class="remove-btn">
            <img src="resources/remove.svg">
        </button>
    </td>
    `;

    new_row.cells[0].addEventListener("change", update_main_checkbox);
    new_row.cells[6].querySelector(".remove-btn").addEventListener("click", function() {
        if(new_row.cells[0].querySelector("input").checked){
            open_remove_window(new_row);
        }
    });
    new_row.cells[6].querySelector(".edit-btn").addEventListener("click", function() {
        if(new_row.cells[0].querySelector("input").checked){
            open_edit_window(new_row);
        }
    });

    document.getElementById("name-add-edit").value = "";
    document.getElementById("date-add-edit").value = "";

    update_main_checkbox();
}

document.querySelectorAll(".remove-btn").forEach(button => {
    button.addEventListener("click", function() {
        const row = this.closest("tr");
        if(row.cells[0].querySelector("input").checked){
            console.log("Removing row:", row);
            open_remove_window(row);
        }
    });
});

function open_remove_window(row){
    let modal = document.getElementById("remove-student");

    let name = row.querySelector(".full-name").textContent;

    modal.style.display = "block";

    const close = document.getElementById("close-remove-window");
    const cancel = document.getElementById("cancel-remove-btn");
    const remove = document.getElementById("action-remove-btn");

    const remove_student = () => {
        const table = document.getElementById("student-table");
        const rowIndex = row.rowIndex;
        table.deleteRow(rowIndex);

        modal.style.display = "none";

        remove.removeEventListener("click", remove_student);
    };

    remove.addEventListener("click", remove_student);
    close.addEventListener("click", function(){
        remove.removeEventListener("click", remove_student);
        modal.style.display = "none";
    });
    cancel.addEventListener("click", function(){
        remove.removeEventListener("click", remove_student);
        modal.style.display = "none";
    });
    
    document.getElementById("remove-text").textContent = "Are you " +
    "sure you want to delete " + name + "?"
}

document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", function(e) {
        let row = e.target.closest("tr");
        if(row.cells[0].querySelector("input").checked){
            console.log("Editing row:", row);
            open_edit_window(row);
        }
    });
});

function open_edit_window(row){
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
    }

    const edit_row = () => {
        console.log("EDITING");

        if (validate_name() && validate_date()){
            row.children[1].textContent = group_input.value;
            let formated_name = name_input.value.split(" ").map(word => word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()).join(" ");
            row.querySelector(".full-name").textContent = formated_name;
            row.children[3].textContent = gender_input.value;
            row.children[4].textContent = date_input.value;
        }

        finaliser();
    }

    name_input.addEventListener('input', validate_name);
    date_input.addEventListener('input', validate_date);

    edit.addEventListener("click", edit_row);
    close.addEventListener("click", finaliser);
    cancel.addEventListener("click", finaliser);
}

const main_checkbox = document.getElementById("main-checkbox");
if (main_checkbox){
    main_checkbox.addEventListener("click", function(){
        let is_checked = this.checked;
        document.querySelectorAll('#student-table input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = is_checked;
        });
    })
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
}

let bell = document.getElementById("bell");
let messages = document.getElementById("bell-messages");
let hideTimeout;

bell.addEventListener("mouseenter", function () {
    clearTimeout(hideTimeout);
    messages.style.display = "block";
});

messages.addEventListener("mouseenter", function () {
    clearTimeout(hideTimeout);
});

bell.addEventListener("mouseleave", function () {
    hideTimeout = setTimeout(() => messages.style.display = "none", 300);
});

messages.addEventListener("mouseleave", function () {
    hideTimeout = setTimeout(() => messages.style.display = "none", 300);
});

let profile = document.getElementById("profile");
let options = document.getElementById("profile-options");

profile.addEventListener("mouseenter", function () {
    clearTimeout(hideTimeout);
    options.style.display = "block";
});

options.addEventListener("mouseenter", function () {
    clearTimeout(hideTimeout);
});

profile.addEventListener("mouseleave", function () {
    hideTimeout = setTimeout(() => options.style.display = "none", 300);
});

options.addEventListener("mouseleave", function () {
    hideTimeout = setTimeout(() => options.style.display = "none", 300);
});

let burger = document.getElementById("burger");
burger.addEventListener("click", toggleMenu);

function toggleMenu() {
    let navigation = document.getElementById('navigation');
    if (burger.textContent == "☰"){
        navigation.style.display = "block";
        burger.textContent = "✖";
    }
    else {
        navigation.style.display = "none";
        burger.textContent = "☰";
    }
}