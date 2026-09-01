import { NotFoundException } from '@nestjs/common';
import { ServiceCatalogService } from './service-catalog.service.js';

// The database is faked. `serviceRepo` and `versionRepo` are fake objects whose
// methods are recorders (`vi.fn()`) we can inspect afterwards. No real Postgres.

describe('ServiceCatalogService', () => {
  it('findOne throws "not found" when the service does not exist', async () => {
    // Arrange: the database returns nothing for this id
    const serviceRepo = { findOne: vi.fn().mockResolvedValue(null) };
    const versionRepo = { countBy: vi.fn() };
    const service = new ServiceCatalogService(
      serviceRepo as never,
      versionRepo as never,
    );

    // Act + Assert: asking for a missing service rejects with NotFoundException
    await expect(
      service.findOne('00000000-0000-0000-0000-000000000000'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('listServices asks the database for page 2 with the right OFFSET', async () => {
    // Arrange: first query returns the rows, second returns the total count
    const serviceRepo = {
      query: vi
        .fn()
        .mockResolvedValueOnce([]) // data rows
        .mockResolvedValueOnce([{ count: '0' }]), // total count
    };
    const service = new ServiceCatalogService(
      serviceRepo as never,
      {} as never,
    );

    // Act: page 2, 20 per page
    await service.listServices({
      name: '',
      page: 2,
      pageSize: 20,
      sortBy: 'name',
      order: 'asc',
    });

    // Assert: the data query was run with [namePattern, limit, offset]
    // page 2 with 20 per page means skip the first 20 rows
    const firstCallParams = serviceRepo.query.mock.calls[0][1];
    expect(firstCallParams).toEqual([null, 20, 20]);
  });

  it('listServices turns the string count from the database into a number', async () => {
    // Arrange: the count query returns "42" as text (that is how pg returns it)
    const serviceRepo = {
      query: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: '42' }]),
    };
    const service = new ServiceCatalogService(
      serviceRepo as never,
      {} as never,
    );

    // Act
    const result = await service.listServices({
      name: '',
      page: 1,
      pageSize: 20,
      sortBy: 'name',
      order: 'asc',
    });

    // Assert
    expect(result.total).toBe(42);
  });
});
