document.addEventListener('DOMContentLoaded', function() {
    const profileModal = document.getElementById('profileModal');
    const completeProfileBtn = document.getElementById('completeProfileBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const profileCompletionForm = document.getElementById('profileCompletionForm');

    completeProfileBtn.addEventListener('click', function() {
        profileModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', function() {
        profileModal.classList.add('hidden');
    });

    profileCompletionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(profileCompletionForm);
        const userData = Object.fromEntries(formData.entries());

        // Validate the form data
        if (validateProfileData(userData)) {
            // Save the profile data (this function should be defined in profile-service.js)
            saveProfileData(userData);
            profileModal.classList.add('hidden');
            alert('Profile updated successfully!');
        } else {
            alert('Please fill in all required fields correctly.');
        }
    });

    function validateProfileData(data) {
        // Implement validation logic here
        // For example, check if required fields are filled
        return data.wilaya && data.commune && data.birthdate && data.gender && data.academicYear;
    }

    function saveProfileData(data) {
        // Call the profile service to save data (this function should be defined in profile-service.js)
        // Example: profileService.updateProfile(data);
    }
});