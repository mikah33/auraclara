// ========================================
// AURA CLARA - Exit Intent Popup
// 15% Discount for First-Time Visitors
// Expected: 10-15% email capture rate
// ========================================

class ExitIntentPopup {
    constructor() {
        this.hasShown = false;
        this.threshold = 50; // pixels from top
        this.init();
    }

    init() {
        // Check if user has already seen popup
        if (localStorage.getItem('exitPopupShown') || this.hasShown) {
            return;
        }

        // Desktop: mouse leave detection
        document.addEventListener('mouseout', (e) => {
            if (!e.toElement && !e.relatedTarget && e.clientY < this.threshold) {
                this.show();
            }
        });

        // Mobile: scroll detection (80% down page)
        let hasScrolled = false;
        window.addEventListener('scroll', () => {
            if (hasScrolled) return;

            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 80) {
                hasScrolled = true;
                setTimeout(() => this.show(), 2000); // Wait 2s after scroll
            }
        });

        // Fallback: show after 30 seconds
        setTimeout(() => {
            if (!this.hasShown) {
                this.show();
            }
        }, 30000);
    }

    show() {
        if (this.hasShown) return;
        this.hasShown = true;

        // Create popup HTML
        const popup = document.createElement('div');
        popup.className = 'exit-intent-popup';
        popup.innerHTML = `
            <div class="exit-popup-overlay"></div>
            <div class="exit-popup-content">
                <button class="exit-popup-close" aria-label="Close popup">&times;</button>

                <div class="exit-popup-inner">
                    <div class="exit-popup-image">
                        <img src="assets/images/clarity-patch-woman-wearing.png" alt="Clarity Patches">
                    </div>

                    <div class="exit-popup-text">
                        <div class="exit-popup-badge">✨ FIRST-TIME VISITOR OFFER</div>
                        <h2>Wait! Get 15% Off Your First Order</h2>
                        <p>Join 50,000+ customers who wake up to clearer, more radiant skin</p>

                        <form class="exit-popup-form" id="exitPopupForm">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                            >
                            <button type="submit" class="btn-popup-submit">
                                Get My 15% Off
                            </button>
                        </form>

                        <div class="exit-popup-trust">
                            <span>✓ Free shipping on orders $50+</span>
                            <span>✓ 60-day money-back guarantee</span>
                        </div>

                        <small class="exit-popup-privacy">
                            By entering your email, you agree to receive marketing emails. Unsubscribe anytime.
                        </small>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Close handlers
        const closeBtn = popup.querySelector('.exit-popup-close');
        const overlay = popup.querySelector('.exit-popup-overlay');

        const close = () => {
            popup.classList.add('exit-popup-closing');
            setTimeout(() => {
                popup.remove();
                document.body.style.overflow = '';
            }, 300);
            localStorage.setItem('exitPopupShown', 'true');
        };

        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);

        // Form submission
        const form = popup.querySelector('#exitPopupForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            const submitBtn = form.querySelector('.btn-popup-submit');

            // Disable button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';

            try {
                // Subscribe to newsletter via Supabase
                if (window.AuraClaraAuth?.supabase) {
                    const { data, error } = await window.AuraClaraAuth.supabase
                        .from('newsletter_signups')
                        .insert({
                            email: email,
                            source: 'exit_intent_popup',
                            discount_code: 'WELCOME15'
                        })
                        .select();

                    if (error) {
                        console.error('Supabase insert error details:', {
                            code: error.code,
                            message: error.message,
                            details: error.details,
                            hint: error.hint
                        });

                        // If duplicate email, that's okay - still show success
                        if (error.code !== '23505') {
                            throw error;
                        }
                    }

                    console.log('Newsletter signup successful:', data);
                }

                // Show success state
                const popupText = popup.querySelector('.exit-popup-text');
                popupText.innerHTML = `
                    <div class="exit-popup-success">
                        <div class="success-icon">✓</div>
                        <h2>Check Your Email!</h2>
                        <p>We've sent your 15% discount code to:<br><strong>${email}</strong></p>
                        <p class="success-discount-code">
                            Your code: <strong>WELCOME15</strong>
                        </p>
                        <button class="btn-popup-shop" onclick="window.location.href='/products'">
                            Start Shopping
                        </button>
                    </div>
                `;

                // Auto-close after 8 seconds
                setTimeout(close, 8000);

            } catch (error) {
                console.error('Exit popup subscription error:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Try Again';

                // Show generic error
                const errorMsg = document.createElement('div');
                errorMsg.className = 'exit-popup-error';
                errorMsg.textContent = 'Something went wrong. Please try again.';
                form.appendChild(errorMsg);
            }
        });

        // Add entrance animation
        setTimeout(() => {
            popup.classList.add('exit-popup-visible');
        }, 10);

        console.log('✨ Exit intent popup shown');
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ExitIntentPopup();
    });
} else {
    new ExitIntentPopup();
}
