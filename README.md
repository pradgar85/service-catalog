# Service Catalog API

Read-only Services API for the service-catalog dashboard widget.

## Stack

- Postgres 15
- Node 20
- NestJS 9
- TypeORM 0.3
- TypeScript
- Docker 29.7
- 

## Setup

```bash
nvm use                 # Node 20
npm install
npm run db:up           # Postgres 15 + Adminer (localhost:8081) via docker compose
npm run start:dev       # http://localhost:3000
```

Schema is auto-created (`synchronize: true`) and sample data is seeded on first boot.

## Docker
0. Included docker compose file, `npm run db:up` will start the database and a UI database client. 
1. Adminer can be accessed on localhost:8081
2. Login in with UserName catalog, password catalog, and Database, service_catalog

## API

| Method | Path | Description |
|---|---|---|
| GET | `/services` | List services. Query: `name` (ILIKE filter), 
`sortBy` (`name`\|`createdAt`\|`updatedAt`), `order` (`asc`\|`desc`), `page` (1), `pageSize` (20, max 100). Returns `{ data, page, pageSize, sortBy, order, total, totalPages }`; each item includes `versionCount`. |
| GET | `/services/:id` | Single service (with `versionCount`). 404 if not found. |
| GET | `/services/:id/versions` | Versions for a service, newest first. 404 if not found |

## Data model

- **Service** — `id`, `name`, `description`, `createdAt`, `updatedAt`
- **ServiceVersion** — `id`, `serviceId` (FK, cascade delete), `version`, `releaseNotes`, `createdAt`, `updatedAt`; unique on `(serviceId, version)`
- One-to-many: Service → ServiceVersion

## Design considerations & trade-offs

- The pagination end point uses offset based pagination. If the write/udpate volume is heavy, we can consider Cursor based pagination with a stream marker. The offset based pagination suffers from page drift etc when the underlying records are changed.
- I created a foreign key relation between services and serviceversions tables with cascade delete set to true. This helps maintain referential integrity between `service` and `serviceversions` table.
- The database ids are UUID which is fine for this demo. We may want to consider using numeric Ids if we are
doing a lot of joins.
- Searching is limited to `name` column, and is case-insensitive, performs a `contains` search. NOTE: the index
on `name` column doesn't help with search, we should consider pg_trgm or moving the search to external store purpose built for search like elasticsearch etc. It helps with sorting though.
- Also for searching, we should enforce a minimum of 3 characters. This protects our db from excessive load.
- Added indices for the SortBy columns, helps speed up sort queries.
- Schema is managed with `synchronize: true` for demo convenience only. A production deployment would
  disable it and use TypeORM migrations as the single source of schema truth
- For the pagination query, I chose hand written SQL over abstractions provided by TypeORM. This is purely a personal preference, for this project I wanted to be able to read the RAW sql.  
