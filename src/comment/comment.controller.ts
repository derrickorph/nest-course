import { Request } from 'express';
import { CommentService } from './comment.service';
import {
  Controller,
  Req,
  Body,
  UseGuards,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Commentaires')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(@Body() createCommentDto: CreateCommentDto, @Req() request: Request) {
    const userId = request.user['id'];
    return this.commentService.create(userId, createCommentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  delete(
    @Param('id', ParseIntPipe) commentId: number,
    @Body('postId') postId: number,
    @Req() request: Request,
  ) {
    const userId = request.user['id'];
    return this.commentService.delete(commentId, userId, postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  update(
    @Param('id', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() request: Request,
  ) {
    const userId = request.user['id'];
    return this.commentService.update(commentId, userId, updateCommentDto);
  }
}
