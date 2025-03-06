function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePhoneNumber(phone) {
    const regex = /^\+?\d{1,3}?[-. ]?\(?\d{1,4}?\)?[-. ]?\d{1,4}[-. ]?\d{1,9}$/;
    return regex.test(phone);
}

function validateInstagram(username) {
    const regex = /^[a-zA-Z0-9_.]{1,30}$/;
    return regex.test(username);
}

function validateRequiredField(value) {
    return value.trim() !== '';
}

function validateDateOfBirth(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    return birthDate < today;
}

export {
    validateEmail,
    validatePhoneNumber,
    validateInstagram,
    validateRequiredField,
    validateDateOfBirth
};