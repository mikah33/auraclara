// ========================================
// AURA CLARA - Sticky Add to Cart Bar
// ========================================

class StickyCartBar {
    constructor() {
        this.stickyBar = null;
        this.addToCartSection = null;
        this.threshold = 0;
        this.isVisible = false;

        this.init();
    }

    init() {
        // Find the main add to cart section on product pages
        this.addToCartSection = document.querySelector('.product-options, .add-to-cart-section, .product-actions');

        if (!this.addToCartSection) {
            return; // Not on a product page
        }

        this.createStickyBar();
        this.setupScrollListener();
    }

    createStickyBar() {
        // Get product information from page
        const productName = document.querySelector('.product-title, h1')?.textContent || 'Product';
        const productPrice = document.getElementById('product-price')?.textContent || '$0.00';
        const productImage = document.querySelector('.product-img, .product-img-main')?.src || '';
        const productSelect = document.getElementById('patch-count');

        // Create sticky bar HTML
        this.stickyBar = document.createElement('div');
        this.stickyBar.className = 'sticky-cart-bar';
        this.stickyBar.innerHTML = `
            <div class="sticky-cart-content">
                <div class="sticky-cart-product">
                    ${productImage ? `<img src="${productImage}" alt="${productName}" class="sticky-cart-image">` : ''}
                    <div class="sticky-cart-info">
                        <h3 class="sticky-cart-name">${productName}</h3>
                        <p class="sticky-cart-price" id="sticky-price">${productPrice}</p>
                    </div>
                </div>
                <div class="sticky-cart-actions">
                    ${productSelect ? `
                    <select class="sticky-cart-select" id="sticky-patch-count">
                        ${Array.from(productSelect.options).map(opt =>
                            `<option value="${opt.value}"
                                     data-price="${opt.getAttribute('data-price')}"
                                     data-image="${opt.getAttribute('data-image')}"
                                     ${opt.selected ? 'selected' : ''}>
                                ${opt.text}
                            </option>`
                        ).join('')}
                    </select>
                    ` : ''}
                    <button class="btn btn-primary sticky-add-to-cart" id="sticky-add-to-cart">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.stickyBar);

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const stickySelect = document.getElementById('sticky-patch-count');
        const stickyPrice = document.getElementById('sticky-price');
        const stickyAddBtn = document.getElementById('sticky-add-to-cart');
        const mainSelect = document.getElementById('patch-count');

        // Sync sticky select with main select
        if (stickySelect && mainSelect) {
            stickySelect.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const price = selectedOption.getAttribute('data-price');

                // Update sticky bar price
                if (stickyPrice) {
                    stickyPrice.textContent = `$${price}`;
                }

                // Update main select
                mainSelect.value = e.target.value;
                mainSelect.dispatchEvent(new Event('change'));
            });

            // Listen to main select changes
            mainSelect.addEventListener('change', (e) => {
                stickySelect.value = e.target.value;
                const selectedOption = e.target.options[e.target.selectedIndex];
                const price = selectedOption.getAttribute('data-price');

                if (stickyPrice) {
                    stickyPrice.textContent = `$${price}`;
                }
            });
        }

        // Add to cart functionality
        if (stickyAddBtn) {
            stickyAddBtn.addEventListener('click', () => {
                // Use the main page's add to cart logic
                const mainAddBtn = document.querySelector('.product-actions .btn-primary, .add-to-cart-section .btn-primary');

                if (mainAddBtn) {
                    mainAddBtn.click();

                    // Visual feedback on sticky button
                    const originalText = stickyAddBtn.textContent;
                    stickyAddBtn.textContent = 'Added! ✨';
                    stickyAddBtn.style.background = '#10B981';
                    setTimeout(() => {
                        stickyAddBtn.textContent = originalText;
                        stickyAddBtn.style.background = '';
                    }, 2000);
                }
            });
        }
    }

    setupScrollListener() {
        // Calculate when to show the sticky bar (when main add to cart is out of view)
        const updateThreshold = () => {
            const rect = this.addToCartSection.getBoundingClientRect();
            this.threshold = rect.bottom + window.pageYOffset;
        };

        updateThreshold();
        window.addEventListener('resize', updateThreshold);

        // Scroll handler
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollPosition = window.pageYOffset + window.innerHeight;

                    if (scrollPosition < this.threshold && !this.isVisible) {
                        this.show();
                    } else if (scrollPosition >= this.threshold && this.isVisible) {
                        this.hide();
                    }

                    ticking = false;
                });

                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state
    }

    show() {
        this.stickyBar.classList.add('visible');
        this.isVisible = true;
    }

    hide() {
        this.stickyBar.classList.remove('visible');
        this.isVisible = false;
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on product detail pages
    if (document.querySelector('.product-options, .add-to-cart-section, .product-actions')) {
        new StickyCartBar();
    }
});
