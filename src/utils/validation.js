// src/utils/validation.js

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
}

function validateLogin(username, password) {
    return username && 
           username.length >= 3 && 
           password && 
           password.length >= 6;
}

function validateMobileNumber(mobileNumber) {
    const re = /^[+]?[\d]{10,14}$/;
    return re.test(mobileNumber);
}

function validateContact(firstName, lastName, email, mobileNumber, message) {
    return firstName && 
           firstName.length >= 2 &&
           lastName &&
           lastName.length >= 2 &&
           validateEmail(email) &&
           validateMobileNumber(mobileNumber) &&
           message &&
           message.length >= 10;
}

module.exports = {
    validateEmail,
    validatePassword,
    validateLogin,
    validateMobileNumber,
    validateContact
};