// fix-auth-modal.js — fixes the OTP modal placement bug
const fs = require('fs');
const file = 'c:/Users/dell/Desktop/Website/index.html';
let html = fs.readFileSync(file, 'utf8');

// ── The OTP view block (currently inside course-modal) ──
const OTP_BLOCK = `            <!-- ── View: OTP Verification ── -->
            <div id="auth-view-otp" style="display:none;">
                <div style="text-align:center;margin-bottom:1.75rem;">
                    <div style="width:56px;height:56px;background:rgba(20,184,166,0.12);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
                        <i class="ph ph-envelope-open" style="font-size:1.6rem;color:var(--primary);"></i>
                    </div>
                    <h3 style="margin:0 0 0.5rem;">Check Your Email</h3>
                    <p style="color:var(--muted);font-size:0.85rem;margin:0;line-height:1.5;">We sent a confirmation link to<br><strong id="otp-email-display" style="color:var(--text);"></strong></p>
                </div>
                <div id="otp-message-area"></div>
                <div style="background:rgba(20,184,166,0.08);border:1px solid var(--primary);border-radius:10px;padding:1.25rem;text-align:center;margin-bottom:1rem;">
                    <i class="ph ph-envelope-open" style="font-size:2rem;color:var(--primary);display:block;margin-bottom:0.5rem;"></i>
                    <strong style="color:var(--primary);">Confirmation Email Sent!</strong>
                    <p style="margin:0.5rem 0 0;font-size:0.85rem;color:var(--muted);line-height:1.5;">
                        Click the link in your email to activate your account,<br>then come back and <strong>Log In</strong>.
                    </p>
                </div>
                <button onclick="switchAuthView('login')" class="btn-primary" style="width:100%;">
                    <i class="ph ph-sign-in"></i> Go to Login
                </button>
                <p style="text-align:center;font-size:0.78rem;color:var(--muted);margin-top:0.75rem;">
                    Didn't receive it? Check spam folder.
                </p>
            </div>`;

// 1. Remove the old OTP block from inside course-modal
const otpInCourseModal = /\s*<!-- ── View: OTP Verification ── -->[\s\S]*?<\/div>\s*\n\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*\n\s*<!-- Quiz Modal/;
if (otpInCourseModal.test(html)) {
    html = html.replace(otpInCourseModal, '\n\n        </div>\n    </div>\n\n    <!-- Quiz Modal');
    console.log('✅ Removed OTP from course-modal');
} else {
    console.log('⚠️  OTP in course-modal pattern not matched — trying alternative');
    // Alternative: find and remove auth-view-otp div that's NOT inside auth-modal
    html = html.replace(/[ \t]*<!-- ── View: OTP Verification ── -->\s*\n[\s\S]*?<\/div>\s*\n\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*\n\s*<!-- Quiz Modal/,
        '\n\n        </div>\n    </div>\n\n    <!-- Quiz Modal');
    console.log('✅ Removed OTP (alternative)');
}

// 2. Add OTP block inside auth-modal, before closing tags
// Find the closing of auth-view-forgot and insert OTP block after it
const AFTER_FORGOT = `            </div>\n\n        </div>\n    </div>\n\n    <!-- Course Modal -->`;
const WITH_OTP = `            </div>\n\n${OTP_BLOCK}\n\n        </div>\n    </div>\n\n    <!-- Course Modal -->`;

if (html.includes(AFTER_FORGOT)) {
    html = html.replace(AFTER_FORGOT, WITH_OTP);
    console.log('✅ Added OTP view inside auth-modal');
} else {
    console.log('❌ Could not find insertion point for OTP inside auth-modal');
}

fs.writeFileSync(file, html, 'utf8');
console.log('\nDone! Check index.html.');
