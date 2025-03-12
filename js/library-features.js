import { db } from '../firebase.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

class LibraryFeatures {
    constructor() {
        this.userId = this.getUserId();
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    }

    async init() {
        await this.loadFavorites();
        this.addFavoriteButtons();
        // ... other features such as keyboard shortcuts and search bar
        this.removeResourceCountBadges();
    }
    
    // Add this new method to remove resource count badges
    removeResourceCountBadges() {
        // Find and remove any resource count badges
        const badges = document.querySelectorAll('.resource-count-badge');
        badges.forEach(badge => badge.remove());
        
        // Also find any elements that might have these badges as children and clean them
        const cardElements = document.querySelectorAll('.service-card');
        cardElements.forEach(card => {
            const countBadges = card.querySelectorAll('.badge, [class*="count"], [class*="badge"]');
            countBadges.forEach(badge => {
                if (badge.textContent.match(/^\d+$/) || badge.textContent.includes('ressource')) {
                    badge.remove();
                }
            });
        });
    }
    
    getSpecialtyId(name) {
        return name.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
    }
    
    // Personal Favorites System
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
            }
        } catch (error) {
            console.error("Error loading favorites:", error);
            // Fallback to localStorage
            const localFavorites = localStorage.getItem('favorites');
            if (localFavorites) {
                this.favorites = JSON.parse(localFavorites);
            }
        }
    }
    
    async saveFavorites() {
        try {
            // Save to Firebase
            const userRef = doc(db, "users", this.userId);
            await setDoc(userRef, {
                favorites: this.favorites,
                lastUpdated: new Date()
            }, { merge: true });
            
            // Also save to localStorage as backup
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error("Error saving favorites:", error);
            // Fallback to just localStorage
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
        }
    }
    
    addFavoriteButtons() {
        console.log("Adding favorite buttons to cards");
        // Determine login status - user is logged in if either isLoggedIn is true or userId exists
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || 
                          (!!localStorage.getItem('userData') && !!localStorage.getItem('userId'));
        
        // Include both service cards and module cards
        const specialtyLinks = document.querySelectorAll('.service-card, .module-card');
        
        specialtyLinks.forEach(link => {
            // Remove any existing favorite buttons
            const existingBtn = link.querySelector('.favorite-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            // Try to get the title element – fallback to a generic selector if missing
            let titleEl = link.querySelector('h3');
            if (!titleEl) {
                titleEl = link.querySelector('.card-title');
            }
            if (!titleEl) return;
            
            const title = titleEl.textContent.trim();
            const specialtyId = this.getSpecialtyId(title);
            const isFavorite = this.favorites.includes(specialtyId);
            
            // Create the favorite button container
            const favBtn = document.createElement('div');
            favBtn.className = 'favorite-btn absolute top-3 right-3 z-10';
            
            if (isLoggedIn) {
                // For logged-in users: Build a button with a star icon – yellow if favorite, gray if not
                favBtn.innerHTML = `
                    <button class="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400">
                        <i class="fas fa-star ${isFavorite ? 'text-yellow-500' : 'text-gray-400'} text-lg"></i>
                    </button>
                `;
                favBtn.title = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
                
                // Click handler for logged in users to toggle favorite status
                favBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const index = this.favorites.indexOf(specialtyId);
                    const starIcon = favBtn.querySelector('i.fa-star');
                    
                    if (index === -1) {
                        // Add to favorites
                        this.favorites.push(specialtyId);
                        starIcon.classList.remove('text-gray-400');
                        starIcon.classList.add('text-yellow-500');
                        favBtn.title = 'Retirer des favoris';
                        
                        // Animate the star and include the notification star in the toast
                        starIcon.classList.add('animate-pulse');
                        setTimeout(() => {
                            starIcon.classList.remove('animate-pulse');
                        }, 1000);
                        
                        this.showToast(`<i class="fas fa-star text-yellow-500 mr-2"></i> ${title} ajouté aux favoris`, 'success');
                    } else {
                        // Remove from favorites
                        this.favorites.splice(index, 1);
                        starIcon.classList.remove('text-yellow-500');
                        starIcon.classList.add('text-gray-400');
                        favBtn.title = 'Ajouter aux favoris';
                        this.showToast(`${title} retiré des favoris`, 'warning');
                    }
                    
                    // Save favorites to Firebase/localStorage
                    await this.saveFavorites();
                    
                    // Update the favorites section
                    this.refreshFavoritesDisplay();
                });
            } else {
                // For non-logged in users: Show a grayed-out button that prompts for login
                favBtn.innerHTML = `
                    <button class="w-10 h-10 bg-white bg-opacity-70 rounded-full shadow flex items-center justify-center opacity-60">
                        <i class="fas fa-star text-gray-400 text-lg"></i>
                    </button>
                `;
                favBtn.title = 'Connectez-vous pour ajouter aux favoris';
                
                // When clicked, show login prompt instead of adding to favorites
                favBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showLoginPrompt();
                });
            }
            
            // Ensure the card is positioned relatively so the button is correctly placed
            link.style.position = 'relative';
            link.appendChild(favBtn);
        });
        
        // Always update the favorites section if it exists
        this.refreshFavoritesDisplay();
    }
    
    // Add a login prompt method
    showLoginPrompt() {
        // First check if a prompt already exists and remove it
        const existingPrompt = document.getElementById('login-prompt-modal');
        if (existingPrompt) {
            existingPrompt.remove();
        }

        // Create a modal for login prompt with improved styling
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 opacity-0 transition-opacity duration-300';
        modal.id = 'login-prompt-modal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full transform transition-all scale-95 duration-300 shadow-xl">
                <div class="text-center mb-4">
                    <div class="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-lock text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">Connexion requise</h3>
                    <p class="text-gray-600 mt-2">Connectez-vous pour ajouter des spécialités à vos favoris</p>
                </div>
                
                <div class="mt-6 flex flex-col gap-3">
                    <a href="auth.html" class="w-full bg-blue-600 text-white py-3 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Se connecter
                    </a>
                    <button id="close-login-prompt" class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg text-center font-medium hover:bg-gray-300 transition-colors">
                        Annuler
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const modalContent = modal.querySelector('div');
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
        
        // Add click handler to close the modal
        modal.querySelector('#close-login-prompt').addEventListener('click', () => {
            modal.classList.add('opacity-0');
            const modalContent = modal.querySelector('div');
            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('opacity-0');
                const modalContent = modal.querySelector('div');
                modalContent.classList.remove('scale-100');
                modalContent.classList.add('scale-95');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        });
    }
    
    // Improve the toast notification
    showToast(message, type = 'success') {
        // Remove any existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        let bgColor, borderColor, textColor;
        
        switch(type) {
            case 'success':
                bgColor = 'bg-green-50';
                borderColor = 'border-green-400';
                textColor = 'text-green-800';
                break;
            case 'error':
                bgColor = 'bg-red-50';
                borderColor = 'border-red-400';
                textColor = 'text-red-800';
                break;
            case 'warning':
                bgColor = 'bg-yellow-50';
                borderColor = 'border-yellow-400';
                textColor = 'text-yellow-800';
                break;
            default:
                bgColor = 'bg-blue-50';
                borderColor = 'border-blue-400';
                textColor = 'text-blue-800';
        }
        
        toast.className = `toast-notification fixed bottom-6 left-1/2 transform -translate-x-1/2 ${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg border ${borderColor} z-50`;
        toast.innerHTML = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('animate-bounce');
            setTimeout(() => {
                toast.classList.remove('animate-bounce');
            }, 1000);
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    // Modify the addFavoritesSection method to ensure it always creates the section properly
    addFavoritesSection() {
        // Always create a favorites section container, even if empty.
        const existingSection = document.getElementById('favorites-section');
        if (existingSection) existingSection.remove();
        
        const favoritesSection = document.createElement('div');
        favoritesSection.id = 'favorites-section';
        favoritesSection.className = 'mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6';
        
        // Header remains the same
        favoritesSection.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <div class="bg-yellow-100 rounded-lg p-2 mr-3">
                        <i class="fas fa-star text-yellow-500 text-xl"></i>
                    </div>
                    <h2 class="text-xl font-bold text-gray-800">Mes Favoris</h2>
                </div>
                <span class="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    ${this.favorites.length} ${this.favorites.length > 1 ? 'éléments' : 'élément'}
                </span>
            </div>
            <div id="favorites-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Favorite cards will be inserted here -->
            </div>
        `;
        
        // Insert the favorites section in bib.html; adjust based on your layout.
        const container = document.querySelector('.container');
        if (container) {
            // For bib.html, always insert immediately after the header.
            const header = container.querySelector('header');
            if (header && header.nextElementSibling) {
                container.insertBefore(favoritesSection, header.nextElementSibling);
            } else {
                container.insertBefore(favoritesSection, container.firstChild);
            }
        } else {
            document.body.appendChild(favoritesSection);
        }
        
        // Populate the grid (empty state will be rendered if no favorite cards exist)
        this.refreshFavoritesDisplay();
    }

    refreshFavoritesDisplay() {
        const favoritesGrid = document.getElementById('favorites-grid');
        
        if (!favoritesGrid) {
            // If the grid doesn't exist, create the whole section
            if (this.favorites.length > 0) {
                this.addFavoritesSection();
            }
            return;
        }
        
        // Clear the grid
        favoritesGrid.innerHTML = '';
        
        if (this.favorites.length === 0) {
            // Remove the entire section if no favorites
            const favoritesSection = document.getElementById('favorites-section');
            if (favoritesSection) {
                favoritesSection.remove();
            }
            return;
        }
        
        // Add favorite cards to the grid
        this.favorites.forEach(specialtyId => {
            const originalCard = this.findSpecialtyCard(specialtyId);
            if (originalCard) {
                // Create a clone of the original card
                const clonedCard = originalCard.cloneNode(true);
                
                // Style it differently to make it stand out as a favorite
                clonedCard.classList.add('border-yellow-400', 'border-2');
                
                // Replace the favorite button in the cloned card with a remove button
                const favBtn = clonedCard.querySelector('.favorite-btn');
                if (favBtn) {
                    const newFavBtn = document.createElement('button');
                    newFavBtn.className = 'absolute top-2 right-2 text-red-500 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:scale-110 transition-transform';
                    newFavBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    newFavBtn.title = 'Retirer des favoris';
                    
                    newFavBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Animate removal
                        clonedCard.classList.add('scale-95', 'opacity-0');
                        
                        // Remove from favorites
                        const index = this.favorites.indexOf(specialtyId);
                        if (index !== -1) {
                            this.favorites.splice(index, 1);
                            await this.saveFavorites();
                            
                            // Wait for animation then refresh the display
                            setTimeout(() => {
                                this.refreshFavoritesDisplay();
                            }, 300);
                            
                            // Also update the original card's star button
                            const originalFavBtn = originalCard.querySelector('.favorite-btn button i.fa-star');
                            if (originalFavBtn) {
                                originalFavBtn.classList.remove('text-yellow-500');
                                originalFavBtn.classList.add('text-gray-400');
                                originalCard.querySelector('.favorite-btn').title = 'Ajouter aux favoris';
                            }
                            
                            const title = originalCard.querySelector('h3').textContent.trim();
                            this.showToast(`${title} retiré des favoris`);
                        }
                    });
                    
                    // Replace the old button with our new one
                    favBtn.replaceWith(newFavBtn);
                }
                
                // Add the card to the grid
                favoritesGrid.appendChild(clonedCard);
            }
        });
    }
    
    findSpecialtyCard(specialtyId) {
        const specialtyLinks = document.querySelectorAll('.service-card');
        
        for (const link of specialtyLinks) {
            const title = link.querySelector('h3').textContent.trim();
            const id = this.getSpecialtyId(title);
            
            if (id === specialtyId) {
                return link;
            }
        }
        
        return null;
    }
    
    // Additional Features
    
    // 1. Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt+F to focus search
            if (e.altKey && e.key === 'f') {
                const searchInput = document.getElementById('library-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Escape to close any open dropdowns/panels
            if (e.key === 'Escape') {
                const openPanels = document.querySelectorAll('[id^="collapse-"][style*="max-height"][style*="px"]');
                openPanels.forEach(panel => {
                    panel.style.maxHeight = "0";
                });
            }
        });
    }
    
    // 2. Search functionality
    addSearchBar() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'mb-8 p-4 bg-white rounded-lg shadow-md transition-all';
        searchContainer.innerHTML = `
            <div class="relative">
                <input type="text" id="library-search" placeholder="Rechercher une spécialité, un campus ou un cours..." 
                    class="w-full py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button class="absolute right-3 top-3 text-gray-500 hover:text-blue-600">
                    <i class="fas fa-search text-xl"></i>
                </button>
                <div class="absolute right-12 top-3">
                    <button id="voice-search" class="text-gray-500 hover:text-blue-600" title="Recherche vocale">
                        <i class="fas fa-microphone text-xl"></i>
                    </button>
                </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
                <button class="filter-btn px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">Tous</button>
                <button class="filter-btn px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">El-Kseur</button>
                <button class="filter-btn px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">Aboudaou</button>
                <button class="filter-btn px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">Targa</button>
                <div class="ml-auto">
                    <button class="text-sm text-blue-600 hover:underline">Options avancées</button>
                </div>
            </div>
        `;
        
        // Insert at the top of the page, after header
        const headerEl = document.querySelector('header');
        if (headerEl && headerEl.nextElementSibling) {
            headerEl.parentNode.insertBefore(searchContainer, headerEl.nextElementSibling);
        }
        
        // Add search functionality
        const searchInput = document.getElementById('library-search');
        searchInput.addEventListener('input', () => {
            this.filterSpecialties(searchInput.value.toLowerCase());
        });
        
        // Add voice search functionality
        const voiceSearchBtn = document.getElementById('voice-search');
        if ('webkitSpeechRecognition' in window) {
            voiceSearchBtn.addEventListener('click', () => {
                const recognition = new webkitSpeechRecognition();
                recognition.lang = 'fr-FR';
                recognition.start();
                
                voiceSearchBtn.innerHTML = '<i class="fas fa-microphone-alt text-red-500"></i>';
                
                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    searchInput.value = transcript;
                    this.filterSpecialties(transcript.toLowerCase());
                    voiceSearchBtn.innerHTML = '<i class="fas fa-microphone text-xl"></i>';
                };
                
                recognition.onerror = () => {
                    voiceSearchBtn.innerHTML = '<i class="fas fa-microphone text-xl"></i>';
                };
                
                recognition.onend = () => {
                    voiceSearchBtn.innerHTML = '<i class="fas fa-microphone text-xl"></i>';
                };
            });
        } else {
            voiceSearchBtn.style.display = 'none';
        }
    }
    
    filterSpecialties(searchTerm) {
        const specialtyLinks = document.querySelectorAll('.service-card');
        
        specialtyLinks.forEach(link => {
            const title = link.querySelector('h3').textContent.trim().toLowerCase();
            const parentSection = this.findParentSection(link);
            const parentCampus = parentSection ? this.findParentCampus(parentSection) : '';
            const parentYear = parentSection ? this.findParentYear(parentSection) : '';
            
            if (
                title.includes(searchTerm) || 
                parentCampus.toLowerCase().includes(searchTerm) || 
                parentYear.toLowerCase().includes(searchTerm)
            ) {
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        });
    }
    
    findParentSection(element) {
        let parent = element.parentElement;
        while (parent && !parent.classList.contains('grid')) {
            parent = parent.parentElement;
        }
        return parent;
    }
    
    findParentCampus(element) {
        let parent = element.parentElement;
        while (parent && !parent.classList.contains('campus-section')) {
            parent = parent.parentElement;
        }
        if (parent) {
            const campusHeader = parent.querySelector('h3');
            return campusHeader ? campusHeader.textContent : '';
        }
        return '';
    }
    
    findParentYear(element) {
        let parent = element.parentElement;
        while (parent && !parent.classList.contains('year-section')) {
            parent = parent.parentElement;
        }
        if (parent) {
            const yearHeader = parent.querySelector('h2');
            return yearHeader ? yearHeader.textContent : '';
        }
        return '';
    }
    
    // Toast notification helper
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
        
        toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 ${bgColor} px-4 py-3 rounded border z-50 shadow-md`;
        toast.innerHTML = message;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize library features
document.addEventListener('DOMContentLoaded', async () => {
    const features = new LibraryFeatures();
    await features.init();
});