// ========================================
// AURA CLARA - Auth State Manager
// ========================================

class AuthStateManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check initial auth state
        await this.checkAuthState();

        // Listen for auth changes
        window.AuraClaraAuth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            this.handleAuthChange(event, session);
        });

        // Set up account button
        this.setupAccountButton();
    }

    async checkAuthState() {
        const user = await window.AuraClaraAuth.getCurrentUser();
        this.currentUser = user;
        this.updateUI();
    }

    handleAuthChange(event, session) {
        this.currentUser = session?.user || null;
        this.updateUI();

        // Handle specific events
        switch(event) {
            case 'SIGNED_IN':
                console.log('✨ User signed in');
                break;
            case 'SIGNED_OUT':
                console.log('👋 User signed out');
                // Clear any user-specific data
                break;
            case 'USER_UPDATED':
                console.log('📝 User updated');
                break;
        }
    }

    updateUI() {
        const accountLink = document.querySelector('a[href="#account"]');

        if (!accountLink) return;

        if (this.currentUser) {
            // User is logged in
            accountLink.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="margin-right: 0.25rem;">
                    <circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M3 18C3 14 6 11 10 11C14 11 17 14 17 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="account-name">${this.getDisplayName()}</span>
            `;
            accountLink.setAttribute('aria-label', `Account - ${this.getDisplayName()}`);
        } else {
            // User is logged out
            accountLink.innerHTML = 'Account';
            accountLink.setAttribute('aria-label', 'Sign in to your account');
        }
    }

    getDisplayName() {
        if (!this.currentUser) return 'Account';

        // Try to get name from metadata
        const fullName = this.currentUser.user_metadata?.full_name;
        if (fullName) {
            const firstName = fullName.split(' ')[0];
            return firstName;
        }

        // Fallback to email
        const email = this.currentUser.email;
        if (email) {
            return email.split('@')[0];
        }

        return 'Account';
    }

    setupAccountButton() {
        const accountLink = document.querySelector('a[href="#account"]');
        const accountPageLink = document.querySelector('a[href="account.html"]');

        if (accountLink) {
            accountLink.addEventListener('click', (e) => {
                e.preventDefault();

                if (this.currentUser) {
                    // User is logged in - redirect to account page
                    window.location.href = 'pages/account.html';
                } else {
                    // User is logged out - show auth modal
                    window.authModal.open('signin');
                }
            });
        }

        // Also handle if we're on a page with direct account.html link
        if (accountPageLink) {
            accountPageLink.addEventListener('click', (e) => {
                if (!this.currentUser) {
                    e.preventDefault();
                    window.authModal.open('signin');
                }
            });
        }
    }

    showAccountMenu(e) {
        // Create dropdown menu for logged-in users
        const existingMenu = document.querySelector('.account-dropdown');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'account-dropdown';
        menu.innerHTML = `
            <div class="account-dropdown-header">
                <strong>${this.getDisplayName()}</strong>
                <small>${this.currentUser.email}</small>
            </div>
            <a href="#orders" class="account-dropdown-item">My Orders</a>
            <a href="#profile" class="account-dropdown-item">Profile Settings</a>
            <a href="#signout" class="account-dropdown-item signout">Sign Out</a>
        `;

        // Position the menu
        const accountLink = e.currentTarget;
        const rect = accountLink.getBoundingClientRect();
        menu.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 10}px;
            right: ${window.innerWidth - rect.right}px;
            background: white;
            border: 1px solid var(--lavender-200);
            border-radius: var(--radius-sm);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 0.5rem 0;
            min-width: 200px;
            z-index: 9999;
        `;

        document.body.appendChild(menu);

        // Handle sign out
        const signoutBtn = menu.querySelector('a[href="#signout"]');
        signoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.signOut();
            menu.remove();
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target !== accountLink) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }

    async signOut() {
        try {
            await window.AuraClaraAuth.signOut();
            window.location.reload();
        } catch (error) {
            console.error('Sign out error:', error);
            alert('Error signing out. Please try again.');
        }
    }
}

// Initialize auth state manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authStateManager = new AuthStateManager();
    });
} else {
    window.authStateManager = new AuthStateManager();
}

console.log('✨ Auth state manager initialized');
