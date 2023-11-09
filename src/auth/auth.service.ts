import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { MailerService } from 'src/mailer/mailer.service';
import { SigninDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordConfirmationDto } from './dto/reset-password-confirmation.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signup = async (signupDto: SignupDto) => {
    const { email, password, username } = signupDto;

    // ** Vérifier si l'utilisateur est déjà inscrit
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (user) throw new ConflictException('utilisateur existe déjà.');
    // ** Hasher le mot de passe
    const hash = await bcrypt.hash(password, 10);
    // ** Enregistrer l'utilisateur dans la BDD
    await this.prismaService.user.create({
      data: { email, username, password: hash },
    });
    // ** Envoyer un mail de confirmation
    await this.mailerService.sendSignupConfirmation(email, username);
    // ** Retourner une répose de succès
    return { data: 'Utilisateur créé avec succès' };
  };

  signin = async (signinDto: SigninDto) => {
    const { email, password } = signinDto;

    // ** Vérifier si l'utilisateur est déjà inscrit
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Identifiants incorrects!');

    // ** Comparer le mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Identifiants incorrects!');

    // ** Retourner un token jwt
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '2h',
      secret: this.configService.get('SECRET_KEY'),
    });

    return {
      token,
      user: {
        username: user.username,
        email: user.email,
      },
    };
  };

  resetPassword = async (resetPasswordDto: ResetPasswordDto) => {
    const { email } = resetPasswordDto;

    // ** Vérifier si l'utilisateur est déjà inscrit
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException("Cet utilisateur n'existe pas!");

    const code = speakeasy.totp({
      secret: this.configService.get('OTP_CODE'),
      digits: 6,
      step: 60 * 15,
      encoding: 'base64',
    });

    const url = 'https://qcdigitalhub.com/';

    await this.mailerService.sendResetPassword(email, user.username, url, code);
    return { data: 'Reset password mail has been sent' };
  };
  resetPasswordConfirmation = async (
    resetPasswordConfirmationDto: ResetPasswordConfirmationDto,
  ) => {
    const { email, code, password } = resetPasswordConfirmationDto;

    // ** Vérifier si l'utilisateur est déjà inscrit
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException("Cet utilisateur n'existe pas!");

    const match = speakeasy.totp.verify({
      secret: this.configService.get('OTP_CODE'),
      token: code,
      digits: 6,
      step: 60 * 15,
      encoding: 'base64',
    });

    if (!match) throw new UnauthorizedException('Token invalide ou expiré!');

    // ** Hasher le mot de passe
    const hash = await bcrypt.hash(password, 10);
    // ** Enregistrer l'utilisateur dans la BDD
    await this.prismaService.user.update({
      where: { email },
      data: { password: hash },
    });

    return { data: 'Mot de passe mis à jour' };
  };

  deleteAccount = async(userId: number, deleteAccountDto: DeleteAccountDto)=> {
    const { password } = deleteAccountDto;

    // ** Vérifier si l'utilisateur est déjà inscrit
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException("Cet utilisateur n'existe pas!");

    // ** Comparer le mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Unauthorized!');

    await this.prismaService.user.delete({where: { id: userId }});
    return { data: 'Utilisateur supprimé avec succès' };


  }
}
