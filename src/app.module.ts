import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './catalog/services.module.js';
import { SeedModule } from './seed/seed.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity.js'
import { ServiceVersion } from './entities/serviceversion.entity.js'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME || 'catalog',
      password: process.env.DB_PASSWORD || 'catalog',
      database: process.env.DB_DATABASE || 'service_catalog',
      entities: [Service, ServiceVersion],
      synchronize: true, // ⚠️ dev only — auto-creates schema, don't use in prod
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ServicesModule,
    SeedModule,
  ],
})
export class AppModule {}
