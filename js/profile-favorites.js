import { db } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

class ProfileFavorites {
    constructor() {
        this.userId = this.getUserId();
        this.favorites = [];
        this.specialtyDetails = {};
        this.notifications = [];
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    }
    
    async init() {
        console.log("Initializing profile favorites...");
        // Force show content even if not logged in (for testing)
        // In production you might want to keep the login check
        
        // Initialize AOS if not already loaded
        this.initializeAOS();
        
        // Create notification center first
        this.createNotificationCenter();
        
        // Load favorites and create the section
        await this.loadFavorites();
        this.createFavoritesSection();
        
        // Set up real-time listeners
        this.setupRealtimeListeners();
        
        // Add a test notification to verify it works
        setTimeout(() => {
            this.addNotification("Système de notifications initialisé", "success");
        }, 1000);
    }
    
    initializeAOS() {
        if (typeof AOS === 'undefined') {
            console.log("Loading AOS dynamically");
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
            script.onload = () => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
                document.head.appendChild(link);
                
                // Initialize AOS after it's loaded
                setTimeout(() => {
                    if (typeof AOS !== 'undefined') {
                        AOS.init({
                            duration: 800,
                            easing: 'ease-out-cubic',
                            once: false,
                            mirror: true,
                            delay: 100
                        });
                    }
                }, 100);
            };
            document.head.appendChild(script);
        } else {
            console.log("AOS already loaded, initializing");
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: false,
                mirror: true,
                delay: 100
            });
        }
    }
    
    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }
    
    async loadFavorites() {
        try {
            const userRef = doc(db, "users", this.userId);
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
                const userData = docSnap.data();
                this.favorites = userData.favorites || [];
            } else {
                // Create default document if it doesn't exist
                await setDoc(userRef, { 
                    favorites: [],
                    lastUpdated: new Date()
                });
            }
        } catch (error) {
            console.error("Error loading favorites:", error);
            // Fallback to localStorage
            const localFavorites = localStorage.getItem('favorites');
            if (localFavorites) {
                this.favorites = JSON.parse(localFavorites);
            }
        }
        
        console.log("Loaded favorites:", this.favorites);
        
        // Load specialty details
        await this.loadSpecialtyDetails();
    }

    async loadSpecialtyDetails() {
        // Add fallback mappings for common specialties
        const fallbackDetails = {
            'informatique-lmd': {
                name: 'Informatique LMD',
                icon: 'laptop-code',
                color: 'blue',
                url: 'specialite-informatique-lmd.html'
            },
            'science-technologie': {
                name: 'Science et Technologie',
                icon: 'flask',
                color: 'purple',
                url: 'specialite-science-technologie.html'
            },
            'mathematiques': {
                name: 'Mathématiques',
                icon: 'square-root-alt',
                color: 'indigo',
                url: 'specialite-mathematiques.html'
            },
            'biologie': {
                name: 'Biologie',
                icon: 'dna',
                color: 'green',
                url: 'specialite-biologie.html'
            },
            'science-matiere': {
                name: 'Science de la matière',
                icon: 'atom',
                color: 'teal',
                url: 'specialite-science-matiere.html'
            },
            'genie-civil': {
                name: 'Génie Civil',
                icon: 'building',
                color: 'orange',
                url: 'modules-GC-semestre4.html'
            },
            'genie-procedes': {
                name: 'Génie des Procédés',
                icon: 'industry',
                color: 'red',
                url: 'modules-GP-semestre4.html'
            }
        };
        
        try {
            // Try to load from Firestore first
            const specialtiesCollection = collection(db, "specialties");
            const querySnapshot = await getDocs(specialtiesCollection);
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                this.specialtyDetails[doc.id] = {
                    name: data.name,
                    icon: data.icon || 'book',
                    color: data.color || 'blue',
                    url: data.url || `specialte-${doc.id}.html`
                };
            });
        } catch (error) {
            console.error("Error loading specialty details:", error);
        }
        
        // Add fallbacks for any missing specialties
        for (const id of this.favorites) {
            if (!this.specialtyDetails[id] && fallbackDetails[id]) {
                this.specialtyDetails[id] = fallbackDetails[id];
            } else if (!this.specialtyDetails[id]) {
                // Generate basic details if no mapping exists
                this.specialtyDetails[id] = {
                    name: this.formatSpecialtyName(id),
                    icon: 'star',
                    color: 'gray',
                    url: `#${id}`
                };
            }
        }
    }
    
    createNotificationCenter() {
        console.log("Creating notification center");
        
        // Remove any existing notification center
        const existingCenter = document.getElementById('notification-center');
        if (existingCenter) existingCenter.remove();
        
        // Create notification center with enhanced design
        const notificationCenter = document.createElement('div');
        notificationCenter.id = 'notification-center';
        notificationCenter.className = 'glass-card max-w-4xl mx-auto overflow-hidden mt-4 mb-4 transform transition-all duration-500';
        notificationCenter.setAttribute('data-aos', 'fade-up');
        notificationCenter.setAttribute('data-aos-delay', '200');
        
        // Initially hide it if no notifications
        notificationCenter.style.display = this.notifications.length > 0 ? 'block' : 'none';
        
        notificationCenter.innerHTML = `
            <div class="bg-gradient-to-r from-blue-600 to-cyan-500 p-5 text-white rounded-t-lg flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <i class="fas fa-bell text-xl"></i>
                        <span id="notification-count" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">0</span>
                    </div>
                    <h3 class="font-bold text-lg">Notifications</h3>
                </div>
                <button id="clear-notifications" class="hover:bg-white hover:bg-opacity-20 p-1.5 rounded-full transition-all duration-300">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div id="notifications-container" class="p-5 max-h-80 overflow-y-auto bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm">
                <!-- Notifications will be inserted here -->
                <div class="text-center text-gray-500 py-6">
                    <i class="fas fa-check-circle text-green-500 text-3xl mb-3"></i>
                    <p class="font-medium">Pas de nouvelles notifications</p>
                    <p class="text-sm text-gray-400">Les notifications apparaîtront ici</p>
                </div>
            </div>
        `;
        
        // Insert after main profile card or fallback to body if not found
        const profileCard = document.querySelector('.glass-card');
        if (profileCard && profileCard.parentNode) {
            profileCard.parentNode.insertBefore(notificationCenter, profileCard.nextSibling);
        } else {
            document.body.appendChild(notificationCenter);
        }
        
        // Handle clear all
        document.getElementById('clear-notifications').addEventListener('click', () => {
            this.clearNotifications();
        });
    }
    
    createFavoritesSection() {
        console.log("Creating favorites section with:", this.favorites);
        
        const existingSection = document.getElementById('favorites-section');
        if (existingSection) existingSection.remove();
        
        if (!this.favorites.length) {
            // Empty state
            const emptyFavoritesSection = document.createElement('div');
            emptyFavoritesSection.id = 'favorites-section';
            emptyFavoritesSection.className = 'glass-card max-w-4xl mx-auto overflow-hidden mt-4 transform transition-all duration-500';
            emptyFavoritesSection.setAttribute('data-aos', 'fade-up');
            emptyFavoritesSection.setAttribute('data-aos-delay', '300');
            
            emptyFavoritesSection.innerHTML = `
                <div class="bg-gradient-to-r from-yellow-400 to-amber-500 p-5 text-white rounded-t-lg">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-star text-xl"></i>
                        <h3 class="font-bold text-lg">Spécialités Favorites</h3>
                    </div>
                </div>
                <div class="p-10 text-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm">
                    <div class="animate-pulse mb-4">
                        <i class="fas fa-folder-open text-yellow-400 text-4xl"></i>
                    </div>
                    <p class="font-medium text-gray-600 mb-2">Vous n'avez pas encore de spécialités favorites</p>
                    <p class="text-sm text-gray-500 mb-4">Explorez la bibliothèque et marquez vos spécialités préférées</p>
                    <a href="bib.html" class="inline-block px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 active:translate-y-0">
                        <i class="fas fa-search mr-2"></i>Explorer la bibliothèque
                    </a>
                </div>
            `;
            
            const notificationCenter = document.getElementById('notification-center');
            if (notificationCenter && notificationCenter.parentNode) {
                notificationCenter.parentNode.insertBefore(emptyFavoritesSection, notificationCenter.nextSibling);
            } else {
                document.body.appendChild(emptyFavoritesSection);
            }
            return;
        }
        
        // Create filled favorites section
        const favoritesSection = document.createElement('div');
        favoritesSection.id = 'favorites-section';
        favoritesSection.className = 'glass-card max-w-4xl mx-auto overflow-hidden mt-4 transform transition-all duration-500';
        favoritesSection.setAttribute('data-aos', 'fade-up');
        favoritesSection.setAttribute('data-aos-delay', '300');
        
        // Header
        const header = document.createElement('div');
        header.className = 'bg-gradient-to-r from-yellow-400 to-amber-500 p-5 text-white rounded-t-lg';
        header.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-star text-xl"></i>
                    <h3 class="font-bold text-lg">Spécialités Favorites</h3>
                </div>
                <span class="bg-white text-yellow-600 text-sm font-medium px-3 py-1 rounded-full shadow-inner">
                    ${this.favorites.length} favoris
                </span>
            </div>
        `;
        
        // Content grid
        const content = document.createElement('div');
        content.className = 'p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm';
        
        this.favorites.forEach((favoriteId, index) => {
            const details = this.specialtyDetails[favoriteId];
            if (!details) return;
            
            const favoriteCard = document.createElement('div');
            favoriteCard.className = `relative bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1`;
            favoriteCard.setAttribute('data-aos', 'zoom-in');
            favoriteCard.setAttribute('data-aos-delay', `${index * 100}`);
            
            favoriteCard.innerHTML = `
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${details.color}-400 to-${details.color}-600"></div>
                <div class="absolute top-2 right-2">
                    <button class="remove-favorite bg-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:shadow-md transition-all text-gray-400 hover:text-red-500" data-id="${favoriteId}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <a href="${details.url}" class="block p-5">
                    <div class="flex items-start">
                        <div class="w-14 h-14 rounded-lg bg-${details.color}-100 text-${details.color}-600 flex items-center justify-center mr-4 transition-transform duration-500 transform group-hover:scale-110">
                            <i class="fas fa-${details.icon} text-lg"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-1">${details.name}</h4>
                            <div class="flex items-center text-xs text-gray-500">
                                <i class="fas fa-arrow-right mr-1"></i>
                                <span>Voir les ressources</span>
                            </div>
                        </div>
                    </div>
                </a>
            `;
            
            content.appendChild(favoriteCard);
        });
        
        favoritesSection.appendChild(header);
        favoritesSection.appendChild(content);
        
        const notificationCenter = document.getElementById('notification-center');
        if (notificationCenter && notificationCenter.parentNode) {
            notificationCenter.parentNode.insertBefore(favoritesSection, notificationCenter.nextSibling);
        } else {
            document.body.appendChild(favoritesSection);
        }
        
        // Remove favorite buttons
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const specialtyId = e.currentTarget.dataset.id;
                
                // Animate removal
                const card = e.currentTarget.closest('.relative');
                card.classList.add('scale-95', 'opacity-0');
                
                setTimeout(async () => {
                    await this.removeFavorite(specialtyId);
                }, 300);
            });
        });
    }
    
    async removeFavorite(specialtyId) {
        // Get specialty details for notification
        const details = this.specialtyDetails[specialtyId];
        const name = details ? details.name : this.formatSpecialtyName(specialtyId);
        
        // Remove from favorites array
        const index = this.favorites.indexOf(specialtyId);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            
            // Update in storage
            try {
                // Update in Firebase
                const userRef = doc(db, "users", this.userId);
                await setDoc(userRef, {
                    favorites: this.favorites,
                    lastUpdated: new Date()
                }, { merge: true });
                
                // Also update localStorage
                localStorage.setItem('favorites', JSON.stringify(this.favorites));
                
                // Add notification
                this.addNotification(`Spécialité "${name}" retirée des favoris`, 'warning');
                
                // Refresh the UI
                this.refreshUI();
            } catch (error) {
                console.error("Error removing favorite:", error);
                this.addNotification(`Erreur lors de la suppression du favori`, 'error');
            }
        }
    }
    
    refreshUI() {
        // Create new favorites section with fresh data
        this.createFavoritesSection();
    }
    
    setupRealtimeListeners() {
        // Listen for changes in Firebase
        try {
            const userRef = doc(db, "users", this.userId);
            
            onSnapshot(userRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    const newFavorites = userData.favorites || [];
                    
                    // Find added favorites
                    const added = newFavorites.filter(id => !this.favorites.includes(id));
                    
                    // Find removed favorites
                    const removed = this.favorites.filter(id => !newFavorites.includes(id));
                    
                    // Update local array
                    this.favorites = newFavorites;
                    
                    // If there were changes, refresh UI
                    if (added.length > 0 || removed.length > 0) {
                        // Add notifications
                        added.forEach(id => {
                            const name = this.specialtyDetails[id]?.name || this.formatSpecialtyName(id);
                            this.addNotification(`Nouvelle spécialité favorite: "${name}"`, 'success');
                        });
                        
                        removed.forEach(id => {
                            const name = this.specialtyDetails[id]?.name || this.formatSpecialtyName(id);
                            this.addNotification(`Spécialité "${name}" retirée des favoris`, 'warning');
                        });
                        
                        this.refreshUI();
                    }
                }
            });
            
            // Also listen for localStorage changes
            window.addEventListener('storage', (event) => {
                if (event.key === 'favorites') {
                    try {
                        const newFavorites = JSON.parse(event.newValue) || [];
                        
                        // Find changes
                        const added = newFavorites.filter(id => !this.favorites.includes(id));
                        const removed = this.favorites.filter(id => !newFavorites.includes(id));
                        
                        // Update local array
                        this.favorites = newFavorites;
                        
                        // If there were changes, refresh UI
                        if (added.length > 0 || removed.length > 0) {
                            this.refreshUI();
                        }
                    } catch (error) {
                        console.error("Error processing localStorage change:", error);
                    }
                }
                
                // Also check for login status changes
                if (event.key === 'isLoggedIn') {
                    const newLoginStatus = event.newValue === 'true';
                    if (this.isLoggedIn !== newLoginStatus) {
                        this.isLoggedIn = newLoginStatus;
                        window.location.reload(); // Refresh the page to update UI
                    }
                }
            });
        } catch (error) {
            console.error("Error setting up listeners:", error);
            this.addNotification("Erreur de connexion au serveur", "error");
        }
    }
    
    addNotification(message, type = 'info') {
        console.log(`Adding notification: ${message} (${type})`);
        
        // Create notification ID
        const id = Date.now().toString();
        
        // Define icon and colors based on type
        let icon = 'info-circle';
        let bgColor = 'bg-blue-50';
        let textColor = 'text-blue-700';
        let borderColor = 'border-blue-200';
        let gradientFrom = 'from-blue-400';
        let gradientTo = 'to-blue-600';
        
        if (type === 'success') {
            icon = 'check-circle';
            bgColor = 'bg-green-50';
            textColor = 'text-green-700';
            borderColor = 'border-green-200';
            gradientFrom = 'from-green-400';
            gradientTo = 'to-green-600';
        } else if (type === 'warning') {
            icon = 'exclamation-triangle';
            bgColor = 'bg-yellow-50';
            textColor = 'text-yellow-700';
            borderColor = 'border-yellow-200';
            gradientFrom = 'from-yellow-400';
            gradientTo = 'to-yellow-600';
        } else if (type === 'error') {
            icon = 'times-circle';
            bgColor = 'bg-red-50';
            textColor = 'text-red-700';
            borderColor = 'border-red-200';
            gradientFrom = 'from-red-400';
            gradientTo = 'to-red-600';
        }
        
        // Add to notifications array
        this.notifications.push({
            id,
            message,
            type,
            timestamp: new Date()
        });
        
        // Update the notification UI
        const container = document.getElementById('notifications-container');
        const notificationCenter = document.getElementById('notification-center');
        
        if (container) {
            // Clear "no notifications" message if present
            if (this.notifications.length === 1) {
                container.innerHTML = '';
            }
            
            // Create notification element
            const notificationElement = document.createElement('div');
            notificationElement.id = `notification-${id}`;
            notificationElement.className = `mb-3 p-4 ${bgColor} border ${borderColor} rounded-lg flex items-start transform transition-all duration-500 opacity-0 translate-x-4`;
            
            // Add a left border with gradient
            notificationElement.innerHTML = `
                <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-gradient-to-b ${gradientFrom} ${gradientTo}"></div>
                <div class="flex-shrink-0 ${textColor} mr-3">
                    <i class="fas fa-${icon} text-lg"></i>
                </div>
                <div class="flex-grow">
                    <p class="${textColor} font-medium">${message}</p>
                    <p class="text-xs opacity-70 mt-1">${new Date().toLocaleTimeString()}</p>
                </div>
                <button class="delete-notification ml-2 text-gray-400 hover:${textColor} transition-colors" data-id="${id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add to container
            container.prepend(notificationElement);
            
            // Animate in
            setTimeout(() => {
                notificationElement.classList.remove('opacity-0', 'translate-x-4');
            }, 10);
            
            // Show notification center if hidden
            if (notificationCenter) {
                notificationCenter.style.display = 'block';
            }
            
            // Add event listener for delete button
            notificationElement.querySelector('.delete-notification').addEventListener('click', () => {
                this.removeNotification(id);
            });
            
            // Update count
            this.updateNotificationCount();
        }
    }
    
    removeNotification(id) {
        // Remove from array
        this.notifications = this.notifications.filter(n => n.id !== id);
        
        // Remove from DOM with animation
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.classList.add('opacity-0', 'translate-x-4');
            setTimeout(() => {
                element.remove();
                
                // Show "no notifications" if empty
                if (this.notifications.length === 0) {
                    const container = document.getElementById('notifications-container');
                    if (container) {
                        container.innerHTML = `
                            <div class="text-center text-gray-500 py-6 transition-opacity duration-300">
                                <i class="fas fa-check-circle text-green-500 text-3xl mb-3"></i>
                                <p class="font-medium">Pas de nouvelles notifications</p>
                                <p class="text-sm text-gray-400">Les notifications apparaîtront ici</p>
                            </div>
                        `;
                    }
                    
                    // Hide notification center if empty
                    if (this.notifications.length === 0) {
                        const notificationCenter = document.getElementById('notification-center');
                        if (notificationCenter) {
                            setTimeout(() => {
                                notificationCenter.style.display = 'none';
                            }, 300);
                        }
                    }
                }
                
                this.updateNotificationCount();
            }, 300);
        }
    }
    
    clearNotifications() {
        // Animate all notifications out
        document.querySelectorAll('[id^="notification-"]').forEach((elem, index) => {
            setTimeout(() => {
                elem.classList.add('opacity-0', 'scale-95');
            }, index * 50); // Staggered animation
        });
        
        // Clear the array
        setTimeout(() => {
            this.notifications = [];
            
            const container = document.getElementById('notifications-container');
            if (container) {
                container.innerHTML = `
                    <div class="text-center text-gray-500 py-6">
                        <i class="fas fa-check-circle text-green-500 text-3xl mb-3"></i>
                        <p class="font-medium">Pas de nouvelles notifications</p>
                        <p class="text-sm text-gray-400">Les notifications apparaîtront ici</p>
                    </div>
                `;
            }
            
            // Hide notification center with animation
            const notificationCenter = document.getElementById('notification-center');
            if (notificationCenter) {
                notificationCenter.classList.add('opacity-0', 'translate-y-4');
                setTimeout(() => {
                    notificationCenter.style.display = 'none';
                    notificationCenter.classList.remove('opacity-0', 'translate-y-4');
                }, 300);
            }
            
            this.updateNotificationCount();
        }, 300);
    }
    
    updateNotificationCount() {
        const countElement = document.getElementById('notification-count');
        if (countElement) {
            countElement.textContent = this.notifications.length;
            
            // Add animation
            countElement.classList.add('scale-125');
            setTimeout(() => {
                countElement.classList.remove('scale-125');
            }, 300);
        }
    }
    
    formatSpecialtyName(id) {
        return id
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

// Initialize the profile favorites
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: false,
            mirror: true,
            delay: 100
        });
    }
    
    const profileFavorites = new ProfileFavorites();
    await profileFavorites.init();
});

export default ProfileFavorites;
