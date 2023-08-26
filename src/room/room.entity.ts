import { Reservation } from 'src/reservation/reservation.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany((type) => Reservation, (reservation) => reservation.room)
  reservation: Reservation[];
}
