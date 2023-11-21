import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }
}
