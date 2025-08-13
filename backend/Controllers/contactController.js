import nodemailer from "nodemailer";

export const sendEmail = async (req, res) => {
    console.log("i am in the contact controller");
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or other SMTP service
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    // Send the email
    await transporter.sendMail({
    from: process.env.EMAIL_USER, // your Gmail
    replyTo: email,               // user's email
    to: process.env.EMAIL_USER,  // receiver
    subject: `Contact Form: ${name}`,
    text: message,
  });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
};
