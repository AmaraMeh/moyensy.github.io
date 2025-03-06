import { db } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

class LibraryFeatures {
    constructor() {
        this.userId = this.getUserId();
        this.favorites = [];
        this.resourceCounts = {};
    }

    async init() {
        await this.loadResourceCounts();
        await this.addResourceCountBadges();
        await this.loadFavorites();
        this.addFavoriteButtons();
        this.setupKeyboardShortcuts();
        this.addSearchBar();
    }

    // Resource Count Badges
    async loadResourceCounts() {
        try {
            const specialtiesRef = collection(db, "specialties");
            const querySnapshot = await getDocs(specialtiesRef);
            
            querySnapshot.forEach(doc => {
                const data = doc.data();
                this.resourceCounts[data.id] = data.resourceCount || 0;
            });
            
            // Also add some default counts for testing
            const defaultSpecialties = [
                'biologie', 'informatique-lmd', 'science-technologie', 
                'medecine', 'segc', 'genie-procedes', 'automatique'
            ];
            
            defaultSpecialties.forEach(specialty => {
                if (!this.resourceCounts[specialty]) {
                    this.resourceCounts[specialty] = Math.floor(Math.random() * 50) + 10;
                }
            });
        } catch (error) {
            console.error("Error loading resource counts:", error);
        }
    }
    
    async addResourceCountBadges() {
        const specialtyLinks = document.querySelectorAll('.service-card');
        
        specialtyLinks.forEach(link => {
            const title = link.querySelector('h3').textContent.trim();
            const specialtyId = this.getSpecialtyId(title);
            const count = this.resourceCounts[specialtyId] || 0;
            
            // Create badge
            const badge = document.createElement('span');
            badge.className = 'resource-count absolute top-2 left-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1';
            badge.innerHTML = `${count} <i class="fas fa-file-alt"></i>`;
            
            // Make the service card position relative
            link.style.position = 'relative';
            
            // Add badge
            link.appendChild(badge);
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
        const specialtyLinks = document.querySelectorAll('.service-card');
        
        specialtyLinks.forEach(link => {
            const title = link.querySelector('h3').textContent.trim();
            const specialtyId = this.getSpecialtyId(title);
            const isFavorite = this.favorites.includes(specialtyId);
            
            // Create favorite button
            const favBtn = document.createElement('button');
            favBtn.className = `favorite-btn absolute top-2 right-2 text-lg ${isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:scale-110 transition-all`;
            favBtn.innerHTML = '<i class="fas fa-star"></i>';
            favBtn.title = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
            
            // Add click handler
            favBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const index = this.favorites.indexOf(specialtyId);
                if (index === -1) {
                    // Add to favorites
                    this.favorites.push(specialtyId);
                    favBtn.className = 'favorite-btn absolute top-2 right-2 text-lg text-yellow-500 hover:scale-110 transition-all';
                    favBtn.title = 'Retirer des favoris';
                    this.showToast(`${title} ajouté aux favoris`);
                } else {
                    // Remove from favorites
                    this.favorites.splice(index, 1);
                    favBtn.className = 'favorite-btn absolute top-2 right-2 text-lg text-gray-400 hover:scale-110 transition-all';
                    favBtn.title = 'Ajouter aux favoris';
                    this.showToast(`${title} retiré des favoris`);
                }
                
                await this.saveFavorites();
                this.refreshFavoritesDisplay();
            });
            
            // Add to link
            link.appendChild(favBtn);
        });
        
        // Add favorites section
        this.addFavoritesSection();
    }
    
    addFavoritesSection() {
        // Create favorites section if we have favorites
        if (this.favorites.length > 0) {
            const favoritesSection = document.createElement('div');
            favoritesSection.id = 'favorites-section';
            favoritesSection.className = 'bg-yellow-50 p-6 rounded-lg shadow-lg mb-8';
            favoritesSection.innerHTML = `
                <h2 class="text-2xl font-bold mb-4 text-yellow-800">
                    <i class="fas fa-star text-yellow-500 mr-2"></i> Mes Favoris
                </h2>
                <div id="favorites-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Favorites will be added here -->
                </div>
            `;
            
            // Insert at the top of the page, after header
            const headerEl = document.querySelector('header');
            if (headerEl && headerEl.nextElementSibling) {
                headerEl.parentNode.insertBefore(favoritesSection, headerEl.nextElementSibling);
                this.refreshFavoritesDisplay();
            }
        }
    }
    
    refreshFavoritesDisplay() {
        const favoritesSection = document.getElementById('favorites-section');
        const favoritesGrid = document.getElementById('favorites-grid');
        
        if (this.favorites.length === 0) {
            // Remove section if no favorites
            if (favoritesSection) {
                favoritesSection.remove();
            }
            return;
        }
        
        // Create section if not exists
        if (!favoritesSection) {
            this.addFavoritesSection();
            return;
        }
        
        // Clear grid
        if (favoritesGrid) {
            favoritesGrid.innerHTML = '';
            
            // Add favorite cards
            this.favorites.forEach(specialtyId => {
                const originalCard = this.findSpecialtyCard(specialtyId);
                if (originalCard) {
                    const clonedCard = originalCard.cloneNode(true);
                    
                    // Replace the favorite button in the cloned card
                    const favBtn = clonedCard.querySelector('.favorite-btn');
                    if (favBtn) {
                        const newFavBtn = document.createElement('button');
                        newFavBtn.className = 'favorite-btn absolute top-2 right-2 text-lg text-red-500 hover:scale-110 transition-all';
                        newFavBtn.innerHTML = '<i class="fas fa-trash"></i>';
                        newFavBtn.title = 'Retirer des favoris';
                        
                        newFavBtn.addEventListener('click', async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Remove from favorites
                            const index = this.favorites.indexOf(specialtyId);
                            if (index !== -1) {
                                this.favorites.splice(index, 1);
                                await this.saveFavorites();
                                this.refreshFavoritesDisplay();
                                
                                // Also update the original card
                                const originalFavBtn = originalCard.querySelector('.favorite-btn');
                                if (originalFavBtn) {
                                    originalFavBtn.className = 'favorite-btn absolute top-2 right-2 text-lg text-gray-400 hover:scale-110 transition-all';
                                    originalFavBtn.title = 'Ajouter aux favoris';
                                }
                                
                                const title = originalCard.querySelector('h3').textContent.trim();
                                this.showToast(`${title} retiré des favoris`);
                            }
                        });
                        
                        favBtn.replaceWith(newFavBtn);
                    }
                    
                    favoritesGrid.appendChild(clonedCard);
                }
            });
        }
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