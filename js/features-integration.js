import QuickAccessMenu from './quick-access-menu.js';
import MobileEnhancements from './mobile-enhancements.js';
import ModuleSubscription from './module-subscription.js';
import DownloadTracker from './download-tracker.js';
import { db } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Main class to integrate all features
class FeaturesIntegration {
    constructor() {
        this.menu = new QuickAccessMenu();
        this.mobileEnhancements = new MobileEnhancements();
        this.moduleSubscription = new ModuleSubscription();
        this.badgeColors = {
            popular: 'bg-blue-100 text-blue-800 border-blue-200',
            veryPopular: 'bg-orange-100 text-orange-800 border-orange-200',
            trending: 'bg-purple-100 text-purple-800 border-purple-200'
        };
        this.resourceDownloadCounts = new Map(); // Cache for download counts
    }

    init() {
        // Initialize features when DOM is loaded
        document.addEventListener('DOMContentLoaded', async () => {
            // Extract modules from the page
            const moduleElements = document.querySelectorAll('.module-card');
            const modules = Array.from(moduleElements).map(el => {
                const titleEl = el.querySelector('h3');
                const iconEl = el.querySelector('.module-icon i');
                return {
                    id: this.getModuleIdFromName(titleEl.textContent.trim()),
                    name: titleEl.textContent.trim(),
                    icon: iconEl ? iconEl.className.replace('fas ', '') : 'fa-book'
                };
            });

            // Initialize quick access menu
            this.menu.init(modules);
            
            // Initialize mobile enhancements
            this.mobileEnhancements.init();
            
            // Add download tracking to the showContent function
            this.enhanceShowContentFunction();
            
            // Add subscription buttons to modules
            await this.addSubscriptionButtons();
            
            // Add custom styles for download counters
            this.addDownloadCounterStyles();
        });
    }

    // Add custom styles for download counters
    addDownloadCounterStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .download-counter {
                display: inline-flex;
                align-items: center;
                background-color: #f3f4f6;
                border-radius: 12px;
                padding: 3px 8px;
                margin-left: 8px;
                transition: all 0.3s ease;
                border: 1px solid #e5e7eb;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            
            .download-counter:hover {
                background-color: #e5e7eb;
            }
            
            .download-counter i {
                margin-right: 4px;
                color: #6b7280;
            }
            
            .download-counter-value {
                font-weight: 500;
                color: #4b5563;
            }
            
            .download-animation {
                animation: downloadPulse 0.6s ease;
            }
            
            @keyframes downloadPulse {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.2);
                    background-color: #dbeafe;
                }
                100% {
                    transform: scale(1);
                }
            }
            
            .popularity-badge {
                animation: fadeIn 0.5s ease;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Enhance the showContent function to include download tracking and popularity badges
    enhanceShowContentFunction() {
        // Store original function
        const originalShowContent = window.showContent;
        
        if (!originalShowContent) {
            console.error('showContent function not found');
            return;
        }

        // Override with enhanced version
        window.showContent = async (moduleShortName, type) => {
            // Call original function
            originalShowContent(moduleShortName, type);
            
            // Enhance content items after they're rendered
            setTimeout(async () => {
                const contentItems = document.querySelectorAll('.content-item a');
                for (const link of contentItems) {
                    await this.enhanceResourceLink(link, moduleShortName);
                }
            }, 300); // Small delay to ensure content is rendered
        };

        // Also enhance createContentItem
        if (window.createContentItem) {
            const originalCreateContentItem = window.createContentItem;
            window.createContentItem = function(item, type, isRecommended) {
                const contentItem = originalCreateContentItem(item, type, isRecommended);
                
                // Make item.url available as data attribute
                if (item.url) {
                    contentItem.setAttribute('data-url', item.url);
                    contentItem.setAttribute('data-title', item.title);
                    
                    // Add resource ID as a data attribute for tracking
                    const resourceId = btoa(item.url).replace(/=/g, '').substring(0, 20);
                    contentItem.setAttribute('data-resource-id', resourceId);
                }
                
                return contentItem;
            };
        }
    }

    // Add download tracking and popularity badges to resource links
    async enhanceResourceLink(link, moduleId) {
        // Generate a resource ID based on URL
        const resourceId = this.generateResourceId(link.href);
        
        // Get current download count 
        const downloads = await this.getDownloadCount(resourceId);
        
        // Create a unique ID for this specific download counter DOM element
        const counterId = `counter-${resourceId}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Add download count display
        const downloadCounter = document.createElement('span');
        downloadCounter.className = `download-counter`;
        downloadCounter.id = counterId;
        downloadCounter.innerHTML = `
            <i class="fas fa-download"></i>
            <span class="download-counter-value">${downloads}</span>
        `;
        
        // Store the resource ID with the counter element for reference
        downloadCounter.dataset.resourceId = resourceId;
        
        // Insert the counter after the link
        link.parentNode.insertBefore(downloadCounter, link.nextSibling);
        
        // Add popularity badge if needed
        if (downloads >= 100) {
            this.addPopularityBadge(link, 'veryPopular', 'Très populaire');
        } else if (downloads >= 50) {
            this.addPopularityBadge(link, 'popular', 'Populaire');
        }
        
        // Add click event to track downloads
        const originalOnClick = link.onclick;
        link.onclick = async (e) => {
            // Track the download
            await this.trackDownload(resourceId, moduleId);
            
            // Get the new count from our local cache + 1 (faster than DB refresh)
            const newCount = (this.resourceDownloadCounts.get(resourceId) || 0) + 1;
            
            // Update only THIS counter (not all with same resource ID)
            const counter = document.getElementById(counterId);
            if (counter) {
                const valueElement = counter.querySelector('.download-counter-value');
                if (valueElement) {
                    valueElement.textContent = newCount;
                }
                
                // Add animation class
                counter.classList.add('download-animation');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    counter.classList.remove('download-animation');
                }, 700);
            }
            
            // Check if this download makes it popular
            if (newCount === 50) {
                this.addPopularityBadge(link, 'popular', 'Populaire');
            } else if (newCount === 100) {
                // Replace popular badge with very popular
                const oldBadge = link.parentNode.querySelector('.popularity-badge');
                if (oldBadge) oldBadge.remove();
                this.addPopularityBadge(link, 'veryPopular', 'Très populaire');
            }
            
            // Call original click handler if it exists
            if (originalOnClick) return originalOnClick.call(this, e);
            return true;
        };
    }
    
    // Track a new download
    async trackDownload(resourceId, moduleId) {
        try {
            const resourceRef = doc(db, "resources", resourceId);
            const docSnap = await getDoc(resourceRef);
            
            if (docSnap.exists()) {
                // Update existing document
                await updateDoc(resourceRef, {
                    downloads: increment(1),
                    lastDownloaded: new Date()
                });
                
                // Update our cache
                const currentCount = this.resourceDownloadCounts.get(resourceId) || 0;
                this.resourceDownloadCounts.set(resourceId, currentCount + 1);
            } else {
                // Create new document
                await setDoc(resourceRef, {
                    id: resourceId,
                    moduleId: moduleId,
                    downloads: 1,
                    firstDownloaded: new Date(),
                    lastDownloaded: new Date()
                });
                
                // Update our cache
                this.resourceDownloadCounts.set(resourceId, 1);
            }
            return true;
        } catch (error) {
            console.error("Error tracking download:", error);
            return false;
        }
    }

    // Get the download count for a resource
    async getDownloadCount(resourceId, forceRefresh = false) {
        // Check if we have it cached and not forcing refresh
        if (!forceRefresh && this.resourceDownloadCounts.has(resourceId)) {
            return this.resourceDownloadCounts.get(resourceId);
        }
        
        try {
            const resourceRef = doc(db, "resources", resourceId);
            const docSnap = await getDoc(resourceRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                const downloads = data.downloads || 0;
                
                // Cache the result
                this.resourceDownloadCounts.set(resourceId, downloads);
                return downloads;
            }
            return 0;
        } catch (error) {
            console.error("Error getting download count:", error);
            return 0;
        }
    }
    
    // Add a popularity badge to a link
    addPopularityBadge(link, type, text) {
        // Check if badge already exists
        const existingBadge = link.parentNode.querySelector('.popularity-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        const badge = document.createElement('span');
        badge.className = `popularity-badge text-xs ${this.badgeColors[type]} border rounded-full px-2 py-1 ml-2 inline-flex items-center`;
        badge.innerHTML = `<i class="fas fa-fire mr-1"></i>${text}`;
        
        // Add after the link
        link.parentNode.insertBefore(badge, link.nextSibling);
    }
    
    // Add subscription buttons to all modules
    async addSubscriptionButtons() {
        const moduleCards = document.querySelectorAll('.module-card');
        
        for (const card of moduleCards) {
            const moduleTitle = card.querySelector('h3').textContent.trim();
            const moduleId = this.getModuleIdFromName(moduleTitle);
            
            // Check if already subscribed
            const isSubscribed = await this.moduleSubscription.isSubscribed(moduleId);
            
            // Create subscription button
            const subBtn = document.createElement('button');
            subBtn.className = `subscription-btn text-xs ${isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} rounded-full px-2 py-1 absolute top-2 right-2`;
            subBtn.innerHTML = isSubscribed ? 
                '<i class="fas fa-bell"></i>' : 
                '<i class="fas fa-bell-slash"></i>';
            subBtn.title = isSubscribed ? 'Se désabonner' : "S'abonner aux mises à jour";
            
            // Add click handler
            subBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                // Toggle subscription
                if (isSubscribed) {
                    await this.moduleSubscription.unsubscribeFromModule(moduleId);
                    subBtn.innerHTML = '<i class="fas fa-bell-slash"></i>';
                    subBtn.className = 'subscription-btn text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1 absolute top-2 right-2';
                    subBtn.title = "S'abonner aux mises à jour";
                    this.showToast(`Désabonné des mises à jour de ${moduleTitle}`);
                } else {
                    const hasPermission = await this.moduleSubscription.requestNotificationPermission();
                    
                    if (hasPermission) {
                        await this.moduleSubscription.subscribeToModule(moduleId, moduleTitle);
                        subBtn.innerHTML = '<i class="fas fa-bell"></i>';
                        subBtn.className = 'subscription-btn text-xs bg-green-100 text-green-800 rounded-full px-2 py-1 absolute top-2 right-2';
                        subBtn.title = 'Se désabonner';
                        this.showToast(`Abonné aux mises à jour de ${moduleTitle}`);
                    } else {
                        this.showToast('Les notifications sont requises pour les abonnements', 'error');
                    }
                }
            });
            
            // Add to card
            card.style.position = 'relative';
            card.appendChild(subBtn);
        }
    }
    
    // Show a toast notification
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
    
    // Helper to generate a resource ID from URL
    generateResourceId(url) {
        // Use a complete hash of the URL instead of truncating
        // This SHA-256 like approach ensures unique IDs even for similar URLs
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'resource-' + Math.abs(hash).toString(16);
    }
    
    // Helper to convert module name to ID
    getModuleIdFromName(name) {
        return name.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
    }
}

// Create and initialize
const features = new FeaturesIntegration();
features.init();

export default features;