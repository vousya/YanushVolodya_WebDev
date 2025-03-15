// remove button event listener
document.querySelectorAll(".remove-btn").forEach(button => {
    button.addEventListener("click", function() {
        const row = this.closest("tr");
        const student_name = row.cells[2].textContent.trim();
        open_remove_window(student_name);
    });
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
function open_remove_window(student_name){
    const modal = document.getElementById("remove-student");

    modal.style.display = "block";

    const close = document.getElementById("close-remove-window");
    const cancel = document.getElementById("cancel-remove-btn");
    const remove = document.getElementById("action-remove-btn");

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

//removing student
function remove_student(){
    //todo
}