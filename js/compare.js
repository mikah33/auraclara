// Product Comparison Tool JavaScript

// Product data
const productData = {
    'clarity-patches': {
        name: 'Clarity Patches',
        price: '$12.99',
        image: '../assets/images/product-packaging.png',
        bestFor: 'Overnight acne treatment',
        skinTypes: 'All skin types',
        ingredients: 'Medical-grade hydrocolloid',
        timeline: '6-8 hours',
        frequency: 'As needed'
    },
    'face-tool': {
        name: 'Face Sculpting Tool',
        price: '$52.99',
        image: '../assets/images/face-sculpting-tool-box.png',
        bestFor: 'Anti-aging, collagen boost',
        skinTypes: 'All skin types',
        ingredients: 'Red light therapy (630nm)',
        timeline: '2 weeks',
        frequency: 'Daily (10 min)'
    },
    'jawline-shaper': {
        name: 'Jawline Shaper',
        price: '$12.99',
        image: '../assets/images/jawline-shaper.jpg',
        bestFor: 'Facial contouring, lymphatic drainage',
        skinTypes: 'All skin types',
        ingredients: 'Rose quartz, stainless steel',
        timeline: 'Immediate + long-term',
        frequency: '2-3 times/week'
    },
    'vline-mask': {
        name: 'V-Line Lifting Mask',
        price: '$19.00',
        image: '../assets/images/vline-mask-flat.jpg',
        bestFor: 'Jawline contouring, depuffing',
        skinTypes: 'All skin types',
        ingredients: 'Firming serum, caffeine, peptides',
        timeline: '30 minutes',
        frequency: '2-3 times/week'
    },
    'bio-collagen': {
        name: 'Bio-Collagen Mask',
        price: '$24.99',
        image: '../assets/images/bio-collagen-aesthetic.jpg',
        bestFor: 'Deep hydration, anti-aging',
        skinTypes: 'All skin types, esp. dry',
        ingredients: 'Hydrolyzed collagen, hyaluronic acid',
        timeline: '20 minutes',
        frequency: '1-2 times/week'
    }
};

// State management
let selectedProducts = {
    1: null,
    2: null,
    3: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdowns();
    initializeCompareButton();
    initializeRemoveButtons();
});

// Initialize dropdowns
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.product-dropdown');

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', (e) => {
            const slot = e.target.getAttribute('data-slot');
            const productId = e.target.value;

            if (productId) {
                selectProduct(slot, productId);
            } else {
                clearSlot(slot);
            }

            updateCompareButton();
        });
    });
}

// Select a product
function selectProduct(slot, productId) {
    const product = productData[productId];
    if (!product) return;

    selectedProducts[slot] = { id: productId, ...product };

    // Get the slot element
    const slotElement = document.querySelector(`.selector-slot[data-slot="${slot}"]`);

    // Update preview
    slotElement.classList.add('filled');
    slotElement.querySelector('.preview-image').src = product.image;
    slotElement.querySelector('.preview-name').textContent = product.name;
    slotElement.querySelector('.preview-price').textContent = product.price;
}

// Clear a slot
function clearSlot(slot) {
    selectedProducts[slot] = null;

    const slotElement = document.querySelector(`.selector-slot[data-slot="${slot}"]`);
    slotElement.classList.remove('filled');

    // Reset dropdown
    const dropdown = slotElement.querySelector('.product-dropdown');
    dropdown.value = '';
}

// Initialize remove buttons
function initializeRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-product');

    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const slot = e.target.closest('.selector-slot').getAttribute('data-slot');
            clearSlot(slot);
            updateCompareButton();
        });
    });
}

// Update compare button state
function updateCompareButton() {
    const compareBtn = document.getElementById('compareBtn');
    const selectedCount = Object.values(selectedProducts).filter(p => p !== null).length;

    if (selectedCount >= 2) {
        compareBtn.classList.add('active');
        compareBtn.disabled = false;
    } else {
        compareBtn.classList.remove('active');
        compareBtn.disabled = true;
    }
}

// Initialize compare button
function initializeCompareButton() {
    const compareBtn = document.getElementById('compareBtn');

    compareBtn.addEventListener('click', () => {
        if (compareBtn.classList.contains('active')) {
            generateComparison();

            // Scroll to comparison table
            const tableSection = document.getElementById('comparisonTable');
            tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// Generate comparison table
function generateComparison() {
    const tableSection = document.getElementById('comparisonTable');
    tableSection.classList.add('visible');

    // Update headers
    for (let i = 1; i <= 3; i++) {
        const product = selectedProducts[i];
        const headerCell = document.getElementById(`header${i}`);

        if (product) {
            headerCell.textContent = product.name;
            headerCell.style.display = 'flex';
        } else {
            headerCell.style.display = 'none';
        }
    }

    // Update data rows
    const fields = ['price', 'bestfor', 'skintypes', 'ingredients', 'timeline', 'frequency'];

    fields.forEach(field => {
        for (let i = 1; i <= 3; i++) {
            const product = selectedProducts[i];
            const cell = document.getElementById(`${field}${i}`);

            if (product) {
                const fieldName = field === 'bestfor' ? 'bestFor' :
                                field === 'skintypes' ? 'skinTypes' : field;
                cell.textContent = product[fieldName] || '-';
                cell.style.display = 'flex';
            } else {
                cell.style.display = 'none';
            }
        }
    });

    // Hide empty columns in table rows
    const tableRows = document.querySelectorAll('.table-row');
    tableRows.forEach(row => {
        const cells = row.querySelectorAll('.table-cell:not(.table-label)');
        const visibleCount = Array.from(cells).filter(cell =>
            window.getComputedStyle(cell).display !== 'none'
        ).length;

        if (visibleCount === 2) {
            row.style.gridTemplateColumns = '200px 1fr 1fr';
        } else if (visibleCount === 3) {
            row.style.gridTemplateColumns = '200px repeat(3, 1fr)';
        }
    });
}
