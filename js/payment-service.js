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
                currency: 'USD',
                payment_link: 'https://api.gammal.tech/sdk/pay/link/?pid=129&amount=92.58&desc=Healing%20Journy%20Program&currency=USD&callback=https%3A%2F%2Fdrmarwa.pages.dev%2Fpayment-success.html%3Fcourse%3Dhealing-journey-program'
            },
            'dbt-course': {
                name_ar: 'العلاج الجدلي السلوكي',
                name_en: 'Dialectical Behavior Therapy (DBT)',
                sale_price: 174.99,
                full_price: 225.00,
                currency: 'USD',
                payment_link: 'https://api.gammal.tech/sdk/pay/link/?pid=129&amount=162.03&desc=DBT%20Course&currency=USD&callback=https%3A%2F%2Fdrmarwa.pages.dev%2Fpayment-success.html%3Fcourse%3Ddbt-course'
            },
            'cbt-course': {
                name_ar: 'العلاج المعرفي السلوكي',
                name_en: 'Cognitive Behavioral Therapy (CBT)',
                sale_price: 149.99,
                full_price: 200.00,
                currency: 'USD',
                payment_link: 'https://api.gammal.tech/sdk/pay/link/?pid=129&amount=138.88&desc=CBT%20Course&currency=USD&callback=https%3A%2F%2Fdrmarwa.pages.dev%2Fpayment-success.html%3Fcourse%3Dcbt-course'
            },
            'act-course': {
                name_ar: 'القبول والالتزام',
                name_en: 'Acceptance & Commitment Therapy (ACT)',
                sale_price: 149.99,
                full_price: 200.00,
                currency: 'USD',
                payment_link: 'https://api.gammal.tech/sdk/pay/link/?pid=129&amount=138.88&desc=ACT%20Course&currency=USD&callback=https%3A%2F%2Fdrmarwa.pages.dev%2Fpayment-success.html%3Fcourse%3Dact-course'
            },
            'personality-disorders-course': {
                name_ar: 'اضطرابات الشخصية',
                name_en: 'Personality Disorders Course',
                sale_price: 174.99,
                full_price: 225.00,
                currency: 'USD',
                payment_link: 'https://api.gammal.tech/sdk/pay/link/?pid=129&amount=162.03&desc=Personality%20Disorders%20Course&currency=USD&callback=https%3A%2F%2Fdrmarwa.pages.dev%2Fpayment-success.html%3Fcourse%3Dpersonality-disorders-course'
            },
            'tri-therapy-bundle': {
                name_ar: 'باقة الثلاث علاجات (DBT + CBT + ACT)',
                name_en: 'Tri-Therapy Bundle (DBT + CBT + ACT)',
                sale_price: 349.99,
                full_price: 425.00,
                currency: 'USD',
                payment_link: 'https://api.gammal.tech/sdk/pay/link/?pid=129&amount=324.06&desc=Tri-Therapy%20Bundle%20(DBT%20%2B%20CBT%20%2B%20ACT)&currency=USD&callback=https%3A%2F%2Fdrmarwa.pages.dev%2Fpayment-success.html%3Fcourse%3Dtri-therapy-bundle'
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
    //  (We go through server.js to keep Supabase service key safe)
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
                const err = await response.json();
                throw new Error(err.error || 'Failed to record purchase');
            }

            return await response.json();
        } catch (error) {
            console.error('[PaymentService] recordPurchase error:', error);
            throw error;
        }
    }

    // -------------------------------------------------------
    //  onPaymentSuccess()
    //  Called after payment gateway confirms payment.
    //  Records purchase → redirects to course content page.
    // -------------------------------------------------------
    async onPaymentSuccess(courseId, delivery) {
        const courseInfo = this.getCourse(courseId);

        console.log('[PaymentService] ✅ Payment confirmed:', delivery.txn || 'simulated');

        try {
            // 1. Save purchase to Supabase
            await this.recordPurchase(
                courseId,
                delivery.txn || ('SIM-' + Date.now()), // fallback for simulation
                courseInfo.sale_price,
                courseInfo.currency
            );

            console.log('[PaymentService] ✅ Purchase recorded in database');

            // 2. Invalidate purchase cache → My Courses btn will appear on next load
            localStorage.setItem('user_has_purchases', 'true');

            // 3. Redirect to course content page
            window.location.href = `/course-${courseId}.html?access=granted`;

        } catch (error) {
            // Even if DB save fails, don't block the user — log for admin
            console.error('[PaymentService] DB record failed:', error);
            // Still redirect — purchase can be verified later via transaction ID
            window.location.href = `/course-${courseId}.html?access=granted&sync=pending`;
        }
    }

    // -------------------------------------------------------
    //  checkAccess()
    //  Called on course content page load.
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
    //  settlePending()
    //  Call on page load — handles users who paid but closed
    //  browser before the callback fired (Gammal Tech pattern)
    // -------------------------------------------------------
    settlePending(courseId) {
        if (typeof GammalTech === 'undefined') return;

        GammalTech.settlePending(async (delivery) => {
            console.log('[PaymentService] Settling pending payment:', delivery.txn);
            await this.onPaymentSuccess(courseId, delivery);
        });
    }

    // -------------------------------------------------------
    //  processPayment()
    //  Main entry point — called when user clicks "Buy"
    // -------------------------------------------------------
    async processPayment(details) {
        const { course: courseId } = details;
        const courseInfo = this.getCourse(courseId);

        if (!courseInfo) {
            throw new Error('Course not found: ' + courseId);
        }

        if (!courseInfo.payment_link) {
            throw new Error('Payment link not configured for: ' + courseId);
        }

        console.log(`[PaymentService] Redirecting to payment for: ${courseInfo.name_en} — $${courseInfo.sale_price}`);

        // ── Save course so payment-success.html can read it if needed ──
        sessionStorage.setItem('pending_course', courseId);

        // Redirect directly to the Gammal Tech payment link
        window.location.href = courseInfo.payment_link;
        
        // Return a promise that never resolves so the UI spinner stays active until browser navigates
        return new Promise(() => {});
    }
}

window.PaymentService = new PaymentServiceInterface();
