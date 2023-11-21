import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  getAllUsers = async (): Promise<User[]> => {
    return await this.prismaService.user.findMany();
  };
}
