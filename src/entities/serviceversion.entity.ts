import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    Unique,
} from "typeorm";
import type { Relation } from "typeorm";
import * as ServiceEntity from "./service.entity.js";
type Service = ServiceEntity.Service;

@Entity('serviceversions')
@Unique(['serviceId', 'version'])
export class ServiceVersion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    version: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    releaseNotes: string | null;

    @Index()
    @Column({ type: 'uuid' })
    serviceId: string;

    @ManyToOne(() => ServiceEntity.Service, (service: Service) => service.versions, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'serviceId' })
    service: Relation<Service>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
