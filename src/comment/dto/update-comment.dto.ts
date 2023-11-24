import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCommentDto {

  @IsNotEmpty()
  readonly contenu: string;
  @IsNotEmpty()
  readonly postId: number;

}
