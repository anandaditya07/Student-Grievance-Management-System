// ===== Email Notification Utility =====
const nodemailer = require('nodemailer');

// Create transporter (configure via .env)
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

/**
 * Send email notification when grievance is submitted
 */
exports.sendGrievanceSubmitted = async (grievance) => {
  // Skip if SMTP not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email] SMTP not configured — skipping email notification');
    return;
  }

  try {
    const mailOptions = {
      from: `"Grievance System" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: grievance.student_email,
      subject: `Grievance Submitted — ${grievance.ticket_id}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Grievance Submitted</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #94a3b8; margin-bottom: 16px;">Your grievance has been registered successfully.</p>
            <div style="background: #151b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Ticket ID</td><td style="padding: 6px 0; color: #a5b4fc; font-weight: 600;">${grievance.ticket_id}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Title</td><td style="padding: 6px 0; color: #e2e8f0;">${grievance.title}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Category</td><td style="padding: 6px 0; color: #e2e8f0;">${grievance.category}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Priority</td><td style="padding: 6px 0; color: #e2e8f0;">${grievance.priority}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Status</td><td style="padding: 6px 0; color: #f59e0b;">Pending</td></tr>
              </table>
            </div>
            <p style="color: #64748b; font-size: 13px;">You can track the status of your grievance by logging in to your dashboard.</p>
          </div>
        </div>
      `
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`[Email] Grievance submitted notification sent to ${grievance.student_email}`);

  } catch (err) {
    console.error('[Email] Failed to send submitted notification:', err.message);
  }
};

/**
 * Send email notification when grievance status changes
 */
exports.sendStatusChanged = async (grievance, newStatus) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email] SMTP not configured — skipping email notification');
    return;
  }

  try {
    const statusColors = {
      'Pending': '#f59e0b',
      'In Progress': '#3b82f6',
      'Resolved': '#10b981',
      'Rejected': '#ef4444'
    };

    const statusColor = statusColors[newStatus] || '#94a3b8';

    const mailOptions = {
      from: `"Grievance System" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: grievance.student_email,
      subject: `Grievance ${newStatus} — ${grievance.ticket_id}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Grievance Status Updated</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #94a3b8; margin-bottom: 16px;">The status of your grievance has been updated.</p>
            <div style="background: #151b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Ticket ID</td><td style="padding: 6px 0; color: #a5b4fc; font-weight: 600;">${grievance.ticket_id}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Title</td><td style="padding: 6px 0; color: #e2e8f0;">${grievance.title}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">New Status</td><td style="padding: 6px 0; color: ${statusColor}; font-weight: 600;">${newStatus}</td></tr>
              </table>
            </div>
            ${grievance.admin_response ? `
              <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Admin Response</p>
                <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 6px; padding: 12px; color: #a5b4fc; font-size: 14px;">
                  ${grievance.admin_response}
                </div>
              </div>
            ` : ''}
            <p style="color: #64748b; font-size: 13px;">Log in to your dashboard to view more details.</p>
          </div>
        </div>
      `
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`[Email] Status changed notification sent to ${grievance.student_email}`);

  } catch (err) {
    console.error('[Email] Failed to send status notification:', err.message);
  }
};
