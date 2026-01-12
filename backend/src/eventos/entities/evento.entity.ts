import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('eventos')
export class Evento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 200 })
    nome_evento: string;

    @Column()
    data_evento: Date;

    @Column({ length: 300 })
    local_evento: string;

}
