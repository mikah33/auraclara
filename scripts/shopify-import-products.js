/**
 * Shopify Product Import Script
 * Automatically creates all Aura Clara products in Shopify
 *
 * Usage: node scripts/shopify-import-products.js
 */

const products = [
    {
        title: "Clarity Patches (36ct)",
        body_html: "Hydrocolloid treatment patches that absorb impurities overnight. Wake up to clearer, calmer skin. 36 patches per pack.",
        vendor: "Aura Clara",
        product_type: "Patches",
        tags: ["patches", "acne", "hydrocolloid", "bestseller"],
        variants: [
            {
                option1: "Default",
                price: "12.99",
                compare_at_price: "19.99",
                sku: "CLARITY-36",
                inventory_management: "shopify",
                inventory_quantity: 0
            }
        ],
        images: [
            {
                src: "https://www.auraclara.store/assets/images/product-packaging.png",
                alt: "Clarity Patches 36ct package"
            }
        ]
    },
    {
        title: "Face Sculpting Tool",
        body_html: "LED therapy tool with red light at 630nm. Boosts collagen production and reduces fine lines in just 2 weeks. Professional at-home treatment.",
        vendor: "Aura Clara",
        product_type: "Tools",
        tags: ["tools", "led-therapy", "anti-aging", "bestseller", "popular"],
        variants: [
            {
                option1: "Default",
                price: "52.99",
                compare_at_price: "79.99",
                sku: "SCULPT-LED",
                inventory_management: "shopify",
                inventory_quantity: 0
            }
        ],
        images: [
            {
                src: "https://www.auraclara.store/assets/images/face-sculpting-tool-box.png",
                alt: "Face Sculpting Tool with LED therapy"
            }
        ]
    },
    {
        title: "Jawline Shaper Set",
        body_html: "Gua sha massage tool that increases lymphatic drainage by 30%. Sculpts jawline and reduces morning puffiness. Complete set with rose quartz stone.",
        vendor: "Aura Clara",
        product_type: "Tools",
        tags: ["tools", "gua-sha", "sculpting", "new"],
        variants: [
            {
                option1: "Default",
                price: "12.99",
                compare_at_price: "24.99",
                sku: "JAWLINE-SHAPER",
                inventory_management: "shopify",
                inventory_quantity: 0
            }
        ],
        images: [
            {
                src: "https://www.auraclara.store/assets/images/jawline-shaper.jpg",
                alt: "Jawline Shaper Set with gua sha tool"
            }
        ]
    },
    {
        title: "V-Line Lifting Mask",
        body_html: "Compression technology with firming serum creates visible V-line contouring in just 30 minutes. Perfect for special events and photo-ready skin.",
        vendor: "Aura Clara",
        product_type: "Masks",
        tags: ["masks", "contouring", "v-line", "new"],
        variants: [
            {
                option1: "Default",
                price: "19.00",
                compare_at_price: "29.99",
                sku: "VLINE-MASK",
                inventory_management: "shopify",
                inventory_quantity: 0
            }
        ],
        images: [
            {
                src: "https://www.auraclara.store/assets/images/vline-mask-flat.jpg",
                alt: "V-Line Lifting Mask"
            }
        ]
    },
    {
        title: "Bio-Collagen Mask (4pk)",
        body_html: "Hydrolyzed collagen mask that penetrates deep to boost skin elasticity and hydration by 28% per use. 4 premium masks per box.",
        vendor: "Aura Clara",
        product_type: "Masks",
        tags: ["masks", "collagen", "hydration", "new"],
        variants: [
            {
                option1: "Default",
                price: "24.99",
                compare_at_price: "39.99",
                sku: "COLLAGEN-4PK",
                inventory_management: "shopify",
                inventory_quantity: 0
            }
        ],
        images: [
            {
                src: "https://www.auraclara.store/assets/images/bio-collagen-aesthetic.jpg",
                alt: "Bio-Collagen Mask 4-pack"
            }
        ]
    }
];

// Shopify Admin API configuration
const SHOP_DOMAIN = 'xq0qhk-h0.myshopify.com';
const ADMIN_API_ACCESS_TOKEN = '4fe996cad412e22ffade4ff780443d8b'; // Your API key
const API_VERSION = '2024-10';

async function createProduct(product) {
    const url = `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/products.json`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': ADMIN_API_ACCESS_TOKEN
            },
            body: JSON.stringify({ product })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ Error creating ${product.title}:`, data.errors);
            return null;
        }

        console.log(`✅ Created: ${product.title}`);
        console.log(`   Product ID: ${data.product.id}`);
        console.log(`   Variant ID: ${data.product.variants[0].id}`);
        return data.product;
    } catch (error) {
        console.error(`❌ Failed to create ${product.title}:`, error);
        return null;
    }
}

async function importAllProducts() {
    console.log('🚀 Starting Shopify product import...\n');

    const results = [];

    for (const product of products) {
        const createdProduct = await createProduct(product);
        if (createdProduct) {
            results.push({
                title: createdProduct.title,
                productId: createdProduct.id,
                variantId: createdProduct.variants[0].id,
                price: createdProduct.variants[0].price
            });
        }
        // Wait 1 second between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✨ Import complete!\n');
    console.log('📋 Product IDs for your reference:\n');
    console.table(results);

    console.log('\n📝 Copy these variant IDs to map your products:');
    results.forEach(product => {
        const slug = product.title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[()]/g, '')
            .replace(/--/g, '-');
        console.log(`'${slug}': 'gid://shopify/ProductVariant/${product.variantId}',`);
    });
}

// Run the import
importAllProducts();
