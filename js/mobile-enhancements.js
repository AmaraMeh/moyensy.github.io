class MobileEnhancements {
    constructor() {
        this.isInstallable = false;
        this.deferredPrompt = null;
    }

    // Initialize mobile enhancements
    init() {
        this.setupInstallPrompt();
        this.optimizeForMobile();
    }

    // Setup "Add to Home Screen" functionality
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 76+ from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            this.isInstallable = true;
            
            // Show the install button
            this.showInstallButton();
        });

        // Listen for successful installs
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.isInstallable = false;
            this.hideInstallButton();
        });
    }

    // Show the install button
    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.className = 'fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40';
        installBtn.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Installer l'application</span>
        `;
        
        installBtn.addEventListener('click', async () => {
            if (!this.deferredPrompt) return;
            
            // Show the installation prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            
            // We no longer need the prompt. Clear it up
            this.deferredPrompt = null;
            this.hideInstallButton();
        });
        
        document.body.appendChild(installBtn);
    }

    // Hide the install button
    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) installBtn.remove();
    }

    // Optimize resources for mobile data usage
    optimizeForMobile() {
        this.addDataSaverWarning();
        this.addConnectionSpeedCheck();
    }

    // Add warning for large downloads
    addDataSaverWarning() {
        // Find all download links
        const downloadLinks = document.querySelectorAll('a[href$=".pdf"], a[href$=".zip"], a[href$=".doc"], a[href$=".docx"], a[href$=".ppt"], a[href$=".pptx"]');
        
        downloadLinks.forEach(link => {
            const originalClick = link.onclick;
            
            link.onclick = function(e) {
                // Check if user is on mobile data
                const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                
                if (connection && connection.saveData) {
                    e.preventDefault();
                    
                    if (confirm('Vous êtes en mode économie de données. Êtes-vous sûr de vouloir télécharger ce fichier?')) {
                        if (originalClick) originalClick.apply(this, arguments);
                        else window.location.href = link.href;
                    }
                    
                    return false;
                }
                
                if (originalClick) return originalClick.apply(this, arguments);
                return true;
            };
        });
    }

    // Add connection speed check
    addConnectionSpeedCheck() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            connection.addEventListener('change', () => {
                this.updateConnectionInfo(connection);
            });
            
            this.updateConnectionInfo(connection);
        }
    }

    // Update connection information
    updateConnectionInfo(connection) {
        if (connection.saveData) {
            // User has data saver enabled
            console.log('Data Saver is enabled');
            
            // Add a data saver notification
            this.showDataSaverNotification();
        }
    }

    // Show data saver notification
    showDataSaverNotification() {
        // Remove existing notification if any
        const existingNotification = document.getElementById('data-saver-notification');
        if (existingNotification) existingNotification.remove();
        
        // Create new notification
        const notification = document.createElement('div');
        notification.id = 'data-saver-notification';
        notification.className = 'fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md z-50';
        notification.innerHTML = `
            <div class="flex">
                <div class="py-1"><i class="fas fa-exclamation-circle text-yellow-500"></i></div>
                <div class="ml-3">
                    <p class="text-sm">Mode économie de données activé. Les téléchargements peuvent être limités.</p>
                </div>
                <button class="ml-auto" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) notification.remove();
        }, 5000);
    }
}

export default MobileEnhancements;