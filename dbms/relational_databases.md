# Relational Databases

## What is Relational Database?
A **relational database** represents a collection of related (two-dimensional) tables. Each of the tables are similar to an Excel spreadsheet, with a fixed number of named columns (the attributes or properties of the table) and any number of rows of data.

**Attributes (columns)** specify a data type, and each **record (or row)** contains the value of that specific data type. All tables in a relational database have an attribute known as the **primary key**, which is a unique identifier of a row, and each row can be used to create a relationship between different tables using a **foreign key** - a reference to a primary key of another existing table. For Example,

```sql
CREATE TABLE customer (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(60) NOT NULL,
    billing_address TEXT NOT NULL,
    shipping_address TEXT NOT NULL
) 

CREATE TABLE order (
    order_id UID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customer(customer_id), -- Foreign Key for customer table
    order_date DATE
    shipping_date DATE
    order_status TEXT -- ENUM to be defined acc. to db
)
```

## Benefits of Relational Databases

- **Flexibility** - It’s easy to add, update, or delete tables, relationships, and make other changes to data whenever you need without changing the overall database structure or impacting existing applications.
- **ACID Compliance** - Relational databases support ACID (Atomicity, Consistency, Isolation, Durability) performance to ensure data validity regardless of errors, failures, or other potential mishaps.
- **Ease of Use** - It’s easy to run complex queries using SQL, which enables even non-technical users to learn how to interact with the database.
- **Collaboration** - Multiple people can operate and access data simultaneously. Built-in locking prevents simultaneous access to data when it’s being updated. 
- **Built-in Security** - Role-based security ensures data access is limited to specific users.
- **DB Normalization** - Relational databases employ a design technique known as normalization that reduces data redundancy and improves data integrity. 

## Limitations
- Schema changes on large tables are painful and sometimes require downtime
- **Horizontal scaling is hard** — sharding is complex; cross-shard joins are expensive or impossible
- Not a natural fit for graphs, variable-schema documents, or high-throughput time-series data
- **ORM N+1 query problem** — silently generates one query per row instead of one query for all rows; can quietly destroy performance

## Relational vs. non-relational databases
The main difference between relational and non-relational databases (NoSQL databases) is how data is stored and organized. **Non-relational databases do not store data in a rule-based, tabular way**. Instead, they **store data as individual, unconnected files** and can be used for complex, unstructured data types, such as documents or rich media files.

Unlike relational databases, **NoSQL databases follow a flexible data model**, making them ideal for storing data that changes frequently or for applications that handle diverse types of data. 

## Keys
 
| Key | What it is |
|---|---|
| **Primary Key (PK)** | Uniquely identifies each row. Must be unique + not null. |
| **Foreign Key (FK)** | A column whose value must exist as a PK in another table. Enforces relationships. |
| **Candidate Key** | Any column (or combo) that *could* be a PK. You pick one; the rest become **alternate keys**. |
| **Composite Key** | A PK made of multiple columns — common on junction tables. |
| **Surrogate Key** | A fake PK with no business meaning (auto-increment ID, UUID). Stable and simple. |
| **Natural Key** | A PK from real data (email, SSN). Can change, can be sensitive — prefer surrogates. |
 
**FK actions** — what happens to child rows when a parent is deleted/updated:
- `CASCADE` → propagate the change
- `RESTRICT` → block the operation
- `SET NULL` → null out the FK

## Relationships
 
- **1:1** — one row maps to one row. Rare; often just merge the tables.
- **1:N** — one row maps to many. FK lives on the "many" side. Most common.
- **M:N** — many rows map to many rows. Needs a **junction table** with a composite PK of both FKs.

## ACID
 
The four guarantees that make a database trustworthy:
 
- **Atomicity** — a transaction is all-or-nothing. Half-applied writes don't exist.
- **Consistency** — a transaction leaves the DB in a valid state (all constraints still hold).
- **Isolation** — concurrent transactions don't step on each other's toes.
- **Durability** — once committed, a transaction survives crashes. Enabled by WAL (write-ahead log).

**WAL (Write-Ahead Log)** — before changing data, the DB writes the intent to a log. On crash, it replays committed changes and rolls back uncommitted ones.
 
## Indexing
 
An index trades write speed + storage for read speed.
 
- **B-Tree** (default) — works for `=`, `<`, `>`, `BETWEEN`, `ORDER BY`, `LIKE 'prefix%'`. Doesn't help `LIKE '%suffix'`.
 
- **Composite index** — index on `(a, b, c)`. Usable only left-to-right: queries on `a` or `a, b` use it; a query on just `b` doesn't.
 
- **Clustered index** — rows physically stored in index order. One per table (Postgres: heap by default; MySQL InnoDB: always clusters on PK).
 
- **Covering index** — index includes all columns a query needs. No table lookup required. Very fast.
 
**When NOT to index:**
- Small tables
- Low-cardinality columns (a boolean index is nearly useless)
- Columns written far more than read

## Constraints
 
Rules the DB enforces so your app doesn't have to:
 
| Constraint | What it does |
|---|---|
| `NOT NULL` | Column must have a value |
| `UNIQUE` | All values distinct (NULLs usually allowed) |
| `PRIMARY KEY` | Unique + not null |
| `FOREIGN KEY` | Value must exist in parent table |
| `CHECK` | Value must pass a condition: `CHECK (age >= 0)` |
| `DEFAULT` | Fallback value when none is provided |

## Views & Stored Procedures
 
- **View** — a saved query that looks like a table. No data stored. Good for hiding complexity or sensitive columns.
 
- **Materialized view** — like a view but the results are stored on disk. Needs periodic refresh. Great for expensive aggregations.
 
- **Stored procedure** — named block of SQL logic stored in the DB. Fewer round-trips. Harder to test and version-control than app code.
 
- **Trigger** — code that auto-runs on `INSERT`/`UPDATE`/`DELETE`. Useful for audit logs. Can be confusing if overused — invisible to app developers.
 