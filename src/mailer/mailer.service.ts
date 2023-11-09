import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class MailerService {
  private transporter = async () => {
    const testAccount = await nodemailer.createTestAccount();
    const transport = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      ignoreTLS: true,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return transport;
  };

  sendSignupConfirmation = async (email: string, username: string) => {
    const filePath = join(__dirname, '../../template/signup.html');
    const source = readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      username,
    };
    const htmlToSend = template(replacements);
    (await this.transporter()).sendMail({
      from: 'app@locahost.com',
      to: email,
      subject: 'Mail de confirmation ✔',
      html: htmlToSend,
      headers: { 'x-myheader': 'test header' },
    });
  };

  sendResetPassword = async (
    email: string,
    username: string,
    url: string,
    code: string
  ) => {
    const filePath = join(__dirname, '../../template/reset-password.html');
    const source = readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      username,
      code,
      url,
    };
    const htmlToSend = template(replacements);
    (await this.transporter()).sendMail({
      from: 'app@locahost.com',
      to: email,
      subject: 'Réinitialisation de mot de passe✔',
      html: htmlToSend,
      headers: { 'x-myheader': 'test header' },
    });
  };
}
