// ========================================
// AURA CLARA - Product Page Cart Script
// ========================================

// Shopping Cart Storage
let cart = JSON.parse(localStorage.getItem('auraClara_cart')) || [];

// Add to Cart Function
function addToCart(productId, price, name, image) {
    const shopifyVariantId = window.shopifyProductMap?.[productId] || null;
    const existingItem = cart.find(item => item.count === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            count: productId,
            price: price,
            name: name,
            image: image,
            quantity: 1,
            shopifyVariantId: shopifyVariantId
        });
    }

    localStorage.setItem('auraClara_cart', JSON.stringify(cart));
    updateCartCount();
    return cart;
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Initialize cart count
updateCartCount();

// Cart icon click - redirect to home page
document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.querySelector('.icon-link[href="#cart"]');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            // Redirect to home page with cart open
            window.location.href = '../index.html#cart';
        });
    }
});

// Change product image
function changeProductImage(thumb) {
    const mainImg = document.getElementById('main-product-img');
    if (mainImg) {
        mainImg.src = thumb.src;
        document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
    }
}

// Toggle FAQ
function toggleFaq(button) {
    const item = button.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) {
        item.classList.add('open');
    }
}

// Pricing option selection
document.addEventListener('DOMContentLoaded', () => {
    // Pricing option selection
    document.querySelectorAll('.pricing-option').forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                document.querySelectorAll('.pricing-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');

                // Update button price
                const price = this.querySelector('.price-current').textContent;
                document.querySelectorAll('.btn-add-to-cart, .btn-sticky-cart, .btn-cta-final').forEach(btn => {
                    if (btn.querySelector('span')) {
                        btn.querySelector('span').textContent = `Add to Cart - ${price}`;
                    } else {
                        btn.textContent = `Add to Cart - ${price}`;
                    }
                });
            }
        });
    });

    // Mobile sticky CTA visibility
    const stickyCta = document.querySelector('.mobile-sticky-cta');
    const heroSection = document.querySelector('.product-hero');

    if (stickyCta && heroSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stickyCta.classList.remove('visible');
                } else {
                    stickyCta.classList.add('visible');
                }
            });
        }, { threshold: 0 });

        observer.observe(heroSection);
    }
});
