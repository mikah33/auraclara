// ========================================
// AURA CLARA - Social Proof Notifications
// "Sarah from Los Angeles just purchased..."
// Expected: 15-30% trust lift
// ========================================

class SocialProofNotifications {
    constructor() {
        this.notifications = [
            { name: 'Sarah', location: 'Los Angeles, CA', product: 'Clarity Patches', time: '2 minutes ago' },
            { name: 'Emma', location: 'New York, NY', product: 'Face Sculpting Tool', time: '5 minutes ago' },
            { name: 'Jessica', location: 'Miami, FL', product: 'Bio-Collagen Mask', time: '8 minutes ago' },
            { name: 'Ashley', location: 'Chicago, IL', product: 'Clarity Patches', time: '12 minutes ago' },
            { name: 'Madison', location: 'Austin, TX', product: 'V-Line Lifting Mask', time: '15 minutes ago' },
            { name: 'Taylor', location: 'Seattle, WA', product: 'Jawline Shaper', time: '18 minutes ago' },
            { name: 'Hannah', location: 'Boston, MA', product: 'Clarity Patches', time: '22 minutes ago' },
            { name: 'Sophia', location: 'San Diego, CA', product: 'Face Sculpting Tool', time: '25 minutes ago' },
            { name: 'Olivia', location: 'Denver, CO', product: 'Bio-Collagen Mask', time: '28 minutes ago' },
            { name: 'Mia', location: 'Portland, OR', product: 'Clarity Patches', time: '32 minutes ago' }
        ];

        this.currentIndex = 0;
        this.isVisible = false;
        this.container = null;

        this.init();
    }

    init() {
        // Don't show on mobile to avoid clutter
        if (window.innerWidth < 768) {
            return;
        }

        // Create notification container
        this.createContainer();

        // Start showing notifications after 5 seconds
        setTimeout(() => {
            this.showNext();
        }, 5000);
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'social-proof-notification';
        this.container.innerHTML = `
            <div class="social-proof-content">
                <div class="social-proof-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="social-proof-text">
                    <div class="social-proof-message"></div>
                    <div class="social-proof-time"></div>
                </div>
            </div>
            <button class="social-proof-close" aria-label="Close notification">&times;</button>
        `;

        document.body.appendChild(this.container);

        // Close button
        const closeBtn = this.container.querySelector('.social-proof-close');
        closeBtn.addEventListener('click', () => {
            this.hide();
        });
    }

    showNext() {
        if (this.isVisible) {
            return;
        }

        // Get next notification
        const notification = this.notifications[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.notifications.length;

        // Update content
        const messageEl = this.container.querySelector('.social-proof-message');
        const timeEl = this.container.querySelector('.social-proof-time');

        messageEl.innerHTML = `<strong>${notification.name}</strong> from ${notification.location} just purchased <strong>${notification.product}</strong>`;
        timeEl.textContent = notification.time;

        // Show notification
        this.show();

        // Hide after 6 seconds
        setTimeout(() => {
            this.hide();
        }, 6000);

        // Show next notification after random interval (30-60 seconds)
        const nextInterval = 30000 + Math.random() * 30000;
        setTimeout(() => {
            this.showNext();
        }, nextInterval + 6000);
    }

    show() {
        this.isVisible = true;
        this.container.classList.add('social-proof-visible');
        console.log('📢 Social proof notification shown');
    }

    hide() {
        this.isVisible = false;
        this.container.classList.remove('social-proof-visible');
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SocialProofNotifications();
    });
} else {
    new SocialProofNotifications();
}
