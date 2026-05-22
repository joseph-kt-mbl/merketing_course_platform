

import nodemailer from "nodemailer"

// const transporter = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "c37fde5dc24fbf",
//       pass: "7a4910f2ff3ecf",
//     },
//   });

const transporter = nodemailer.createTransport({
  // host: "127.0.0.1",
  host:"host.docker.internal",
  port: 1025,
  secure: false, 
});

  
const sendEmail = async (email,message , html) => {
    const info = await transporter.sendMail({
      from: 'youcefabdellaouidev@gmail.com',
      to: email,
      subject: message,
      html,
    });
    console.log("Message sent:", info.messageId);
    return info
}

export default sendEmail

