// ========================================
// AURA CLARA - Shopify Integration
// ========================================

class ShopifyClient {
    constructor() {
        this.shopDomain = 'xq0qhk-h0.myshopify.com';
        this.storefrontAccessToken = 'ab3dcd93643c1f542ab72cbf500df85a';
        this.apiVersion = '2024-10';
        this.endpoint = `https://${this.shopDomain}/api/${this.apiVersion}/graphql.json`;
    }

    // Make GraphQL request to Shopify
    async query(graphqlQuery, variables = {}) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken
                },
                body: JSON.stringify({
                    query: graphqlQuery,
                    variables: variables
                })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('Shopify GraphQL errors:', result.errors);
                throw new Error(result.errors[0].message);
            }

            return result.data;
        } catch (error) {
            console.error('Shopify API error:', error);
            throw error;
        }
    }

    // Get all products
    async getProducts(limit = 50) {
        const query = `
            query getProducts($limit: Int!) {
                products(first: $limit) {
                    edges {
                        node {
                            id
                            title
                            description
                            handle
                            images(first: 5) {
                                edges {
                                    node {
                                        url
                                        altText
                                    }
                                }
                            }
                            priceRange {
                                minVariantPrice {
                                    amount
                                    currencyCode
                                }
                            }
                            variants(first: 10) {
                                edges {
                                    node {
                                        id
                                        title
                                        price {
                                            amount
                                            currencyCode
                                        }
                                        availableForSale
                                        quantityAvailable
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const data = await this.query(query, { limit });
        return data.products.edges.map(edge => edge.node);
    }

    // Get single product by handle
    async getProductByHandle(handle) {
        const query = `
            query getProduct($handle: String!) {
                productByHandle(handle: $handle) {
                    id
                    title
                    description
                    handle
                    images(first: 5) {
                        edges {
                            node {
                                url
                                altText
                            }
                        }
                    }
                    priceRange {
                        minVariantPrice {
                            amount
                            currencyCode
                        }
                    }
                    variants(first: 10) {
                        edges {
                            node {
                                id
                                title
                                price {
                                    amount
                                    currencyCode
                                }
                                availableForSale
                                quantityAvailable
                            }
                        }
                    }
                }
            }
        `;

        const data = await this.query(query, { handle });
        return data.productByHandle;
    }

    // Create checkout
    async createCheckout(lineItems, customerEmail = null) {
        const query = `
            mutation checkoutCreate($input: CheckoutCreateInput!) {
                checkoutCreate(input: $input) {
                    checkout {
                        id
                        webUrl
                        lineItems(first: 50) {
                            edges {
                                node {
                                    title
                                    quantity
                                }
                            }
                        }
                        subtotalPrice {
                            amount
                            currencyCode
                        }
                        totalPrice {
                            amount
                            currencyCode
                        }
                    }
                    checkoutUserErrors {
                        code
                        field
                        message
                    }
                }
            }
        `;

        const input = {
            lineItems: lineItems
        };

        if (customerEmail) {
            input.email = customerEmail;
        }

        const data = await this.query(query, { input });

        if (data.checkoutCreate.checkoutUserErrors.length > 0) {
            throw new Error(data.checkoutCreate.checkoutUserErrors[0].message);
        }

        return data.checkoutCreate.checkout;
    }

    // Convert cart items to Shopify line items format
    cartToLineItems(cart) {
        return cart.map(item => {
            // Get variant ID from item or product map
            let variantId = item.shopifyVariantId;

            // If not in item, try to get from product map
            if (!variantId && window.shopifyProductMap) {
                const productSlug = typeof item.count === 'string' ? item.count : String(item.count);
                variantId = window.shopifyProductMap[productSlug];
            }

            if (!variantId) {
                console.error('Missing Shopify variant ID for item:', item);
                throw new Error(`Product "${item.name}" is not mapped to Shopify`);
            }

            return {
                variantId: variantId,
                quantity: item.quantity
            };
        });
    }

    // Redirect to Shopify checkout
    async checkoutFromCart(cart, customerEmail = null) {
        try {
            const lineItems = this.cartToLineItems(cart);
            const checkout = await this.createCheckout(lineItems, customerEmail);

            // Redirect to Shopify checkout
            window.location.href = checkout.webUrl;

            return checkout;
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    }

    // Get checkout by ID
    async getCheckout(checkoutId) {
        const query = `
            query getCheckout($id: ID!) {
                node(id: $id) {
                    ... on Checkout {
                        id
                        webUrl
                        completedAt
                        lineItems(first: 50) {
                            edges {
                                node {
                                    title
                                    quantity
                                }
                            }
                        }
                        subtotalPrice {
                            amount
                            currencyCode
                        }
                        totalPrice {
                            amount
                            currencyCode
                        }
                    }
                }
            }
        `;

        const data = await this.query(query, { id: checkoutId });
        return data.node;
    }
}

// Initialize Shopify client
window.ShopifyClient = new ShopifyClient();
console.log('✨ Shopify client initialized');
