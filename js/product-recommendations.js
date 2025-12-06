// ========================================
// AURA CLARA - Product Recommendations Carousel
// ========================================

const recommendedProducts = {
    'bio-collagen-mask': [
        {
            id: 'vline-mask',
            name: 'V-Line Lifting Mask',
            price: 19.00,
            image: '../assets/images/vline-mask-flat.jpg',
            url: 'vline-lifting-mask.html',
            badge: 'Popular'
        },
        {
            id: 'clarity-patches',
            name: 'Clarity Patches (36ct)',
            price: 12.99,
            image: '../assets/images/product-packaging.png',
            url: 'clarity-patches.html',
            badge: 'Bestseller'
        },
        {
            id: 'face-sculpting-tool',
            name: 'Face Sculpting Tool',
            price: 52.99,
            image: '../assets/images/face-sculpting-tool-box.png',
            url: 'neck-face-sculpting-tool.html',
            badge: 'Popular'
        }
    ],
    'face-sculpting-tool': [
        {
            id: 'jawline-shaper',
            name: 'Jawline Shaper Set',
            price: 12.99,
            image: '../assets/images/jawline-shaper.jpg',
            url: 'jawline-shaper.html',
            badge: 'New'
        },
        {
            id: 'bio-collagen-mask',
            name: 'Bio-Collagen Mask (4pk)',
            price: 24.99,
            image: '../assets/images/bio-collagen-aesthetic.jpg',
            url: 'bio-collagen-mask.html',
            badge: 'New'
        },
        {
            id: 'vline-mask',
            name: 'V-Line Lifting Mask',
            price: 19.00,
            image: '../assets/images/vline-mask-flat.jpg',
            url: 'vline-lifting-mask.html',
            badge: 'Popular'
        }
    ],
    'jawline-shaper': [
        {
            id: 'face-sculpting-tool',
            name: 'Face Sculpting Tool',
            price: 52.99,
            image: '../assets/images/face-sculpting-tool-box.png',
            url: 'neck-face-sculpting-tool.html',
            badge: 'Popular'
        },
        {
            id: 'vline-mask',
            name: 'V-Line Lifting Mask',
            price: 19.00,
            image: '../assets/images/vline-mask-flat.jpg',
            url: 'vline-lifting-mask.html',
            badge: 'Popular'
        },
        {
            id: 'bio-collagen-mask',
            name: 'Bio-Collagen Mask (4pk)',
            price: 24.99,
            image: '../assets/images/bio-collagen-aesthetic.jpg',
            url: 'bio-collagen-mask.html',
            badge: 'New'
        }
    ],
    'vline-mask': [
        {
            id: 'bio-collagen-mask',
            name: 'Bio-Collagen Mask (4pk)',
            price: 24.99,
            image: '../assets/images/bio-collagen-aesthetic.jpg',
            url: 'bio-collagen-mask.html',
            badge: 'New'
        },
        {
            id: 'face-sculpting-tool',
            name: 'Face Sculpting Tool',
            price: 52.99,
            image: '../assets/images/face-sculpting-tool-box.png',
            url: 'neck-face-sculpting-tool.html',
            badge: 'Popular'
        },
        {
            id: 'clarity-patches',
            name: 'Clarity Patches (36ct)',
            price: 12.99,
            image: '../assets/images/product-packaging.png',
            url: 'clarity-patches.html',
            badge: 'Bestseller'
        }
    ],
    'clarity-patches': [
        {
            id: 'bio-collagen-mask',
            name: 'Bio-Collagen Mask (4pk)',
            price: 24.99,
            image: '../assets/images/bio-collagen-aesthetic.jpg',
            url: 'bio-collagen-mask.html',
            badge: 'New'
        },
        {
            id: 'vline-mask',
            name: 'V-Line Lifting Mask',
            price: 19.00,
            image: '../assets/images/vline-mask-flat.jpg',
            url: 'vline-lifting-mask.html',
            badge: 'Popular'
        },
        {
            id: 'face-sculpting-tool',
            name: 'Face Sculpting Tool',
            price: 52.99,
            image: '../assets/images/face-sculpting-tool-box.png',
            url: 'neck-face-sculpting-tool.html',
            badge: 'Popular'
        }
    ]
};

function initRecommendedProducts(currentProductId) {
    const container = document.getElementById('recommended-products-carousel');
    if (!container) return;

    const products = recommendedProducts[currentProductId];
    if (!products) return;

    let currentIndex = 0;

    // Build carousel HTML
    const carouselHTML = `
        <div class="recommended-track">
            ${products.map((product, index) => `
                <div class="recommended-card ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <a href="${product.url}" class="recommended-link">
                        <div class="recommended-image">
                            <img src="${product.image}" alt="${product.name}">
                            <span class="recommended-badge">${product.badge}</span>
                        </div>
                        <div class="recommended-info">
                            <h4 class="recommended-name">${product.name}</h4>
                            <p class="recommended-price">$${product.price.toFixed(2)}</p>
                        </div>
                    </a>
                    <button class="btn-recommended-cart" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}" data-product-image="${product.image}">
                        Add to Cart
                    </button>
                </div>
            `).join('')}
        </div>
        <div class="recommended-nav">
            <button class="recommended-prev" aria-label="Previous product">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
            </button>
            <div class="recommended-dots">
                ${products.map((_, index) => `
                    <span class="recommended-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
                `).join('')}
            </div>
            <button class="recommended-next" aria-label="Next product">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </button>
        </div>
    `;

    container.innerHTML = carouselHTML;

    // Carousel navigation
    const cards = container.querySelectorAll('.recommended-card');
    const dots = container.querySelectorAll('.recommended-dot');
    const prevBtn = container.querySelector('.recommended-prev');
    const nextBtn = container.querySelector('.recommended-next');

    function showCard(index) {
        if (index >= products.length) index = 0;
        if (index < 0) index = products.length - 1;

        cards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        if (cards[index]) cards[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');

        currentIndex = index;
    }

    prevBtn.addEventListener('click', () => showCard(currentIndex - 1));
    nextBtn.addEventListener('click', () => showCard(currentIndex + 1));

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showCard(index));
    });

    // Add to cart functionality
    container.querySelectorAll('.btn-recommended-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const productId = btn.dataset.productId;
            const productName = btn.dataset.productName;
            const productPrice = parseFloat(btn.dataset.productPrice);
            const productImage = btn.dataset.productImage;

            if (typeof addToCart === 'function') {
                addToCart(productId, productPrice, productName, productImage);

                btn.textContent = 'Added! ✨';
                btn.style.background = '#10B981';
                setTimeout(() => {
                    btn.textContent = 'Add to Cart';
                    btn.style.background = '';
                }, 2000);
            }
        });
    });

    // Auto-rotate every 5 seconds
    setInterval(() => showCard(currentIndex + 1), 5000);
}

// Export for use in product pages
window.initRecommendedProducts = initRecommendedProducts;
