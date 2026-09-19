const nodemailer = require('nodemailer');

/**
 * CombineTuition Email Notification Service
 * Powered by Nodemailer with resilient SMTP transport, fallback preview,
 * and role-customized welcome/greeting email templates.
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initTransporter();
  }

  /**
   * Initialize Nodemailer transport from environment variables.
   * Falls back gracefully to ethereal/mock transport in development if unconfigured.
   */
  initTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });
      this.isConfigured = true;
      console.log(`[EmailService] Configured live SMTP transport (${host}:${port}, user: ${user})`);
    } else {
      // In development or when credentials are not yet supplied, create a fallback json transport
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      this.isConfigured = false;
      console.log('[EmailService] SMTP credentials not provided in .env; running in local preview/mock mode.');
    }
  }

  /**
   * Verify SMTP connection status.
   */
  async verifyConnection() {
    if (!this.transporter || !this.isConfigured) {
      return { success: false, message: 'SMTP not configured. Running in preview mode.' };
    }
    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection verified successfully.' };
    } catch (err) {
      console.error('[EmailService] SMTP verification failed:', err.message);
      return { success: false, message: err.message };
    }
  }

  /**
   * Base email sender wrapper with safety error handling.
   */
  async sendMail(mailOptions) {
    try {
      const defaultFrom = process.env.EMAIL_FROM || '"CombineTuition Community" <no-reply@combinetution.com>';
      const finalOptions = {
        from: defaultFrom,
        ...mailOptions
      };

      const info = await this.transporter.sendMail(finalOptions);

      if (!this.isConfigured) {
        console.log(`[EmailService - DEV PREVIEW] Welcome email queued for ${mailOptions.to}:`);
        console.log(`[EmailService - DEV PREVIEW] Subject: ${mailOptions.subject}`);
        console.log(`[EmailService - DEV PREVIEW] Content summary: ${mailOptions.text ? mailOptions.text.substring(0, 150) + '...' : 'HTML template rendered'}`);
      } else {
        console.log(`[EmailService] Email successfully sent to ${mailOptions.to} (MessageId: ${info.messageId})`);
      }

      return { success: true, info };
    } catch (error) {
      console.error(`[EmailService] Failed to send email to ${mailOptions.to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build role-specific welcome email HTML and text.
   * @param {Object} user User object ({ name, email, role })
   */
  buildWelcomeEmail(user) {
    const role = (user.role || 'guardian').toLowerCase();
    const name = user.name || (role === 'tutor' ? 'Valued Educator' : 'Valued Member');
    const baseUrl = (process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const loginUrl = `${baseUrl}/login`;
    const currentYear = new Date().getFullYear();

    const isTutor = role === 'tutor';

    const roleTitle = isTutor ? 'Professional Educator & Tutor' : 'Guardian / Student';
    const badgeColor = isTutor ? '#10b981' : '#3b82f6';
    const badgeText = isTutor ? '🎓 Verified Educator Network' : '🌟 Welcome to the Community';

    const congratulationHeading = isTutor
      ? `Congratulations, ${name}! Welcome to Our Educator Community`
      : `Welcome to CombineTuition, ${name}!`;

    const openingMessage = isTutor
      ? `We are truly thrilled and honored to welcome you to our select educator network at <strong>CombineTuition</strong>. Congratulations on taking this exciting step to share your expertise, inspire young minds, and elevate the standard of private tuition in Bangladesh!`
      : `Congratulations on registering with <strong>CombineTuition</strong>! We are delighted to welcome you to our vibrant educational family. Whether you are seeking exceptional home tutors or tailored online mentorship, we are here to support your learning journey every step of the way.`;

    const appreciationStatement = isTutor
      ? `Our mission is built around dedicated teachers like you. Your commitment, academic knowledge, and passion for mentoring are what empower students to achieve their highest potential. We deeply appreciate you choosing CombineTuition as your professional teaching platform.`
      : `We understand that finding the ideal educator is one of the most vital decisions for every family. We deeply appreciate your trust in our platform and are committed to connecting you with verified, passionate tutors who make a genuine difference.`;

    const checklistItems = isTutor
      ? [
          {
            title: 'Complete Your Educator Profile',
            desc: 'Highlight your academic qualifications, institution, teaching subjects, and preferred tuition locations to attract top-tier students.'
          },
          {
            title: 'Explore Available Tuition Jobs',
            desc: 'Browse verified tuition requirements tailored to your preferred schedule, grade levels, and geographic zones.'
          },
          {
            title: 'Direct Coordinator Support',
            desc: 'Our dedicated tuition coordinators are available to assist you with class matches, guardian discussions, and verified agreements.'
          }
        ]
      : [
          {
            title: 'Post Your Tuition Requirements',
            desc: 'Tell us your student’s grade level, subject requirements, budget, and location to receive handpicked tutor matches within 24-48 hours.'
          },
          {
            title: 'Browse Verified Tutors',
            desc: 'Inspect detailed credentials, university backgrounds, and verified feedback from top educators across Dhaka and Bangladesh.'
          },
          {
            title: 'Dedicated Matching Coordinator',
            desc: 'Enjoy personalized assistance from our support team to schedule demo classes and ensure a seamless learning experience.'
          }
        ];

    const ctaText = isTutor ? 'Go to Tutor Dashboard' : 'Explore Platform & Find Tutors';
    const ctaUrl = isTutor ? `${baseUrl}/tutor-dashboard.html` : loginUrl;

    const checklistHtml = checklistItems
      .map(
        (item, index) => `
        <div style="margin-bottom: 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="top" style="padding-right: 14px;">
                <div style="background-color: #e0e7ff; color: #3730a3; font-weight: 700; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px;">${index + 1}</div>
              </td>
              <td valign="top">
                <div style="font-weight: 600; font-size: 15px; color: #1e293b; margin-bottom: 3px;">${item.title}</div>
                <div style="font-size: 13px; color: #64748b; line-height: 1.5;">${item.desc}</div>
              </td>
            </tr>
          </table>
        </div>`
      )
      .join('');

    const checklistText = checklistItems
      .map((item, index) => `${index + 1}. ${item.title}: ${item.desc}`)
      .join('\n');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${congratulationHeading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); padding: 40px 30px 30px 30px; text-align: center; color: #ffffff;">
              <table role="presentation" width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 8px 18px; border-radius: 9999px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid rgba(255, 255, 255, 0.25);">
                      ${badgeText}
                    </div>
                    <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 800; line-height: 1.3; color: #ffffff; letter-spacing: -0.5px;">
                      CombineTuition
                    </h1>
                    <p style="margin: 0; font-size: 15px; color: #dbeafe; font-weight: 500;">
                      Empowering Education & Connecting Excellence
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <!-- Warm Congratulations -->
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.35;">
                ${congratulationHeading}
              </h2>

              <p style="font-size: 15px; color: #334155; margin-bottom: 16px; line-height: 1.65;">
                ${openingMessage}
              </p>

              <!-- Appreciation Note Callout -->
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px 18px; border-radius: 0 10px 10px 0; margin-bottom: 26px;">
                <p style="margin: 0; font-size: 14px; color: #1e293b; font-style: italic; line-height: 1.6;">
                  "${appreciationStatement}"
                </p>
              </div>

              <!-- Quick Next Steps -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 28px;">
                <h3 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                  Getting Started with CombineTuition
                </h3>
                ${checklistHtml}
              </div>

              <!-- Primary Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                      ${ctaText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Support & Assistance -->
              <div style="background-color: #f1f5f9; padding: 14px 18px; border-radius: 10px; font-size: 13px; color: #475569; text-align: center;">
                Need any help getting started? Reach out to our community coordinators anytime at
                <a href="mailto:support@combinetution.com" style="color: #2563eb; font-weight: 600; text-decoration: underline;">support@combinetution.com</a>
                or visit our <a href="${baseUrl}/contact-coordinator.html" style="color: #2563eb; font-weight: 600;">Coordinator Help Desk</a>.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #64748b;">
                CombineTuition — Trusted Tuition & Educator Network
              </p>
              <p style="margin: 0 0 10px 0;">
                You received this email because you registered an account as a <strong>${roleTitle}</strong> on CombineTuition with email <em>${user.email}</em>.
              </p>
              <p style="margin: 0;">
                &copy; ${currentYear} CombineTuition. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `
=====================================================
${congratulationHeading}
=====================================================

Hello ${name},

${openingMessage.replace(/<[^>]*>?/gm, '')}

${appreciationStatement}

-----------------------------------------------------
GETTING STARTED WITH COMBINETUITION:
-----------------------------------------------------
${checklistText}

Get started right away by visiting your dashboard:
${ctaUrl}

Need assistance? Our coordinators are here for you:
Email: support@combinetution.com
Website: ${baseUrl}

Thank you for being an essential part of our educator community!

Warm regards,
The CombineTuition Team
© ${currentYear} CombineTuition. All rights reserved.
    `.trim();

    return {
      subject: isTutor
        ? `Welcome to the CombineTuition Educator Network, ${name}! 🎓`
        : `Welcome to CombineTuition, ${name}! 🌟`,
      html,
      text
    };
  }

  /**
   * Automatically dispatch welcome and greeting email upon successful user registration.
   * Safe and non-blocking: catches any errors internally so user registration is never interrupted.
   * @param {Object} user User object ({ id, name, email, role })
   * @returns {Promise<{ success: boolean, info?: any, error?: string }>}
   */
  async sendWelcomeEmail(user) {
    if (!user || !user.email) {
      console.warn('[EmailService] Skipped welcome email: missing user or email address.');
      return { success: false, error: 'No recipient email specified' };
    }

    try {
      const { subject, html, text } = this.buildWelcomeEmail(user);
      const result = await this.sendMail({
        to: user.email,
        subject,
        html,
        text
      });

      return result;
    } catch (err) {
      console.error('[EmailService] Unexpected error while sending welcome email:', err);
      return { success: false, error: err.message };
    }
  }
}

const emailService = new EmailService();
module.exports = emailService;
