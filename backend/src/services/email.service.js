/**
 * Email Service
 * Handles all email sending operations
 */
const { getTransporter } = require('../lib/email-transporter');
const config = require('../config/env');
const logger = require('../utils/logger');

class EmailService {
  /**
   * Send EOI email to candidate
   */
  async sendEOIEmail(
    candidateEmail,
    candidateName,
    referrerName,
    referrerCompany,
    referrerEmail,
    referrerRole,
    referrerLinkedIn,
    referrerPhoneNumber,
    targetRoles,
    primarySkills,
    requestId = null
  ) {
    const emailTransporter = getTransporter();

    if (!emailTransporter) {
      logger.warn(requestId, `[Email disabled] Cannot send EOI email to: ${candidateEmail} - Email not configured`);
      return;
    }

    // Log email attempt
    logger.info(requestId, `[Email] Attempting to send EOI email to: ${candidateEmail}`);

    const subject = `${referrerName} from ${referrerCompany} - Referral Opportunity`;

    // Opening message for referral introduction
    const openingMessage = `You are being referred for an opportunity at ${referrerCompany}.`;
    const introMessage = `A professional from ${referrerCompany} has reviewed your profile and would like to connect with you to discuss a potential referral.`;

    // Optional fields - only render if present
    const rolesList = targetRoles && targetRoles.length > 0
      ? `<ul style="margin: 5px 0; padding-left: 20px;">${targetRoles.map(role => `<li>${role}</li>`).join('')}</ul>`
      : '';

    const skillsList = primarySkills && primarySkills.length > 0
      ? `<ul style="margin: 5px 0; padding-left: 20px;">${primarySkills.map(skill => `<li>${skill}</li>`).join('')}</ul>`
      : '';

    // Phone and LinkedIn sections are now handled inline in the HTML template
    const phoneSection = referrerPhoneNumber;
    const linkedinSection = referrerLinkedIn;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Referral Opportunity</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <!-- Greeting -->
                    <p style="margin: 0 0 24px 0; font-size: 18px; line-height: 1.6; color: #1a202c; font-weight: 500;">Hello ${candidateName},</p>
                    
                    <!-- Opening Message -->
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.7; color: #2d3748;">${openingMessage}</p>
                    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.7; color: #4a5568;">${introMessage}</p>
                    
                    <!-- Referrer Details Card -->
                    <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 28px; margin: 32px 0; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                      <h2 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 700; color: #667eea; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;">Referrer Details</h2>
                      <div style="background-color: #ffffff; border-radius: 10px; padding: 24px;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                              <span style="display: inline-block; min-width: 90px; font-size: 14px; font-weight: 600; color: #64748b;">Name:</span>
                              <span style="font-size: 15px; color: #1e293b; font-weight: 500;">${referrerName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                              <span style="display: inline-block; min-width: 90px; font-size: 14px; font-weight: 600; color: #64748b;">Company:</span>
                              <span style="font-size: 15px; color: #1e293b; font-weight: 600;">${referrerCompany}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                              <span style="display: inline-block; min-width: 90px; font-size: 14px; font-weight: 600; color: #64748b;">Role:</span>
                              <span style="font-size: 15px; color: #1e293b;">${referrerRole}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                              <span style="display: inline-block; min-width: 90px; font-size: 14px; font-weight: 600; color: #64748b;">Email:</span>
                              <a href="mailto:${referrerEmail}" style="font-size: 15px; color: #667eea; text-decoration: none; font-weight: 500;">${referrerEmail}</a>
                            </td>
                          </tr>
                          ${phoneSection ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><span style="display: inline-block; min-width: 90px; font-size: 14px; font-weight: 600; color: #64748b;">Phone:</span><a href="tel:${referrerPhoneNumber.replace(/\s/g, '')}" style="font-size: 15px; color: #667eea; text-decoration: none; font-weight: 500;">${referrerPhoneNumber}</a></td></tr>` : ''}
                          ${linkedinSection ? `<tr><td style="padding: 10px 0;"><span style="display: inline-block; min-width: 90px; font-size: 14px; font-weight: 600; color: #64748b;">LinkedIn:</span><a href="${referrerLinkedIn}" style="font-size: 15px; color: #667eea; text-decoration: none; font-weight: 500;">${referrerLinkedIn}</a></td></tr>` : ''}
                        </table>
                      </div>
                    </div>

                    <!-- Why Considered Section (only if skills/roles present) -->
                    ${(rolesList || skillsList) ? `
                    <div style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 12px; padding: 24px; margin: 28px 0; border-left: 4px solid #667eea;">
                      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #4338ca;">Why you are being considered</h3>
                      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #4c1d95;">Your profile aligns well with the following role and skill requirements:</p>
                      ${rolesList ? `<div style="margin-bottom: 16px;"><p style="margin: 0 0 10px 0; font-weight: 600; color: #4c1d95; font-size: 14px;">Role:</p>${rolesList}</div>` : ''}
                      ${skillsList ? `<div><p style="margin: 0 0 10px 0; font-weight: 600; color: #4c1d95; font-size: 14px;">Relevant Skills:</p>${skillsList}</div>` : ''}
                    </div>
                    ` : ''}

                    <!-- CTA Section -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 28px 0; border-left: 4px solid #f59e0b;">
                      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #92400e;">Next steps:</h3>
                      <p style="margin: 0; line-height: 1.7; color: #78350f; font-size: 15px;">If you are interested, please connect directly with the referrer using the contact details provided above.</p>
                    </div>

                    <!-- Disclaimer -->
                    <div style="margin-top: 40px; padding-top: 24px; border-top: 2px solid #e2e8f0;">
                      <p style="margin: 0 0 12px 0; font-weight: 700; color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Disclaimer</p>
                      <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 13px; line-height: 1.8;">
                        <li style="margin-bottom: 8px;">This message is an introduction for referral discussion only.</li>
                        <li style="margin-bottom: 8px;">Engagement is optional and based on mutual interest.</li>
                        <li>Please communicate respectfully and professionally.</li>
                      </ul>
                    </div>

                    <!-- Footer -->
                    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="margin: 0; color: #94a3b8; font-size: 14px;">Best regards,<br><span style="color: #667eea; font-weight: 600; font-size: 15px;">Referral Discovery Portal</span></p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const rolesText = targetRoles && targetRoles.length > 0
      ? targetRoles.join(', ')
      : '';

    const skillsText = primarySkills && primarySkills.length > 0
      ? primarySkills.join(', ')
      : '';

    const linkedinText = referrerLinkedIn ? `LinkedIn: ${referrerLinkedIn}\n` : '';
    const phoneText = referrerPhoneNumber ? `Phone: ${referrerPhoneNumber}\n` : '';

    const profileSection = (rolesText || skillsText)
      ? `\nWhy you are being considered\n\nYour profile aligns well with the following role and skill requirements:\n\n${rolesText ? `Role: ${rolesText}\n` : ''}${skillsText ? `Relevant Skills: ${skillsText}\n` : ''}`
      : '';

    const text = `
Referral opportunity at ${referrerCompany}

Hello ${candidateName},

${openingMessage}

${introMessage}

Referrer Details:
Name: ${referrerName}
Company: ${referrerCompany}
Role: ${referrerRole}
Email: ${referrerEmail}
${phoneText}${linkedinText}${profileSection}
Next steps:
If you are interested, please connect directly with the referrer using the contact details provided above.

Disclaimer:
- This message is an introduction for referral discussion only.
- Engagement is optional and based on mutual interest.
- Please communicate respectfully and professionally.

Best regards,
Referral Discovery Portal
    `;

    try {
      const fromEmail = config.email.from.includes('<') 
        ? config.email.from.match(/<(.+?)>/)?.[1] || config.email.from
        : config.email.from;
      const fromDomain = fromEmail.split('@')[1] || 'referral-portal.com';
      
      const info = await emailTransporter.sendMail({
        from: config.email.from,
        replyTo: referrerEmail,
        to: candidateEmail,
        subject: subject,
        text: text,
        html: html,
        headers: {
          'Message-ID': `<${Date.now()}-${Math.random().toString(36).substring(7)}@${fromDomain}>`,
          'X-Mailer': 'Referral Discovery Portal',
          'X-Priority': '1',
        },
      });

      logger.info(requestId, `[Email] Successfully sent EOI email to ${candidateEmail}`, {
        messageId: info.messageId,
        response: info.response,
      });
      return info;
    } catch (error) {
      // Log full error details for debugging
      const errorDetails = {
        message: error.message,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
      };

      // If SendGrid error, log response body for better debugging
      if (error.response?.body?.errors) {
        errorDetails.sendGridErrors = error.response.body.errors;
      }

      logger.error(requestId, `[Email] Failed to send EOI email to ${candidateEmail}:`, errorDetails);
      throw error;
    }
  }

  /**
   * Send admin notification for EOI
   */
  async sendAdminEOINotification(
    referrerName,
    referrerEmail,
    referrerCompany,
    referrerRole,
    candidateNames,
    candidateIds,
    requestId = null
  ) {
    const emailTransporter = getTransporter();

    if (!emailTransporter) {
      logger.warn(requestId, '[Email disabled] Cannot send admin notification - Email not configured');
      return;
    }

    const adminEmail = config.email.admin;
    if (!adminEmail) {
      logger.warn(requestId, 'ADMIN_EMAIL not configured. Skipping admin notification.');
      return;
    }

    // Log email attempt
    logger.info(requestId, `[Email] Attempting to send admin notification to: ${adminEmail}`);

    const subject = `EOI Notification: ${referrerName} sent interest to ${candidateNames.length} candidate(s)`;

    const candidateList = candidateNames.map((name, idx) =>
      `- ${name} (ID: ${candidateIds[idx]})`
    ).join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">EOI Notification</h2>
        <p>A new Expression of Interest has been sent.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Referrer:</strong> ${referrerName}</p>
          <p><strong>Email:</strong> ${referrerEmail}</p>
          <p><strong>Company:</strong> ${referrerCompany}</p>
          <p><strong>Role:</strong> ${referrerRole}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div style="margin: 15px 0;">
          <p><strong>Candidates (${candidateNames.length}):</strong></p>
          <pre style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${candidateList}</pre>
        </div>
      </div>
    `;

    const text = `
EOI Notification

A new Expression of Interest has been sent.

Referrer: ${referrerName}
Email: ${referrerEmail}
Company: ${referrerCompany}
Role: ${referrerRole}
Timestamp: ${new Date().toLocaleString()}

Candidates (${candidateNames.length}):
${candidateList}
    `;

    try {
      const info = await emailTransporter.sendMail({
        from: config.email.from,
        to: adminEmail,
        subject: subject,
        text: text,
        html: html,
      });

      logger.info(requestId, '[Email] Successfully sent admin notification', {
        messageId: info.messageId,
        response: info.response,
      });
      return info;
    } catch (error) {
      // Log full error details for debugging
      logger.error(requestId, '[Email] Failed to send admin notification:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
      throw error;
    }
  }
}

module.exports = new EmailService();

