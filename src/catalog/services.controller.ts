import {
  Controller,
  Get,
  Query,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import type { Service } from '../entities/service.entity.js';
import {
  ServiceResponseDto,
  ServiceVersionResponseDto,
  PaginatedServicesDto,
} from './dto/service-response.dto.js';
import { ServiceCatalogService } from './service-catalog.service.js';

enum SortBy {
  Name = 'name',
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
}

enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

@Controller('services')
export class ServicesController {

  constructor(private readonly serviceCatalog: ServiceCatalogService) {}

  @Get()
  async getServices(
    @Query('name', new DefaultValuePipe('')) name: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('sortBy', new DefaultValuePipe(SortBy.Name), new ParseEnumPipe(SortBy))
    sortBy: SortBy,
    @Query('order', new DefaultValuePipe(SortOrder.Asc), new ParseEnumPipe(SortOrder))
    order: SortOrder,
  ): Promise<PaginatedServicesDto> {
    const safePage = Math.max(page, 1);
    const safePageSize = Math.min(Math.max(pageSize, 1), 100); // pageSize defaults to 20, but capped at 100

    const { data, total } = await this.serviceCatalog.listServices({
      name,
      page: safePage,
      pageSize: safePageSize,
      sortBy,
      order,
    });

    return new PaginatedServicesDto({
      data: data.map((s) => new ServiceResponseDto(s)),
      page: safePage,
      pageSize: safePageSize,
      sortBy,
      order,
      total,
      totalPages: Math.ceil(total / safePageSize),
    });
  }

  @Get(':id')
  async getServicesById(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceResponseDto> {
    const serviceWithVersionCount = await this.serviceCatalog.findOne(id);
    return new ServiceResponseDto(serviceWithVersionCount)
  }

  @Get(':id/versions')
  async getServiceVersionsById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceVersionResponseDto[]> {
    const versions = await this.serviceCatalog.findVersions(id);
    return versions.map((v) => new ServiceVersionResponseDto(v));
  }
}
