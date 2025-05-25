const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Check if Gmail credentials are provided
      if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD ||
          process.env.EMAIL_USER === 'your-gmail@gmail.com' ||
          process.env.EMAIL_APP_PASSWORD === 'your-gmail-app-password-here') {
        throw new Error('Gmail credentials not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD in .env file');
      }

      // Create transporter using Gmail SMTP
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password (not regular password)
        },
        secure: true,
        port: 465,
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify the connection
      await this.transporter.verify();
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Email service initialized successfully with Gmail');
        console.log(`📧 Sending emails from: ${process.env.EMAIL_USER}`);
      }
    } catch (error) {
      console.error('❌ Gmail email service initialization failed:', error.message);

      // For development, create a test account if Gmail credentials are not available
      if (process.env.NODE_ENV !== 'production') {
        try {
          const testAccount = await nodemailer.createTestAccount();

          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });

          console.log('✅ Test email account created for development');
          console.log(`📧 Test email: ${testAccount.user}`);
          console.log('⚠️  Note: Emails will be sent to test account, not real recipients');
        } catch (testError) {
          console.error('❌ Failed to create test email account:', testError.message);
          console.log('🔧 Using development simulation mode...');

          // Create a mock transporter for development
          this.transporter = {
            sendMail: async (mailOptions) => {
              console.log('📧 [DEVELOPMENT MODE] Simulating email send...');
              console.log(`📤 To: ${mailOptions.to}`);
              console.log(`📋 Subject: ${mailOptions.subject}`);
              console.log('✅ Email simulation completed successfully');

              return {
                messageId: 'dev-' + Date.now(),
                response: 'Development mode - email simulated'
              };
            }
          };

          console.log('🔧 Gmail not configured, using development mode...');
          console.log('✅ Development email simulation ready');
          console.log('⚠️  Note: Emails are simulated in development mode');
        }
      } else {
        this.transporter = null;
      }
    }
  }

  async sendOTPEmail(email, otp) {
    if (!this.transporter) {
      throw new Error('Email service not initialized. Please check your email configuration.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email address format');
    }

    const mailOptions = {
      from: {
        name: 'PromptPix',
        address: process.env.EMAIL_USER || 'noreply@promptpix.com'
      },
      to: email,
      subject: '🔐 Your PromptPix Password Reset Code',
      html: this.generateOTPEmailTemplate(otp),
      text: this.generateOTPEmailText(otp)
    };

    try {
      console.log(`📤 Sending OTP email to ${email}...`);
      const info = await this.transporter.sendMail(mailOptions);

      // Log success
      console.log(`✅ OTP email sent successfully to ${email}`);
      console.log(`📧 Message ID: ${info.messageId}`);

      // For development, always show the OTP code in console
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔑 [DEVELOPMENT] OTP Code: ${otp}`);
        console.log('📋 Copy this code and use it in the password reset form');

        // For test accounts, log the preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`🔗 Preview URL: ${previewUrl}`);
          console.log('⚠️  This is a test email. Real users will not receive it.');
        }
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error(`❌ Failed to send OTP email to ${email}:`, error.message);

      // Provide more specific error messages
      if (error.code === 'EAUTH') {
        throw new Error('Email authentication failed. Please check your Gmail App Password.');
      } else if (error.code === 'ECONNECTION') {
        throw new Error('Failed to connect to email server. Please check your internet connection.');
      } else if (error.code === 'EMESSAGE') {
        throw new Error('Invalid email message format.');
      } else {
        throw new Error('Failed to send email. Please try again later or contact support.');
      }
    }
  }

  generateOTPEmailTemplate(otp) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PromptPix Password Reset</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #6750A4;
                margin-bottom: 10px;
            }
            .otp-code {
                background: linear-gradient(135deg, #6750A4 0%, #7F67BE 100%);
                color: white;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                text-align: center;
                padding: 20px;
                border-radius: 12px;
                margin: 30px 0;
                font-family: 'Courier New', monospace;
            }
            .instructions {
                background: #f0f0f0;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎨 PromptPix</div>
                <h1>Password Reset Request</h1>
            </div>

            <p>Hello,</p>

            <p>We received a request to reset your PromptPix account password. Use the verification code below to complete your password reset:</p>

            <div class="otp-code">${otp}</div>

            <div class="instructions">
                <h3>📋 How to use this code:</h3>
                <ol>
                    <li>Go back to the PromptPix password reset page</li>
                    <li>Enter this 6-digit code in the verification field</li>
                    <li>Create your new password</li>
                    <li>Click "Reset Password" to complete the process</li>
                </ol>
            </div>

            <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                    <li>This code expires in <strong>5 minutes</strong></li>
                    <li>Never share this code with anyone</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>For security, this code can only be used once</li>
                </ul>
            </div>

            <p>If you're having trouble with the password reset process, please contact our support team.</p>

            <div class="footer">
                <p>Best regards,<br>The PromptPix Team</p>
                <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateOTPEmailText(otp) {
    return `
PromptPix Password Reset

Hello,

We received a request to reset your PromptPix account password.

Your verification code is: ${otp}

How to use this code:
1. Go back to the PromptPix password reset page
2. Enter this 6-digit code in the verification field
3. Create your new password
4. Click "Reset Password" to complete the process

IMPORTANT SECURITY INFORMATION:
- This code expires in 5 minutes
- Never share this code with anyone
- If you didn't request this reset, please ignore this email
- For security, this code can only be used once

If you're having trouble with the password reset process, please contact our support team.

Best regards,
The PromptPix Team

This is an automated email. Please do not reply to this message.
    `;
  }
}

module.exports = new EmailService();
