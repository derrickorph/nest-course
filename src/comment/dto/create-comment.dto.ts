import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  readonly contenu: string;
  @IsNotEmpty()
  readonly postId: number;
}
