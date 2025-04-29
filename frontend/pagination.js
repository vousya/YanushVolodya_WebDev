const studentsPerPage = 4;
let currentPage = 1;
let students = [];

async function fetchStudents() {
  const token = sessionStorage.getItem("access_token");
  console.log("token = ", token);
  const response = await fetch("http://127.0.0.1:8000/students", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    });
  const data = await response.json();
  if(response.status === 401){
    window.location.href = "/index.html";
  };
  console.log("Fetch Student:", data);
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

document.addEventListener('DOMContentLoaded', function() {
  fetchStudents();
});
