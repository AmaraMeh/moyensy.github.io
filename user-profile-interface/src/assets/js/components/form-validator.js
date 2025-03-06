const formValidator = (() => {
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePhoneNumber = (phone) => {
        const regex = /^\+?\d{1,3}?\s?\d{1,14}$/;
        return regex.test(phone);
    };

    const validateInstagram = (username) => {
        const regex = /^[a-zA-Z0-9_.]{1,30}$/;
        return regex.test(username);
    };

    const validateRequiredFields = (fields) => {
        return fields.every(field => field.value.trim() !== '');
    };

    const validateForm = (form) => {
        const emailField = form.querySelector('#profileEmail');
        const phoneField = form.querySelector('#phoneNumber');
        const instagramField = form.querySelector('#instagram');

        const errors = [];

        if (!validateRequiredFields([emailField, phoneField])) {
            errors.push('Please fill in all required fields.');
        }

        if (!validateEmail(emailField.value)) {
            errors.push('Please enter a valid email address.');
        }

        if (!validatePhoneNumber(phoneField.value)) {
            errors.push('Please enter a valid phone number.');
        }

        if (instagramField.value && !validateInstagram(instagramField.value)) {
            errors.push('Instagram username can only contain letters, numbers, underscores, and periods.');
        }

        return errors;
    };

    return {
        validateForm
    };
})();

export default formValidator;