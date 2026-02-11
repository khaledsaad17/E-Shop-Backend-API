import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MongoIdDto {
  @ApiProperty({ example: '6986515a2486e7a0075ef5aa' })
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}
