import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Service } from '../entities/service.entity.js';
import { SeedService } from './seed.service.js';

describe('SeedService', () => {
  it('inserts 10 services with 2 versions each on bootstrap', async () => {
    const serviceRepo = { save: vi.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getRepositoryToken(Service), useValue: serviceRepo },
      ],
    }).compile();

    await module.get(SeedService).onApplicationBootstrap();

    expect(serviceRepo.save).toHaveBeenCalledTimes(10);
    expect(serviceRepo.save.mock.calls[0][0].versions).toHaveLength(2);
  });
});
