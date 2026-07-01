# SQL III — Advanced SQL

*So far we have covered SQL foundations (data types, operators, commands) and core querying (SELECT, filtering, joins, grouping, set operations, subqueries). Now we move into advanced territory — database objects, query optimization, and powerful techniques for complex data problems.*

---

## Views & Triggers

### Views
- In SQL, a **view** is a *named query* stored in the database system.
- Unlike a table, a view does not store data physically. The database system only stores the view's definition.
- When you query data from a view, the database system executes the query to retrieve data from the underlying tables.
- Some views can be updatable — you can modify the underlying tables' data via updatable views.
- Views allow you to encapsulate complex queries, limit access to sensitive data, and provide a consistent interface even if the underlying table structure changes.

```sql
-- Creating a view
CREATE VIEW [IF NOT EXISTS] view_name AS query;

-- Querying a view
SELECT * FROM view_name;

-- Modifying a view
CREATE OR REPLACE VIEW view_name AS query;

-- Removing a view
DROP VIEW IF EXISTS view_name;
```

- A **Materialized View** stores the query result physically on disk. Needs periodic refresh. Useful for expensive aggregations that don't need real-time data.

```sql
-- Creating a materialized view (PostgreSQL)
CREATE MATERIALIZED VIEW view_name AS query;

-- Refreshing a materialized view
REFRESH MATERIALIZED VIEW view_name;
```

### Triggers
- A **trigger** is a *database object* that executes a piece of code automatically in response to a specific event on a table.
- Always associated with a specific table — if the table is deleted, all its triggers are deleted too.
- Invoked either `BEFORE` or `AFTER` the following events: `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE` (PostgreSQL).
- Useful for audit logs, enforcing business rules, or syncing derived data.

```sql
-- Creating a trigger
CREATE TRIGGER trigger_name
[BEFORE|AFTER] event
ON table_name trigger_type
BEGIN
  -- trigger_logic
END;

-- Modifying a trigger
CREATE OR REPLACE TRIGGER trigger_name
[BEFORE|AFTER] event
ON table_name
   trigger_type
BEGIN
  -- trigger_logic
END;

-- Removing a trigger
DROP TRIGGER [IF EXISTS] trigger_name;
```

> **Note:** Overusing triggers makes behaviour invisible to application developers. Prefer explicit app logic unless there's a strong reason (e.g. audit trails).

---

## Indexes

An index trades **write speed + storage** for **read speed**. The database uses it to find rows without scanning the entire table.

- **B-Tree** (default) — works for `=`, `<`, `>`, `BETWEEN`, `ORDER BY`, `LIKE 'prefix%'`. Does not help `LIKE '%suffix'`.

```sql
CREATE INDEX idx_name ON table_name (column_name);
```

- **Composite Index** — index on multiple columns `(a, b, c)`. Usable only left-to-right: queries on `a` or `a, b` use it; a query on just `b` or `c` alone doesn't.

```sql
CREATE INDEX idx_name ON table_name (col_a, col_b);
```

- **Unique Index** — enforces uniqueness on a column, similar to a `UNIQUE` constraint.

```sql
CREATE UNIQUE INDEX idx_name ON table_name (column_name);
```

- **Clustered Index** — rows physically stored in index order. One per table. In MySQL InnoDB, always clusters on PK. In PostgreSQL, heap by default.

- **Covering Index** — index includes all columns a query needs. No table lookup required — very fast.

```sql
-- Covers a query that selects name and email, filtered by dept
CREATE INDEX idx_covering ON employees (dept_id, name, email);
```

**When NOT to index:**
- Small tables — a full scan is faster
- Low-cardinality columns — a boolean index is nearly useless
- Columns written far more than they are read

```sql
-- Removing an index
DROP INDEX idx_name;
```

---

## Stored Procedures

A **stored procedure** is a named block of SQL (and optionally procedural) logic stored in the database. Called explicitly, unlike triggers.

- Reduces round-trips between app and database
- Can accept input/output parameters
- Harder to test and version-control than application code — use judiciously

```sql
-- Creating a stored procedure (PostgreSQL syntax)
CREATE OR REPLACE PROCEDURE procedure_name (param1 datatype, param2 datatype)
LANGUAGE plpgsql
AS $$
BEGIN
  -- logic here
  UPDATE accounts SET balance = balance - param1 WHERE id = param2;
END;
$$;

-- Calling a stored procedure
CALL procedure_name(500, 1);

-- Removing a stored procedure
DROP PROCEDURE IF EXISTS procedure_name;
```

> Stored procedures vs functions — procedures perform actions (no return value required); functions return a value and can be used in `SELECT` expressions.

---

## Window Functions

Window functions perform calculations **across a set of rows related to the current row** — without collapsing them into a group like `GROUP BY` does.

```sql
function_name() OVER (
  PARTITION BY column   -- divide rows into groups
  ORDER BY column       -- order within each group
)
```

### Ranking Functions

- **`ROW_NUMBER()`** — unique sequential number per row within partition
- **`RANK()`** — same rank for ties, skips next rank
- **`DENSE_RANK()`** — same rank for ties, no gaps

```sql
SELECT name, dept, salary,
  RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rank_in_dept
FROM employees;
```

### Offset Functions

- **`LAG(col, n)`** — value from `n` rows before the current row
- **`LEAD(col, n)`** — value from `n` rows after the current row

```sql
SELECT order_date, revenue,
  LAG(revenue, 1) OVER (ORDER BY order_date) AS prev_revenue
FROM sales;
```

### Aggregate Window Functions

- Run aggregates like `SUM`, `AVG`, `COUNT` without collapsing rows

```sql
SELECT name, salary,
  SUM(salary) OVER (PARTITION BY dept) AS dept_total,
  ROUND(salary * 100.0 / SUM(salary) OVER (PARTITION BY dept), 2) AS pct_of_dept
FROM employees;
```

---

## Common Table Expressions (CTE)

A CTE is a **named temporary result set** defined with the `WITH` clause. Exists only for the duration of the query. Makes complex queries readable by breaking them into named steps.

### Basic CTE

```sql
WITH high_earners AS (
  SELECT id, name, salary
  FROM employees
  WHERE salary > 100000
)
SELECT * FROM high_earners ORDER BY salary DESC;
```

### Multiple CTEs

Chain them with a comma — each can reference the one before it.

```sql
WITH dept_avg AS (
  SELECT dept_id, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY dept_id
),
above_avg AS (
  SELECT e.name, e.salary, d.avg_salary
  FROM employees e
  JOIN dept_avg d ON e.dept_id = d.dept_id
  WHERE e.salary > d.avg_salary
)
SELECT * FROM above_avg;
```

### Recursive CTE

A CTE that references itself. Used for hierarchical or tree-structured data — org charts, category trees, file paths.

```sql
WITH RECURSIVE org_chart AS (
  SELECT id, name, manager_id
  FROM employees
  WHERE manager_id IS NULL          -- anchor: start at the root

  UNION ALL

  SELECT e.id, e.name, e.manager_id
  FROM employees e
  JOIN org_chart o ON e.manager_id = o.id  -- recursive step
)
SELECT * FROM org_chart;
```

---

## Recursive Queries

Recursive queries are built using **recursive CTEs** (covered above). Common use cases:

- **Org charts** — traverse manager → employee relationships
- **Category trees** — parent → child categories in e-commerce
- **File system paths** — folder hierarchies
- **Graph traversal** — finding connected nodes

The structure always follows:
1. **Anchor member** — the base case (no recursion), selects the starting rows
2. **`UNION ALL`**
3. **Recursive member** — joins back to the CTE itself to get the next level

```sql
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 0 AS depth
  FROM categories
  WHERE parent_id IS NULL           -- anchor: top-level categories

  UNION ALL

  SELECT c.id, c.name, c.parent_id, ct.depth + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY depth, name;
```

---

## Pivot / Unpivot Operations

### Pivot — rows to columns

Transforms row values into column headers. Useful for reports and cross-tabulations.

```sql
-- PostgreSQL: manual pivot using conditional aggregation
SELECT
  dept,
  SUM(CASE WHEN year = 2022 THEN revenue ELSE 0 END) AS "2022",
  SUM(CASE WHEN year = 2023 THEN revenue ELSE 0 END) AS "2023",
  SUM(CASE WHEN year = 2024 THEN revenue ELSE 0 END) AS "2024"
FROM sales
GROUP BY dept;
```

> SQL Server and Oracle have a native `PIVOT` keyword. PostgreSQL and MySQL use conditional aggregation as above.

### Unpivot — columns to rows

The reverse — transforms column headers back into row values.

```sql
-- PostgreSQL: manual unpivot using UNION ALL
SELECT dept, '2022' AS year, "2022" AS revenue FROM sales_pivot
UNION ALL
SELECT dept, '2023' AS year, "2023" AS revenue FROM sales_pivot
UNION ALL
SELECT dept, '2024' AS year, "2024" AS revenue FROM sales_pivot;
```

> SQL Server has a native `UNPIVOT` keyword.

---

## Dynamic SQL

**Dynamic SQL** means constructing a SQL statement as a string at runtime and then executing it. Useful when table names, column names, or conditions aren't known until runtime.

- Used in stored procedures, admin scripts, and reporting tools
- **Risk: SQL injection** — always parameterize user input, never concatenate raw strings

```sql
-- PostgreSQL: EXECUTE inside a procedure
CREATE OR REPLACE PROCEDURE search_table(tbl_name TEXT, search_val TEXT)
LANGUAGE plpgsql AS $$
DECLARE
  query TEXT;
BEGIN
  query := format('SELECT * FROM %I WHERE name = %L', tbl_name, search_val);
  EXECUTE query;
END;
$$;
```

> `%I` safely quotes identifiers (table/column names). `%L` safely quotes literal values. Always prefer these over string concatenation.

---

## Performance Optimization

### `EXPLAIN` and `EXPLAIN ANALYZE`

The first tool for any slow query. Shows the **execution plan** — how the database intends to (or did) run the query.

```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 5;

EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 5;
-- ANALYZE actually runs the query and shows real timings
```

Key things to look for in the plan:
- **Seq Scan** — full table scan, no index used. Fine for small tables, bad for large ones.
- **Index Scan** — index used. Good.
- **Hash Join / Nested Loop** — join strategies. Nested loop is expensive on large sets.
- **Rows estimate vs actual** — large discrepancies mean outdated statistics. Run `ANALYZE table_name` to update.

### Index Strategy

- Index columns used in `WHERE`, `JOIN ON`, and `ORDER BY`
- Prefer **composite indexes** that cover the full query condition
- Use **covering indexes** to avoid table lookups entirely
- Avoid indexing low-cardinality columns (e.g. a boolean `is_active`)
- Too many indexes slow down `INSERT`/`UPDATE`/`DELETE` — audit and drop unused ones

```sql
-- Find unused indexes in PostgreSQL
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### Query Optimization

- **Avoid `SELECT *`** — fetch only the columns you need; reduces I/O and prevents accidental data leaks
- **Avoid functions on indexed columns in WHERE** — this disables index use

```sql
-- Bad: index on order_date not used
WHERE YEAR(order_date) = 2024

-- Good: index used
WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'
```

- **Avoid `N+1` queries** — one query per row instead of one query for all rows. Use `JOIN` or `IN` instead.
- **Use `EXISTS` over `COUNT`** when checking for existence — stops at first match

```sql
-- Bad
SELECT COUNT(*) FROM orders WHERE customer_id = 1 > 0

-- Good
SELECT EXISTS (SELECT 1 FROM orders WHERE customer_id = 1)
```

- **Filter early** — use `WHERE` before `JOIN` where possible to reduce the working set
- **Paginate large results** — use `LIMIT` / `OFFSET` or keyset pagination instead of loading all rows

### Partitioning

Splits a large table into smaller physical pieces (partitions) based on a column value. Queries that filter on the partition key only scan the relevant partition.

```sql
-- Range partitioning by year (PostgreSQL)
CREATE TABLE orders (
  id INT,
  order_date DATE,
  amount NUMERIC
) PARTITION BY RANGE (order_date);

CREATE TABLE orders_2023 PARTITION OF orders
  FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

Types: **Range** (dates, numbers), **List** (specific values), **Hash** (distributed evenly by hash).

### Connection Pooling

Opening a new database connection for every request is expensive. A **connection pool** maintains a set of open connections and reuses them.

- Tools: **PgBouncer** (PostgreSQL), **HikariCP** (Java), built-in pooling in ORMs
- Reduces connection overhead significantly under high concurrency
- Configure pool size based on DB server capacity, not app demand

### Caching Strategies

Avoid hitting the database at all for frequently read, rarely changed data.

- **Application-level cache** — store query results in memory (Redis, Memcached). Set TTL based on how stale data can be.
- **Materialized views** — cache expensive aggregations inside the database itself. Refresh on a schedule.
- **Query result cache** — some databases (MySQL) have built-in query caches, though often disabled in favour of app-level caching.

> Cache invalidation is the hard part — decide upfront whether you need time-based expiry (TTL) or event-based invalidation (clear on write).