import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity.js';

const SERVICE_NAMES = [
  'orders-api',
  'inventory-service',
  'notifications',
  'payments-gateway',
  'user-profile',
  'search-indexer',
  'shipping-tracker',
  'reviews-api',
  'recommendations',
  'audit-log',
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    for (const name of SERVICE_NAMES) {
      await this.serviceRepo.save({
        name,
        description: `Demo service: ${name}`,
        versions: [
          { version: 'v1', releaseNotes: `${name} - Initial release` },
          { version: 'v2', releaseNotes: `${name} - Bug fixes and improvements` },
        ],
      });
    }
  }
}
