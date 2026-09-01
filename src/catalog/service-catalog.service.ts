import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { Service }  from './../entities/service.entity.js'
import { ServiceVersion } from './../entities/serviceversion.entity.js'

export type ServiceWithVersionCount = Service & { versionCount: number };

@Injectable()
export class ServiceCatalogService {
    constructor(
        @InjectRepository(Service) private readonly serviceRepo: Repository<Service>,
        @InjectRepository(ServiceVersion) private readonly versionRepo: Repository<ServiceVersion>,
    ) {}


    async findOne(id: string): Promise<ServiceWithVersionCount> {
        const service = await this.serviceRepo.findOne({ where: {id}})
        if (service == null) {
            throw new NotFoundException("Service not found");
        }
        const count =  await this.versionRepo.countBy(
            { serviceId: id }
        )
        return { ...service, versionCount: count };
    }

    async listServices(params: {
        name: string;
        page: number;
        pageSize: number;
        sortBy: 'name' | 'createdAt' | 'updatedAt';
        order: 'asc' | 'desc';
    }): Promise<{ data: ServiceWithVersionCount[]; total: number }> {
        const { name, page, pageSize, sortBy, order } = params;

        // sortBy / order are validated by ParseEnumPipe in the controller; map to
        // a quoted column so camelCase identifiers resolve in Postgres, and fall
        // back to name so this method is safe even if called without that pipe.
        const orderColumn =
            { name: 'name', createdAt: '"createdAt"', updatedAt: '"updatedAt"' }[sortBy] ?? 'name';
        const direction = order === 'desc' ? 'DESC' : 'ASC';
        const offset = (page - 1) * pageSize;

        // $1 is always bound: null means "no name filter", so the placeholder
        // positions are fixed and both queries share the same WHERE clause.
        const namePattern = name ? `%${name}%` : null;
        const nameFilter = 'WHERE ($1::text IS NULL OR s.name ILIKE $1)';

        // versionCount is computed at query time via LEFT JOIN + GROUP BY
        // (not denormalized onto services); fine at this scale.
        const data: ServiceWithVersionCount[] = await this.serviceRepo.query(
            `SELECT s.*, COUNT(v.id)::int AS "versionCount"
             FROM services s
             LEFT JOIN serviceversions v ON v."serviceId" = s.id
             ${nameFilter}
             GROUP BY s.id
             ORDER BY s.${orderColumn} ${direction}, s.id ${direction}
             LIMIT $2 OFFSET $3`,
            [namePattern, pageSize, offset],
        );

        const countRows: Array<{ count: string }> = await this.serviceRepo.query(
            `SELECT COUNT(*) AS count FROM services s ${nameFilter}`,
            [namePattern],
        );

        return { data, total: Number(countRows[0].count) };
    }

    async findVersions(serviceId: string): Promise<ServiceVersion[]> {
        await this.findOne(serviceId); // reuse existence check -> NotFoundException
        return this.versionRepo.find({
            where: { serviceId },
            order: { createdAt: 'DESC' },
        });
    }
}
