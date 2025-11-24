// ========================================
// AURA CLARA - Auth Modal Controller
// ========================================

class AuthModal {
    constructor() {
        this.modal = null;
        this.currentView = 'signin'; // signin, signup, forgot
        this.init();
    }

    init() {
        // Create modal HTML
        this.createModal();

        // Set up event listeners
        this.setupEventListeners();

        // Check for verification/reset URL parameters
        this.checkURLParams();
    }

    createModal() {
        const modalHTML = `
            <div id="auth-modal" class="auth-modal" style="display: none;">
                <div class="auth-modal-overlay"></div>
                <div class="auth-modal-content">
                    <button class="auth-modal-close" aria-label="Close authentication modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>

                    <!-- Sign In View -->
                    <div id="signin-view" class="auth-view">
                        <div class="auth-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to your Aura Clara account</p>
                        </div>

                        <form id="signin-form" class="auth-form">
                            <div class="form-group">
                                <label for="signin-email">Email</label>
                                <input type="email" id="signin-email" required placeholder="your@email.com">
                            </div>

                            <div class="form-group">
                                <label for="signin-password">Password</label>
                                <input type="password" id="signin-password" required placeholder="••••••••">
                            </div>

                            <button type="button" class="link-button" id="show-forgot">Forgot password?</button>

                            <button type="submit" class="btn btn-primary btn-full">Sign In</button>

                            <div class="auth-divider">
                                <span>Don't have an account?</span>
                            </div>

                            <button type="button" class="btn btn-outline btn-full" id="show-signup">Create Account</button>
                        </form>
                    </div>

                    <!-- Sign Up View -->
                    <div id="signup-view" class="auth-view" style="display: none;">
                        <div class="auth-header">
                            <h2>Create Account</h2>
                            <p>Join our circle for exclusive perks</p>
                        </div>

                        <form id="signup-form" class="auth-form">
                            <div class="form-group">
                                <label for="signup-name">Full Name</label>
                                <input type="text" id="signup-name" required placeholder="Your name">
                            </div>

                            <div class="form-group">
                                <label for="signup-email">Email</label>
                                <input type="email" id="signup-email" required placeholder="your@email.com">
                            </div>

                            <div class="form-group">
                                <label for="signup-password">Password</label>
                                <input type="password" id="signup-password" required placeholder="••••••••" minlength="8">
                                <small>Minimum 8 characters</small>
                            </div>

                            <button type="submit" class="btn btn-primary btn-full">Create Account</button>

                            <div class="auth-divider">
                                <span>Already have an account?</span>
                            </div>

                            <button type="button" class="btn btn-outline btn-full" id="show-signin">Sign In</button>
                        </form>
                    </div>

                    <!-- Forgot Password View -->
                    <div id="forgot-view" class="auth-view" style="display: none;">
                        <div class="auth-header">
                            <h2>Reset Password</h2>
                            <p>We'll send you a link to reset your password</p>
                        </div>

                        <form id="forgot-form" class="auth-form">
                            <div class="form-group">
                                <label for="forgot-email">Email</label>
                                <input type="email" id="forgot-email" required placeholder="your@email.com">
                            </div>

                            <button type="submit" class="btn btn-primary btn-full">Send Reset Link</button>

                            <button type="button" class="btn btn-outline btn-full" id="back-to-signin">Back to Sign In</button>
                        </form>
                    </div>

                    <!-- Success Message -->
                    <div id="success-message" class="auth-message" style="display: none;">
                        <div class="success-icon">✨</div>
                        <h3 id="success-title">Success!</h3>
                        <p id="success-text"></p>
                        <button class="btn btn-primary btn-full" id="close-success">Continue</button>
                    </div>

                    <!-- Error Message -->
                    <div id="error-message" class="auth-error" style="display: none;"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('auth-modal');
    }

    setupEventListeners() {
        // Close modal
        const closeBtn = this.modal.querySelector('.auth-modal-close');
        const overlay = this.modal.querySelector('.auth-modal-overlay');

        closeBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());

        // View switchers
        document.getElementById('show-signup').addEventListener('click', () => this.switchView('signup'));
        document.getElementById('show-signin').addEventListener('click', () => this.switchView('signin'));
        document.getElementById('show-forgot').addEventListener('click', () => this.switchView('forgot'));
        document.getElementById('back-to-signin').addEventListener('click', () => this.switchView('signin'));
        document.getElementById('close-success').addEventListener('click', () => this.close());

        // Form submissions
        document.getElementById('signin-form').addEventListener('submit', (e) => this.handleSignIn(e));
        document.getElementById('signup-form').addEventListener('submit', (e) => this.handleSignUp(e));
        document.getElementById('forgot-form').addEventListener('submit', (e) => this.handleForgotPassword(e));

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.close();
            }
        });
    }

    checkURLParams() {
        const params = new URLSearchParams(window.location.search);

        if (params.get('verified') === 'true') {
            this.showSuccess('Email Verified!', 'Your email has been verified. You can now sign in.');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (params.get('reset') === 'true') {
            this.switchView('reset-password');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    open(view = 'signin') {
        this.switchView(view);
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.clearError();
    }

    switchView(view) {
        // Hide all views
        this.modal.querySelectorAll('.auth-view, .auth-message').forEach(v => v.style.display = 'none');

        // Show selected view
        const viewElement = document.getElementById(`${view}-view`);
        if (viewElement) {
            viewElement.style.display = 'block';
            this.currentView = view;
        }

        this.clearError();
    }

    async handleSignIn(e) {
        e.preventDefault();
        this.clearError();

        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';

            const { user } = await window.AuraClaraAuth.signIn(email, password);

            // Success - close modal and update UI
            this.close();
            window.location.reload(); // Refresh to update auth state

        } catch (error) {
            this.showError(error.message);
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    }

    async handleSignUp(e) {
        e.preventDefault();
        this.clearError();

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (password.length < 8) {
            this.showError('Password must be at least 8 characters');
            return;
        }

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            const { user } = await window.AuraClaraAuth.signUp(email, password, name);

            // Show success message
            this.showSuccess(
                'Check Your Email!',
                `We've sent a verification link to ${email}. Please verify your email to complete registration.`
            );

            // Reset form
            e.target.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';

        } catch (error) {
            this.showError(error.message);
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        this.clearError();

        const email = document.getElementById('forgot-email').value;

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            await window.AuraClaraAuth.resetPassword(email);

            this.showSuccess(
                'Reset Link Sent!',
                `We've sent a password reset link to ${email}. Check your inbox.`
            );

            e.target.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';

        } catch (error) {
            this.showError(error.message);
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
        }
    }

    showSuccess(title, message) {
        document.getElementById('success-title').textContent = title;
        document.getElementById('success-text').textContent = message;
        this.modal.querySelectorAll('.auth-view').forEach(v => v.style.display = 'none');
        document.getElementById('success-message').style.display = 'block';
    }

    showError(message) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    clearError() {
        document.getElementById('error-message').style.display = 'none';
    }
}

// Initialize auth modal when DOM is ready
let authModal;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        authModal = new AuthModal();
        window.authModal = authModal;
    });
} else {
    authModal = new AuthModal();
    window.authModal = authModal;
}

console.log('✨ Auth modal initialized');
