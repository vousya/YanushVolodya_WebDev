const add_btn = document.getElementById("add-button");
if (add_btn){
    add_btn.addEventListener("click", open_add_window);
}

function open_add_window(){
    const modal = document.getElementById("add-student");
    
    modal.style.display = "block";
    
    const close = document.getElementById("close-add-window");
    const cancel = document.getElementById("cancel-add-btn");
    const add = document.getElementById("action-add-btn");

    close.addEventListener("click", close_add_window);
    cancel.addEventListener("click", close_add_window);
    add.addEventListener("click", add_row);
}

function close_add_window() {
    const modal = document.getElementById("add-student");
    modal.style.display = "none";
}

function add_row() {
    let table = document.getElementById("student-table").getElementsByTagName('tbody')[0];

    let group = document.getElementById("group-add").value;
    let full_name = document.getElementById("name-add").value;
    let gender = document.getElementById("gender-add").value;
    let date = document.getElementById("date-add").value;

    if (full_name.trim() === "" || date === "") {
        alert("Please fill in all required fields.");
        return;
    }

    let initials = full_name.split(" ").map(word => word[0]).join(" ").toUpperCase();

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
        const row = this.closest("tr");
        if(row.cells[0].querySelector("input").checked){
            open_remove_window(row);
        }
    });

    document.getElementById("name-add").value = "";
    document.getElementById("date-add").value = "";
    close_add_window();

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
    const modal = document.getElementById("edit-student");
    
    modal.style.display = "block";
    
    const close = document.getElementById("close-edit-window");
    const cancel = document.getElementById("cancel-edit-btn");
    const edit = document.getElementById("action-edit-btn");

    const row_group = row.children[1].textContent.trim();
    const row_name = row.querySelector(".full-name").textContent.trim();  
    const row_gender = row.children[3].textContent.trim();
    const row_date = row.children[4].textContent.trim();  

    let group = document.getElementById("group-edit");
    let name = document.getElementById("name-edit");
    let gender = document.getElementById("gender-edit");
    let date = document.getElementById("date-edit");
    let formated_date = row_date.split('.').reverse().join('-');

    group.value = row_group;
    name.value = row_name;
    gender.value = row_gender;
    date.value = formated_date;

    const edit_row = () => {
        
        edit.removeEventListener("click", edit_row);
        modal.style.display = "none";
    }

    edit.addEventListener("click", edit_row);
    close.addEventListener("click", () => {
        edit.removeEventListener("click", edit_row);
        modal.style.display = "none";
    });
    cancel.addEventListener("click", () => {
        edit.removeEventListener("click", edit_row);
        modal.style.display = "none";
    });
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