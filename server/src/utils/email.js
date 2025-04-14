const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create a test account if we're in development
    let transporter;
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating test email account...');
      try {
        const testAccount = await nodemailer.createTestAccount();
        console.log('Test account created successfully:', {
          user: testAccount.user,
          pass: testAccount.pass
        });
      
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (testAccountError) {
        console.error('Failed to create test account:', testAccountError);
        
        // Fallback to a predefined Ethereal account
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'eleanore.kris@ethereal.email',
            pass: 'UYyFwF5cPNrNm4Yv1p'
          },
        });
        console.log('Using fallback test account');
      }
    } else {
      // Validate production email configuration
      if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        throw new Error('Email configuration is incomplete. Please check EMAIL_SERVICE, EMAIL_USERNAME, and EMAIL_PASSWORD environment variables.');
      }

      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    try {
      // Verify transporter configuration
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      throw verifyError;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Git Mastery <noreply@gitmastery.com>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    console.log('Attempting to send email with options:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      from: mailOptions.from
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL:', previewUrl);
    }

    return info;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      stack: error.stack,
      options: {
        to: options.email,
        subject: options.subject
      }
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail; 