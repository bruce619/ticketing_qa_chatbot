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
    const location = clientRow.cells[3].innerText;
    const phone = clientRow.cells[4].innerText;

    // Set the values in the editModal
    const editFirstNameInput = document.querySelector('#edit_firstname');
    const editLastNameInput = document.querySelector('#edit_lastname');
    const editEmailInput = document.querySelector('#edit_email');
    const editLocationInput = document.querySelector('#edit_location');
    const editPhoneInput = document.querySelector('#edit_phone');

    editFirstNameInput.value = firstName;
    editLastNameInput.value = lastName;
    editEmailInput.value = email;
    editLocationInput.value = location;
    editPhoneInput.value = phone;

    // Show the editModal
    const editModal = document.querySelector('#editModal');
    editModal.classList.add('open');  });
});


closeModalButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.parentElement.parentElement.parentElement.classList.remove('open')
  })
})


