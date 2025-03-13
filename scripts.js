const addButtons = document.querySelectorAll(".add-btn");

addButtons.forEach(button => {
    button.addEventListener("click", open_add_window);
});

function bell_animation(elem) {
    elem.classList.remove('swinging');

    void elem.offsetWidth;

    elem.classList.add('swinging');
}

function open_add_window(){
    const modal = document.getElementById("add-student");

    modal.style.display = "block";

    const close = document.getElementById("close-add-window");

    close.addEventListener("click", close_add_window)
}

function close_add_window() {
    const modal = document.getElementById("add-student");
    modal.style.display = "none";
}