const passwordInput = document.querySelector('#password');
const passwordConfirmInput = document.querySelector('#confirm');
const toggleButton = document.querySelector("#togglePassword");
const signUpForm = document.querySelector("#signup")
const error = document.querySelector('#error-msg')

  // Add a click event listener to the toggle button
  toggleButton.addEventListener('click', () => {
    // Toggle the input field's type between "password" and "text"
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleButton.innerHTML = '<i class="fa-regular fa-eye"></i>';
    } else {
      passwordInput.type = 'password';
      toggleButton.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    }
  });

  // make sure password and confirm password matches
  signUpForm.addEventListener("submit", e => {
    e.preventDefault();

    let messages = [];

    if (passwordInput.value !== passwordConfirmInput.value){
      messages.push("<i class='fa fa-times-circle'></i>Passwords doesn't match")
    }

    if (messages.length > 0){
      e.preventDefault();
      error.innerHTML = messages.join('<br />')
  }else{
    signUpForm.submit();
  }

  })