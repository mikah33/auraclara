// ========================================
// AURA CLARA - Product Recommendations & Recently Viewed
// ========================================

// Recently Viewed Products Tracker
class RecentlyViewedTracker {
    constructor() {
        this.storageKey = 'auraClara_recentlyViewed';
        this.maxItems = 8;
    }

    addProduct(productData) {
        let recentlyViewed = this.getProducts();

        // Remove if already exists to avoid duplicates
        recentlyViewed = recentlyViewed.filter(p => p.id !== productData.id);

        // Add to beginning of array
        recentlyViewed.unshift(productData);

        // Keep only the last maxItems
        if (recentlyViewed.length > this.maxItems) {
            recentlyViewed = recentlyViewed.slice(0, this.maxItems);
        }

        // Save to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(recentlyViewed));
    }

    getProducts() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    clearProducts() {
        localStorage.removeItem(this.storageKey);
    }
}

// Product Recommendations Engine
class RecommendationEngine {
    constructor() {
        // Product categories and relationships
        this.productRelationships = {
            'clarity-patches': ['jawline-shaper', 'bio-collagen-mask', 'vline-mask'],
            'jawline-shaper': ['face-sculpting-tool', 'clarity-patches', 'vline-mask'],
            'face-sculpting-tool': ['jawline-shaper', 'vline-mask', 'bio-collagen-mask'],
            'vline-mask': ['jawline-shaper', 'bio-collagen-mask', 'clarity-patches'],
            'bio-collagen-mask': ['vline-mask', 'clarity-patches', 'face-sculpting-tool']
        };

        // All products data
        this.allProducts = [
            {
                id: 'clarity-patches',
                name: 'Clarity Patches (36ct)',
                subtitle: 'Hydrocolloid Treatment',
                price: 12.99,
                originalPrice: 19.99,
                image: 'assets/images/product-packaging.png',
                rating: '★★★★★',
                reviews: '4.2K',
                badge: 'Bestseller',
                category: 'patches'
            },
            {
                id: 'jawline-shaper',
                name: 'Jawline Shaper Set',
                subtitle: 'Face Toning System',
                price: 12.99,
                image: 'assets/images/jawline-shaper.jpg',
                rating: '★★★★★',
                reviews: '3.8K',
                badge: 'Popular',
                category: 'tools'
            },
            {
                id: 'face-sculpting-tool',
                name: 'Face Sculpting Tool',
                subtitle: 'Microcurrent Technology',
                price: 52.99,
                image: 'assets/images/face-sculpting-tool-box.png',
                rating: '★★★★★',
                reviews: '2.1K',
                badge: 'Premium',
                category: 'tools'
            },
            {
                id: 'vline-mask',
                name: 'V-Line Lifting Mask',
                subtitle: 'Face Contouring',
                price: 19.00,
                image: 'assets/images/vline-mask-flat.jpg',
                rating: '★★★★★',
                reviews: '1.9K',
                badge: 'New',
                category: 'masks'
            },
            {
                id: 'bio-collagen-mask',
                name: 'Bio-Collagen Mask (4pk)',
                subtitle: 'Deep Hydration',
                price: 24.99,
                image: 'assets/images/bio-collagen-aesthetic.jpg',
                rating: '★★★★★',
                reviews: '3.2K',
                badge: 'Popular',
                category: 'masks'
            }
        ];
    }

    getRecommendations(productId, count = 4) {
        // Get related product IDs
        const relatedIds = this.productRelationships[productId] || [];

        // Get product objects
        const recommendations = relatedIds
            .slice(0, count)
            .map(id => this.allProducts.find(p => p.id === id))
            .filter(p => p !== undefined);

        return recommendations;
    }

    getProductById(productId) {
        return this.allProducts.find(p => p.id === productId);
    }
}

// Render Recently Viewed Section
function renderRecentlyViewed() {
    const tracker = new RecentlyViewedTracker();
    const products = tracker.getProducts();

    if (products.length === 0) {
        return; // Don't show section if no products viewed
    }

    // Find or create the container
    let container = document.getElementById('recently-viewed-section');

    if (!container) {
        // Create section after shop section
        const shopSection = document.getElementById('shop');
        if (!shopSection) return;

        container = document.createElement('section');
        container.id = 'recently-viewed-section';
        container.className = 'recently-viewed-section';
        shopSection.parentNode.insertBefore(container, shopSection.nextSibling);
    }

    // Build HTML
    const html = `
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Recently Viewed</h2>
                <p class="section-subtitle">Continue where you left off</p>
            </div>
            <div class="recently-viewed-grid">
                ${products.map(product => `
                    <div class="ios-product-card"
                         data-category="${product.category}"
                         data-product-id="${product.id}"
                         data-product-name="${product.name}"
                         data-product-price="${product.price}"
                         data-product-image="${product.image}">
                        <div class="ios-product-image">
                            <img src="${product.image}" alt="${product.name}">
                            ${product.badge ? `<span class="ios-product-badge">${product.badge}</span>` : ''}
                        </div>
                        <div class="ios-product-info">
                            <a href="products/${product.id}.html">
                                <h3 class="ios-product-name">${product.name.replace(/ \(.*\)/, '')}</h3>
                                <p class="ios-product-subtitle">${product.subtitle}</p>
                            </a>
                            <div class="ios-product-rating">
                                <span class="ios-stars">${product.rating}</span>
                                <span class="ios-reviews">${product.reviews}</span>
                            </div>
                            <div class="ios-product-price">
                                <span class="ios-price">$${product.price.toFixed(2)}</span>
                                ${product.originalPrice ? `<span class="ios-price-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
                            </div>
                            <button class="ios-add-to-cart-btn recently-viewed-cart-btn">Add to Cart</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Add event listeners to cart buttons
    container.querySelectorAll('.recently-viewed-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const card = btn.closest('.ios-product-card');
            const productId = card.dataset.productId;
            const productName = card.dataset.productName;
            const productPrice = parseFloat(card.dataset.productPrice);
            const productImage = card.dataset.productImage;

            // Add to cart (using global function from main.js)
            if (typeof addToCart === 'function') {
                addToCart(productId, productPrice, productName, productImage);
            }

            // Visual feedback
            btn.textContent = 'Added! ✨';
            btn.style.background = '#10B981';
            setTimeout(() => {
                btn.textContent = 'Add to Cart';
                btn.style.background = '';
            }, 2000);
        });
    });
}

// Render Product Recommendations
function renderRecommendations(currentProductId) {
    const engine = new RecommendationEngine();
    const recommendations = engine.getRecommendations(currentProductId, 4);

    if (recommendations.length === 0) {
        return;
    }

    // Find or create the container
    let container = document.getElementById('recommendations-section');

    if (!container) {
        // Create section at the end of main content
        const mainContent = document.querySelector('main');
        if (!mainContent) return;

        container = document.createElement('section');
        container.id = 'recommendations-section';
        container.className = 'recommendations-section';
        mainContent.appendChild(container);
    }

    // Build HTML
    const html = `
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">You Might Also Like</h2>
                <p class="section-subtitle">Complete your skincare routine</p>
            </div>
            <div class="recommendations-grid">
                ${recommendations.map(product => `
                    <div class="ios-product-card"
                         data-category="${product.category}"
                         data-product-id="${product.id}"
                         data-product-name="${product.name}"
                         data-product-price="${product.price}"
                         data-product-image="${product.image}">
                        <div class="ios-product-image">
                            <img src="../${product.image}" alt="${product.name}">
                            ${product.badge ? `<span class="ios-product-badge">${product.badge}</span>` : ''}
                        </div>
                        <div class="ios-product-info">
                            <a href="${product.id}.html">
                                <h3 class="ios-product-name">${product.name.replace(/ \(.*\)/, '')}</h3>
                                <p class="ios-product-subtitle">${product.subtitle}</p>
                            </a>
                            <div class="ios-product-rating">
                                <span class="ios-stars">${product.rating}</span>
                                <span class="ios-reviews">${product.reviews}</span>
                            </div>
                            <div class="ios-product-price">
                                <span class="ios-price">$${product.price.toFixed(2)}</span>
                                ${product.originalPrice ? `<span class="ios-price-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
                            </div>
                            <button class="ios-add-to-cart-btn recommendation-cart-btn">Add to Cart</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Add event listeners to cart buttons
    container.querySelectorAll('.recommendation-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const card = btn.closest('.ios-product-card');
            const productId = card.dataset.productId;
            const productName = card.dataset.productName;
            const productPrice = parseFloat(card.dataset.productPrice);
            const productImage = card.dataset.productImage;

            // Add to cart (using global function from main.js)
            if (typeof addToCart === 'function') {
                addToCart(productId, productPrice, productName, productImage);
            }

            // Visual feedback
            btn.textContent = 'Added! ✨';
            btn.style.background = '#10B981';
            setTimeout(() => {
                btn.textContent = 'Add to Cart';
                btn.style.background = '';
            }, 2000);
        });
    });
}

// Track product view on product detail pages
function trackProductView(productId) {
    const tracker = new RecentlyViewedTracker();
    const engine = new RecommendationEngine();

    const product = engine.getProductById(productId);

    if (product) {
        tracker.addProduct(product);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on homepage
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        renderRecentlyViewed();
    }

    // Check if we're on a product page and get product ID from URL or page data
    const productPageId = document.body.dataset.productId;
    if (productPageId) {
        trackProductView(productPageId);
        renderRecommendations(productPageId);
    }
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.RecentlyViewedTracker = RecentlyViewedTracker;
    window.RecommendationEngine = RecommendationEngine;
    window.trackProductView = trackProductView;
    window.renderRecentlyViewed = renderRecentlyViewed;
    window.renderRecommendations = renderRecommendations;
}
