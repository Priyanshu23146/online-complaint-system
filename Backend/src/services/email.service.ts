import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendComplaintNotification = async (
  email: string,
  complaintTitle: string,
  complaintId: number,
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Complaint Created: ${complaintTitle}`,
    html: `
      <h2>Your Complaint Has Been Registered</h2>
      <p><strong>Title:</strong> ${complaintTitle}</p>
      <p><strong>Complaint ID:</strong> #${complaintId}</p>
      <p>You can track your complaint status in your dashboard.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email error:", error);
  }
};

export const sendStatusUpdateEmail = async (
  email: string,
  complaintTitle: string,
  newStatus: string,
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Complaint Update: ${complaintTitle}`,
    html: `
      <h2>Your Complaint Status Updated</h2>
      <p><strong>Complaint:</strong> ${complaintTitle}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
      <p>Log in to see more details.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email error:", error);
  }
};
