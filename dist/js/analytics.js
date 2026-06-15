class AnalyticsSystem {
    constructor() {
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9);
    }

    trackEvent(eventName, payload = {}) {
        const eventData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            session_id: this.sessionId,
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
            ...payload
        };

        // Send to Google Analytics (GA4) if available
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, payload);
        }

        console.log('[Analytics Event Logged]:', eventData);
    }
}

// Initialize globally
window.AnalyticsSystem = new AnalyticsSystem();
