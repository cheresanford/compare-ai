import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('eventos')
export class Evento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100})
    titulo: string;

    @Column()
    dataInicio: Date;

    @Column()
    dataTermino: Date;

    @Column()
    status: boolean;

    @Column()
    organizadorEmail: string;


    // todo no proximo modulo
    @Column({nullable: true})
    categoria: string;

}


//título, data de início, data de término, status, organizador