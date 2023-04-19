import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'rozella30@ethereal.email',
      pass: 'gwpZ1CSCqSSGQMD5Fh'
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'xyz@xyz.com', // sender address
    to: to, // list of receivers
    subject: "Change password", // Subject line
    html,
  });

  console.log("Message sent: %s", info);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
