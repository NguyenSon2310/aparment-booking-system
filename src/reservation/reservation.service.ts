import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { Room } from 'src/room/room.entity';
import { Repository } from 'typeorm';
import { GetAvailableRoomDto } from './dto/get-available-room.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async getAvailableRoom(getAvailableRoomDto: GetAvailableRoomDto) {
    const { startTime, endTime } = getAvailableRoomDto;

    const newStartTime = new Date(startTime);
    newStartTime.setTime(newStartTime.getTime() + 1000);
    const newEndTime = new Date(endTime);
    newEndTime.setTime(newEndTime.getTime() - 1000);

    const subQuery = this.reservationRepository.createQueryBuilder('reser');
    subQuery
      .select('reser.roomId')
      .where('(:startTime BETWEEN reser.startTime AND reser.endTime)', {
        startTime: newStartTime,
      })
      .orWhere('(:endTime BETWEEN reser.startTime AND reser.endTime)', {
        endTime: newEndTime,
      })
      .orWhere(
        '((reser.startTime BETWEEN :startTime AND :endTime) AND (reser.endTime BETWEEN :startTime AND :endTime))',
        { startTime: newStartTime, endTime: newEndTime },
      );

    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.reservation', 'reservation')
      .where('(reservation.id IS NULL)')
      .orWhere('(reservation.roomId NOT IN(' + subQuery.getQuery() + '))')
      .setParameters(subQuery.getParameters())
      .select(['room']);

    const rooms = await query.getMany();

    return rooms;
  }

  async addReservation(
    startTime: Date,
    endTime: Date,
    roomIds: number[],
    userId: number,
  ) {
    const now = new Date();
    if (
      new Date(startTime).getTime() < now.getTime() ||
      new Date(endTime).getTime() < now.getTime()
    ) {
      throw new BadRequestException(
        'Your selected time is in the past, please reselect.',
      );
    }

    const newStartTime = new Date(startTime);
    newStartTime.setTime(newStartTime.getTime() + 1000);

    const newEndTime = new Date(endTime);
    newEndTime.setTime(newEndTime.getTime() - 1000);

    const query = this.reservationRepository.createQueryBuilder('reservation');
    query
      .where(
        '((:startTime BETWEEN reservation.startTime AND reservation.endTime) AND (reservation.roomId IN (:...roomIds)))',
        {
          startTime: newStartTime,
          roomIds,
        },
      )
      .orWhere(
        '((:endTime BETWEEN reservation.startTime AND reservation.endTime) AND (reservation.roomId IN (:...roomIds)))',
        {
          endTime: newEndTime,
          roomIds,
        },
      )
      .orWhere(
        '((reservation.startTime BETWEEN :startTime AND :endTime) AND (reservation.endTime BETWEEN :startTime AND :endTime) AND (reservation.roomId IN (:...roomIds)))',
        {
          startTime: newStartTime,
          endTime: newEndTime,
          roomIds,
        },
      )
      .leftJoin('reservation.room', 'room')
      .select(['reservation', 'room']);

    const checkReservation = await query.getOne();

    if (checkReservation) {
      throw new BadRequestException(
        `${checkReservation.room.name} room was booked.`,
      );
    }

    for (const roomId of roomIds) {
      const reservation = new Reservation();
      reservation.userId = userId;
      reservation.roomId = roomId;
      reservation.startTime = startTime;
      reservation.endTime = endTime;
      await this.reservationRepository.save(reservation);
    }

    return { message: 'Successfully.' };
  }
}
