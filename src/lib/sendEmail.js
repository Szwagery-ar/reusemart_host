import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,          
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

export async function sendEmail(to, subject, content) {
  if (typeof content !== 'string') {
    throw new Error('Content harus berupa string');
  }

  let mailOptions = {
    from: `"Reusemart" <${process.env.GMAIL_USER}>`,
    to,
    subject,
  };

  if (/<[a-z][\s\S]*>/i.test(content)) {
    mailOptions.html = content; 
  } else {
    mailOptions.text = content; 
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email berhasil dikirim ke:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}
