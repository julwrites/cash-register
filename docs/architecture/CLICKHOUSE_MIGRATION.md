# ClickHouse Migration Plan: Architectural Transition

## Overview
This document outlines the plan to transition **Cash Register** from a multi-file SQLite architecture to a unified, high-performance **ClickHouse** backend. The goal is to eliminate annual database fragmentation, enable multi-year analytical queries, and optimize the storage footprint for OneDrive-synchronized environments.

## Current State vs. Future State

| Feature | Current (SQLite) | Future (ClickHouse) |
| :--- | :--- | :--- |
| **Storage Model** | Multi-file (one per year) | Unified Table (Partitioned by Year) |
| **Scaling** | Risk of "bloat" / file management | Native compression & background merging |
| **Performance** | Fast point-writes, slow cross-year scans | Ultra-fast analytical scans (OLAP) |
| **Backup** | Raw `.sqlite` files (uncompressed) | Compressed Tarball Snapshots (7-day rolling) |

## Architectural Changes

### 1. Database Schema
We will use the `MergeTree` engine, which is the core of ClickHouse's efficiency.
- **Table Name**: `expenses`
- **Partitioning**: `PARTITION BY toYYYY(date)` — Keeps data organized by year on disk while allowing single-query access.
- **Ordering**: `ORDER BY (date, category)` — Optimizes search performance for the most common query patterns.
- **Data Types**: Use `LowCardinality(String)` for categories to significantly reduce storage size for repetitive tags.

### 2. Backup Strategy (The "Anti-Fragmentation" Layer)
To prevent OneDrive from being overwhelmed by the thousands of small data parts ClickHouse manages internally:
- **Snapshotting**: Use `clickhouse-backup` to create a point-in-time consistent state.
- **Compression**: Tarball the entire backup into a **single `.tar.gz` file**.
- **Rotation**: A script will maintain a **7-day rolling window** in the OneDrive directory, deleting backups older than one week.

## Implementation Tasks

### Phase 1: Infrastructure (Mac Mini)
- [ ] **Docker Update**: Add `clickhouse-server` to `docker-compose.yml` with memory limits (2GB recommended).
- [ ] **Backup Sidecar**: Integrate `clickhouse-backup` and the rotation script.
- [ ] **OneDrive Link**: Configure volume mount for the compressed backup target.

### Phase 2: Application Logic (Nuxt)
- [ ] **Dependency**: Add `@clickhouse/client` to `package.json`.
- [ ] **New Client**: Create `server/api/expenses/clickhouse-db.ts` to manage the connection and schema initialization.
- [ ] **Abstraction**: Refactor `getDb` logic to support the transition from yearly files to a single unified connection.
- [ ] **CRUD Updates**: Update `add.ts`, `index.ts`, and `summary.ts` to utilize ClickHouse SQL syntax (e.g., using `INSERT INTO` batches).

### Phase 3: Migration & Verification
- [ ] **Import Script**: Create a one-time utility to read all existing `expenses-*.sqlite` files and bulk-insert them into ClickHouse.
- [ ] **Verification**: Compare multi-year totals between the old SQLite files and the new ClickHouse table.
- [ ] **Cleanup**: Archive old SQLite files to a "Legacy" folder in OneDrive before final deletion.

## Strategic Impact
This move turns **Cash Register** from a simple ledger into a strategic data asset. It will allow **Jiro** to perform cross-year inflation analysis and spending trend correlation during your **Strategic Check-ins** without the overhead of manually parsing multiple database files.
