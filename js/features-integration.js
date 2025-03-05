import QuickAccessMenu from './quick-access-menu.js';
import MobileEnhancements from './mobile-enhancements.js';
import ModuleSubscription from './module-subscription.js';
import DownloadTracker from './download-tracker.js';

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
        });
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
                contentItem.setAttribute('data-url', item.url);
                contentItem.setAttribute('data-title', item.title);
                
                return contentItem;
            };
        }
    }

    // Add download tracking and popularity badges to resource links
    async enhanceResourceLink(link, moduleId) {
        // Generate a resource ID based on URL
        const resourceId = this.generateResourceId(link.href);
        
        // Get current download count
        const downloads = await DownloadTracker.getDownloadCount(resourceId);
        
        // Add download count display
        const downloadCounter = document.createElement('span');
        downloadCounter.className = 'text-xs text-gray-500 ml-2';
        downloadCounter.innerHTML = `<i class="fas fa-download text-gray-400"></i> ${downloads}`;
        link.parentNode.appendChild(downloadCounter);
        
        // Add popularity badge if needed
        if (await DownloadTracker.isVeryPopular(resourceId)) {
            this.addPopularityBadge(link, 'veryPopular', 'Très populaire');
        } else if (await DownloadTracker.isPopular(resourceId)) {
            this.addPopularityBadge(link, 'popular', 'Populaire');
        }
        
        // Add click event to track downloads
        const originalOnClick = link.onclick;
        link.onclick = async (e) => {
            // Track the download
            await DownloadTracker.trackDownload(resourceId, moduleId);
            
            // Update counter immediately
            const newCount = downloads + 1;
            downloadCounter.innerHTML = `<i class="fas fa-download text-gray-400"></i> ${newCount}`;
            
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
    
    // Add a popularity badge to a link
    addPopularityBadge(link, type, text) {
        const badge = document.createElement('span');
        badge.className = `popularity-badge text-xs ${this.badgeColors[type]} border rounded-full px-2 py-1 ml-2 inline-flex items-center`;
        badge.innerHTML = `<i class="fas fa-fire mr-1"></i>${text}`;
        
        // Add after the link
        link.parentNode.appendChild(badge);
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
                
                if (isSubscribed) {
                    // Unsubscribe
                    await this.moduleSubscription.unsubscribeFromModule(moduleId);
                    subBtn.innerHTML = '<i class="fas fa-bell-slash"></i>';
                    subBtn.className = 'subscription-btn text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1 absolute top-2 right-2';
                    subBtn.title = "S'abonner aux mises à jour";
                } else {
                    // Subscribe - Request notification permission first
                    const hasPermission = await this.moduleSubscription.requestNotificationPermission();
                    
                    if (hasPermission) {
                        await this.moduleSubscription.subscribeToModule(moduleId, moduleTitle);
                        subBtn.innerHTML = '<i class="fas fa-bell"></i>';
                        subBtn.className = 'subscription-btn text-xs bg-green-100 text-green-800 rounded-full px-2 py-1 absolute top-2 right-2';
                        subBtn.title = 'Se désabonner';
                        
                        // Show confirmation
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
        return btoa(url).replace(/=/g, '').substring(0, 20);
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