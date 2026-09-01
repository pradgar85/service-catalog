import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller.js';
import { ServiceCatalogService } from './service-catalog.service.js';
import { Service } from './../entities/service.entity.js'
import { ServiceVersion } from './../entities/serviceversion.entity.js'

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceVersion])],
  controllers: [ServicesController],
  providers: [ServiceCatalogService],
})
export class ServicesModule {}
