const addBtn = document.querySelector('#addButton')
const editBtns = document.querySelectorAll('.btn-edit');
const addModal = document.querySelector('#addModal')
const closeModalButtons = document.querySelectorAll('.close')

const showAddModal = () => {
  addModal.classList.add('open')
}

addBtn.addEventListener('click', showAddModal)



editBtns.forEach((button, index) => {

  button.addEventListener('click', () => {
    const clientRow = button.closest('tr');
    const firstName = clientRow.cells[0].innerText;
    const lastName = clientRow.cells[1].innerText;
    const email = clientRow.cells[2].innerText;
    const department = clientRow.cells[3].innerText;
    const is_admin = clientRow.cells[4].innerText;

    console.log(is_admin)

    // Set the values in the editModal
    const editFirstNameInput = document.querySelector('#edit_firstname');
    const editLastNameInput = document.querySelector('#edit_lastname');
    const editEmailInput = document.querySelector('#edit_email');
    const editDepartmentInput = document.querySelector('#edit_department');
    let editIsAdminCheckbox = document.querySelector('#edit_is_admin');
    const yesLabel = document.querySelector('.yes-label');
    const noLabel = document.querySelector('.no-label');

    editFirstNameInput.value = firstName;
    editLastNameInput.value = lastName;
    editEmailInput.value = email;
    editDepartmentInput.value = department;

    const isAdminValue = is_admin === 'true';

    editIsAdminCheckbox.checked = isAdminValue;

    if (isAdminValue) {
      yesLabel.classList.add('checked');
      noLabel.classList.remove('checked');
    } else {
      yesLabel.classList.remove('checked');
      noLabel.classList.add('checked');
    }

    // Show the editModal
    const editModal = document.querySelector('#editModal');
    editModal.classList.add('open');
  });
});


closeModalButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.parentElement.parentElement.parentElement.classList.remove('open')
  })
})

