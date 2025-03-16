// remove button event listener
document.querySelectorAll(".remove-btn").forEach(button => {
    button.addEventListener("click", function() {
        const row = this.closest("tr");
        const student_name = row.cells[2].textContent.trim();
        open_remove_window(row, student_name);
    });
});

const main_checkbox = document.getElementById("main-checkbox");
main_checkbox.addEventListener("click", function(){
    let is_checked = this.checked;
    document.querySelectorAll('#student-table input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = is_checked;
    });
})

function updateMainCheckbox() {
    const allCheckboxes = document.getElementsByClassName("checkbox");
    const allChecked = Array.from(allCheckboxes).every(checkbox => checkbox.checked);
    main_checkbox.checked = allChecked;
}

// Add listener to each table checkbox
document.querySelectorAll('#student-table input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateMainCheckbox);
});



//add button event listener
document.getElementById("bell").addEventListener('click', bell_animation);

// swinging animation
function bell_animation(event) {
    const bell = event.target;
    
    bell.classList.remove('swinging');

    void bell.offsetWidth;

    bell.classList.add('swinging');
}

// modal window for removing student
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

//close modal window for removing student
function close_remove_window() {
    const modal = document.getElementById("remove-student");
    modal.style.display = "none";
}