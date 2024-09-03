const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    console.log("TEST");
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    console.log("TEST");
    container.classList.remove("active");
});