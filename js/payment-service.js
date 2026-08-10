// ============================================================
//  Payment Service — Dr. Marwa Badr Platform
//  Secure course purchase flow with Supabase + redirect
// ============================================================

const PAYMENT_API_BASE = 'https://drmarwa.onrender.com';

class PaymentServiceInterface {

    constructor() {
        // -------------------------------------------------------
        //  Course Catalog — Prices in EGP
        // -------------------------------------------------------
        this.courses = {
            'healing-journey-program': {
                name_ar: 'رحلة تعافي',
                name_en: 'Healing Journey Program',
                sale_price: 1000,
                full_price: 1500,
                currency: 'EGP'
            },
            'dbt-course': {
                name_ar: 'العلاج الجدلي السلوكي',
                name_en: 'Dialectical Behavior Therapy (DBT)',
                sale_price: 2000,
                full_price: 3000,
                currency: 'EGP'
            },
            'cbt-course': {
                name_ar: 'العلاج المعرفي السلوكي',
                name_en: 'Cognitive Behavioral Therapy (CBT)',
                sale_price: 1500,
                full_price: 2000,
                currency: 'EGP'
            },
            'act-course': {
                name_ar: 'القبول والالتزام',
                name_en: 'Acceptance & Commitment Therapy (ACT)',
                sale_price: 1500,
                full_price: 2000,
                currency: 'EGP'
            },
            'personality-disorders-course': {
                name_ar: 'اضطرابات الشخصية',
                name_en: 'Personality Disorders Course',
                sale_price: 1700,
                full_price: 2500,
                currency: 'EGP'
            },
            'tri-therapy-bundle': {
                name_ar: 'باقة الثلاث علاجات (DBT + CBT + ACT)',
                name_en: 'Tri-Therapy Bundle (DBT + CBT + ACT)',
                sale_price: 4000,
                full_price: 7000,
                currency: 'EGP'
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
    //  processInstapay()
    //  Handles manual payment submissions (InstaPay)
    // -------------------------------------------------------
    async processInstapay(courseId, name, whatsapp, receiptFile) {
        if (!receiptFile) throw new Error("يرجى إرفاق صورة إيصال التحويل");

        const courseInfo = this.getCourse(courseId);
        if (!courseInfo) throw new Error("الكورس غير موجود");

        const session = JSON.parse(localStorage.getItem('site_current_session') || 'null');
        const token = session?.access_token;
        if (!token) throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً");

        // Helper to convert file to Base64
        const getBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        const base64_receipt = await getBase64(receiptFile);

        // 1. Record pending purchase in Supabase Database and upload receipt
        const dbResponse = await fetch(`${PAYMENT_API_BASE}/api/instapay-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                course_id: courseId,
                username: name,
                whatsapp: whatsapp,
                base64_receipt: base64_receipt
            })
        });

        if (!dbResponse.ok) {
            const errorData = await dbResponse.json();
            if (dbResponse.status === 401 || errorData.error === 'Unauthorized - please log in') {
                localStorage.removeItem('site_current_session');
                localStorage.removeItem('site_current_user');
                throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً من الصفحة الرئيسية.");
            }
            throw new Error(errorData.error || "فشل في تسجيل الطلب في قاعدة البيانات.");
        }

        const dbResult = await dbResponse.json();
        const receiptUrl = dbResult.receipt_url || 'تعذر رفع الصورة، الرجاء مراجعة قاعدة البيانات.';

        // 2. Send Email via Web3Forms with the Receipt URL
        const currentUser = JSON.parse(localStorage.getItem('site_current_user') || '{}');
        const userEmail = currentUser.email || 'no-reply@drmarwa.com';

        const formData = new FormData();
        formData.append("access_key", "fb92385f-3e85-4f05-8b04-69f61449449e");
        formData.append("subject", "💰 إشعار تحويل InstaPay جديد - Dr. Marwa Platform");
        formData.append("from_name", "InstaPay System");
        formData.append("email", userEmail);
        formData.append("Client_Name", name);
        formData.append("WhatsApp_Number", whatsapp);
        formData.append("Course_Name", courseInfo.name_ar + " - " + courseInfo.name_en);
        formData.append("Receipt_URL", receiptUrl);

        try {
            const emailResponse = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });
            const emailResult = await emailResponse.json();
            if (!emailResult.success) {
                console.error("Web3Forms failed:", emailResult);
            }
        } catch (e) {
            console.error("Web3Forms error:", e);
            // We do not throw here because the DB record is already saved securely.
            // The admin can still see it in Supabase.
        }

        return true;
    }

    // -------------------------------------------------------
    //  processPayment()
    //  Main entry point — currently disabled until new gateway
    // -------------------------------------------------------
    async processPayment(details) {
        // Card payment gateway is currently being updated.
        // This is handled by the UI — button should not call this.
        return new Promise((_, reject) => {
            reject(new Error("Card payment gateway is temporarily disabled. Please use InstaPay."));
        });
    }
}

window.PaymentService = new PaymentServiceInterface();
