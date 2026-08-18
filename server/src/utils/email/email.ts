import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const getSender = () => {
    const defaultName = "ERPBugs LMS Team";
    const senderName = process.env.BREVO_SENDER_NAME || defaultName;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;

    return { name: senderName, email: senderEmail };
};

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to get logo URL (use your actual domain in production)
const getLogoUrl = () => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return `${clientUrl}/erp.png`;
};

// Enhanced professional email template wrapper with modern design
const getEmailTemplate = (content: string) => {
    const logoUrl = getLogoUrl();
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ERPBugs LMS</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                padding: 40px 20px;
                min-height: 100vh;
            }
            
            .email-wrapper {
                max-width: 640px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(8, 145, 178, 0.08), 0 10px 30px rgba(2, 132, 199, 0.06);
            }
            
            .email-header {
                background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%);
                padding: 60px 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .email-header::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -10%;
                width: 300px;
                height: 300px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50%;
            }
            
            .email-header::after {
                content: '';
                position: absolute;
                bottom: -30%;
                left: -5%;
                width: 200px;
                height: 200px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50%;
            }
            
            .email-header-content {
                position: relative;
                z-index: 1;
            }
            
            .email-logo {
                max-width: 140px;
                height: auto;
                margin-bottom: 20px;
                filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
            }
            
            .email-header h1 {
                font-family: 'Outfit', sans-serif;
                color: #ffffff;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: -0.8px;
                margin: 0;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .email-content {
                padding: 50px 40px;
            }
            
            .content-section {
                margin-bottom: 30px;
            }
            
            .content-icon-box {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .content-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%);
                border-radius: 20px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                box-shadow: 0 12px 30px rgba(8, 145, 178, 0.2);
                margin-bottom: 25px;
            }
            
            .content-icon.success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                box-shadow: 0 12px 30px rgba(16, 185, 129, 0.2);
            }
            
            .content-icon.warning {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                box-shadow: 0 12px 30px rgba(245, 158, 11, 0.2);
            }
            
            .content-icon.error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                box-shadow: 0 12px 30px rgba(239, 68, 68, 0.2);
            }
            
            .content-icon.purple {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                box-shadow: 0 12px 30px rgba(139, 92, 246, 0.2);
            }
            
            .section-title {
                font-family: 'Outfit', sans-serif;
                color: #0f172a;
                font-size: 26px;
                font-weight: 700;
                margin: 0 0 15px 0;
                letter-spacing: -0.5px;
            }
            
            .section-subtitle {
                color: #64748b;
                font-size: 16px;
                line-height: 1.6;
                margin: 0;
                font-weight: 500;
            }
            
            .highlight-box {
                background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
                border: 2px solid #0891b2;
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                margin: 30px 0;
                position: relative;
                overflow: hidden;
            }
            
            .highlight-box::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -10%;
                width: 150px;
                height: 150px;
                background: rgba(8, 145, 178, 0.05);
                border-radius: 50%;
            }
            
            .highlight-box-content {
                position: relative;
                z-index: 1;
            }
            
            .highlight-label {
                color: #0c4a6e;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                margin: 0 0 15px 0;
                display: block;
            }
            
            .otp-code {
                font-size: 48px;
                font-weight: 700;
                color: #0c4a6e;
                letter-spacing: 14px;
                font-family: 'Courier New', monospace;
                margin: 20px 0;
                font-variant-numeric: tabular-nums;
                word-spacing: 10px;
            }
            
            .highlight-text {
                color: #075985;
                font-size: 14px;
                margin: 15px 0 0 0;
            }
            
            .highlight-text strong {
                font-weight: 600;
            }
            
            .features-list {
                list-style: none;
                margin: 20px 0 0 0;
                padding: 0;
            }
            
            .features-list li {
                color: #475569;
                font-size: 15px;
                line-height: 1.8;
                padding: 12px 0;
                padding-left: 30px;
                position: relative;
                font-weight: 500;
            }
            
            .features-list li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #0891b2;
                font-weight: 700;
                font-size: 18px;
            }
            
            .alert-box {
                background: #f1f5f9;
                border-left: 4px solid #0891b2;
                border-radius: 12px;
                padding: 20px;
                margin-top: 30px;
            }
            
            .alert-box.warning {
                background: #fef3c7;
                border-left-color: #f59e0b;
            }
            
            .alert-box.error {
                background: #fee2e2;
                border-left-color: #ef4444;
            }
            
            .alert-text {
                color: #475569;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
            }
            
            .alert-box.warning .alert-text {
                color: #92400e;
            }
            
            .alert-box.error .alert-text {
                color: #7f1d1d;
            }
            
            .alert-text strong {
                font-weight: 600;
            }
            
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%);
                color: #ffffff;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 8px 20px rgba(8, 145, 178, 0.3);
                transition: all 0.3s ease;
                text-align: center;
                margin: 10px 5px;
            }
            
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 30px rgba(8, 145, 178, 0.4);
            }
            
            .cta-button.success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
            }
            
            .cta-button.success:hover {
                box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
            }
            
            .cta-button.warning {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
            }
            
            .cta-button.warning:hover {
                box-shadow: 0 12px 30px rgba(245, 158, 11, 0.4);
            }
            
            .cta-button.secondary {
                background: transparent;
                color: #0891b2;
                border: 2px solid #0891b2;
                box-shadow: none;
            }
            
            .cta-button.secondary:hover {
                background: rgba(8, 145, 178, 0.05);
            }
            
            .button-group {
                text-align: center;
                margin-top: 30px;
            }
            
            .gradient-box {
                background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                border-radius: 16px;
                padding: 40px;
                margin: 30px 0;
                text-align: center;
            }
            
            .gradient-box.success-light {
                background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            }
            
            .gradient-box.info-light {
                background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            }
            
            .gradient-box.purple-light {
                background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
            }
            
            .gradient-box h3 {
                font-family: 'Outfit', sans-serif;
                color: #065f46;
                font-size: 20px;
                font-weight: 600;
                margin: 0 0 15px 0;
            }
            
            .gradient-box.purple-light h3 {
                color: #5b21b6;
            }
            
            .gradient-box p {
                color: #065f46;
                font-size: 15px;
                line-height: 1.6;
                margin: 0 0 20px 0;
            }
            
            .gradient-box.purple-light p {
                color: #6d28d9;
            }
            
            .credentials-box {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 25px;
                margin: 20px 0;
                border: 1px solid #e2e8f0;
            }
            
            .credential-field {
                margin: 15px 0;
                text-align: left;
            }
            
            .credential-label {
                color: #64748b;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                display: block;
                margin-bottom: 8px;
            }
            
            .credential-value {
                color: #0f172a;
                font-size: 16px;
                font-weight: 700;
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
                word-break: break-all;
            }
            
            .email-footer {
                background-color: #f8fafc;
                padding: 40px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer-text {
                color: #64748b;
                font-size: 14px;
                line-height: 1.6;
                margin: 0 0 10px 0;
            }
            
            .footer-subtext {
                color: #94a3b8;
                font-size: 13px;
                line-height: 1.6;
                margin: 0;
            }
            
            .divider {
                height: 1px;
                background: #e2e8f0;
                margin: 30px 0;
            }
            
            .text-center {
                text-align: center;
            }
            
            .mt-30 {
                margin-top: 30px;
            }
            
            .mb-20 {
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0; padding: 0;">
            <tr>
                <td align="center" style="padding: 0;">
                    <div class="email-wrapper">
                        <!-- Header -->
                        <div class="email-header">
                            <div class="email-header-content">
                                <img src="${logoUrl}" alt="ERPBugs LMS Logo" class="email-logo" />
                                <h1>ERPBugs LMS</h1>
                            </div>
                        </div>
                        
                        <!-- Content -->
                        <div class="email-content">
                            ${content}
                        </div>
                        
                        <!-- Footer -->
                        <div class="email-footer">
                            <p class="footer-text">© ${new Date().getFullYear()} ERPBugs LMS. All rights reserved.</p>
                            <p class="footer-subtext">This is an automated email. Please do not reply to this message.</p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
    const content = `
        <div class="content-icon-box">
            <div class="content-icon">✓</div>
            <h2 class="section-title">Verify Your Email</h2>
            <p class="section-subtitle">Thank you for signing up! Please use the following OTP to verify your email address. This code will expire in <strong>10 minutes</strong>.</p>
        </div>
        
        <div class="highlight-box">
            <div class="highlight-box-content">
                <label class="highlight-label">Your Verification Code</label>
                <div class="otp-code">${otp}</div>
                <p class="highlight-text">Enter this code in your verification screen</p>
            </div>
        </div>
        
        <div class="alert-box warning">
            <p class="alert-text"><strong>🔒 Security Tip:</strong> If you didn't request this code, please ignore this email or contact our support team immediately. Never share this code with anyone.</p>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: "Verify Your Email - ERPBugs LMS",
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending OTP email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon">🎉</div>
            <h2 class="section-title">Welcome to ERPBugs LMS, ${name}!</h2>
            <p class="section-subtitle">Your email has been successfully verified. You're all set to start your learning journey!</p>
        </div>
        
        <div class="gradient-box success-light">
            <h3>What's Next?</h3>
            <p>Explore our comprehensive course library, learn from industry experts, and advance your career with hands-on projects and certifications.</p>
            <a href="${clientUrl}/dashboard" class="cta-button success">Start Learning Now →</a>
        </div>
        
        <div class="content-section">
            <h3 class="section-title" style="font-size: 18px; margin-top: 0;">Why Choose ERPBugs LMS?</h3>
            <ul class="features-list">
                <li>Expert-led courses from industry professionals</li>
                <li>Lifetime access to all course materials</li>
                <li>Hands-on projects and real-world applications</li>
                <li>Recognized certificates upon completion</li>
                <li>Flexible learning at your own pace</li>
            </ul>
        </div>
        
        <div class="alert-box">
            <p class="alert-text"><strong>💡 Pro Tip:</strong> Complete your profile to get personalized course recommendations tailored to your interests and goals.</p>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: "Welcome to ERPBugs LMS! 🎉",
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending welcome email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendForgetPasswordOTPEmail(email: string, otp: string): Promise<void> {
    const content = `
        <div class="content-icon-box">
            <div class="content-icon">🔐</div>
            <h2 class="section-title">Password Reset Request</h2>
            <p class="section-subtitle">We received a request to reset your password. Use the OTP below to verify your identity.</p>
        </div>
        
        <div class="highlight-box">
            <div class="highlight-box-content">
                <label class="highlight-label">Your Verification Code</label>
                <div class="otp-code">${otp}</div>
                <p class="highlight-text">This code will expire in <strong>10 minutes</strong></p>
            </div>
        </div>
        
        <div class="alert-box warning">
            <p class="alert-text"><strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email. Your account remains secure. Contact us if you have concerns.</p>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: "Password Reset Request - ERPBugs LMS",
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending password reset OTP via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendPasswordResetConfirmationEmail(email: string, name: string): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon success">✓</div>
            <h2 class="section-title">Password Reset Successful</h2>
            <p class="section-subtitle">Your password has been successfully reset, ${name}.</p>
        </div>
        
        <div class="gradient-box success-light">
            <p>Your account password was changed on <strong>${new Date().toLocaleString()}</strong>. If you didn't make this change, please contact our support team immediately.</p>
            <a href="${clientUrl}/login" class="cta-button success">Sign In to Your Account →</a>
        </div>
        
        <div class="alert-box warning">
            <p class="alert-text"><strong>🔒 Security Reminder:</strong> For your account's security, use a strong, unique password and enable two-factor authentication if available.</p>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: "Password Reset Confirmation - ERPBugs LMS",
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending password reset confirmation via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendUserCreatedEmail(
    email: string,
    name: string,
    password: string,
    role: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const roleDisplayName = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    const content = `
        <div class="content-icon-box">
            <div class="content-icon">👋</div>
            <h2 class="section-title">Welcome to ERPBugs LMS, ${name}!</h2>
            <p class="section-subtitle">Your account has been created successfully. You have been assigned the role of <strong>${roleDisplayName}</strong>.</p>
        </div>
        
        <div class="highlight-box">
            <div class="highlight-box-content">
                <label class="highlight-label">Your Login Credentials</label>
                <div class="credentials-box">
                    <div class="credential-field">
                        <span class="credential-label">Email</span>
                        <div class="credential-value">${email}</div>
                    </div>
                    <div class="credential-field">
                        <span class="credential-label">Password</span>
                        <div class="credential-value">${password}</div>
                    </div>
                </div>
                <p class="highlight-text">✓ Please change your password after first login for security.</p>
            </div>
        </div>
        
        <div class="gradient-box success-light">
            <h3>What's Next?</h3>
            <p>You can now log in to your account and start using the platform. Based on your role, you'll have access to different features.</p>
            <a href="${clientUrl}/login" class="cta-button success">Login to Your Account →</a>
        </div>
        
        <div class="alert-box warning">
            <p class="alert-text"><strong>⚠️ Security Reminder:</strong> This password was auto-generated. Change it immediately after your first login to ensure account security.</p>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Welcome to ERPBugs LMS - Your Account Has Been Created`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending user created email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

// ============================================
// WORKFLOW EMAIL FUNCTIONS
// ============================================

export async function sendCourseSubmittedEmail(
    email: string,
    name: string,
    courseTitle: string,
    courseId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon">📤</div>
            <h2 class="section-title">Course Submitted for Review</h2>
            <p class="section-subtitle">Hello ${name}, your course "<strong>${courseTitle}</strong>" has been successfully submitted for review.</p>
        </div>
        
        <div class="gradient-box info-light">
            <h3>What Happens Next?</h3>
            <p>Our moderation team will review your course content and get back to you soon.</p>
            <ul class="features-list" style="color: #075985;">
                <li>Review typically takes 24-48 hours</li>
                <li>You'll be notified of approval or required changes</li>
                <li>Track the status in your dashboard</li>
            </ul>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/contributor/courses" class="cta-button">View My Contributions →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Course Submitted: ${courseTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending course submitted email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendCourseSubmittedNotificationEmail(
    email: string,
    name: string,
    courseTitle: string,
    contributorName: string,
    courseId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon warning">🔔</div>
            <h2 class="section-title">New Course Submission</h2>
            <p class="section-subtitle">Hello ${name}, a new course "<strong>${courseTitle}</strong>" has been submitted by <strong>${contributorName}</strong> and requires your review.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 30px; margin: 30px 0;">
            <h3 style="font-family: 'Outfit', sans-serif; color: #92400e; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">Action Required</h3>
            <p style="color: #78350f; font-size: 15px; line-height: 1.6; margin: 0;">Please review the course content and either approve or reject it with appropriate feedback.</p>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/moderator/review?courseId=${courseId}" class="cta-button warning">Review Course Now →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Review Required: ${courseTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending course submitted notification via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendCourseApprovedEmail(
    email: string,
    name: string,
    courseTitle: string,
    courseId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon success">✓</div>
            <h2 class="section-title">Course Approved! 🎉</h2>
            <p class="section-subtitle">Congratulations ${name}! Your course "<strong>${courseTitle}</strong>" has been approved by our moderation team.</p>
        </div>
        
        <div class="gradient-box success-light">
            <h3>What's Next?</h3>
            <p>Your course is now ready for publishing. An administrator will review it and publish it to make it available to students.</p>
            <ul class="features-list" style="color: #065f46;">
                <li>Your course has been approved and is pending publication</li>
                <li>You'll be notified once it's published</li>
                <li>Track the status in your dashboard</li>
            </ul>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/contributor/courses" class="cta-button success">View My Contributions →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Course Approved: ${courseTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending course approved email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendCourseRejectedEmail(
    email: string,
    name: string,
    courseTitle: string,
    rejectionReason: string,
    courseId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon error">⚠️</div>
            <h2 class="section-title">Course Review Feedback</h2>
            <p class="section-subtitle">Hello ${name}, your course "<strong>${courseTitle}</strong>" requires some changes before it can be approved.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 16px; padding: 30px; margin: 30px 0;">
            <h3 style="font-family: 'Outfit', sans-serif; color: #991b1b; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Rejection Reason</h3>
            <div style="background-color: #ffffff; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px;">
                <p style="color: #7f1d1d; font-size: 15px; line-height: 1.8; white-space: pre-wrap; margin: 0;">${rejectionReason}</p>
            </div>
        </div>
        
        <div class="alert-box warning">
            <p class="alert-text"><strong>💡 Next Steps:</strong> Please review the feedback above, make the necessary changes, and resubmit your course for review.</p>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/contributor/courses" class="cta-button">Edit & Resubmit Course →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Course Review Feedback: ${courseTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending course rejected email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendCoursePublishedEmail(
    email: string,
    name: string,
    courseTitle: string,
    courseId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon purple">🚀</div>
            <h2 class="section-title">Course Published! 🎊</h2>
            <p class="section-subtitle">Congratulations ${name}! Your course "<strong>${courseTitle}</strong>" is now live and available to students.</p>
        </div>
        
        <div class="gradient-box purple-light">
            <h3>Your Course is Live!</h3>
            <p>Students can now discover, enroll, and learn from your course. Track engagement and performance metrics in your dashboard.</p>
            <ul class="features-list" style="color: #6d28d9;">
                <li>Your course is visible on the platform</li>
                <li>Students can enroll and start learning</li>
                <li>Track views, enrollments, and student progress</li>
            </ul>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/course/${courseId}" class="cta-button">View Course →</a>
            <a href="${clientUrl}/contributor/courses" class="cta-button secondary">My Dashboard →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Course Published: ${courseTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending course published email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendChapterSubmittedEmail(
    email: string,
    name: string,
    chapterTitle: string,
    courseTitle: string,
    chapterId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon">📤</div>
            <h2 class="section-title">Chapter Submitted for Review</h2>
            <p class="section-subtitle">Hello ${name}, your chapter "<strong>${chapterTitle}</strong>" from course "<strong>${courseTitle}</strong>" has been submitted for review.</p>
        </div>
        
        <div class="gradient-box info-light">
            <p>Our moderation team will review your chapter content. You'll receive an email notification once the review is complete.</p>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/contributor/courses" class="cta-button">View My Contributions →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Chapter Submitted: ${chapterTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending chapter submitted email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendChapterSubmittedNotificationEmail(
    email: string,
    name: string,
    chapterTitle: string,
    courseTitle: string,
    contributorName: string,
    chapterId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon warning">🔔</div>
            <h2 class="section-title">New Chapter Submission</h2>
            <p class="section-subtitle">Hello ${name}, a new chapter "<strong>${chapterTitle}</strong>" from course "<strong>${courseTitle}</strong>" has been submitted by <strong>${contributorName}</strong> and requires your review.</p>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/moderator/review?chapterId=${chapterId}" class="cta-button warning">Review Chapter Now →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Review Required: ${chapterTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending chapter submitted notification via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendChapterApprovedEmail(
    email: string,
    name: string,
    chapterTitle: string,
    courseTitle: string,
    chapterId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon success">✓</div>
            <h2 class="section-title">Chapter Approved! 🎉</h2>
            <p class="section-subtitle">Congratulations ${name}! Your chapter "<strong>${chapterTitle}</strong>" from course "<strong>${courseTitle}</strong>" has been approved.</p>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/contributor/courses" class="cta-button success">View My Contributions →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Chapter Approved: ${chapterTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending chapter approved email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendChapterRejectedEmail(
    email: string,
    name: string,
    chapterTitle: string,
    courseTitle: string,
    rejectionReason: string,
    chapterId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon error">⚠️</div>
            <h2 class="section-title">Chapter Review Feedback</h2>
            <p class="section-subtitle">Hello ${name}, your chapter "<strong>${chapterTitle}</strong>" from course "<strong>${courseTitle}</strong>" requires some changes.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 16px; padding: 30px; margin: 30px 0;">
            <h3 style="font-family: 'Outfit', sans-serif; color: #991b1b; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Rejection Reason</h3>
            <div style="background-color: #ffffff; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px;">
                <p style="color: #7f1d1d; font-size: 15px; line-height: 1.8; white-space: pre-wrap; margin: 0;">${rejectionReason}</p>
            </div>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/contributor/courses" class="cta-button">Edit & Resubmit Chapter →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Chapter Review Feedback: ${chapterTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending chapter rejected email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendLessonSubmittedEmail(
    email: string,
    name: string,
    lessonTitle: string,
    chapterTitle: string,
    lessonId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon">📤</div>
            <h2 class="section-title">Lesson Submitted for Review</h2>
            <p class="section-subtitle">Hello ${name}, your lesson "<strong>${lessonTitle}</strong>" from chapter "<strong>${chapterTitle}</strong>" has been submitted for review.</p>
        </div>
        
        <div class="gradient-box info-light">
            <p>Our moderation team will review your lesson content. You'll receive an email notification once the review is complete.</p>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/contributor/courses" class="cta-button">View My Contributions →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Lesson Submitted: ${lessonTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending lesson submitted email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendLessonSubmittedNotificationEmail(
    email: string,
    name: string,
    lessonTitle: string,
    chapterTitle: string,
    contributorName: string,
    lessonId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon warning">🔔</div>
            <h2 class="section-title">New Lesson Submission</h2>
            <p class="section-subtitle">Hello ${name}, a new lesson "<strong>${lessonTitle}</strong>" from chapter "<strong>${chapterTitle}</strong>" has been submitted by <strong>${contributorName}</strong> and requires your review.</p>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/moderator/review?lessonId=${lessonId}" class="cta-button warning">Review Lesson Now →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Review Required: ${lessonTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending lesson submitted notification via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendLessonApprovedEmail(
    email: string,
    name: string,
    lessonTitle: string,
    chapterTitle: string,
    lessonId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon success">✓</div>
            <h2 class="section-title">Lesson Approved! 🎉</h2>
            <p class="section-subtitle">Congratulations ${name}! Your lesson "<strong>${lessonTitle}</strong>" from chapter "<strong>${chapterTitle}</strong>" has been approved.</p>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/contributor/courses" class="cta-button success">View My Contributions →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Lesson Approved: ${lessonTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending lesson approved email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}

export async function sendLessonRejectedEmail(
    email: string,
    name: string,
    lessonTitle: string,
    chapterTitle: string,
    rejectionReason: string,
    lessonId: string
): Promise<void> {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const content = `
        <div class="content-icon-box">
            <div class="content-icon error">⚠️</div>
            <h2 class="section-title">Lesson Review Feedback</h2>
            <p class="section-subtitle">Hello ${name}, your lesson "<strong>${lessonTitle}</strong>" from chapter "<strong>${chapterTitle}</strong>" requires some changes.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 16px; padding: 30px; margin: 30px 0;">
            <h3 style="font-family: 'Outfit', sans-serif; color: #991b1b; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Rejection Reason</h3>
            <div style="background-color: #ffffff; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px;">
                <p style="color: #7f1d1d; font-size: 15px; line-height: 1.8; white-space: pre-wrap; margin: 0;">${rejectionReason}</p>
            </div>
        </div>
        
        <div class="button-group">
            <a href="${clientUrl}/contributor/courses" class="cta-button">Edit & Resubmit Lesson →</a>
        </div>
    `;

    const payload = {
        sender: getSender(),
        to: [{ email }],
        subject: `Lesson Review Feedback: ${lessonTitle} - ERPBugs LMS`,
        htmlContent: getEmailTemplate(content),
    };

    try {
        await axios.post(BREVO_API_URL, payload, {
            headers: {
                "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("[Error sending lesson rejected email via Brevo API]", error?.response?.data || error);
        throw error;
    }
}