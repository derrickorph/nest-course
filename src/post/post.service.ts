import { PrismaService } from './../prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  getAllPosts = async () => {
    return await this.prismaService.post.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
            password: false,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                password: false,
              },
            },
          },
        },
      },
    });
  };

  create = async (createPostDto: CreatePostDto, userId: number) => {
    const { body, title } = createPostDto;
    await this.prismaService.post.create({ data: { body, title, userId } });
    return { data: 'Post created!' };
  };

  delete = async (postId: number, userId: number) => {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('Forbidden Action');
    await this.prismaService.post.delete({ where: { id: postId } });
    return { data: 'Post deleted' };
  };

  update = async (postId: number, userId: number, updatePostDto: UpdatePostDto)  => {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('Forbidden Action');
    await this.prismaService.post.update({ where: { id: postId }, data:{...updatePostDto} });
    return { data: 'Post updated' };

  }
}
