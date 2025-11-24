// ========================================
// AURA CLARA - Account Manager
// ========================================

class AccountManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check if user is logged in
        await this.checkAuth();

        // Set up event listeners
        this.setupNavigation();
        this.setupForms();

        // Load user data
        await this.loadUserData();
    }

    async checkAuth() {
        try {
            const user = await window.AuraClaraAuth.getCurrentUser();

            if (!user) {
                // Redirect to home if not logged in
                window.location.replace('../index.html');
                return;
            }

            this.currentUser = user;
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.replace('../index.html');
        }
    }

    async loadUserData() {
        if (!this.currentUser) return;

        // Update greeting
        const greeting = document.getElementById('account-greeting');
        const displayName = this.currentUser.user_metadata?.full_name ||
                           this.currentUser.email.split('@')[0];
        greeting.textContent = `Welcome back, ${displayName}!`;

        // Populate profile form
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');

        nameInput.value = this.currentUser.user_metadata?.full_name || '';
        emailInput.value = this.currentUser.email;

        // Update last sign in
        const lastSignIn = document.getElementById('last-signin');
        if (this.currentUser.last_sign_in_at) {
            const date = new Date(this.currentUser.last_sign_in_at);
            lastSignIn.textContent = date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }

        // Load newsletter subscription status
        await this.loadNewsletterStatus();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.account-nav-item');
        const sections = document.querySelectorAll('.account-section');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetSection = item.dataset.section;

                // Update active states
                navItems.forEach(nav => nav.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));

                item.classList.add('active');
                document.getElementById(`${targetSection}-section`).classList.add('active');

                // Update URL hash
                window.location.hash = targetSection;
            });
        });

        // Handle hash on load
        const hash = window.location.hash.slice(1);
        if (hash) {
            const targetNav = document.querySelector(`[data-section="${hash}"]`);
            if (targetNav) {
                targetNav.click();
            }
        }
    }

    setupForms() {
        // Profile form
        const profileForm = document.getElementById('profile-form');
        profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));

        // Password form
        const passwordForm = document.getElementById('password-form');
        passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));

        // Support form
        const supportForm = document.getElementById('support-form');
        supportForm.addEventListener('submit', (e) => this.handleSupportSubmit(e));

        // Newsletter toggle
        const newsletterToggle = document.getElementById('newsletter-toggle');
        if (newsletterToggle) {
            newsletterToggle.addEventListener('change', (e) => this.handleNewsletterToggle(e));
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();

        const nameInput = document.getElementById('profile-name');
        const newName = nameInput.value.trim();

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';

            // Update user metadata in Supabase
            const { data, error } = await window.AuraClaraAuth.supabase.auth.updateUser({
                data: {
                    full_name: newName
                }
            });

            if (error) throw error;

            this.currentUser = data.user;
            this.showToast('Profile updated successfully!', 'success');

            // Update greeting
            const greeting = document.getElementById('account-greeting');
            greeting.textContent = `Welcome back, ${newName}!`;

            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Profile';

        } catch (error) {
            console.error('Profile update error:', error);
            this.showToast(error.message, 'error');

            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Profile';
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            this.showToast('New passwords do not match', 'error');
            return;
        }

        // Validate password length
        if (newPassword.length < 8) {
            this.showToast('Password must be at least 8 characters', 'error');
            return;
        }

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';

            // Re-authenticate with current password first
            const { error: signInError } = await window.AuraClaraAuth.supabase.auth.signInWithPassword({
                email: this.currentUser.email,
                password: currentPassword
            });

            if (signInError) {
                throw new Error('Current password is incorrect');
            }

            // Update password
            const { error } = await window.AuraClaraAuth.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            this.showToast('Password updated successfully!', 'success');

            // Clear form
            e.target.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password';

        } catch (error) {
            console.error('Password change error:', error);
            this.showToast(error.message, 'error');

            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password';
        }
    }

    async handleSupportSubmit(e) {
        e.preventDefault();

        const subject = document.getElementById('support-subject').value;
        const message = document.getElementById('support-message').value;

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            // Send support email via Supabase Edge Function or direct SMTP
            // For now, we'll create a simple mailto link
            const emailBody = `
Subject: ${subject}
From: ${this.currentUser.email}
Name: ${this.currentUser.user_metadata?.full_name || 'N/A'}

Message:
${message}
            `.trim();

            const mailtoLink = `mailto:support@auraclara.store?subject=Support: ${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

            // Open default email client
            window.location.href = mailtoLink;

            // Show success message
            this.showToast('Opening your email client...', 'success');

            // Reset form after short delay
            setTimeout(() => {
                e.target.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }, 1000);

        } catch (error) {
            console.error('Support form error:', error);
            this.showToast('Error sending message. Please try again.', 'error');

            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    }

    async loadNewsletterStatus() {
        const newsletterToggle = document.getElementById('newsletter-toggle');
        const newsletterStatus = document.getElementById('newsletter-status');

        if (!newsletterToggle || !newsletterStatus) return;

        try {
            newsletterStatus.textContent = 'Loading...';
            newsletterStatus.className = 'newsletter-status loading';
            newsletterToggle.disabled = true;

            // Check if user is subscribed to newsletter
            const { data, error } = await window.AuraClaraAuth.supabase
                .from('newsletter_signups')
                .select('*')
                .eq('email', this.currentUser.email)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                // User is subscribed
                newsletterToggle.checked = true;
                newsletterStatus.textContent = `Subscribed on ${new Date(data.subscribed_at).toLocaleDateString()}`;
                newsletterStatus.className = 'newsletter-status subscribed';
            } else {
                // User is not subscribed
                newsletterToggle.checked = false;
                newsletterStatus.textContent = 'Not subscribed';
                newsletterStatus.className = 'newsletter-status unsubscribed';
            }

            newsletterToggle.disabled = false;

        } catch (error) {
            console.error('Error loading newsletter status:', error);
            newsletterStatus.textContent = 'Unable to load status';
            newsletterStatus.className = 'newsletter-status';
            newsletterToggle.disabled = false;
        }
    }

    async handleNewsletterToggle(e) {
        const newsletterToggle = e.target;
        const newsletterStatus = document.getElementById('newsletter-status');
        const isSubscribing = newsletterToggle.checked;

        try {
            newsletterToggle.disabled = true;
            newsletterStatus.textContent = isSubscribing ? 'Subscribing...' : 'Unsubscribing...';
            newsletterStatus.className = 'newsletter-status loading';

            if (isSubscribing) {
                // Subscribe to newsletter
                const { data, error } = await window.AuraClaraAuth.supabase
                    .from('newsletter_signups')
                    .insert([
                        {
                            email: this.currentUser.email,
                            source: 'account_settings',
                            user_id: this.currentUser.id
                        }
                    ])
                    .select()
                    .single();

                if (error) {
                    // Check if already subscribed
                    if (error.code === '23505') {
                        newsletterStatus.textContent = 'Already subscribed';
                        newsletterStatus.className = 'newsletter-status subscribed';
                        this.showToast('You\'re already subscribed to our newsletter!', 'success');
                    } else {
                        throw error;
                    }
                } else {
                    newsletterStatus.textContent = `Subscribed on ${new Date(data.subscribed_at).toLocaleDateString()}`;
                    newsletterStatus.className = 'newsletter-status subscribed';
                    this.showToast('Successfully subscribed to newsletter! ✨', 'success');
                }

            } else {
                // Unsubscribe from newsletter
                const { error } = await window.AuraClaraAuth.supabase
                    .from('newsletter_signups')
                    .delete()
                    .eq('email', this.currentUser.email);

                if (error) throw error;

                newsletterStatus.textContent = 'Not subscribed';
                newsletterStatus.className = 'newsletter-status unsubscribed';
                this.showToast('Unsubscribed from newsletter', 'success');
            }

            newsletterToggle.disabled = false;

        } catch (error) {
            console.error('Newsletter toggle error:', error);
            this.showToast('Error updating newsletter preference. Please try again.', 'error');

            // Revert toggle state
            newsletterToggle.checked = !isSubscribing;
            newsletterToggle.disabled = false;

            // Reload status
            await this.loadNewsletterStatus();
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;

        // Trigger reflow
        toast.offsetHeight;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize account manager when DOM is ready
// Use 'interactive' state to catch earlier in page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AccountManager();
    });
} else {
    new AccountManager();
}

console.log('✨ Account manager initialized');
