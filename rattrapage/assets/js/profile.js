// Add this code for profile picture handling
document.addEventListener('DOMContentLoaded', () => {
    const avatarInput = document.getElementById('avatarInput');
    const profileAvatar = document.getElementById('profileAvatar');
    const changeAvatarButton = document.getElementById('changeAvatarButton');

    changeAvatarButton.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                alert('La taille de l\'image ne doit pas dépasser 5MB');
                return;
            }

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const response = await fetch('http://localhost:3000/api/profile/avatar', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    profileAvatar.src = data.avatarUrl;
                    // Show success message
                    showNotification('Photo de profil mise à jour avec succès', 'success');
                }
            } catch (error) {
                console.error('Error uploading avatar:', error);
                showNotification('Erreur lors de la mise à jour de la photo', 'error');
            }
        }
    });
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } shadow-lg z-50 animate-fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
