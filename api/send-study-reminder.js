import nodemailer from 'nodemailer';

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send study reminder email
async function sendStudyReminder(email, userName) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '📚 Time to Study on Oafcodify!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 Study Reminder</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello ${userName},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">It's time to continue your learning journey on Oafcodify! Consistent practice is the key to mastering programming.</p>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #1976d2; margin: 0; font-weight: bold;">💡 Quick Tip:</p>
              <p style="color: #333; margin: 5px 0 0 0;">Even 15 minutes of daily practice can lead to significant improvement over time.</p>
            </div>
            <a href="${process.env.CLIENT_URL || 'https://your-app.vercel.app'}/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Continue Learning</a>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">Keep coding and never stop learning!</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">This is an automated reminder from Oafcodify.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Study reminder sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending study reminder:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, userName } = req.body;
    
    if (!email || !userName) {
      return res.status(400).json({ message: "Email and userName are required" });
    }

    const success = await sendStudyReminder(email, userName);
    
    if (success) {
      res.status(200).json({ message: "Study reminder sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send study reminder" });
    }
  } catch (error) {
    console.error("Error sending study reminder:", error);
    res.status(500).json({ message: "Failed to send study reminder" });
  }
}
