/************************************************************
AUTHENTICATION & SECURITY
Names: 
Description:
Handles registration, login, lockout,
TRN validation, password reset, and localStorage.
************************************************************/


/************************************************************
QUESTION 1 – USER AUTHENTICATION (LocalStorage)
************************************************************/


/***********************
UTILITY FUNCTIONS
************************/

// Calculate Age from Date of Birth
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}


// Get users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem("RegistrationData")) || [];
}


// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem("RegistrationData", JSON.stringify(users));
}



/************************************************************
REGISTRATION LOGIC
************************************************************/

const registrationForm = document.getElementById("registrationForm");

if (registrationForm) {

    registrationForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Get form values
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const dob = document.getElementById("dob").value;
        const gender = document.getElementById("gender").value;
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const trn = document.getElementById("trn").value.trim();
        const password = document.getElementById("password").value;

        // Validate Password Length
        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        // Validate Age (18+)
        if (calculateAge(dob) < 18) {
            alert("You must be 18 years or older to register.");
            return;
        }

        // Validate TRN Format (000-000-000)
        const trnPattern = /^\d{3}-\d{3}-\d{3}$/;

        if (!trnPattern.test(trn)) {
            alert("TRN must be in format 000-000-000");
            return;
        }

        // Check TRN uniqueness
        let users = getUsers();

        const trnExists = users.some(user => user.trn === trn);

        if (trnExists) {
            alert("TRN already registered. Please login.");
            return;
        }

        // Create new user object
        const newUser = {
            firstName,
            lastName,
            dob,
            gender,
            phone,
            email,
            trn,
            password: btoa(password), // basic encoding
            dateOfRegistration: new Date().toLocaleDateString(),
            cart: {},
            invoices: []
        };

        // Add to array
        users.push(newUser);

        // Save to localStorage
        saveUsers(users);

        alert("Registration successful! Redirecting to login...");

        window.location.href = "index.html";
    });
}



/************************************************************
LOGIN LOGIC (3 Attempts + Lockout)
************************************************************/

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    let attempts = 3;

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const enteredTrn = document.getElementById("loginTrn").value.trim();
        const enteredPassword = document.getElementById("loginPassword").value;
        const errorMsg = document.getElementById("errorMsg");

        let users = getUsers();

        const user = users.find(u =>
            u.trn === enteredTrn &&
            u.password === btoa(enteredPassword)
        );

        if (user) {

            // Store logged in user
            localStorage.setItem("LoggedInUser", JSON.stringify(user));

            alert("Login successful!");

            window.location.href = "product.html";

        } else {

            attempts--;

            errorMsg.innerText = "Invalid TRN or Password. Attempts left: " + attempts;

            if (attempts === 0) {
                window.location.href = "locked.html";
            }
        }
    });
}



/************************************************************
RESET PASSWORD FUNCTION
************************************************************/

function resetPassword() {

    let trn = prompt("Enter your TRN (000-000-000):");

    if (!trn) return;

    let users = getUsers();

    let user = users.find(u => u.trn === trn);

    if (!user) {
        alert("TRN not found.");
        return;
    }

    let newPassword = prompt("Enter new password (minimum 8 characters):");

    if (!newPassword || newPassword.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }

    user.password = btoa(newPassword);

    saveUsers(users);

    alert("Password successfully updated!");
}
