// IA#2: JavaScript - Form Validation & Interaction
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    // Prevent the page from refreshing
    event.preventDefault();

    // Get the values from the form
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const messageBox = document.getElementById('messageBox');

    // Simple Validation Check
    if (fullName.length < 3) {
        messageBox.style.color = "red";
        messageBox.innerHTML = "Please enter a valid full name.";
    } else {
        // Success Message
        messageBox.style.color = "green";
        messageBox.innerHTML = "Thank you, " + fullName + "! Your Creole account has been created. A confirmation was sent to " + email + ".";
        
        // Optional: Clear the form
        document.getElementById('registrationForm').reset();
    }
});