const usersTable = document.getElementById('users-table');
const tbody = document.querySelector('#users-table tbody');
const searchInput = document.getElementById('search-input');
const selectAllCheckbox = document.getElementById('select-all');
const deleteSelectedButton = document.getElementById('delete-selected');
const paginationContainer = document.getElementById('pagination');

let currentPage = 1;
let users = [];

// Fetch user data
fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
  .then(response => response.json())
  .then(data => {
    users = data;
    renderUsers(users, currentPage);
    updatePagination(users.length);
  })
  .catch(error => console.error(error));

// Render user data in table
function renderUsers(data, page) {
  tbody.innerHTML = '';

  // Filter data based on search query
  const searchTerm = searchInput.value.toLowerCase();
  const filteredData = data.filter(user => (
    user.name.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm) ||
    user.role.toLowerCase().includes(searchTerm)
  ));

  // Pagination
  const totalPages = Math.ceil(filteredData.length / 10);
  const startingIndex = (page - 1) * 10;
  const endingIndex = Math.min(startingIndex + 10, filteredData.length);
  const pageData = filteredData.slice(startingIndex, endingIndex);

  pageData.forEach(user => {
    const row = document.createElement('tr');
    row.classList.add('user-row');
    row.dataset.id = user.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('user-checkbox');
    checkbox.addEventListener('change', handleCheckboxChange);
    row.appendChild(checkbox);

    // User details
    for (const key in user) {
      const cell = document.createElement('td');
      if (key === 'id' || key === 'name') {
        cell.textContent = user[key];
      } else {
        // Display other details in other columns
        cell.textContent = user[key];
      }
      row.appendChild(cell);
    }

    // Actions
    const actionsCell = document.createElement('td');
    
    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => handleEditClick(user.id));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => handleDeleteClick(user.id));
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);

    tbody.appendChild(row);
  });
}

// Update pagination
function updatePagination(totalUsers) {
  paginationContainer.innerHTML = '';

  // First page button
  const firstPageButton = createPaginationButton('<<', () => changePage(1));
  paginationContainer.appendChild(firstPageButton);

  // Previous page button
  const previousPageButton = createPaginationButton('<', () => changePage(currentPage - 1));
  paginationContainer.appendChild(previousPageButton);

  // Page number buttons
  for (let i = 1; i <= Math.ceil(totalUsers / 10); i++) {
    const pageButton = createPaginationButton(i, () => changePage(i));
    pageButton.classList.toggle('active', i === currentPage);
    paginationContainer.appendChild(pageButton);
  }

  // Next page button
  const nextPageButton = createPaginationButton('>', () => changePage(currentPage + 1));
  paginationContainer.appendChild(nextPageButton);

  // Last page button
  const lastPageButton = createPaginationButton('>>', () => changePage(Math.ceil(totalUsers / 10)));
  paginationContainer.appendChild(lastPageButton);
}

// Helper function to create pagination button
function createPaginationButton(text, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

// Handle checkbox change
function handleCheckboxChange(event) {
  const checkboxes = document.querySelectorAll('.user-checkbox');
  const selectedRows = [];
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const row = checkbox.closest('.user-row');
      selectedRows.push(row);
    }
  });

  highlightSelectedRows(selectedRows);
}

// Highlight selected rows
function highlightSelectedRows(selectedRows) {
  const allRows = document.querySelectorAll('.user-row');
  allRows.forEach(row => row.classList.remove('selected'));

  selectedRows.forEach(row => row.classList.add('selected'));
}

// Handle edit button click
function handleEditClick(userId) {
  const row = document.querySelector(`.user-row[data-id="${userId}"]`);
  const cells = row.querySelectorAll('td:not(:first-child)');
  cells.forEach(cell => {
    const input = document.createElement('input');
    input.value = cell.textContent;
    cell.textContent = '';
    cell.appendChild(input);
  });
}

// Handle delete button click
function handleDeleteClick(userId) {
  const index = users.findIndex(user => user.id === userId);
  if (index !== -1) {
    users.splice(index, 1);
    renderUsers(users, currentPage);
    updatePagination(users.length);
  }
}

// Handle page change
function changePage(page) {
  currentPage = page;
  renderUsers(users, currentPage);
}

// Event listener for search input
searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderUsers(users, currentPage);
  updatePagination(users.length);
});

// Event listener for select all checkbox
selectAllCheckbox.addEventListener('change', () => {
  const checkboxes = document.querySelectorAll('.user-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
  });

  handleCheckboxChange();
});

// Event listener for delete selected button
deleteSelectedButton.addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('.user-checkbox:checked');
  const selectedRows = Array.from(checkboxes).map(checkbox => checkbox.closest('.user-row'));

  selectedRows.forEach(row => {
    const userId = row.dataset.id;
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });

  renderUsers(users, currentPage);
  updatePagination(users.length);
});
