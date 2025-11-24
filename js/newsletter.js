// ========================================
// AURA CLARA - Newsletter Signup
// ========================================

class NewsletterManager {
    constructor() {
        this.setupNewsletterForm();
    }

    setupNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleNewsletterSignup(e);
            });
        }
    }

    async handleNewsletterSignup(e) {
        const emailInput = e.target.querySelector('.newsletter-input');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();

        // Validate email
        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';

            // Save to Supabase
            const { data, error } = await window.AuraClaraAuth.supabase
                .from('newsletter_signups')
                .insert([
                    {
                        email: email,
                        source: 'website',
                        user_id: null // Will be null unless user is logged in
                    }
                ])
                .select();

            if (error) {
                // Check if already subscribed
                if (error.code === '23505') { // Unique constraint violation
                    this.showMessage('You\'re already subscribed! ✨', 'success');
                } else {
                    throw error;
                }
            } else {
                // Successfully subscribed
                this.showMessage('Thank you for joining our circle! ✨', 'success');

                // Send notification email to support
                await this.notifySupport(email);
            }

            // Clear form
            emailInput.value = '';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';

        } catch (error) {
            console.error('Newsletter signup error:', error);
            this.showMessage('Oops! Something went wrong. Please try again.', 'error');

            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';
        }
    }

    async notifySupport(email) {
        // Note: This would ideally be handled by a Supabase Edge Function
        // For now, this logs the signup (you can set up a database trigger to send emails)
        console.log(`New newsletter signup: ${email}`);

        // You can optionally send an email notification here using a backend service
        // or set up a database trigger in Supabase to send notifications
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    showMessage(message, type = 'success') {
        // Try to use toast if available (on account page)
        const toast = document.getElementById('toast');

        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type} show`;

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        } else {
            // Fallback to alert
            alert(message);
        }
    }
}

// Initialize newsletter manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NewsletterManager();
    });
} else {
    new NewsletterManager();
}

console.log('✨ Newsletter manager initialized');
