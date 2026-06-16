document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Supabase Email Verification Hash Handling
    // ==========================================
    if (window.location.hash && window.location.hash.includes('access_token')) {
        try {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');
            
            if (accessToken && (type === 'signup' || type === 'magiclink' || type === 'recovery')) {
                // Remove hash from URL
                window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
                
                // Decode JWT to get user info
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                const user = { 
                    id: payload.sub, 
                    email: payload.email, 
                    user_metadata: payload.user_metadata || {} 
                };
                
                // Save session permanently
                const savedUser = user;
                localStorage.setItem('site_current_user', JSON.stringify(savedUser));
                if (session) localStorage.setItem('site_current_session', JSON.stringify({access_token: accessToken, refresh_token: refreshToken}));
                
                // Remove any active verification overlay
                const verifyOverlay = document.getElementById('check-email-modal');
                if (verifyOverlay) verifyOverlay.style.display = 'none';
                
                // Show the premium success modal
                const successModal = document.getElementById('account-success-modal');
                if (successModal) {
                    successModal.classList.add('active');
                    const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'there';
                    const nameEl = document.getElementById('account-success-name');
                    if (nameEl) nameEl.textContent = `Welcome, ${displayName}! Your account has been verified and you're now logged in.`;
                }
            }
        } catch (e) {
            console.error("Error parsing auth hash:", e);
        }
    }

    // ==========================================
    // Navbar Scroll Shadow
    // ==========================================
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 10);
        }, { passive: true });
    }

    // ==========================================
    // Sticky CTA Logic
    // ==========================================
    const stickyCta = document.getElementById('sticky-cta');
    const heroSection = document.getElementById('hero');
    
    if (stickyCta && heroSection) {
        window.addEventListener('scroll', () => {
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            if (window.scrollY > heroBottom - 200) {
                stickyCta.style.opacity = '1';
                stickyCta.style.pointerEvents = 'auto';
                stickyCta.style.transform = 'translateY(0)';
            } else {
                stickyCta.style.opacity = '0';
                stickyCta.style.pointerEvents = 'none';
                stickyCta.style.transform = 'translateY(20px)';
            }
        });

        stickyCta.addEventListener('click', () => {
            if (window.AnalyticsSystem) {
                window.AnalyticsSystem.trackEvent('CTA_click', { button: 'sticky_cta' });
            }
        });
    }


    // ==========================================
    // Quiz Logic
    // ==========================================
    const openQuizBtn = document.getElementById('open-quiz-btn');
    const quizModal = document.getElementById('quiz-modal');
    const quizAnswerBtns = document.querySelectorAll('.quiz-answer-btn');
    const quizQuestionContainer = document.getElementById('quiz-question-container');
    const quizResultContainer = document.getElementById('quiz-result-container');
    const quizRecommendation = document.getElementById('quiz-recommendation');

    const courseMap = {
        '1': {
            title: 'برنامج رحلة تعافي (Healing Journey)',
            desc: 'هذا البرنامج مصمم خصيصاً لمساعدتك على معالجة الصدمات النفسية، التحرر من أعباء الماضي، وإعادة بناء السلام الداخلي بخطوات عملية ومدروسة.'
        },
        '2': {
            title: 'دورة العلاج المعرفي السلوكي (CBT)',
            desc: 'العلاج المعرفي السلوكي (CBT) هو المعيار الذهبي عالمياً للتعامل مع التفكير المفرط، القلق، والاكتئاب. سيساعدك على تفكيك الأفكار السلبية وإعادة هيكلة طريقة تفكيرك.'
        },
        '3': {
            title: 'دورة العلاج الجدلي السلوكي (DBT)',
            desc: 'العلاج الجدلي السلوكي (DBT) هو الأقوى علمياً في علاج التقلبات المزاجية الحادة، الاندفاعية، وتطوير مهارات تنظيم المشاعر وبناء علاقات صحية.'
        },
        '4': {
            title: 'دورة اضطرابات الشخصية',
            desc: 'هذه الدورة ستوفر لك الفهم العميق للأنماط السلوكية المعقدة وتمنحك الأدوات اللازمة للتعامل مع سمات اضطرابات الشخصية بوعي واستقرار.'
        },
        '5': {
            title: 'دورة العلاج بالتقبل والالتزام (ACT)',
            desc: 'سيساعدك العلاج بالتقبل والالتزام (ACT) على التوقف عن محاربة مشاعرك، وزيادة المرونة النفسية، والتحرك نحو حياة مليئة بالمعنى والقيم الحقيقية.'
        },
        '6': {
            title: 'باقة العلاج الثلاثي المتكامل',
            desc: 'نظراً لأنك تواجه تحديات متعددة، فإن دمج تقنيات (CBT) و(DBT) و(ACT) سيمنحك أقوى الأدوات العلاجية المتاحة للوصول إلى الاتزان النفسي الشامل.'
        }
    };

    if (openQuizBtn && quizModal) {
        openQuizBtn.addEventListener('click', () => {
            quizQuestionContainer.style.display = 'block';
            quizResultContainer.style.display = 'none';
            quizModal.classList.add('active');
            if (window.AnalyticsSystem) window.AnalyticsSystem.trackEvent('quiz_started');
        });

        quizAnswerBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resultId = e.currentTarget.getAttribute('data-result');
                const resultData = courseMap[resultId] || courseMap['1'];
                
                quizRecommendation.textContent = resultData.title;
                document.getElementById('quiz-explanation').textContent = resultData.desc;
                
                quizQuestionContainer.style.display = 'none';
                quizResultContainer.style.display = 'block';
                
                if (window.AnalyticsSystem) window.AnalyticsSystem.trackEvent('quiz_completed', { recommended_course: resultId });
            });
        });
    }

    // ==========================================
    // Theme Toggle
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check local storage for theme preference, default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // ==========================================
    // Mobile Navigation
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    }

    mobileMenuBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // ==========================================
    // Scroll Animations (Intersection Observer)
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Optional: stop observing once animated
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });

    // ==========================================
    // Expertise Tabs
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });

    // ==========================================
    // Modals Handling (Course & Auth)
    // ==========================================
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close-modal');

    function closeAllModals() {
        modals.forEach(m => m.classList.remove('active'));
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    const courseModal = document.getElementById('course-modal');
    const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');
    
    // Use event delegation for dynamically loaded course buttons
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.subscribe-btn');
        if (!btn) return;

        // ── Enforce Login Before Purchase ──
        if (!getSessionUser()) {
            showToast('Please log in or create an account to purchase a course.', 'info');
            if (authModal) authModal.classList.add('active');
            return;
        }

        const courseCard = btn.closest('.course-card');
        if (courseCard && proceedCheckoutBtn) {
            const h3 = courseCard.querySelector('h3');
            let courseId = 'content';
            if (h3) {
                const fullText = h3.innerHTML.replace(/<br>.*$/i, '').trim();
                courseId = fullText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }
            // Try to get course_id from data attribute (set dynamically by fetchCourses)
            const dataCourseId = courseCard.getAttribute('data-course-slug');
            if (dataCourseId) courseId = dataCourseId;

            const price = courseCard.getAttribute('data-price') || '49';
            proceedCheckoutBtn.href = `checkout.html?course=${courseId}&price=${price}`;
            proceedCheckoutBtn.textContent = `Proceed to Checkout — $${price}`;
            
            if (window.AnalyticsSystem) {
                window.AnalyticsSystem.trackEvent(courseId === 'tri-therapy-bundle' ? 'bundle_view' : 'course_view', {
                    course: courseId, price
                });
            }
        }
        courseModal.classList.add('active');
    });

    // ==========================================
    // Auth View Switcher
    // ==========================================
    window.switchAuthView = function(view) {
        const views = ['auth-view-login','auth-view-forgot','auth-view-otp'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if (el) el.style.display = (v === `auth-view-${view}`) ? 'block' : 'none';
        });
        if (view === 'login') {
            const fa = document.getElementById('forgot-message-area');
            const ff = document.getElementById('forgot-form');
            if (fa) fa.innerHTML = '';
            if (ff) ff.reset();
        }
    };

    // ── Premium Tab Switcher (new auth modal) ──
    window.switchAuthTab = function(tab) {
        const loginTab = document.getElementById('tab-login');
        const signupTab = document.getElementById('tab-signup');
        const loginPanel = document.getElementById('login-panel');
        const signupPanel = document.getElementById('signup-panel');
        const title = document.getElementById('auth-modal-title');
        const subtitle = document.getElementById('auth-modal-subtitle');

        if (tab === 'login') {
            loginTab?.classList.add('active');
            signupTab?.classList.remove('active');
            if (loginPanel) loginPanel.style.display = 'block';
            if (signupPanel) signupPanel.style.display = 'none';
            if (title) title.textContent = 'Welcome Back';
            if (subtitle) subtitle.textContent = 'Sign in to access your courses and profile';
        } else {
            signupTab?.classList.add('active');
            loginTab?.classList.remove('active');
            if (signupPanel) signupPanel.style.display = 'block';
            if (loginPanel) loginPanel.style.display = 'none';
            if (title) title.textContent = 'Create Account';
            if (subtitle) subtitle.textContent = 'Join thousands of mental health professionals';
        }
    };

    // ── Premium Verification Countdown Timer ──
    let _countdownInterval = null;

    function startVerificationCountdown(seconds = 3600) {
        if (_countdownInterval) clearInterval(_countdownInterval);
        let remaining = seconds;

        const update = () => {
            const el = document.getElementById('verify-countdown');
            if (!el) { clearInterval(_countdownInterval); return; }
            const m = Math.floor(remaining / 60).toString().padStart(2, '0');
            const s = (remaining % 60).toString().padStart(2, '0');
            el.textContent = `${m}:${s}`;
            if (remaining <= 0) {
                clearInterval(_countdownInterval);
                el.textContent = 'Expired';
                el.style.color = '#ef4444';
                const resendBtn = document.getElementById('verify-resend-btn');
                if (resendBtn) { resendBtn.disabled = false; resendBtn.textContent = 'Resend (link expired)'; }
            }
            remaining--;
        };
        update();
        _countdownInterval = setInterval(update, 1000);
    }

    window.startVerificationCountdown = startVerificationCountdown;

    // ── Resend Verification Email ──
    window.resendVerification = async function() {
        const email = window._pendingVerifyEmail;
        const btn = document.getElementById('verify-resend-btn');
        if (!email || !btn) return;

        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                startVerificationCountdown(3600);
                btn.textContent = 'Email sent! Check your inbox.';
                setTimeout(() => { btn.disabled = false; btn.textContent = 'Resend verification email'; }, 30000);
            } else {
                btn.disabled = false;
                btn.textContent = 'Failed. Try again.';
            }
        } catch {
            btn.disabled = false;
            btn.textContent = 'Failed. Try again.';
        }
    };

    // ── Show verification overlay with countdown ──
    function showVerificationOverlay(email) {
        window._pendingVerifyEmail = email;
        const overlay = document.getElementById('check-email-modal');
        const emailText = document.getElementById('verify-email-text');
        if (overlay) overlay.style.display = 'flex';
        if (emailText) emailText.textContent = email;
        // Close auth modal
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.classList.remove('active');
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        startVerificationCountdown(3600);
    }

    window.showVerificationOverlay = showVerificationOverlay;

    window.toggleModalPw = function(inputId, btn) {
        const input = document.getElementById(inputId);
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'ph ph-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'ph ph-eye';
        }
    };

    // ==========================================
    // Auth & Login / Sign Up Logic
    // ==========================================
    const authModal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const loginPanel = document.getElementById('login-panel');
    const signupPanel = document.getElementById('signup-panel');
    const authButtonsDiv = document.getElementById('auth-buttons');
    const userProfileDiv = document.getElementById('user-profile');
    const userNameDisplay = document.getElementById('user-name-display');
    const logoutBtn = document.getElementById('logout-btn');
    const myCoursesBtn = document.getElementById('my-courses-nav-btn');

    // ==========================================
    // Toast Notification System
    // ==========================================
    function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        let icon = 'ph-info';
        if (type === 'success') icon = 'ph-check-circle';
        if (type === 'error') icon = 'ph-warning-circle';
        toast.innerHTML = `<i class="ph ${icon}" style="font-size: 1.25rem;"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3500);
    }
    window.showToast = showToast;

    // ── Show inline modal message ──
    function showModalMsg(areaId, msg, type = 'error') {
        const area = document.getElementById(areaId);
        if (!area) return;
        const icon = type === 'error' ? 'ph-warning-circle' : type === 'success' ? 'ph-check-circle' : 'ph-info';
        const bg   = type === 'error' ? 'rgba(239,68,68,0.1)' : type === 'success' ? 'rgba(20,184,166,0.1)' : 'rgba(59,130,246,0.1)';
        const col  = type === 'error' ? '#f87171' : type === 'success' ? 'var(--primary)' : '#60a5fa';
        area.innerHTML = `<div style="background:${bg};border:1px solid ${col};color:${col};padding:0.75rem 1rem;border-radius:8px;font-size:0.85rem;display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;"><i class='ph ${icon}'></i><span>${msg}</span></div>`;
    }

    // ==========================================
    // Backend API & Auth State Management
    // ==========================================
    const API_BASE_URL = 'https://drmarwa.onrender.com';
    
    // ── Check if user has any purchases → show My Courses btn everywhere ──
    async function checkAndShowMyCourses(token) {
        if (!token) return;

        // Check cache first (avoid unnecessary API call on every page load)
        const cached = localStorage.getItem('user_has_purchases');
        if (cached === 'true') {
            revealMyCoursesButtons();
            return;
        }
        if (cached === 'false') return; // Known non-buyer

        try {
            const res = await fetch(`${API_BASE_URL}/api/my-courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    localStorage.setItem('user_has_purchases', 'true');
                    revealMyCoursesButtons();
                } else {
                    localStorage.setItem('user_has_purchases', 'false');
                }
            }
        } catch { /* silent — fail gracefully */ }
    }

    function revealMyCoursesButtons() {
        // Desktop navbar button
        if (myCoursesBtn) myCoursesBtn.style.display = 'inline-flex';
        // Mobile menu link
        const mobileBtn = document.getElementById('mobile-my-courses');
        if (mobileBtn) mobileBtn.style.display = 'flex';
    }

    
    function updateUIForAuth(user) {
        if (user) {
            if (authButtonsDiv) authButtonsDiv.style.display = 'none';
            if (userProfileDiv) userProfileDiv.style.display = 'flex';
            const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
            if (userNameDisplay) userNameDisplay.textContent = 'Welcome, ' + displayName;
            if (authModal) authModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            // Show My Courses in nav + mobile menu if user has purchases
            const session = JSON.parse(localStorage.getItem('site_current_session') || 'null');
            if (session?.access_token) checkAndShowMyCourses(session.access_token);
            // Show/hide mobile menu items
            const mobileLogin = document.getElementById('mobile-login-btn');
            if (mobileLogin) mobileLogin.style.display = 'none';
        } else {
            if (authButtonsDiv) authButtonsDiv.style.display = 'block';
            if (userProfileDiv) userProfileDiv.style.display = 'none';
            if (myCoursesBtn) myCoursesBtn.style.display = 'none';
            const mobileMyCourses = document.getElementById('mobile-my-courses');
            if (mobileMyCourses) mobileMyCourses.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    function getSessionUser() {
        try {
            return JSON.parse(localStorage.getItem('site_current_user'));
        } catch { return null; }
    }

    function setSession(session, user) {
        if (user) {
            if (session) localStorage.setItem('site_current_session', JSON.stringify(session));
            localStorage.setItem('site_current_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('site_current_session');
            localStorage.removeItem('site_current_user');
        }
        updateUIForAuth(user);
    }

    // Check initial auth state on load
    const currentUser = getSessionUser();
    updateUIForAuth(currentUser);

    // Auto-open Auth Modal if redirected from checkout
    if (!currentUser && sessionStorage.getItem('intended_course')) {
        setTimeout(() => {
            const authModalObj = document.getElementById('auth-modal');
            if (authModalObj) authModalObj.classList.add('active');
            switchAuthTab('signup');
            showToast('Please create an account or log in to continue to checkout.', 'info');
        }, 500);
    }

    // Check if user was redirected from a locked course
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('locked')) {
        setTimeout(() => {
            showToast('You must purchase this course to access its contents.', 'error');
            // Clean up URL without reloading
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }, 500);
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            switchAuthView('login');
            if (authModal) authModal.classList.add('active');
        });
    }

    // Premium tab switching is now handled via switchAuthTab function.

    window.registerUser = async function() {
        const name     = document.getElementById('signup-name').value.trim();
        const email    = document.getElementById('signup-email').value.trim().toLowerCase();
        const password = document.getElementById('signup-password').value;
        const submitBtn = document.getElementById('signup-submit-btn') || document.querySelector('#signup-form button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="ph ph-circle-notch" style="animation:spin 0.8s linear infinite;"></i> Creating Account...';
        submitBtn.disabled = true;
        document.getElementById('signup-message-area').innerHTML = '';

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
            const data = await response.json();

            // ── Duplicate Account Detection ──
            const errMsg = (data.error || '').toLowerCase();
            const isExisting = !response.ok && (
                errMsg.includes('already registered') ||
                errMsg.includes('already exists') ||
                errMsg.includes('user already') ||
                errMsg.includes('email already') ||
                errMsg.includes('duplicate')
            );

            if (isExisting) {
                // Show premium 'Account Already Exists' modal then auto-login
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                const existsModal = document.getElementById('account-exists-modal');
                if (existsModal) existsModal.classList.add('active');

                // Auto-fill login and trigger after 2 seconds
                setTimeout(async () => {
                    if (existsModal) existsModal.classList.remove('active');
                    document.getElementById('login-email').value = email;
                    document.getElementById('login-password').value = password;
                    switchAuthTab('login');
                    await window.loginUser();
                }, 2200);
                return;
            }

            if (!response.ok) throw new Error(data.error || 'Failed to create account');

            // ── Notify Admin via Web3Forms ──
            try {
                const now = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kuwait' });
                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_key: '9d8affa7-79dd-41e4-a9d6-0587948e964f',
                        subject: '🆕 New User Registered — Dr. Marwa Platform',
                        from_name: 'Platform Notifications',
                        message: `New user registered:\n\nName: ${name || 'N/A'}\nEmail: ${email}\nTime: ${now} (Kuwait)`
                    })
                });
            } catch (e) { console.warn('Notification failed', e); }

            // Log in immediately if session exists
            const user   = data.session?.user || data.user;
            const session = data.session;
            if (session && user) {
                setSession(session, user);
                closeAllModals();
                const displayName = user.user_metadata?.name || name || email.split('@')[0];
                showToast(`Welcome, ${displayName}! Your account has been created. 🎉`, 'success');
            } else {
                // Email confirmation required — show premium verification overlay
                document.getElementById('signup-form').reset();
                showVerificationOverlay(email);
            }
            document.getElementById('signup-form').reset();
        } catch (error) {
            showModalMsg('signup-message-area', error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    };

    // ── OAuth Login (Google / Facebook) ──
    window.socialLogin = async function(provider) {
        try {
            // Show loading toast since redirect might take a second
            showToast('Connecting to ' + provider + '...', 'info');
            
            const redirectUrl = encodeURIComponent(window.location.origin + window.location.pathname);
            const res = await fetch(`${API_BASE_URL}/api/auth/oauth?provider=${provider}&redirect_to=${redirectUrl}`);
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to initialize OAuth');
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No redirect URL provided');
            }
        } catch (error) {
            console.error('Social login error:', error);
            showToast(error.message || 'Failed to connect with ' + provider, 'error');
        }
    };

    // ── Verify OTP code ──

    window.verifyOtp = async function() {
        const email = window._pendingOtpEmail;
        const token = document.getElementById('otp-input').value.trim();
        const btn = document.getElementById('otp-submit-btn');
        const originalHTML = btn.innerHTML;

        if (!email) return showModalMsg('otp-message-area', 'Session expired. Please sign up again.', 'error');
        if (!token || token.length < 6) return showModalMsg('otp-message-area', 'Please enter the 6-digit code from your email.', 'error');

        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Verifying...';
        document.getElementById('otp-message-area').innerHTML = '';

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Verification failed');

            setSession(data.session, data.user || data.session?.user);
            closeAllModals();
            showToast('Email verified! Welcome to the platform 🎉', 'success');
            window._pendingOtpEmail = null;
            if (document.getElementById('otp-input')) document.getElementById('otp-input').value = '';
        } catch(err) {
            showModalMsg('otp-message-area', err.message || 'Invalid code. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        }
    };

    window.loginUser = async function() {
        const email    = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const submitBtn = document.getElementById('login-submit-btn') || document.querySelector('#login-form button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="ph ph-circle-notch" style="animation:spin 0.8s linear infinite;"></i> Logging In...';
        submitBtn.disabled = true;
        document.getElementById('login-message-area').innerHTML = '';

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                // Friendly message for unconfirmed email
                if (data.error?.toLowerCase().includes('email not confirmed')) {
                    throw new Error('Please check your email and click the confirmation link first.');
                }
                throw new Error(data.error || 'Login failed');
            }
            if (data.session) {
                setSession(data.session, data.session.user);
                closeAllModals();
                showToast('Logged in successfully! Welcome back.', 'success');
                document.getElementById('login-form').reset();

                // Check if user came from checkout → redirect there
                const intendedCourse = sessionStorage.getItem('intended_course');
                if (intendedCourse) {
                    sessionStorage.removeItem('intended_course');
                    window.location.href = `checkout.html?course=${intendedCourse}`;
                }
            }
        } catch (error) {
            showModalMsg('login-message-area', error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    };

    // ── Forgot Password ──
    window.sendForgotPassword = async function() {
        const email = document.getElementById('forgot-email').value.trim().toLowerCase();
        const btn = document.getElementById('forgot-submit-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Sending...';
        btn.disabled = true;
        document.getElementById('forgot-message-area').innerHTML = '';

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            // Always show success (security: don't reveal if email exists)
            showModalMsg('forgot-message-area',
                '✉️ If this email is registered, a reset link has been sent. Check your inbox (and spam folder).',
                'success');
            document.getElementById('forgot-form').reset();
        } catch (err) {
            showModalMsg('forgot-message-area', 'Failed to send. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user_has_purchases'); // clear purchase cache
            setSession(null, null);
            showToast('Logged out successfully.', 'info');
        });
    }

    // ==========================================
    // Dynamic Sections Logic (Fetching from Backend)
    // ==========================================
    async function fetchSections() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/sections`);
            if (!response.ok) return; // Silent fail if backend is not ready
            const sections = await response.json();
            
            sections.forEach(section => {
                const sectionEl = document.getElementById(section.section_key);
                if (sectionEl && section.is_visible === false) {
                    sectionEl.style.display = 'none';
                    return;
                }
                
                const titleEl = document.getElementById(`${section.section_key}-title`);
                const subtitleEl = document.getElementById(`${section.section_key}-subtitle`);
                const contentEl = document.getElementById(`${section.section_key}-content`);
                
                if (titleEl && section.title) titleEl.innerHTML = section.title;
                if (subtitleEl && section.subtitle) subtitleEl.innerHTML = section.subtitle;
                if (contentEl && section.content) contentEl.innerHTML = section.content;
            });
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    }
    fetchSections();

    // ==========================================
    // Dynamic Blog Logic (Fetching from Backend)
    // ==========================================
    const blogPageContainer = document.getElementById('blog-page-posts-container');
    const homeBlogContainer = document.getElementById('blog-posts-container');
    
    if (blogPageContainer || homeBlogContainer) {
        async function fetchBlogPosts() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/posts`);
                if (!response.ok) throw new Error('Failed to fetch posts');
                const posts = await response.json();
                
                const containers = [];
                if (blogPageContainer) containers.push({ element: blogPageContainer, limit: 100 });
                if (homeBlogContainer) containers.push({ element: homeBlogContainer, limit: 3 });
                
                containers.forEach(({ element, limit }) => {
                    element.innerHTML = ''; // Clear loading state or static content
                    
                    if (!posts || posts.length === 0) {
                        element.innerHTML = '<p class="arabic-text medium text-center" style="grid-column: 1 / -1; color: var(--muted);">لا توجد مقالات حالياً.</p>';
                        return;
                    }
                    
                    posts.slice(0, limit).forEach(post => {
                        const article = document.createElement('article');
                        article.className = 'glass-card blog-card';
                        article.style.padding = '1.5rem';
                        article.style.display = 'flex';
                        article.style.flexDirection = 'column';
                        article.style.gap = '1rem';
                        
                        // Format date elegantly
                        const dateStr = post.date || post.created_at;
                        const dateObj = dateStr ? new Date(dateStr) : new Date();
                        const options = { year: 'numeric', month: 'long', day: 'numeric' };
                        const formattedDate = dateObj.toLocaleDateString('ar-EG', options);

                        // Prepare full content if it exists
                        const fullContentHtml = post.content ? `<div class="post-full-content arabic-text medium" style="display: none; line-height: 1.8; color: var(--text); margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem;">${post.content}</div>` : '';

                        article.innerHTML = `
                            <h3 class="arabic-text large" style="color: var(--primary);">${post.title || 'بدون عنوان'}</h3>
                            <span style="color: var(--muted); font-size: 0.85rem;">${formattedDate}</span>
                            <div class="post-content-area" style="flex-grow: 1;">
                                <p class="arabic-text medium post-excerpt" style="line-height: 1.8; color: var(--muted); margin: 0;">${post.excerpt || post.content || ''}</p>
                                ${fullContentHtml}
                            </div>
                            ${post.link ? `<a href="${post.link}" class="btn-outline arabic-text medium" style="align-self: flex-start; padding: 0.5rem 1rem; margin-top: auto;">اقرأ المزيد</a>` : 
                            (post.content ? `<button class="btn-outline arabic-text medium" style="align-self: flex-start; padding: 0.5rem 1rem; margin-top: auto; cursor: pointer;" onclick="const excerpt = this.previousElementSibling.querySelector('.post-excerpt'); const full = this.previousElementSibling.querySelector('.post-full-content'); if(full.style.display === 'none') { full.style.display = 'block'; excerpt.style.display = 'none'; this.textContent = 'إخفاء التفاصيل'; } else { full.style.display = 'none'; excerpt.style.display = 'block'; this.textContent = 'اقرأ المزيد'; }">اقرأ المزيد</button>` 
                            : '')}
                        `;
                        element.appendChild(article);
                    });
                });
            } catch (error) {
                console.error('Error fetching blog posts:', error);
                if (blogPageContainer) {
                    blogPageContainer.innerHTML = '<p class="arabic-text medium text-center" style="grid-column: 1 / -1; color: #ef4444;">عفواً، حدث خطأ أثناء جلب المقالات. يرجى المحاولة لاحقاً.</p>';
                }
                if (homeBlogContainer) {
                    homeBlogContainer.innerHTML = '<p class="arabic-text medium text-center" style="grid-column: 1 / -1; color: #ef4444;">عفواً، حدث خطأ أثناء جلب المقالات. يرجى المحاولة لاحقاً.</p>';
                }
            }
        }
        
        fetchBlogPosts();
    }

    // ==========================================
    // Dynamic Home Page Data (Courses & Testimonials)
    // ==========================================
    const homeCoursesContainer = document.getElementById('home-courses-container');
    const homeTestimonialsContainer = document.getElementById('home-testimonials-container');

    if (homeCoursesContainer) {
        async function fetchCourses() {
            // Slug map — maps DB id to checkout slug
            const SLUG_MAP = {
                1: 'tri-therapy-bundle', 2: 'cbt-course', 3: 'dbt-course',
                4: 'personality-disorders-course', 5: 'act-course', 6: 'healing-journey-program'
            };
            try {
                const response = await fetch(`${API_BASE_URL}/api/courses`);
                if (!response.ok) return; // Keep static fallback on non-200
                const courses = await response.json();

                // Only replace if we got real data (≥ 1 course)
                if (!courses || courses.length === 0) return;

                homeCoursesContainer.innerHTML = '';
                courses.forEach(course => {
                    const slug = SLUG_MAP[course.id] || course.id;
                    const card = document.createElement('div');
                    card.className = `course-card ${course.is_bundle ? 'bundle-card' : ''}`;
                    card.setAttribute('data-course-id', course.id);
                    card.setAttribute('data-price', course.price);
                    card.setAttribute('data-course-slug', slug);

                    if (course.is_bundle) {
                        card.style.border = '2px solid var(--primary)';
                        card.style.transform = 'scale(1.02)';
                        card.style.position = 'relative';
                    }

                    card.innerHTML = `
                        <div class="course-thumbnail" ${course.is_bundle ? 'style="overflow: hidden; border-radius: 12px 12px 0 0;"' : ''}>
                            <img src="${course.image_url || 'images/placeholder.jpg'}" alt="${course.title.replace(/<[^>]*>/g,'')}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="course-info">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                                <h3>${course.title}</h3>
                                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                                    ${course.original_price ? `<span class="strikethrough-price" style="text-decoration: line-through; color: var(--muted); font-size: 0.9rem;">$${course.original_price}</span>` : ''}
                                    <h3 style="color: var(--primary); white-space: nowrap; margin-top: 0;">$${course.price}</h3>
                                    ${course.discount_badge ? `<span class="discount-badge" style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-top: 4px; white-space: nowrap;">${course.discount_badge}</span>` : ''}
                                </div>
                            </div>
                            <p>${course.excerpt}<br><strong>Duration:</strong> ${course.duration || 'N/A'}</p>
                            <button class="${course.is_bundle ? 'btn-primary' : 'btn-outline'} subscribe-btn" ${course.is_bundle ? 'style="width: 100%; margin-top: 1rem;"' : ''}>
                                ${course.is_bundle ? 'Start Your Transformation' : 'Subscribe to Access'}
                            </button>
                        </div>
                    `;
                    homeCoursesContainer.appendChild(card);
                });
            } catch (error) {
                // API unreachable — static fallback already rendered, do nothing
                console.warn('[Courses] API unavailable, using static fallback:', error.message);
            }
        }
        fetchCourses();
    }

    if (homeTestimonialsContainer) {
        async function fetchTestimonials() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/testimonials`);
                const testimonials = await res.json();
                homeTestimonialsContainer.innerHTML = '';
                
                if(!testimonials || testimonials.length === 0) {
                    homeTestimonialsContainer.innerHTML = '<p class="text-center" style="grid-column: 1 / -1; color: var(--muted);">No testimonials yet.</p>';
                    return;
                }
                
                testimonials.forEach(t => {
                    const card = document.createElement('div');
                    card.className = 'glass-card';
                    card.style.padding = '2rem';
                    card.innerHTML = `
                        <div style="color: #f59e0b; margin-bottom: 1rem; font-size: 1.2rem;">${'★'.repeat(t.rating)}</div>
                        <p style="font-style: italic; margin-bottom: 1rem;">"${t.quote}"</p>
                        <h4 style="color: var(--primary);">- ${t.author}</h4>
                    `;
                    homeTestimonialsContainer.appendChild(card);
                });
            } catch (err) {
                console.error('Error fetching testimonials:', err);
            }
        }
        fetchTestimonials();
    }


    // ==========================================
    // Cookie Consent Banner Logic
    // ==========================================
    const consentBanner = document.getElementById('cookie-consent-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');

    if (consentBanner && acceptBtn && declineBtn) {
        const consentStatus = localStorage.getItem('cookie_consent');

        // Show banner if no consent status is found
        if (!consentStatus) {
            consentBanner.style.display = 'flex';
        } else if (consentStatus === 'granted') {
            // Update gtag if previously granted
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                });
            }
        }

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'granted');
            consentBanner.style.display = 'none';
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                });
            }
            showToast('Cookies accepted.', 'success');
        });

        declineBtn.addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'denied');
            consentBanner.style.display = 'none';
            showToast('Cookies declined.', 'info');
        });
    }

});
