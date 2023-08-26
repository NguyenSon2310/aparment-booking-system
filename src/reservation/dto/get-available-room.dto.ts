import { IsNotEmpty } from 'class-validator';

export class GetAvailableRoomDto {
  @IsNotEmpty()
  startTime: Date;

  @IsNotEmpty()
  endTime: Date;
}
