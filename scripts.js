document.getElementById("add-button").addEventListener("click", open_add_window);

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

    let group = document.getElementById("group").value;
    let full_name = document.getElementById("name").value;
    let gender = document.getElementById("gender").value;
    let date = document.getElementById("date").value;

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
        const student_name = row.cells[2].textContent.trim();
        open_remove_window(row, student_name);
    });

    document.getElementById("name").value = "";
    document.getElementById("date").value = "";
    close_add_window();

    update_main_checkbox();
}

document.querySelectorAll(".remove-btn").forEach(button => {
    button.addEventListener("click", function() {
        const row = this.closest("tr");
        const student_name = row.cells[2].textContent.trim();
        open_remove_window(row, student_name);
    });
});

function open_remove_window(row, student_name){
    const modal = document.getElementById("remove-student");

    modal.style.display = "block";

    const close = document.getElementById("close-remove-window");
    const cancel = document.getElementById("cancel-remove-btn");
    const remove = document.getElementById("action-remove-btn");

    const remove_student = () => {
        const checkbox = row.cells[0].querySelector('input[type="checkbox"]');

        console.log(checkbox.checked)
        if( !checkbox.checked){
            close_remove_window();
            remove.removeEventListener("click", remove_student);
            return
        }

        const table = document.getElementById("student-table");
        const rowIndex = row.rowIndex;
        table.deleteRow(rowIndex);
        close_remove_window();

        remove.removeEventListener("click", remove_student);
    };

    close.addEventListener("click", close_remove_window);
    cancel.addEventListener("click", close_remove_window);
    remove.addEventListener("click", remove_student);
    
    document.getElementById("remove-text").textContent = "Are you " +
    "sure you want to delete " + student_name + "?"
    console.log(student_name)
}

function close_remove_window() {
    const modal = document.getElementById("remove-student");
    modal.style.display = "none";
}



const main_checkbox = document.getElementById("main-checkbox");
main_checkbox.addEventListener("click", function(){
    let is_checked = this.checked;
    document.querySelectorAll('#student-table input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = is_checked;
    });
})

function update_main_checkbox() {
    const all_checkboxes = document.getElementsByClassName("checkbox");
    const all_checked = Array.from(all_checkboxes).every(checkbox => checkbox.checked);
    main_checkbox.checked = all_checked;
}

document.querySelectorAll('#student-table input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', update_main_checkbox);
});



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