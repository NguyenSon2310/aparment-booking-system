import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports: [ReservationModule],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule { }
