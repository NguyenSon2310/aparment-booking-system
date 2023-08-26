import {
  Controller,
  Get,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { GetAvailableRoomDto } from 'src/reservation/dto/get-available-room.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/decorators/get-user';
import { User } from 'src/users/users.entity';

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly reservationService: ReservationService,
  ) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('available')
  getAvailable(@Query() getAvailableRoomDto: GetAvailableRoomDto) {
    return this.reservationService.getAvailableRoom(getAvailableRoomDto);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('booking')
  booking(
    @Body('startTime') startTime: Date,
    @Body('endTime') endTime: Date,
    @Body('roomIds') roomId: number[],
    @GetUser() user: User,
  ) {
    return this.reservationService.addReservation(
      startTime,
      endTime,
      roomId,
      user.id,
    );
  }
}
