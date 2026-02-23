import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'jambrovic.nino@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || '',
  },
});

export async function sendVerificationEmail(to: string, code: string, firstName: string) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; font-size: 24px; font-weight: bold; padding: 12px 24px; border-radius: 12px; letter-spacing: -0.5px;">
          LinkedWeldJobs
        </div>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
        <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #1e293b;">Welcome, ${firstName}!</h2>
        <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px;">Verify your email to start browsing welding jobs across Europe.</p>
        <div style="background: linear-gradient(135deg, #eff6ff, #ecfeff); border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
          <p style="margin: 0; font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: monospace;">${code}</p>
        </div>
        <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">This code expires in 30 minutes. If you didn't create this account, you can ignore this email.</p>
      </div>
      <p style="text-align: center; margin: 16px 0 0 0; color: #94a3b8; font-size: 11px;">&copy; ${new Date().getFullYear()} LinkedWeldJobs</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"LinkedWeldJobs" <${process.env.GMAIL_USER || 'jambrovic.nino@gmail.com'}>`,
      to,
      subject: `${code} — Verify your LinkedWeldJobs account`,
      html,
    });
    console.log(`Verification email sent to ${to}`);
    return true;
  } catch (error: any) {
    console.error('Failed to send verification email:', error.message);
    return false;
  }
}
