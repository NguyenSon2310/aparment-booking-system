import { Room } from 'src/room/room.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  roomId: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @ManyToOne((type) => Room, (room) => room.reservation)
  @JoinColumn({ name: 'room_id', referencedColumnName: 'id' })
  room: Room;
}
