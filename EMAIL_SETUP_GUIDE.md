# Email Setup Guide for PromptPix

This guide will help you configure real email sending for the PromptPix password reset functionality using Gmail.

## Prerequisites

- A Gmail account (peacemusic80@gmail.com is already configured in the .env file)
- 2-Factor Authentication enabled on your Gmail account

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2-Factor Authentication if not already enabled

## Step 2: Generate Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "App passwords"
4. You may need to sign in again
5. Select "Mail" for the app and "Other (Custom name)" for the device
6. Enter "PromptPix" as the custom name
7. Click "Generate"
8. Copy the 16-character app password (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Update Environment Variables

1. Open the `server/.env` file
2. Replace `your-gmail-app-password-here` with the app password you generated:
   ```
   EMAIL_APP_PASSWORD=abcdefghijklmnop
   ```
   (Remove the spaces from the app password)

## Step 4: Test the Configuration

1. Start the PromptPix server:
   ```bash
   cd server
   npm run dev
   ```

2. Check the console output for:
   ```
   ✅ Email service initialized successfully with Gmail
   📧 Sending emails from: peacemusic80@gmail.com
   ```

3. Test the forgot password functionality:
   - Go to Settings → Forgot Password
   - Enter a valid Gmail address
   - Click "Send 6-Digit OTP"
   - Check the recipient's Gmail inbox (and spam folder)

## Troubleshooting

### Error: "Gmail credentials not configured"
- Make sure you've set both `EMAIL_USER` and `EMAIL_APP_PASSWORD` in the .env file
- Ensure the values are not the placeholder values

### Error: "Email authentication failed"
- Double-check your Gmail App Password
- Make sure you're using an App Password, not your regular Gmail password
- Ensure 2-Factor Authentication is enabled on your Gmail account

### Error: "Failed to connect to email server"
- Check your internet connection
- Verify that Gmail SMTP is not blocked by your firewall

### Emails not being received
- Check the spam/junk folder
- Verify the recipient email address is correct
- Check the server console for successful sending logs

## Security Notes

- Never share your Gmail App Password
- The App Password is specific to this application
- You can revoke the App Password anytime from your Google Account settings
- The OTP codes expire in 5 minutes for security
- Each OTP code can only be used once

## Production Deployment

When deploying to production:
1. Set `NODE_ENV=production` in your environment
2. Ensure your Gmail App Password is securely stored
3. Consider using environment variable management services
4. Monitor email sending logs for any issues

## Support

If you encounter issues:
1. Check the server console logs for detailed error messages
2. Verify your Gmail account settings
3. Test with a different email address
4. Contact support if problems persist
