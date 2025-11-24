// ========================================
// AURA CLARA - Main JavaScript
// ========================================

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

function closeMobileMenu() {
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    }
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking nav links
if (navLinks) {
    const navLinksItems = navLinks.querySelectorAll('a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active')) {
        if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    }
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#search' && href !== '#cart') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Newsletter Form Handler - Handled by newsletter.js

// Shopping Cart Storage
let cart = JSON.parse(localStorage.getItem('auraClara_cart')) || [];

// Stripe Product IDs (you'll replace these with your actual Stripe Price IDs)
const STRIPE_PRICES = {
    '36': 'price_xxx36patches', // Replace with your Stripe Price ID for 36 patches
    '72': 'price_xxx72patches'  // Replace with your Stripe Price ID for 72 patches
};

// Add to Cart Functionality
function addToCart(count, price, name, image) {
    // Get Shopify variant ID from product map
    const productSlug = typeof count === 'string' ? count : String(count);
    const shopifyVariantId = window.shopifyProductMap?.[productSlug] || null;

    // Check if item already in cart
    const existingItem = cart.find(item => item.count === count);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            count: count,
            price: price,
            name: name,
            image: image,
            quantity: 1,
            stripePriceId: STRIPE_PRICES[count],
            shopifyVariantId: shopifyVariantId // Add Shopify variant ID
        });
    }

    // Save to localStorage
    localStorage.setItem('auraClara_cart', JSON.stringify(cart));

    // Update cart count in UI
    updateCartCount();

    // Sync to Supabase if user is logged in
    if (window.cartSync) {
        window.cartSync.syncCart();
    }

    return cart;
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update aria-label for accessibility
        const cartLink = cartCount.closest('.icon-link');
        cartLink.setAttribute('aria-label', `Shopping cart with ${totalItems} items`);
    }
}

// Make updateCartCount available globally for cart-sync.js
window.updateCartCount = updateCartCount;
window.cart = cart;

// Add to Cart Button Handler
const addToCartButtons = document.querySelectorAll('.btn-primary');
addToCartButtons.forEach(button => {
    if (button.textContent.includes('Add to Cart')) {
        button.addEventListener('click', () => {
            // Get current product details
            const patchSelect = document.getElementById('patch-count');
            const selectedOption = patchSelect.options[patchSelect.selectedIndex];
            const count = selectedOption.value;
            const price = selectedOption.getAttribute('data-price');
            const image = selectedOption.getAttribute('data-image');
            const name = `Clarity Patches (${count}ct)`;

            // Add to cart
            addToCart(count, price, name, image);

            // Visual feedback
            button.textContent = 'Added! ✨';
            setTimeout(() => {
                button.textContent = 'Add to Cart';
            }, 2000);
        });
    }
});

// Initialize cart count on load
updateCartCount();

// Cart Modal Functionality
const cartModal = document.getElementById('cartModal');
const cartIcon = document.querySelector('.icon-link[href="#cart"]');
const cartModalClose = document.querySelector('.cart-modal-close');
const cartModalOverlay = document.querySelector('.cart-modal-overlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartEmptyState = document.getElementById('cartEmpty');
const cartSubtotalElement = document.getElementById('cartSubtotal');

function openCartModal() {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartItems();
}

function closeCartModal() {
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartEmptyState.classList.add('show');
        cartSubtotalElement.textContent = '$0.00';
        return;
    }

    cartItemsContainer.style.display = 'flex';
    cartEmptyState.classList.remove('show');

    // Clear existing items
    cartItemsContainer.innerHTML = '';

    // Render each cart item
    cart.forEach((item, index) => {
        const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);

        // Ensure image path starts with / for absolute path from root
        let imagePath = item.image || 'assets/images/product-packaging.png';
        if (!imagePath.startsWith('/')) {
            imagePath = '/' + imagePath;
        }

        const cartItemHTML = `
            <div class="cart-item" data-index="${index}">
                <img src="${imagePath}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <div class="cart-item-price">$${itemTotal}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button class="qty-btn qty-decrease" data-index="${index}" aria-label="Decrease quantity">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn qty-increase" data-index="${index}" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">×</button>
                </div>
            </div>
        `;

        cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    });

    // Update subtotal
    updateCartSubtotal();

    // Add event listeners to quantity buttons and remove buttons
    document.querySelectorAll('.qty-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            cart[index].quantity += 1;
            localStorage.setItem('auraClara_cart', JSON.stringify(cart));
            renderCartItems();
            updateCartCount();
            // Sync to Supabase
            if (window.cartSync) window.cartSync.syncCart();
        });
    });

    document.querySelectorAll('.qty-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            localStorage.setItem('auraClara_cart', JSON.stringify(cart));
            renderCartItems();
            updateCartCount();
            // Sync to Supabase
            if (window.cartSync) window.cartSync.syncCart();
        });
    });

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            cart.splice(index, 1);
            localStorage.setItem('auraClara_cart', JSON.stringify(cart));
            renderCartItems();
            updateCartCount();
            // Sync to Supabase
            if (window.cartSync) window.cartSync.syncCart();
        });
    });
}

function updateCartSubtotal() {
    const subtotal = cart.reduce((total, item) => {
        return total + (parseFloat(item.price) * item.quantity);
    }, 0);
    cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
}

// Cart icon click event
if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openCartModal();
    });
}

// Close button click event
if (cartModalClose) {
    cartModalClose.addEventListener('click', closeCartModal);
}

// Overlay click event
if (cartModalOverlay) {
    cartModalOverlay.addEventListener('click', closeCartModal);
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartModal.classList.contains('active')) {
        closeCartModal();
    }
});

// Clear cart function
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        localStorage.setItem('auraClara_cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems();

        // Clear from Supabase if user is logged in
        if (window.cartSync) {
            window.cartSync.clearCart();
        }

        console.log('✨ Cart cleared');
    }
}

// Make clearCart available globally
window.clearCart = clearCart;

// Checkout button
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        try {
            // Debug: Check if Shopify client loaded
            console.log('Checking Shopify client...', {
                ShopifyClient: typeof window.ShopifyClient,
                shopifyProductMap: typeof window.shopifyProductMap,
                cart: cart
            });

            // Show loading state
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Creating checkout...';

            // Get current user email if logged in
            const user = await window.AuraClaraAuth?.getCurrentUser();
            const email = user?.email || null;

            // Create Shopify checkout
            if (window.ShopifyClient) {
                await window.ShopifyClient.checkoutFromCart(cart, email);
                // User will be redirected to Shopify checkout
            } else {
                console.error('Shopify client not found! Scripts may not have loaded.');
                throw new Error('Shopify client not loaded - please refresh the page');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            alert(`Error: ${error.message}\n\nPlease refresh the page and try again.`);
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Proceed to Checkout';
        }
    });
}

// Cart Upsell - Add Face Sculpting Tool
const addUpsellBtn = document.getElementById('addUpsellBtn');
if (addUpsellBtn) {
    addUpsellBtn.addEventListener('click', () => {
        // Add Face Sculpting Tool to cart
        addToCart('face-sculpting-tool', 52.99, 'Face Sculpting Tool', 'assets/images/face-sculpting-tool-box.png');

        // Visual feedback
        addUpsellBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Added!';
        addUpsellBtn.style.background = '#10B981';
        setTimeout(() => {
            addUpsellBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Add';
            addUpsellBtn.style.background = '';
        }, 2000);

        // Re-render cart to show new item
        renderCartItems();
    });
}

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.philosophy-item, .product-info, .product-image').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Navbar Background on Scroll
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Accessibility: Skip to Main Content
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.textContent = 'Skip to main content';
skipLink.className = 'skip-link';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--lavender-600);
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 10000;
`;
skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});
skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
});
document.body.insertBefore(skipLink, document.body.firstChild);

// Add main-content ID to first section
const firstSection = document.querySelector('.hero');
if (firstSection && !firstSection.id) {
    firstSection.id = 'main-content';
    firstSection.setAttribute('tabindex', '-1');
}

// Product Count Selector - Update Image and Price
const patchSelect = document.getElementById('patch-count');
const productImage = document.querySelector('.product-img');
const productPrice = document.getElementById('product-price');
const productCount = document.getElementById('product-count');

if (patchSelect) {
    patchSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const count = selectedOption.value;
        const price = selectedOption.getAttribute('data-price');
        const imageSrc = selectedOption.getAttribute('data-image');

        // Update image
        if (productImage && imageSrc) {
            productImage.src = imageSrc;
        }

        // Update price
        if (productPrice && price) {
            productPrice.textContent = `$${price}`;
        }

        // Update count
        if (productCount && count) {
            productCount.textContent = `${count} patches`;
        }
    });
}

// Hero Carousel
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const indicators = document.querySelectorAll('.indicator');

function showSlide(index) {
    // Remove active class from all slides
    slides.forEach(slide => slide.classList.remove('active'));

    // Only handle indicators if they exist
    if (indicators.length > 0) {
        indicators.forEach(ind => ind.classList.remove('active'));
    }

    // Add active class to current slide
    if (slides[index]) {
        slides[index].classList.add('active');
    }

    // Add active class to indicator if it exists
    if (indicators.length > 0 && indicators[index]) {
        indicators[index].classList.add('active');
    }

    currentSlide = index;
}

// Auto-rotate slides every 5 seconds
if (slides.length > 1) {
    let autoSlide = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);

    // Indicator click handlers (only if indicators exist)
    if (indicators.length > 0) {
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                clearInterval(autoSlide);
                showSlide(index);
                // Restart auto-rotation after 10 seconds
                setTimeout(() => {
                    autoSlide = setInterval(() => {
                        currentSlide = (currentSlide + 1) % slides.length;
                        showSlide(currentSlide);
                    }, 5000);
                }, 10000);
            });
        });
    }
}

// Jawline Shaper Image Gallery
function changeJawlineImage(thumbnail, imageSrc) {
    // Update main image
    const mainImg = document.getElementById('jawline-main-img');
    if (mainImg) {
        mainImg.src = imageSrc;
    }

    // Update active thumbnail
    const thumbnails = thumbnail.parentElement.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Neck Roller Image Gallery
function changeNeckImage(thumbnail, imageSrc) {
    // Update main image
    const mainImg = document.getElementById('neck-main-img');
    if (mainImg) {
        mainImg.src = imageSrc;
    }

    // Update active thumbnail
    const thumbnails = thumbnail.parentElement.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Bio-Collagen Image Gallery
function changeCollagenImage(thumbnail, imageSrc) {
    // Update main image
    const mainImg = document.getElementById('collagen-main-img');
    if (mainImg) {
        mainImg.src = imageSrc;
    }

    // Update active thumbnail
    const thumbnails = thumbnail.parentElement.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

// V-Line Mask Video/Image Gallery
function showVlineVideo(thumbnail) {
    const container = document.querySelector('#vline-mask .product-img-container');
    const video = document.getElementById('vline-main-video');

    // Show video
    if (container && video) {
        // Remove any image that might be there
        const img = container.querySelector('img');
        if (img) img.remove();

        // Show video
        video.style.display = 'block';
        video.play();
    }

    // Update active thumbnail
    const thumbnails = thumbnail.parentElement.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

function changeVlineImage(thumbnail, imageSrc) {
    const container = document.querySelector('#vline-mask .product-img-container');
    const video = document.getElementById('vline-main-video');

    if (container) {
        // Hide video
        if (video) {
            video.style.display = 'none';
            video.pause();
        }

        // Check if image exists, if not create it
        let img = container.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            img.className = 'product-img-main';
            img.id = 'vline-main-img';
            container.appendChild(img);
        }

        img.src = imageSrc;
        img.alt = 'V-Line Face Lifting Mask';
    }

    // Update active thumbnail
    const thumbnails = thumbnail.parentElement.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Hero Deals Carousel
const dealCards = document.querySelectorAll('.hero-deal-card');
const dealDots = document.querySelectorAll('.deal-dot');
const dealPrev = document.querySelector('.deal-prev');
const dealNext = document.querySelector('.deal-next');
let currentDeal = 0;
let dealAutoRotate;

// Product data for hero deals
const heroDealsProducts = {
    0: {
        id: 'face-sculpting-tool',
        name: 'Face Sculpting Tool',
        image: 'assets/images/face-sculpting-tool-box.png',
        prices: { one: 52.99, bundle: 105.98 }
    },
    1: {
        id: 'clarity-patches',
        name: 'Clarity Patches (36ct)',
        image: 'assets/images/product-packaging.png',
        prices: { one: 12.99, bundle: 25.98, subscribe: 10.39 }
    },
    2: {
        id: 'jawline-shaper',
        name: 'Jawline Shaper Set',
        image: 'assets/images/jawline-shaper.jpg',
        prices: { one: 12.99, bundle: 25.98 }
    },
    3: {
        id: 'vline-mask',
        name: 'V-Line Lifting Mask',
        image: 'assets/images/vline-mask-flat.jpg',
        prices: { one: 19.00, bundle: 38.00, subscribe: 15.20 }
    },
    4: {
        id: 'bio-collagen-mask',
        name: 'Bio-Collagen Mask (4pk)',
        image: 'assets/images/bio-collagen-aesthetic.jpg',
        prices: { one: 24.99, bundle: 49.98, subscribe: 19.99 }
    }
};

function showDeal(index) {
    // Wrap around
    if (index >= dealCards.length) index = 0;
    if (index < 0) index = dealCards.length - 1;

    // Update cards
    dealCards.forEach(card => card.classList.remove('active'));
    dealDots.forEach(dot => dot.classList.remove('active'));

    if (dealCards[index]) {
        dealCards[index].classList.add('active');
    }
    if (dealDots[index]) {
        dealDots[index].classList.add('active');
    }

    currentDeal = index;
}

function nextDeal() {
    showDeal(currentDeal + 1);
}

function prevDeal() {
    showDeal(currentDeal - 1);
}

function startDealAutoRotate() {
    dealAutoRotate = setInterval(nextDeal, 4000);
}

function resetDealAutoRotate() {
    clearInterval(dealAutoRotate);
    startDealAutoRotate();
}

// Initialize deals carousel if it exists
if (dealCards.length > 0) {
    // Auto-rotate every 4 seconds
    startDealAutoRotate();

    // Navigation buttons
    if (dealNext) {
        dealNext.addEventListener('click', () => {
            nextDeal();
            resetDealAutoRotate();
        });
    }

    if (dealPrev) {
        dealPrev.addEventListener('click', () => {
            prevDeal();
            resetDealAutoRotate();
        });
    }

    // Dot navigation
    dealDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showDeal(index);
            resetDealAutoRotate();
        });
    });

    // Pause auto-rotate on hover
    const carousel = document.querySelector('.hero-deals-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            clearInterval(dealAutoRotate);
        });
        carousel.addEventListener('mouseleave', () => {
            startDealAutoRotate();
        });
    }

    // Add to cart functionality for deal cards
    dealCards.forEach((card, dealIndex) => {
        const addToCartBtn = card.querySelector('.btn-deal-cart');
        const radioInputs = card.querySelectorAll('input[type="radio"]');

        // Update button text when option changes
        radioInputs.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const selectedOption = e.target.value;
                const productData = heroDealsProducts[dealIndex];
                const price = productData.prices[selectedOption];
                addToCartBtn.textContent = `Add to Cart - $${price.toFixed(2)}`;
            });
        });

        // Add to cart click handler
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const selectedRadio = card.querySelector('input[type="radio"]:checked');
                const selectedOption = selectedRadio ? selectedRadio.value : 'one';
                const productData = heroDealsProducts[dealIndex];
                const price = productData.prices[selectedOption];

                // Determine product name based on option
                let productName = productData.name;
                if (selectedOption === 'bundle') {
                    productName += ' (Buy 2 Get 1 FREE)';
                } else if (selectedOption === 'subscribe') {
                    productName += ' (Subscribe & Save)';
                }

                // Add to cart with product ID
                addToCart(productData.id, price, productName, productData.image);

                // Visual feedback
                const originalText = addToCartBtn.textContent;
                addToCartBtn.textContent = 'Added! ✨';
                addToCartBtn.style.background = '#10B981';
                setTimeout(() => {
                    addToCartBtn.textContent = originalText;
                    addToCartBtn.style.background = '';
                }, 2000);
            });
        }
    });
}

// Homepage Product Grid - Add to Cart
document.querySelectorAll('.ios-add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest('.ios-product-card');
        const productId = card.dataset.productId;
        const productName = card.dataset.productName;
        const productPrice = parseFloat(card.dataset.productPrice);
        const productImage = card.dataset.productImage;

        // Add to cart
        addToCart(productId, productPrice, productName, productImage);

        // Visual feedback
        btn.textContent = 'Added! ✨';
        btn.style.background = '#10B981';
        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.style.background = '';
        }, 2000);
    });
});

// ========================================
// Category Filtering
// ========================================
document.querySelectorAll('.category-circle').forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const category = card.dataset.category;

        // Scroll to products section
        const productsSection = document.getElementById('shop');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Filter products
        setTimeout(() => {
            filterProductsByCategory(category);
        }, 500);
    });
});

function filterProductsByCategory(category) {
    const productCards = document.querySelectorAll('.ios-product-card');
    const sectionTitle = document.querySelector('.home-products-grid .section-title');

    // Update section title
    if (sectionTitle) {
        const categoryNames = {
            'patches': 'Patches',
            'tools': 'Tools',
            'masks': 'Masks'
        };
        sectionTitle.textContent = `Shop ${categoryNames[category]}`;
    }

    // Filter products
    productCards.forEach(card => {
        const productCategories = card.dataset.category.toLowerCase();

        if (productCategories.includes(category.toLowerCase())) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });

    // Add "Show All" button if not already present
    addShowAllButton();
}

function addShowAllButton() {
    const productsSection = document.querySelector('.home-products-grid .container');
    let showAllBtn = document.getElementById('showAllProductsBtn');

    if (!showAllBtn && productsSection) {
        showAllBtn = document.createElement('button');
        showAllBtn.id = 'showAllProductsBtn';
        showAllBtn.className = 'btn btn-secondary';
        showAllBtn.textContent = 'Show All Products';
        showAllBtn.style.cssText = 'display: block; margin: 2rem auto 0; padding: 0.75rem 2rem;';

        showAllBtn.addEventListener('click', () => {
            showAllProducts();
        });

        productsSection.appendChild(showAllBtn);
    }
}

function showAllProducts() {
    const productCards = document.querySelectorAll('.ios-product-card');
    const sectionTitle = document.querySelector('.home-products-grid .section-title');
    const showAllBtn = document.getElementById('showAllProductsBtn');

    // Reset section title
    if (sectionTitle) {
        sectionTitle.textContent = 'Shop All Products';
    }

    // Show all products
    productCards.forEach(card => {
        card.style.display = 'flex';
    });

    // Remove show all button
    if (showAllBtn) {
        showAllBtn.remove();
    }
}

// ========================================
// Make Product Cards Clickable
// ========================================
document.querySelectorAll('.ios-product-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
        // Don't navigate if clicking the Add to Cart button
        if (e.target.closest('.ios-add-to-cart-btn')) {
            return;
        }

        // Get the product link from inside the card
        const productLink = this.querySelector('.ios-product-info a');
        if (productLink) {
            window.location.href = productLink.href;
        }
    });
});

console.log('✨ Aura Clara website loaded successfully');
