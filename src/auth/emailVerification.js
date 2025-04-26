import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/sendEmail'; 

export async function registerUser(userEmail, userId) {
  const token = jwt.sign(
    { id: userId, email: userEmail },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}`;

  await sendEmail(
    userEmail,
    'Verifikasi Email Anda',
    `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Selamat Datang di Reusemart!</h2>
        <p>Silakan klik tombol di bawah untuk verifikasi email Anda:</p>
        <a href="${verificationLink}" style="padding: 10px 20px; background-color: #220593; color: #ffffff; text-decoration: none; border-radius: 5px;">
          Verifikasi Email
        </a>
        <p>Link ini hanya berlaku selama 1 jam.</p>
      </div>
    `
  );
}

export async function verifyTokenAndUpdate(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; 
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
