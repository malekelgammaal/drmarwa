// ============================================================
//  Payment Service — Dr. Marwa Badr Platform
//  Secure course purchase flow with Supabase + redirect
// ============================================================

const PAYMENT_API_BASE = 'https://drmarwa.onrender.com';

class PaymentServiceInterface {

    constructor() {
        // -------------------------------------------------------
        //  Course Catalog — Prices in USD
        // -------------------------------------------------------
        this.courses = {
            'healing-journey-program': {
                name_ar: 'رحلة تعافي',
                name_en: 'Healing Journey Program',
                sale_price: 99.99,
                full_price: 150.00,
                currency: 'USD'
            },
            'dbt-course': {
                name_ar: 'العلاج الجدلي السلوكي',
                name_en: 'Dialectical Behavior Therapy (DBT)',
                sale_price: 174.99,
                full_price: 225.00,
                currency: 'USD'
            },
            'cbt-course': {
                name_ar: 'العلاج المعرفي السلوكي',
                name_en: 'Cognitive Behavioral Therapy (CBT)',
                sale_price: 149.99,
                full_price: 200.00,
                currency: 'USD'
            },
            'act-course': {
                name_ar: 'القبول والالتزام',
                name_en: 'Acceptance & Commitment Therapy (ACT)',
                sale_price: 149.99,
                full_price: 200.00,
                currency: 'USD'
            },
            'personality-disorders-course': {
                name_ar: 'اضطرابات الشخصية',
                name_en: 'Personality Disorders Course',
                sale_price: 174.99,
                full_price: 225.00,
                currency: 'USD'
            },
            'tri-therapy-bundle': {
                name_ar: 'باقة الثلاث علاجات (DBT + CBT + ACT)',
                name_en: 'Tri-Therapy Bundle (DBT + CBT + ACT)',
                sale_price: 349.99,
                full_price: 425.00,
                currency: 'USD'
            }
        };
    }

    // -------------------------------------------------------
    //  getCourse() — get course info by slug
    // -------------------------------------------------------
    getCourse(courseId) {
        return this.courses[courseId] || null;
    }

    // -------------------------------------------------------
    //  recordPurchase()
    //  Saves the purchase to Supabase via the Node.js backend
    // -------------------------------------------------------
    async recordPurchase(courseId, transactionId, amountPaid, currency) {
        try {
            // Get JWT token from session stored by login flow
            const session = JSON.parse(localStorage.getItem('site_current_session') || 'null');
            const token = session?.access_token;

            if (!token) throw new Error('User session expired — please log in again');

            const response = await fetch(`${PAYMENT_API_BASE}/api/record-purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    course_id: courseId,
                    transaction_id: transactionId,
                    amount_paid: amountPaid,
                    currency: currency
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to record purchase in backend');
            }

            console.log('[PaymentService] ✅ Purchase recorded successfully on backend.');
            return true;
        } catch (error) {
            console.error('[PaymentService] ❌ Failed to record purchase:', error);
            throw error;
        }
    }

    // -------------------------------------------------------
    //  checkAccess()
    //  Returns true if current user has purchased this course.
    // -------------------------------------------------------
    async checkAccess(courseId) {
        try {
            const session = JSON.parse(localStorage.getItem('site_current_session') || 'null');
            const token = session?.access_token;
            if (!token) return false;

            // 8-second timeout — prevents hanging if Render server is sleeping
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(`${PAYMENT_API_BASE}/api/check-access?course_id=${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!response.ok) return false;
            const data = await response.json();
            return data.has_access === true;
        } catch {
            return false;
        }
    }

    // -------------------------------------------------------
    //  guardCoursePage()
    //  Call this at the top of every course content page.
    //  Blocks access and redirects if user hasn't purchased.
    // -------------------------------------------------------
    async guardCoursePage(courseId) {
        // ── Admin Preview Bypass ──────────────────────────────
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('preview') === 'drmarwabadr1984') {
            console.log(`%c[Admin Preview] Bypassing access check for: ${courseId}`, 'color:#fb923c;font-weight:bold;');
            // Append badge (works whether DOM is ready or not)
            const appendBadge = () => {
                if (document.body) {
                    const badge = document.createElement('div');
                    badge.innerHTML = '<i class="ph ph-eye" style="margin-right:0.3rem;"></i> Admin Preview Mode';
                    badge.style.cssText = 'position:fixed;bottom:1rem;right:1rem;background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.4);color:#fb923c;padding:0.4rem 0.9rem;border-radius:20px;font-size:0.75rem;font-weight:600;z-index:9999;display:flex;align-items:center;pointer-events:none;';
                    document.body.appendChild(badge);
                } else {
                    document.addEventListener('DOMContentLoaded', appendBadge);
                }
            };
            appendBadge();
            return true;
        }
        // ─────────────────────────────────────────────────────

        const hasAccess = await this.checkAccess(courseId);
        if (!hasAccess) {
            console.warn(`[PaymentService] Access denied for course: ${courseId}`);
            window.location.href = `index.html?locked=${courseId}#courses`;
            return false;
        }
        console.log(`[PaymentService] ✅ Access granted for course: ${courseId}`);
        return true;
    }

    // -------------------------------------------------------
    //  processPayment()
    //  Main entry point — currently disabled until new gateway
    // -------------------------------------------------------
    async processPayment(details) {
        alert('Payment gateway is currently being updated. Please try again later or contact support.');
        return new Promise((resolve, reject) => {
            reject(new Error("Payment gateway disabled"));
        });
    }
}

window.PaymentService = new PaymentServiceInterface();
