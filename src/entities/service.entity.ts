import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm";
import { ServiceVersion } from "./serviceversion.entity.js";

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'text', nullable: true})
    description: string;

    @Index()
    @CreateDateColumn()
    createdAt: Date;

    @Index()
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ServiceVersion, (version) => version.service, {
        cascade: true,
    })
    versions: ServiceVersion[];
}