// Request permission for notifications
function requestNotificationPermission() {
    return new Promise((resolve, reject) => {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                resolve(true);
            } else {
                reject(false);
            }
        });
    });
}

// Display a notification
function displayNotification(title, options) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, options);
        notification.onclick = function(event) {
            event.preventDefault(); // Prevent the browser from focusing the Notification's tab
            // Handle click event
            console.log('Notification clicked');
        };
    }
}

// Activate notifications
document.getElementById('activate-notifications').addEventListener('click', () => {
    requestNotificationPermission()
        .then(() => {
            console.log('Notification permission granted');
            // You can now display notifications
        })
        .catch(() => {
            console.log('Notification permission denied');
        });
});

// Example usage: Call this function when a new announcement is published
function onNewAnnouncement(announcement) {
    const title = announcement.title;
    const options = {
        body: announcement.body,
        icon: 'path/to/icon.png' // Replace with your icon path
    };
    displayNotification(title, options);
}