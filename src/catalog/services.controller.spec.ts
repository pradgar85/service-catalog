import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesController } from './services.controller.js';
import { ServiceCatalogService } from './service-catalog.service.js';

describe('ServicesController', () => {
  let controller: ServicesController;

  // Fake catalog service. Each method is a recorder we can script per test.
  const catalog = {
    findOne: vi.fn(),
    listServices: vi.fn(),
    findVersions: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [{ provide: ServiceCatalogService, useValue: catalog }],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /services/:id responds 404 when the service is not found', async () => {
    // Arrange: the catalog layer reports the service does not exist
    catalog.findOne.mockRejectedValue(new NotFoundException('Service not found'));

    // Act: call the route handler and capture the error it throws
    const error = await controller
      .getServicesById('00000000-0000-0000-0000-000000000000')
      .catch((e) => e);

    // Assert: it is a NotFoundException, which Nest sends to the client as 404
    expect(error).toBeInstanceOf(NotFoundException);
    expect(error.getStatus()).toBe(404);
  });
});
