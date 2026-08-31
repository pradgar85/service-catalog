import type { ServiceVersion } from '../../entities/serviceversion.entity.js';
import type { ServiceWithVersionCount } from '../service-catalog.service.js';

export class ServiceResponseDto {
  id: number;
  name: string;
  description: string;
  versionCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(service: ServiceWithVersionCount) {
    this.id = service.id;
    this.name = service.name;
    this.description = service.description;
    this.versionCount = service.versionCount;
    this.createdAt = service.createdAt;
    this.updatedAt = service.updatedAt;
  }
}

export class ServiceVersionResponseDto {
  id: number;
  serviceId: number;
  version: string;
  releaseNotes: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(version: ServiceVersion) {
    this.id = version.id;
    this.serviceId = version.serviceId;
    this.version = version.version;
    this.releaseNotes = version.releaseNotes;
    this.createdAt = version.createdAt;
    this.updatedAt = version.updatedAt;
  }
}

export class PaginatedServicesDto {
  data: ServiceResponseDto[];
  page: number;
  pageSize: number;
  sortBy: string;
  order: string;
  total: number;
  totalPages: number;

  constructor(result: {
    data: ServiceResponseDto[];
    page: number;
    pageSize: number;
    sortBy: string;
    order: string;
    total: number;
    totalPages: number;
  }) {
    this.data = result.data;
    this.page = result.page;
    this.pageSize = result.pageSize;
    this.sortBy = result.sortBy;
    this.order = result.order;
    this.total = result.total;
    this.totalPages = result.totalPages;
  }
}
