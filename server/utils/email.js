import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Configure transporter (Update .env with your credentials)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or 'zoho', or use host/port for others
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Pick Your Pickle" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};