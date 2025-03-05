class QuickAccessMenu {
    constructor() {
        this.modules = [];
        this.menuElement = null;
    }

    // Initialize the quick access menu
    init(modules) {
        this.modules = modules;
        this.createMenu();
        this.addEventListeners();
    }

    // Create the floating menu HTML
    createMenu() {
        // Create container
        const menu = document.createElement('div');
        menu.className = 'fixed right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg p-2 z-40 quick-access-menu';
        menu.innerHTML = `
            <button class="toggle-menu-btn bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mb-2">
                <i class="fas fa-bars"></i>
            </button>
            <div class="menu-items hidden flex flex-col space-y-2">
                ${this.modules.map(module => `
                    <button class="module-link bg-gray-100 hover:bg-gray-200 rounded-lg p-2 text-sm" 
                            data-module="${module.id}" title="${module.name}">
                        <i class="fas ${module.icon}"></i>
                    </button>
                `).join('')}
            </div>
        `;

        // Add to the document
        document.body.appendChild(menu);
        this.menuElement = menu;
    }

    // Add event listeners
    addEventListeners() {
        const toggleBtn = this.menuElement.querySelector('.toggle-menu-btn');
        const menuItems = this.menuElement.querySelector('.menu-items');

        // Toggle menu visibility
        toggleBtn.addEventListener('click', () => {
            menuItems.classList.toggle('hidden');
            toggleBtn.innerHTML = menuItems.classList.contains('hidden') 
                ? '<i class="fas fa-bars"></i>' 
                : '<i class="fas fa-times"></i>';
        });

        // Module links
        const moduleLinks = this.menuElement.querySelectorAll('.module-link');
        moduleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const moduleId = e.currentTarget.getAttribute('data-module');
                const moduleElement = document.querySelector(`.module-card[data-module="${moduleId}"]`);
                if (moduleElement) {
                    moduleElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}

export default QuickAccessMenu;