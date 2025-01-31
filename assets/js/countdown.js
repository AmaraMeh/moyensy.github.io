function updateCountdown() {
    const targetDate = new Date("Feb 2, 2025 08:00:00");
    const now = new Date();
    const difference = targetDate - now;

    if (difference < 0) {
        document.getElementById('countdown-days').textContent = '00';
        document.getElementById('countdown-hours').textContent = '00';
        document.getElementById('countdown-minutes').textContent = '00';
        document.getElementById('countdown-seconds').textContent = '00';
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
    document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('countdown-seconds').textContent = seconds.toString().padStart(2, '0');

    // Add pulse animation to the countdown items when they change
    const items = document.querySelectorAll('.countdown-item');
    items.forEach(item => {
        item.classList.add('animate-pulse');
        setTimeout(() => item.classList.remove('animate-pulse'), 500);
    });
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown();
