import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  create = async (userId: number, createCommentDto: CreateCommentDto) => {
    const { postId, contenu } = createCommentDto;
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    await this.prismaService.comment.create({
      data: {
        contenu,
        userId,
        postId,
      },
    });

    return { data: 'Comment created!' };
  };

  delete = async (commentId: number, userId: number, postId: number) => {
    const comment = await this.prismaService.comment.findFirst({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.postId !== postId)
      throw new UnauthorizedException('Post id does not match');
    if (comment.userId !== userId)
      throw new ForbiddenException('Forbidden Action');
    await this.prismaService.comment.delete({ where: { id: commentId } });
    return { data: 'Comment deleted' };
  };

  update = async (
    commentId: number,
    userId: number,
    updateCommentDto: UpdateCommentDto,
  ) => {
    const { contenu, postId } = updateCommentDto;
    const comment = await this.prismaService.comment.findFirst({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.postId !== postId)
      throw new UnauthorizedException('Post id does not match');
    if (comment.userId !== userId)
      throw new ForbiddenException('Forbidden Action');
    await this.prismaService.comment.update({
      where: { id: commentId },
      data: { contenu },
    });
    return { data: 'Comment updated' };
  };
}
