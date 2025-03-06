const avatarUpload = (() => {
    const avatarInput = document.getElementById('avatarUpload');
    const avatarPreview = document.getElementById('userAvatar');
    const avatarOverlay = document.getElementById('avatarOverlay');

    const init = () => {
        avatarOverlay.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', handleAvatarChange);
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    return {
        init,
    };
})();

document.addEventListener('DOMContentLoaded', avatarUpload.init);