import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: 'placeholder@ethereal.email',
      pass: 'placeholder'
    },
  });

  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log(`Sending verification email to ${email} with token: ${token}`);
    // In a real app, this would send the email
    // await this.transporter.sendMail({...});
  }
}
