/**
 * Get Shopify Product Variant IDs
 */

const SHOP_DOMAIN = 'xq0qhk-h0.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = 'ab3dcd93643c1f542ab72cbf500df85a';
const API_VERSION = '2024-10';

const productIds = [
    { name: 'Bio-Collagen Mask', shopifyId: '7716169678899' },
    { name: 'V-Line Lifting Mask', shopifyId: '7716169580595' },
    { name: 'Jawline Shaper', shopifyId: '7716169547827' },
    { name: 'Face Sculpting Tool', shopifyId: '7716169515059' },
    { name: 'Clarity Patches', shopifyId: '7716169449523' }
];

async function getVariantId(product) {
    const query = `
        query getProduct($id: ID!) {
            product(id: $id) {
                id
                title
                variants(first: 1) {
                    edges {
                        node {
                            id
                            price {
                                amount
                            }
                        }
                    }
                }
            }
        }
    `;

    const shopifyGid = `gid://shopify/Product/${product.shopifyId}`;

    try {
        const response = await fetch(
            `https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
                },
                body: JSON.stringify({
                    query: query,
                    variables: { id: shopifyGid }
                })
            }
        );

        const result = await response.json();

        if (result.errors) {
            console.error(`❌ Error fetching ${product.name}:`, result.errors);
            return null;
        }

        const variantId = result.data.product.variants.edges[0].node.id;
        const price = result.data.product.variants.edges[0].node.price.amount;

        return {
            name: product.name,
            productId: product.shopifyId,
            variantId: variantId,
            price: price
        };
    } catch (error) {
        console.error(`❌ Failed to fetch ${product.name}:`, error.message);
        return null;
    }
}

async function getAllVariants() {
    console.log('🔍 Fetching Shopify variant IDs...\n');

    const results = [];

    for (const product of productIds) {
        const result = await getVariantId(product);
        if (result) {
            results.push(result);
            console.log(`✅ ${result.name}: ${result.variantId} ($${result.price})`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n📋 Product Mapping for your site:\n');
    console.log('Add this to js/shopify-product-map.js:\n');
    console.log('window.shopifyProductMap = {');
    results.forEach(r => {
        const slug = r.name
            .toLowerCase()
            .replace(/[()]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--/g, '-');
        console.log(`    '${slug}': '${r.variantId}',`);
    });
    console.log('};\n');
}

getAllVariants();
