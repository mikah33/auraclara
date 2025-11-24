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

            // Save to Supabase with discount code (triggers n8n email automation)
            const { data, error } = await window.AuraClaraAuth.supabase
                .from('newsletter_signups')
                .insert({
                    email: email,
                    source: 'homepage_newsletter',
                    discount_code: 'WELCOME15'
                })
                .select();

            if (error) {
                // Check if already subscribed
                if (error.code === '23505') { // Unique constraint violation
                    this.showMessage('You\'re already subscribed! ✨', 'success');
                } else {
                    throw error;
                }
            } else {
                // Successfully subscribed - email will be sent automatically via n8n
                this.showMessage('Thank you for joining our circle! Check your email for your 15% off code ✨', 'success');
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

    // notifySupport method removed - emails are now sent automatically via n8n webhook

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
