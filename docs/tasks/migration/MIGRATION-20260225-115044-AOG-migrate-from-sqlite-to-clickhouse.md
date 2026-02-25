# Task: Migrate from SQLite to ClickHouse

## Status
- **ID**: MIGRATION-20260225-115044-AOG
- **Status**: pending
- **Category**: migration
- **Assignee**: Jiro
- **Priority**: medium
- **Created**: 2026-02-25
- **Last Updated**: 2026-02-25

## Description
Transition the Cash-Register application from a multi-file SQLite architecture to a unified, high-performance ClickHouse backend to eliminate annual database fragmentation and enable multi-year analytical queries.

## Context
- High-level architecture documented in `docs/architecture/CLICKHOUSE_MIGRATION.md`.
- Current implementation uses `better-sqlite3` with yearly files (e.g., `expenses-2026.sqlite`).
- Target environment: Mac Mini (Docker).

## Risk Assessment & Mitigation
- **Data Loss During Migration**: Risk of partial transfer or silent failures.
    - *Mitigation*: Implementation of a "Checksum Validation" in the migration script to compare row counts and total debit/credit sums between SQLite and ClickHouse before decommissioning.
- **Write Collision**: Risk of data loss if a user writes to SQLite *after* migration has started but *before* the app switches over.
    - *Mitigation*: Planned maintenance window (Downtime). We will set the application to `read-only` or stop the container entirely during the one-time migration.
- **Schema Mismatch**: ClickHouse's `Decimal` and `Date` types are stricter than SQLite's strings/numbers.
    - *Mitigation*: Migration script will include a "Sanitization" layer to handle nulls or malformed dates in the legacy SQLite files.

## Acceptance Criteria
- [ ] `clickhouse-server` is running in Docker on Mac Mini.
- [ ] `clickhouse-backup` is configured with a 7-day rolling rotation on OneDrive.
- [ ] Application can read/write data to ClickHouse using `@clickhouse/client`.
- [ ] Existing data from yearly SQLite files is successfully migrated to ClickHouse.
- [ ] **Verification**: Row counts and monetary sums (Credit/Debit) match exactly between legacy and new DBs.
- [ ] Multi-year queries (e.g., summary across 2024-2026) are verified and working.

## Technical Notes
- Database Engine: `MergeTree`
- Partitioning: `PARTITION BY toYYYY(date)`
- Use `LowCardinality(String)` for categories.
- Backup format: Compressed `.tar.gz` to prevent OneDrive file sync overhead.

## Sub-tasks
- [ ] **Infrastructure Setup**
    - [ ] Update `docker-compose.yml` for ClickHouse.
    - [ ] Set up backup and rotation scripts.
- [ ] **Application Logic**
    - [ ] Install dependencies (`@clickhouse/client`).
    - [ ] Implement `server/api/expenses/clickhouse-db.ts`.
    - [ ] Refactor existing API endpoints.
- [ ] **Data Migration**
    - [ ] Create and run migration script for legacy SQLite files.
    - [ ] Verify data integrity.

## Effort
- **Estimated**: 8 hours
- **Actual**: 0 hours
