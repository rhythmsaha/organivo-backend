import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

class NodeMailer {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: "organivo@rhythmsaha.dev",
        pass: "g6&nwDsn",
      },
    });
  }

  async sendMail(to: string, subject: string, text: string = "", html: string) {
    const info = await this.transporter.sendMail({
      from: '"Organivo" <organivo@rhythmsaha.dev>',
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
  }

  async sendVerificationEmail({ code, name, to }: { to: string; code: string; name: string }) {
    const templatePath = path.join(__dirname, "../config/emails", "verify.ejs");
    const htmlContent = await ejs.renderFile(templatePath, { name, code });
    const textContent = `
        Hello ${name},

        Here is your Organivo verification code:

        ${code}

        Enter this code in the app to complete your sign-up.

        If you didn't request this, please ignore this email.

        - The Organivo Team
`;

    const info = await this.transporter.sendMail({
      from: '"Organivo" <organivo@rhythmsaha.dev>',
      to,
      subject: "Your Organivo Verification Code",
      text: textContent,
      html: htmlContent,
    });

    return info.messageId;
  }
}

export default NodeMailer;
export const mailer = new NodeMailer();
