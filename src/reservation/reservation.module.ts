import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { Room } from 'src/room/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Room])],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
