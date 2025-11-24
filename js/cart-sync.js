// ========================================
// AURA CLARA - Cart Sync with Supabase
// ========================================

class CartSync {
    constructor() {
        this.supabase = window.AuraClaraAuth?.supabase;
        this.localStorageKey = 'auraClara_cart';
        this.syncInProgress = false;

        if (!this.supabase) {
            console.error('Supabase client not initialized. Cart sync disabled.');
            return;
        }

        this.init();
    }

    async init() {
        // Listen for auth state changes
        if (window.AuraClaraAuth) {
            window.AuraClaraAuth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN') {
                    await this.onUserSignIn(session.user);
                } else if (event === 'SIGNED_OUT') {
                    this.onUserSignOut();
                }
            });

            // Check if user is already logged in
            const user = await window.AuraClaraAuth.getCurrentUser();
            if (user) {
                await this.loadCartFromDatabase(user.id);
            }
        }
    }

    // Get cart from localStorage
    getLocalCart() {
        try {
            return JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
        } catch (error) {
            console.error('Error reading local cart:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveLocalCart(cart) {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(cart));

            // Update cart count in UI
            if (window.updateCartCount) {
                window.cart = cart;
                window.updateCartCount();
            }
        } catch (error) {
            console.error('Error saving local cart:', error);
        }
    }

    // Load cart from database
    async loadCartFromDatabase(userId) {
        if (this.syncInProgress) return;
        this.syncInProgress = true;

        try {
            const { data, error } = await this.supabase
                .from('carts')
                .select('cart_data')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No cart found in database, sync local cart
                    console.log('No cart in database, will sync local cart');
                    await this.syncCartToDatabase(userId);
                } else {
                    console.error('Error loading cart from database:', error);
                }
                return;
            }

            if (data?.cart_data) {
                // Merge with local cart
                const localCart = this.getLocalCart();
                const mergedCart = this.mergeCarts(localCart, data.cart_data);

                // Save merged cart locally and to database
                this.saveLocalCart(mergedCart);
                await this.syncCartToDatabase(userId, mergedCart);

                console.log('✨ Cart loaded from database and synced');
            }
        } catch (error) {
            console.error('Error in loadCartFromDatabase:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // Sync cart to database
    async syncCartToDatabase(userId, cart = null) {
        if (this.syncInProgress) return;
        if (!userId) return;

        const cartData = cart || this.getLocalCart();

        try {
            // Try to update existing cart first
            const { data: existing, error: fetchError } = await this.supabase
                .from('carts')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (existing) {
                // Update existing cart
                const { error } = await this.supabase
                    .from('carts')
                    .update({
                        cart_data: cartData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);

                if (error) {
                    console.error('Error updating cart in database:', error);
                } else {
                    console.log('✅ Cart synced to database (updated)');
                }
            } else {
                // Insert new cart
                const { error } = await this.supabase
                    .from('carts')
                    .insert({
                        user_id: userId,
                        cart_data: cartData
                    });

                if (error) {
                    console.error('Error inserting cart to database:', error);
                } else {
                    console.log('✅ Cart synced to database (inserted)');
                }
            }
        } catch (error) {
            console.error('Error in syncCartToDatabase:', error);
        }
    }

    // Merge local and database carts
    mergeCarts(localCart, dbCart) {
        const merged = [...dbCart];

        // Add items from local cart that aren't in database cart
        localCart.forEach(localItem => {
            const existingIndex = merged.findIndex(item =>
                item.count === localItem.count && item.name === localItem.name
            );

            if (existingIndex >= 0) {
                // Item exists, add quantities
                merged[existingIndex].quantity += localItem.quantity;
            } else {
                // New item, add to merged cart
                merged.push(localItem);
            }
        });

        return merged;
    }

    // Handle user sign in
    async onUserSignIn(user) {
        console.log('User signed in, syncing cart...');
        await this.loadCartFromDatabase(user.id);
    }

    // Handle user sign out
    onUserSignOut() {
        console.log('User signed out');
        // Keep local cart on logout (user might want to checkout as guest)
        // If you want to clear cart on logout, uncomment:
        // this.saveLocalCart([]);
    }

    // Public method to sync cart (call this when cart changes)
    async syncCart() {
        const user = await window.AuraClaraAuth?.getCurrentUser();
        if (user) {
            await this.syncCartToDatabase(user.id);
        }
    }

    // Clear cart from database and localStorage
    async clearCart() {
        // Clear localStorage
        this.saveLocalCart([]);

        // Clear from database if user is logged in
        const user = await window.AuraClaraAuth?.getCurrentUser();
        if (user) {
            try {
                await this.supabase
                    .from('carts')
                    .update({
                        cart_data: [],
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id);

                console.log('✅ Cart cleared from database');
            } catch (error) {
                console.error('Error clearing cart from database:', error);
            }
        }
    }
}

// Initialize cart sync
let cartSync;
if (window.AuraClaraAuth) {
    cartSync = new CartSync();
    window.cartSync = cartSync;
    console.log('✨ Cart sync initialized');
} else {
    console.warn('AuraClaraAuth not available, cart sync disabled');
}

// Export for use in other scripts
window.CartSync = CartSync;
