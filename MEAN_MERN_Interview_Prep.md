# MEAN & MERN Stack Interview Preparation Guide
**Target: 4 Years of Experience | Mid-to-Senior Level**

This guide covers the questions you're most likely to face, with answers calibrated for someone with 4 years of hands-on experience. Interviewers at this level expect not just definitions, but trade-offs, real-world reasoning, and signs that you've debugged production issues.

---

## Table of Contents
1. [JavaScript & TypeScript Core](#1-javascript--typescript-core)
2. [Node.js (Deep Dive)](#2-nodejs-deep-dive)
3. [Express.js](#3-expressjs)
4. [MongoDB](#4-mongodb)
5. [React (MERN)](#5-react-mern)
6. [Angular (MEAN)](#6-angular-mean)
7. [REST APIs & GraphQL](#7-rest-apis--graphql)
8. [Authentication & Security](#8-authentication--security)
9. [Performance & Scaling](#9-performance--scaling)
10. [System Design Scenarios](#10-system-design-scenarios)
11. [Coding Problems](#11-coding-problems)
12. [Behavioral Questions](#12-behavioral-questions)

---

## 1. JavaScript & TypeScript Core

### Q1. Explain the event loop. What's the difference between `process.nextTick`, `setImmediate`, and `setTimeout`?

**Answer:** The event loop is what allows Node.js (which is single-threaded) to perform non-blocking I/O. It continuously checks the call stack and the callback queues, pushing callbacks onto the stack when the stack is empty.

The loop runs through phases: **timers** (setTimeout/setInterval) → **pending callbacks** → **idle/prepare** → **poll** (I/O) → **check** (setImmediate) → **close callbacks**.

- `process.nextTick(cb)` — runs **before** the event loop continues to the next phase. Highest priority. Microtask queue.
- `Promise.then(cb)` — also a microtask, runs after `nextTick` callbacks.
- `setImmediate(cb)` — runs in the **check** phase, after I/O.
- `setTimeout(cb, 0)` — runs in the **timers** phase, with at least 1ms delay in practice.

```js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
// Output: nextTick, promise, timeout, immediate (order of timeout/immediate may vary outside I/O context)
```

Inside an I/O callback, `setImmediate` always runs before `setTimeout(fn, 0)`.

---

### Q2. What's the difference between `==` and `===`? When would you ever use `==`?

`===` checks type and value. `==` does type coercion. In production code, prefer `===` to avoid surprises (`"" == 0` is `true`, `null == undefined` is `true`).

The one place `==` is useful: `value == null` checks for both `null` and `undefined` in one expression. Otherwise, stick to `===`.

---

### Q3. Explain closures with a real-world example.

A closure is a function that retains access to its lexical scope even when executed outside that scope.

**Real-world use:** rate limiter, memoization, private state.

```js
function createRateLimiter(maxCalls, windowMs) {
  let calls = [];
  return function () {
    const now = Date.now();
    calls = calls.filter(t => now - t < windowMs);
    if (calls.length >= maxCalls) return false;
    calls.push(now);
    return true;
  };
}
const limiter = createRateLimiter(5, 1000);
```

`calls` is private — no one outside can mutate it.

---

### Q4. `var` vs `let` vs `const`. What's the temporal dead zone?

- `var` — function-scoped, hoisted and initialized to `undefined`.
- `let`/`const` — block-scoped, hoisted but **not initialized**. Accessing them before declaration throws `ReferenceError`. The window between hoisting and declaration is the **Temporal Dead Zone (TDZ)**.
- `const` prevents reassignment, but not mutation (`const obj = {}; obj.x = 1` is fine).

---

### Q5. Explain `this` in JavaScript. How does it differ in arrow functions?

`this` is determined by **how a function is called**, not where it's defined:
- Method call (`obj.fn()`) → `this` is `obj`.
- Standalone (`fn()`) → `this` is `undefined` (strict) or `global`.
- `new Fn()` → `this` is the new instance.
- `fn.call(ctx)` / `fn.apply(ctx)` / `fn.bind(ctx)` — explicit binding.

Arrow functions **don't have their own `this`** — they inherit from the enclosing lexical scope. This is why they're useful in callbacks inside class methods:

```js
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(() => { this.seconds++; }, 1000); // arrow → `this` is the Timer
  }
}
```

---

### Q6. Promises vs async/await. What problems does async/await solve?

Promises fix callback hell but still chain with `.then()`. async/await makes async code look synchronous, easier to read and debug (proper stack traces).

**Gotchas to mention:**
- `await` in a loop runs sequentially. Use `Promise.all` for parallel.
- Always wrap `await` in try/catch, or attach `.catch()` to the resulting promise.
- An unhandled rejection in async functions crashes Node 15+.

```js
// Sequential — slow
for (const url of urls) {
  const r = await fetch(url);
}
// Parallel — fast
const results = await Promise.all(urls.map(fetch));
```

---

### Q7. What's the difference between `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`?

- `all` — resolves when all resolve; rejects on first rejection.
- `allSettled` — waits for all, returns `{status, value/reason}[]`. Use when you want all results regardless of failures.
- `race` — settles with the first to resolve OR reject.
- `any` — resolves with the first to resolve; rejects only if all reject.

---

### Q8. TypeScript: `interface` vs `type`. When to use which?

Both describe shapes. Differences:
- `interface` can be **declaration-merged** and `extends`. Better for public APIs and class contracts.
- `type` can describe unions, intersections, primitives, mapped types, conditionals. More flexible.

Rule of thumb: use `interface` for object shapes that might be extended; use `type` for unions, tuples, or computed types.

---

### Q9. What are TypeScript generics? Give a real example.

Generics let you write reusable code that works with multiple types while preserving type safety.

```ts
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as T;
}
interface User { id: string; name: string; }
const user = await fetchJson<User>('/api/me');
// user is typed as User
```

---

### Q10. Explain prototypal inheritance.

Every object has an internal `[[Prototype]]` link to another object. When you access a property, JS walks up the prototype chain until it finds it or hits `null`.

```js
const animal = { eats: true };
const dog = Object.create(animal);
dog.barks = true;
console.log(dog.eats); // true (from animal)
```

ES6 `class` syntax is sugar over this. `class Dog extends Animal` sets `Dog.prototype.__proto__ = Animal.prototype`.

---

## 2. Node.js (Deep Dive)

### Q11. Is Node.js single-threaded? How does it handle concurrency?

Node's **JavaScript execution** is single-threaded, but **I/O is not**. The libuv library uses a thread pool (default 4 threads) for file system, DNS, and certain crypto/zlib operations. Network I/O uses the OS's async primitives (epoll on Linux, kqueue on macOS, IOCP on Windows).

For CPU-bound work, you use `worker_threads` (since Node 10.5+) or the `cluster` module to spawn worker processes.

---

### Q12. How would you handle CPU-intensive tasks in Node?

Three options, in increasing complexity:
1. **`worker_threads`** — same process, shared memory possible via `SharedArrayBuffer`. Best for in-process parallelism.
2. **`cluster`** — fork multiple processes, each on its own core. Used with PM2 in production.
3. **External queue** — push the job to Redis/RabbitMQ, process it in a separate service. Best for heavy/long-running jobs (image processing, ML inference).

I'd never run heavy CPU work on the main thread — it blocks the event loop and stalls all requests.

---

### Q13. What is the difference between `cluster` and `worker_threads`?

| | cluster | worker_threads |
|---|---|---|
| Memory | Separate processes | Shared possible |
| Use case | Scaling HTTP servers across cores | CPU-bound tasks |
| IPC | `process.send()`, slow (serialization) | `MessagePort`, faster |
| Crash isolation | Strong (one dies, others live) | Weaker (same process) |

---

### Q14. How do streams work in Node? What are the four types?

Streams process data in chunks, avoiding loading entire files into memory.

- **Readable** — source (e.g. `fs.createReadStream`)
- **Writable** — sink (e.g. `fs.createWriteStream`)
- **Duplex** — both (e.g. TCP socket)
- **Transform** — Duplex that modifies data (e.g. `zlib.createGzip`)

```js
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz')
);
```

Use `pipeline` over `.pipe()` — it handles errors and cleanup correctly.

**Backpressure:** when the writable can't keep up, `write()` returns `false` and you should stop pushing until `drain` fires.

---

### Q15. What's `Buffer`? When do you use it?

`Buffer` is Node's pre-ES6 way of handling raw binary data — fixed-size chunks of memory outside the V8 heap. You use it for files, network I/O, crypto, and image manipulation. Modern code can use `Uint8Array`, but `Buffer` has more methods and is what most Node APIs return.

---

### Q16. How does `require` work? `require` vs `import`.

`require` is CommonJS — synchronous, runs at execution time, can be conditional. Each module is wrapped in a function and cached in `require.cache` after first load.

`import` is ES Modules — static, hoisted, async under the hood, supports tree-shaking. Files use `.mjs` or `"type": "module"` in package.json.

You can't mix them freely. To use ESM in a CJS project, use dynamic `import()`. To use CJS in ESM, you can `import` it but only the default export.

---

### Q17. How do you handle uncaught exceptions and unhandled rejections in production?

```js
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException');
  // Do cleanup, then exit. State is unreliable.
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandledRejection');
});
```

The key insight: **after `uncaughtException`, the process is in an undefined state**. Log, flush, and exit. Let your process manager (PM2, systemd, Kubernetes) restart it.

---

### Q18. What's `package.json` vs `package-lock.json`?

- `package.json` — declares dependencies and version ranges (e.g. `^4.17.0`).
- `package-lock.json` — pins the exact versions of every dependency and sub-dependency. Commit it. It guarantees reproducible builds across machines.

Tip: in CI, use `npm ci` (not `npm install`) — it installs from the lockfile strictly and is faster.

---

### Q19. How would you debug a memory leak in a Node app?

1. Confirm the leak: monitor RSS over time (`process.memoryUsage()`, Prometheus, or a simple `/healthz` endpoint).
2. Take heap snapshots before and after load (`node --inspect` + Chrome DevTools, or `heapdump` package).
3. Compare snapshots — look for growing object counts, especially closures and event listeners.
4. Common culprits: unbounded caches, listeners not removed, global arrays, large response objects retained in promise chains.

---

## 3. Express.js

### Q20. What is middleware? Walk me through the request lifecycle.

Middleware is a function with the signature `(req, res, next) => {}`. Express runs them in order; each can:
- Modify `req`/`res`
- End the response (`res.send(...)`)
- Pass control via `next()` or `next(err)`

Lifecycle: incoming request → app-level middleware → route-specific middleware → route handler → error-handling middleware (if `next(err)` was called) → response.

Error-handling middleware has 4 args: `(err, req, res, next)`.

---

### Q21. How do you structure a production Express app?

I follow a layered structure:

```
src/
  config/        # env, db connections
  routes/        # express routers
  controllers/   # HTTP layer — parse req, call service, format res
  services/      # business logic, framework-agnostic
  models/        # mongoose schemas / DB models
  middlewares/   # auth, validation, rate limit
  utils/
  app.js
  server.js      # only this calls app.listen()
```

The split between `app.js` and `server.js` matters for testing — you can import `app` into Jest/Supertest without binding a port.

---

### Q22. How do you handle errors centrally in Express?

A single error-handling middleware at the end of the chain:

```js
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  logger.error({ err, path: req.path }, 'request failed');
  res.status(status).json({
    error: status >= 500 ? 'Internal error' : err.message
  });
});
```

For async route handlers, wrap them so thrown errors reach this middleware:

```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/users', asyncHandler(async (req, res) => {
  const users = await db.users.find();
  res.json(users);
}));
```

Express 5 does this automatically.

---

### Q23. How do you validate request input?

I use `joi` or `zod`. `zod` pairs well with TypeScript because the schema infers the type:

```ts
const CreateUser = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
});
type CreateUserDto = z.infer<typeof CreateUser>;

app.post('/users', (req, res) => {
  const data = CreateUser.parse(req.body); // throws on invalid
  // data is typed
});
```

Validation belongs in middleware so controllers stay clean.

---

### Q24. What security middleware do you use?

- `helmet` — sets sane HTTP headers (CSP, HSTS, X-Frame-Options).
- `cors` — strict origin allowlist, never `*` for authenticated endpoints.
- `express-rate-limit` — throttle by IP or user ID.
- `express-mongo-sanitize` — strip `$` and `.` from inputs to prevent NoSQL injection.
- Body size limits (`express.json({ limit: '100kb' })`).
- HTTPS-only cookies, `httpOnly`, `sameSite: 'lax'` or `'strict'`.

---

### Q25. How does Express handle async errors before v5?

In Express 4, throwing inside an async route handler does **not** trigger the error middleware. The promise rejects unhandled. You need to either wrap with an async helper (above) or use a library like `express-async-errors`.

---

## 4. MongoDB

### Q26. Indexing — what types are there and when do you use each?

- **Single field** — most common.
- **Compound** — multiple fields. Order matters: prefix rule means `{a:1, b:1}` supports queries on `a`, and `a+b`, but not `b` alone.
- **Multikey** — automatic on array fields.
- **Text** — for `$text` search.
- **Geospatial** — `2dsphere` for location queries.
- **Hashed** — for sharding by hash.
- **TTL** — auto-deletes documents after a time.
- **Partial / Sparse** — index only docs matching a filter or with the field present.

Always check your queries with `.explain('executionStats')` to confirm index usage.

---

### Q27. What's the ESR rule for compound indexes?

For a compound index, order fields as **Equality, Sort, Range**.

Example: query `{status: 'active', age: {$gt: 25}}` sorted by `createdAt` → index `{status: 1, createdAt: -1, age: 1}`.

This minimizes scanned documents and avoids in-memory sorts.

---

### Q28. Embedding vs Referencing in MongoDB.

**Embed when:**
- Data is read together (one-to-few).
- Sub-document doesn't need to be queried independently.
- Total document size stays well under the 16MB BSON limit.

**Reference when:**
- One-to-many with unbounded growth (a user's posts).
- Sub-document is updated independently and frequently.
- You need to query the sub-document on its own.

A typical pattern: embed for the read path, denormalize critical fields, accept some duplication, and use change streams or app logic to keep them in sync.

---

### Q29. Explain the MongoDB Aggregation Pipeline. Give a real example.

A pipeline runs documents through stages, each transforming the data:

```js
db.orders.aggregate([
  { $match: { status: 'paid', createdAt: { $gte: ISODate('2025-01-01') } } },
  { $group: { _id: '$customerId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 10 },
  { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
  { $unwind: '$customer' },
  { $project: { name: '$customer.name', total: 1, count: 1 } }
]);
```

Common stages: `$match`, `$group`, `$project`, `$lookup` (join), `$unwind`, `$sort`, `$facet` (run multiple pipelines in parallel), `$bucket`.

**Performance tip:** put `$match` and `$sort` as early as possible so they can use indexes.

---

### Q30. What are transactions in MongoDB? When do you need them?

Multi-document ACID transactions are supported in replica sets (4.0+) and sharded clusters (4.2+).

```js
const session = client.startSession();
try {
  await session.withTransaction(async () => {
    await accounts.updateOne({ _id: a }, { $inc: { balance: -100 } }, { session });
    await accounts.updateOne({ _id: b }, { $inc: { balance: 100 } }, { session });
  });
} finally {
  await session.endSession();
}
```

**Caveat:** transactions have overhead and contention costs. Often you can redesign to avoid them — embed the related data into one document so updates are atomic at the document level. Use transactions only when the data genuinely spans collections (financial, inventory).

---

### Q31. Replica Set vs Sharding.

- **Replica set** — high availability and read scaling. One primary, multiple secondaries, automatic failover via election. Same data on each node.
- **Sharding** — horizontal write scaling. Data split across shards by a shard key. Each shard is itself a replica set.

You almost always want a replica set in production. You shard only when a single node can't hold the data or handle the write throughput.

**Choosing a shard key** is the hardest design decision: it should have high cardinality, even distribution, and match query patterns. Bad shard keys (monotonic, low cardinality) create hot shards.

---

### Q32. Mongoose `populate` — how does it work? Drawbacks?

`populate` does a second query to fetch referenced documents and merges them into the result. It's basically a client-side join.

```js
Post.find().populate('author', 'name email');
```

**Drawbacks:**
- N+1 risk if used inside loops.
- Extra round-trips vs `$lookup`.
- Mongoose populate can't filter on populated fields in the parent query.

For complex joins, `$lookup` in an aggregation is often more efficient.

---

### Q33. Explain optimistic vs pessimistic locking. How do you implement either in Mongo?

**Pessimistic** — lock the document during read. Mongo doesn't really do this at the document level for normal CRUD; you'd use transactions with `findOneAndUpdate` to serialize.

**Optimistic** — read with a version, update only if version matches:

```js
const doc = await Item.findById(id);
const result = await Item.updateOne(
  { _id: id, version: doc.version },
  { $set: { qty: doc.qty - 1 }, $inc: { version: 1 } }
);
if (result.matchedCount === 0) throw new Error('Conflict — retry');
```

Mongoose has built-in `versionKey` (`__v`) and supports `findOneAndUpdate` with version checks.

---

### Q34. What are change streams?

A real-time feed of changes on a collection, database, or deployment, built on the oplog. Useful for cache invalidation, search index updates, and event-driven architectures.

```js
const stream = User.watch([{ $match: { 'fullDocument.country': 'IN' } }]);
stream.on('change', change => /* handle */);
```

Requires a replica set.

---

## 5. React (MERN)

### Q35. Class components vs function components with hooks. Why hooks?

Hooks let you use state and lifecycle in function components. Benefits:
- Less boilerplate, no `this`.
- Easier to share logic via custom hooks (vs HOCs/render props).
- Better composition — logic isn't tied to lifecycle methods.
- Easier to test (just functions).

Modern React code is essentially all hooks. Class components are legacy at this point.

---

### Q36. Explain `useEffect`. What's the dependency array? What is the cleanup function for?

`useEffect(fn, deps)` runs `fn` after render. The dependency array controls when:
- `[]` → only after mount.
- `[a, b]` → when `a` or `b` changes.
- omitted → after every render (rarely correct).

The function `fn` can return a cleanup function. React calls it before the next effect runs, and on unmount.

```js
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

Use the cleanup for: timers, subscriptions, websocket connections, aborting fetch requests.

**Common bug:** stale closures. If your effect uses a state value but doesn't list it as a dep, you'll see the old value. Either add the dep, or use a ref, or use the functional updater (`setX(prev => prev + 1)`).

---

### Q37. `useMemo` vs `useCallback` vs `React.memo`. When do you actually use them?

- `useMemo(() => compute(a), [a])` — memoizes a value.
- `useCallback(fn, [deps])` — memoizes a function reference. Equivalent to `useMemo(() => fn, [deps])`.
- `React.memo(Component)` — memoizes a component, skipping re-renders if props are shallow-equal.

**When to use:** only after profiling shows a problem. Premature memoization adds complexity and the deps-array overhead. The two real cases:
1. Expensive computations (calculations, filtering large lists).
2. Stable references for child components wrapped in `React.memo`, or for `useEffect` deps.

---

### Q38. What's the Virtual DOM? How does React decide what to re-render?

The Virtual DOM is a JS object tree representing the UI. On state change, React builds a new tree, **diffs** it against the previous one (the "reconciliation" algorithm), and applies only the minimal changes to the real DOM.

The diff is O(n) thanks to two heuristics:
1. Different element types → replace the whole subtree.
2. Lists need stable `key` props to track items across renders.

React 16+ uses Fiber, which makes reconciliation interruptible — it can pause and resume work to keep the UI responsive (Concurrent Mode features in React 18).

---

### Q39. Why are `key` props important?

`key` tells React how to identify items across renders. Without stable keys (or using array indices), React may reuse the wrong DOM nodes when the list reorders, causing:
- Lost input focus.
- Wrong items animating.
- State leaking between items.

Use a stable, unique ID (database ID), not the array index — except for static lists that never reorder.

---

### Q40. How do you handle global state? Context vs Redux vs Zustand vs Redux Toolkit.

- **Context** — built-in. Best for low-frequency global data (theme, current user, locale). Frequent updates cause every consumer to re-render.
- **Redux Toolkit (RTK)** — predictable, devtools, time-travel debugging, RTK Query for data fetching. Best for large apps with complex state.
- **Zustand** — minimal API, no provider needed, hooks-based. Great for medium apps.
- **Jotai/Recoil** — atomic state.
- **Server state** — for API data, prefer `react-query` / TanStack Query or RTK Query, not Redux.

For 4-yr level, the key insight is: **separate server state from client state**. Don't dump API data into Redux; use a query library that handles caching, refetching, and stale-while-revalidate for you.

---

### Q41. Controlled vs uncontrolled components.

- **Controlled** — value is in React state (`value={x} onChange={e => setX(e.target.value)}`). React is the source of truth.
- **Uncontrolled** — value lives in the DOM, accessed via `ref`. Less code, but harder to validate live.

For most forms, use controlled. For file inputs and integration with third-party DOM libraries, uncontrolled is fine.

---

### Q42. Lifting state up — what is it and when?

When two sibling components need the same state, move it to their lowest common ancestor and pass it down via props. This keeps a single source of truth.

If lifting causes too much prop drilling, that's the signal to use Context or a state library.

---

### Q43. What are React refs? When do you use them?

`useRef` returns a mutable object whose `.current` persists across renders without triggering re-renders.

Use cases:
- DOM access (`<input ref={inputRef} />`).
- Storing values that shouldn't trigger renders (timers, previous values, instance variables).
- Imperative APIs from third-party libraries.

Don't use refs as a substitute for state.

---

### Q44. How do you optimize a slow React app?

1. **Profile first** with React DevTools Profiler. Don't guess.
2. **Code-split** with `React.lazy` + `Suspense` and route-based chunks.
3. **Virtualize** long lists with `react-window` or `react-virtuoso`.
4. **Memoize** hot components with `React.memo`, expensive computations with `useMemo`.
5. **Avoid creating new objects/arrays** in render that get passed as props.
6. **Debounce** rapid inputs (search, resize).
7. **Move state down** — keep it as local as possible to avoid wide re-render trees.
8. **Use `key` correctly** to prevent unnecessary remounts.

---

### Q45. What is server-side rendering (SSR)? How is it different from CSR and SSG?

- **CSR** — JS bundle sent to browser, browser renders. Slow first paint, bad SEO without effort.
- **SSR** — server renders HTML per request, sends to client, hydrates. Better SEO and TTFB, but server load is higher.
- **SSG** — HTML pre-built at build time, served as static. Fastest, but only works for content that doesn't depend on the request.
- **ISR** (Next.js) — SSG with periodic revalidation.
- **RSC** (React Server Components) — server-only components that don't ship JS to the client.

Next.js 13+ App Router defaults to RSC, with selective `'use client'` boundaries.

---

### Q46. How do you handle data fetching in React?

**Don't** roll your own with `useEffect` for anything serious — you'll re-implement caching, dedup, retry, race conditions, and cancellation.

Use:
- **TanStack Query** — most popular, framework-agnostic.
- **SWR** — Vercel's, simpler.
- **RTK Query** — if you're already on Redux.

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => api.getUser(id),
  staleTime: 60_000,
});
```

These handle caching, background refetch, dedup, retries, and request cancellation out of the box.

---

### Q47. What's the difference between `useEffect` and `useLayoutEffect`?

Both run after render. `useLayoutEffect` runs **synchronously after the DOM is mutated but before the browser paints**. Use it when you need to measure DOM nodes or apply mutations the user shouldn't see flicker. It blocks paint, so default to `useEffect` and only switch when needed.

---

### Q48. What's the React Suspense API?

Suspense lets components "wait" for something (code, data) before rendering, showing a fallback in the meantime.

```jsx
<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>
```

Originally just for `React.lazy`, now (with frameworks like Next.js and libraries like Relay/TanStack Query in suspense mode) it works for data fetching too.

---

## 6. Angular (MEAN)

### Q49. AngularJS vs Angular. Why the rewrite?

AngularJS (1.x) used dirty-checking, two-way binding, scopes, controllers — limited performance and hard to scale. Angular 2+ is a complete rewrite: TypeScript, component-based, Zone.js change detection, RxJS for async, AOT compilation, hierarchical DI. They share almost nothing in common.

---

### Q50. Explain Angular's component lifecycle hooks.

In order:
- `ngOnChanges` — when bound inputs change.
- `ngOnInit` — once after first `ngOnChanges`. Most setup goes here.
- `ngDoCheck` — every change detection run. Use sparingly.
- `ngAfterContentInit` / `ngAfterContentChecked` — content projection.
- `ngAfterViewInit` / `ngAfterViewChecked` — child views.
- `ngOnDestroy` — cleanup. Unsubscribe observables, clear timers.

---

### Q51. What is Dependency Injection in Angular?

A design pattern where a class receives its dependencies from outside rather than instantiating them. Angular has a hierarchical injector — services declared at root are singletons app-wide; services provided in a component are scoped to that component tree.

```ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}
}
```

Tree-shakable providers (`providedIn: 'root'`) are preferred over `providers: []` arrays in modules.

---

### Q52. Observables vs Promises. When does Angular use which?

| | Promise | Observable |
|---|---|---|
| Values | One | Many |
| Eager/lazy | Eager | Lazy (subscribed) |
| Cancellable | No | Yes (`unsubscribe`) |
| Operators | Few | Rich (RxJS) |

Angular's `HttpClient` returns `Observable`. Reactive Forms emit value changes as observables. You can `.toPromise()` (or `firstValueFrom`) when needed, but RxJS is idiomatic.

---

### Q53. Common RxJS operators you've used.

- `map` — transform.
- `filter` — drop unwanted values.
- `switchMap` — cancel previous inner observable. Critical for typeaheads.
- `mergeMap` — run inner observables in parallel.
- `concatMap` — queue them sequentially.
- `exhaustMap` — ignore new emissions while one is in flight (login submit).
- `debounceTime` — wait for pause in emissions.
- `distinctUntilChanged` — only emit when value changes.
- `catchError`, `retry`, `tap`, `combineLatest`, `forkJoin`.

Typical search input pipeline:
```ts
this.search.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => this.api.search(q)),
).subscribe(...);
```

---

### Q54. Template-driven vs Reactive Forms.

- **Template-driven** — uses `ngModel`, logic in template. Quick for small forms.
- **Reactive** — `FormGroup`/`FormControl` in code. Better for complex validation, dynamic fields, and unit testing.

Reactive is preferred at the 4-yr level for any non-trivial form.

---

### Q55. How does change detection work in Angular?

Zone.js patches async APIs so Angular knows when to run change detection. By default (`ChangeDetectionStrategy.Default`), Angular checks the entire component tree top-down on every async event.

`OnPush` strategy: a component is checked only when:
- An `@Input` reference changes.
- An event from the component or its template fires.
- An async pipe in the template emits.
- You manually call `ChangeDetectorRef.markForCheck()`.

Using `OnPush` with immutable data and observables is a major perf win in large apps.

Angular 16+ adds **Signals**, an alternative reactive primitive that doesn't depend on Zone.js, and Angular 18+ has experimental zoneless mode.

---

### Q56. What's an Angular module (`NgModule`)? Standalone components?

Historically, every component had to belong to an `NgModule`, which declared, imported, and exported components/pipes/directives. Modules organized features and enabled lazy loading.

Angular 14+ introduced **standalone components** — they declare their own dependencies directly. Angular 17 made standalone the default in new apps. NgModules are still supported but increasingly considered legacy.

---

### Q57. How do you handle authentication in Angular?

- Store the token in memory + httpOnly cookie if possible. `localStorage` is vulnerable to XSS.
- An `HttpInterceptor` attaches the token to outgoing requests and handles 401s (e.g. trigger refresh or logout).
- An `AuthGuard` (or `canActivate` function in v15+) protects routes.
- Refresh tokens via a separate endpoint, queued during 401 retry.

---

### Q58. Lazy loading routes in Angular.

```ts
const routes = [
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) }
];
```

Splits the bundle so the admin code is downloaded only when the user visits `/admin`. Combined with route preloading strategies (`PreloadAllModules`, custom), you get fast initial load + warm cache.

---

## 7. REST APIs & GraphQL

### Q59. REST best practices you follow.

- **Nouns, not verbs**: `/users/123` not `/getUser?id=123`.
- **Plural resources**: `/users`, `/users/123/orders`.
- **Correct status codes**: 200/201/204/400/401/403/404/409/422/429/500.
- **Versioning** in the URL (`/v1/`) or `Accept` header.
- **Consistent error format**: `{ error: { code, message, details } }`.
- **Pagination**: cursor-based for large datasets, offset for small.
- **Idempotency**: PUT and DELETE are idempotent; POST should accept an `Idempotency-Key` header for retries.
- **HATEOAS** is rarely worth the cost in practice.

---

### Q60. PUT vs PATCH vs POST.

- **POST** — create (or non-idempotent action).
- **PUT** — replace the entire resource. Idempotent.
- **PATCH** — partial update. JSON Patch (RFC 6902) or JSON Merge Patch (RFC 7396).

In practice, many APIs use PATCH for any update because full replacements rarely make sense.

---

### Q61. Pagination strategies.

- **Offset/limit** — `?page=3&limit=20`. Easy, but slow on large tables (DB skips N rows) and unstable if data changes between pages.
- **Cursor** — `?after=eyJpZCI6...`. Pass the last seen ID; query is `WHERE id > cursor LIMIT n`. Stable and fast. Best for feeds and infinite scroll.

---

### Q62. REST vs GraphQL. When would you pick GraphQL?

GraphQL strengths: clients ask for exactly the fields they need, single endpoint, strong type system, great for aggregating across services.

REST strengths: simpler, HTTP caching out of the box, no resolver complexity, easier rate limiting and observability.

Pick GraphQL when:
- Multiple clients with different data shapes (web, iOS, Android).
- You're aggregating multiple backend services.
- Mobile bandwidth/latency is critical.

Stick with REST when:
- Public API where consumers expect REST.
- Small team — GraphQL has real operational overhead (N+1, depth limiting, persisted queries).

---

### Q63. What's the N+1 problem in GraphQL? How do you solve it?

A query like `posts { author { name } }` triggers one query for posts and N queries for authors. Solution: **DataLoader** batches and caches loads within a request:

```js
const userLoader = new DataLoader(ids => User.find({ _id: { $in: ids } }));
// Each authorId resolution calls userLoader.load(id), batched per tick.
```

---

## 8. Authentication & Security

### Q64. JWT vs Session-based auth. Pros and cons.

**Session-based:** server stores session ID → user mapping. Cookie has the session ID.
- Pros: revocation is instant (delete the row).
- Cons: server-side state, harder to scale across services without a shared store.

**JWT:** signed token containing claims; server validates without lookup.
- Pros: stateless, easy to share across services.
- Cons: revocation is hard. You typically use short-lived access tokens (5–15 min) plus a refresh token (with a server-side allowlist) so revocation is bounded.

In practice, modern systems often use **opaque tokens with introspection** for server-to-server, and short-lived JWTs for browser sessions. For pure browser apps, session cookies remain the safer default.

---

### Q65. Where do you store the JWT in the browser?

- **httpOnly cookie** (with `Secure`, `SameSite=Lax/Strict`) — safe from XSS, but you must protect against CSRF.
- **localStorage** — easy, but **vulnerable to XSS**. Any injected script can steal the token. Avoid.
- **In-memory + refresh cookie** — keep access token in JS memory (lost on refresh), refresh token in httpOnly cookie. Best balance for SPAs.

---

### Q66. What is CSRF and how do you prevent it?

CSRF tricks an authenticated user's browser into making a request to your site (e.g. via an image tag on a malicious page). The browser auto-attaches the cookie, and the server can't tell it wasn't intentional.

Prevention:
- `SameSite=Lax` (or `Strict`) cookies — blocks cross-site requests in modern browsers.
- CSRF tokens (double-submit cookie or synchronizer token) for state-changing endpoints.
- Don't accept GET for mutating actions.

---

### Q67. What is XSS? Prevention?

XSS = injecting JS into your site that other users execute. Three flavors: stored (in DB), reflected (in URL), DOM-based (client routing).

Prevention:
- Output-encode user input (React does this by default for text; `dangerouslySetInnerHTML` opts out).
- `Content-Security-Policy` header — disallow inline scripts and untrusted origins.
- Sanitize HTML inputs with `DOMPurify` if you must allow rich text.
- HttpOnly cookies for sensitive tokens.

---

### Q68. How do you store passwords?

Hash with **bcrypt**, **argon2**, or **scrypt** — all designed to be slow and memory-hard. Each password gets a unique salt (built into bcrypt's output). Never use MD5/SHA-1/SHA-256 alone — they're too fast, allowing brute force at billions per second on GPUs.

```js
const hash = await bcrypt.hash(password, 12); // cost factor 12
const ok = await bcrypt.compare(password, hash);
```

Bump the cost factor every couple years as hardware improves.

---

### Q69. NoSQL injection in MongoDB.

If you accept user input directly into a query: `User.find({ username: req.body.username, password: req.body.password })`, an attacker can send `{"username": "admin", "password": {"$ne": null}}` and bypass auth.

Defenses:
- Cast inputs to expected types (string, number).
- Use `express-mongo-sanitize` to strip `$` and `.`.
- Validate with `zod`/`joi` before hitting the DB.

---

### Q70. Rate limiting strategies.

- **Fixed window** — N requests per minute. Simple but allows burst at the boundary.
- **Sliding window** — smoothed.
- **Token bucket** — refilled at a fixed rate, each request consumes a token. Best for APIs.
- **Leaky bucket** — fixed processing rate.

In Node, `express-rate-limit` (in-memory, single instance) or Redis-backed (`rate-limiter-flexible`) for clustered apps. Apply per-IP and per-user, with stricter limits on sensitive endpoints (login, password reset).

---

## 9. Performance & Scaling

### Q71. How do you scale a Node.js application?

**Vertical first**: profile, fix hot paths, add indexes, cache.

**Horizontal**:
- `cluster` or PM2 to use all CPU cores on one box.
- Multiple instances behind a load balancer (ALB, Nginx).
- Make the app stateless — sessions in Redis, files in S3.
- Sticky sessions only if you have stateful WebSockets, otherwise round-robin.

Beyond that:
- **Caching** layers: Redis for hot data, CDN for static.
- **Async processing** — push slow work into a queue (BullMQ, RabbitMQ).
- **Database scaling** — read replicas, sharding, separate analytical DB.
- **Microservices** — only when team/domain boundaries warrant it; they add operational cost.

---

### Q72. What caching layers do you use?

1. **Browser cache** — `Cache-Control`, `ETag`.
2. **CDN** — static assets and cacheable API responses.
3. **Reverse proxy cache** — Nginx, Varnish.
4. **App-level cache** — Redis or Memcached for hot DB queries, computed values, sessions.
5. **In-memory** — `lru-cache` for very hot, small data within a process.
6. **Database** — query cache, materialized views.

Cache invalidation is the hard part. Common strategies: TTL, write-through, cache-aside (lazy), event-driven invalidation via change streams or pub/sub.

---

### Q73. How do you handle long-running tasks (sending emails, generating reports)?

Push them to a job queue:

```js
// producer
await emailQueue.add('welcome', { userId }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });

// worker (separate process)
new Worker('email', async job => {
  if (job.name === 'welcome') await sendWelcome(job.data.userId);
});
```

BullMQ (Redis-backed) is the standard in Node. Workers scale independently of the API. The API stays fast and crashes in workers don't take down the request path.

---

### Q74. How do you debug a slow API endpoint in production?

1. **Reproduce** — find a slow trace via APM (Datadog, New Relic, OpenTelemetry).
2. **Identify the bottleneck**: DB query, external API, CPU, GC, network?
3. **DB**: run `.explain('executionStats')` to check index usage. Look for `COLLSCAN`.
4. **External calls**: log durations, add timeouts, retry budgets.
5. **CPU**: take a flamegraph (`clinic flame`, `0x`).
6. **GC**: monitor heap, look for major GC pauses.
7. **Connection pool exhaustion**: check active vs max connections to DB.

Then: cache, batch, parallelize, add an index, or push the work async.

---

### Q75. What's connection pooling and why does it matter?

Opening a TCP connection (and TLS handshake) to MongoDB is expensive. A pool keeps a fixed number of connections open and reuses them. Mongoose/MongoDB driver default is 100 per process, which is usually fine.

Sizing: `pool_size ≈ peak_concurrency`. If your DB is the bottleneck, more pool isn't the answer — more DB resources or query optimization is.

---

## 10. System Design Scenarios

### Q76. Design a URL shortener.

**Requirements:** generate short URLs, redirect, analytics, ~100M new URLs/yr, 10:1 read:write.

**Components:**
- API: POST `/shorten` → returns `short`. GET `/{short}` → 301 redirect.
- ID generation: base62-encode an auto-increment, or hash + collision check, or pre-allocated ranges per node (avoid central counter contention).
- Storage: MongoDB or PostgreSQL — `{short, long, createdBy, expiresAt, createdAt}`. Index on `short` (unique).
- Cache: Redis for hot redirects (most traffic is on the long tail of recent + popular).
- Analytics: write click events to a queue → ClickHouse or similar columnar store. Don't write to the OLTP DB on every redirect.
- CDN in front for global low latency.

**Trade-offs:** 301 caches in browser (good for traffic reduction, bad for analytics) vs 302 (fresh hit each time, accurate analytics).

---

### Q77. Design a chat application (real-time messaging).

**Components:**
- WebSocket server (Socket.IO or `ws`) for client connections.
- Sticky-session load balancing OR a pub/sub layer (Redis pub/sub, Kafka) so any node can deliver to any user.
- Presence: Redis with TTL'd keys per user.
- Message storage: MongoDB sharded by `conversationId`. Index `{conversationId, createdAt}`.
- Delivery: write message → fan out to online recipients via pub/sub → for offline users, push notification.
- Read receipts: per-conversation cursor (last read message ID).
- Scale: each WS server holds tens of thousands of connections; horizontally scale them; Redis cluster for pub/sub.

**Tricky bits:** message ordering across nodes (use timestamps + tiebreaker IDs), handling reconnects (resume from last seen), media uploads (signed URLs to S3, send only the URL through the chat).

---

### Q78. Design a file upload service.

**Direct upload to S3 with presigned URLs.** API issues a signed URL; client uploads directly. Saves your servers from being a bandwidth bottleneck.

For large files, use S3 multipart upload — client uploads chunks in parallel with retry, server initiates and completes the multipart.

After upload, an S3 event triggers a Lambda or queue worker that: validates content (mime, virus scan), generates thumbnails, updates the DB.

---

### Q79. How would you implement search in a MERN app?

Stages of growth:
1. **Mongo `$text` search** — fine for simple use cases. Limited (no relevance tuning, no faceting).
2. **Mongo Atlas Search** — Lucene-backed, hosted. Big upgrade if you're on Atlas.
3. **Dedicated search engine** — Elasticsearch / OpenSearch / Meilisearch / Typesense. Index synced via change streams or app-level dual-write.

For 4-yr-level interviews, the key is articulating **when to upgrade** rather than reaching for ES on day one.

---

### Q80. How do you ensure data consistency between two services (e.g. orders and inventory)?

Distributed transactions are usually impractical. Patterns:

- **Saga** — sequence of local transactions; if one fails, run compensating actions for the prior steps. Two flavors: choreography (events) and orchestration (central coordinator).
- **Outbox pattern** — write the business state and an "event" to the same DB transaction. A separate process reads the outbox and publishes. Guarantees at-least-once delivery without distributed transactions.
- **Idempotency** — every consumer must handle duplicate events safely.

The mental shift is from "consistency" to "eventual consistency" with explicit reconciliation paths.

---

## 11. Coding Problems

Interviewers at 4 yrs expect clean code, edge cases, and complexity analysis.

### Q81. Implement debounce.

```js
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
```
Variations: leading edge, trailing edge, with cancel method.

---

### Q82. Implement throttle.

```js
function throttle(fn, wait) {
  let last = 0, timer;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      clearTimeout(timer);
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
```

---

### Q83. Deep clone an object.

```js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);              // handles cycles
  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value);
  if (value instanceof Map) {
    const out = new Map(); seen.set(value, out);
    for (const [k, v] of value) out.set(deepClone(k, seen), deepClone(v, seen));
    return out;
  }
  if (Array.isArray(value)) {
    const out = []; seen.set(value, out);
    for (const v of value) out.push(deepClone(v, seen));
    return out;
  }
  const out = {}; seen.set(value, out);
  for (const k of Reflect.ownKeys(value)) out[k] = deepClone(value[k], seen);
  return out;
}
```
In modern environments, `structuredClone(value)` is built-in.

---

### Q84. Implement `Promise.all` from scratch.

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = promises.length;
    if (remaining === 0) return resolve([]);
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        v => { results[i] = v; if (--remaining === 0) resolve(results); },
        reject
      );
    });
  });
}
```

---

### Q85. Flatten a nested array.

```js
function flatten(arr, depth = Infinity) {
  return arr.reduce((acc, val) =>
    Array.isArray(val) && depth > 0
      ? acc.concat(flatten(val, depth - 1))
      : acc.concat(val), []);
}
// Or simply: arr.flat(Infinity)
```

---

### Q86. LRU Cache.

```js
class LRU {
  constructor(capacity) { this.cap = capacity; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key); this.map.set(key, val);
    return val;
  }
  put(key, val) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.cap) this.map.delete(this.map.keys().next().value);
    this.map.set(key, val);
  }
}
```
Map preserves insertion order, so the oldest key is at the front. O(1) for both ops.

---

### Q87. Find duplicates in an array of objects by a key.

```js
function findDuplicates(arr, key) {
  const seen = new Map();
  const dups = [];
  for (const item of arr) {
    const k = item[key];
    if (seen.has(k)) dups.push(item);
    else seen.set(k, true);
  }
  return dups;
}
```

---

### Q88. Build a simple event emitter.

```js
class EventEmitter {
  constructor() { this.listeners = new Map(); }
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn); // unsubscribe
  }
  off(event, fn) { this.listeners.get(event)?.delete(fn); }
  emit(event, ...args) {
    this.listeners.get(event)?.forEach(fn => fn(...args));
  }
  once(event, fn) {
    const wrap = (...args) => { this.off(event, wrap); fn(...args); };
    this.on(event, wrap);
  }
}
```

---

## 12. Behavioral Questions

These matter as much as the technical questions at 4 yrs. Use the **STAR** method (Situation, Task, Action, Result). Have 3–4 stories ready that you can adapt.

### Q89. Tell me about a difficult bug you fixed.

Pick a real one. Structure: symptoms → hypotheses → tools used → root cause → fix → prevention. Bonus points for: it was someone else's code, you used an unfamiliar tool to debug, the root cause wasn't where it looked, you added monitoring/tests so it can't recur.

### Q90. Tell me about a time you disagreed with a teammate.

Show that you can disagree on the merits without making it personal. Structure: what was the disagreement, how you understood their position, the data/reasoning you used, the outcome (and what you did if they were right).

### Q91. A time you missed a deadline.

Honesty wins. What you did when you saw it slipping (escalated early, scoped down), what you learned, how your estimation changed.

### Q92. A time you mentored a junior.

At 4 yrs you'll often be the senior in a team of 2–3. Talk about a specific mentoring moment — code review patterns, pairing, helping someone debug, raising the bar without crushing them.

### Q93. Why are you leaving your current job?

Frame as moving toward something, not away. Avoid bashing your current employer — interviewers note it.

### Q94. Where do you see yourself in 3 years?

Show you've thought about it. Pick one of: deeper specialist (architecture, performance), broader (full stack lead, eng manager), or domain-focused (fintech, healthtech). Connect it to why this company.

### Q95. Do you have any questions for us?

Always have 3+ ready. Good ones for a 4-yr level:
- "What does the path from senior to staff look like here?"
- "What does code review and deployment look like? How long from PR to prod?"
- "What's the team's biggest technical debt right now?"
- "How is on-call structured?"
- "What's something you wish was different about engineering here?"

---

## Quick Reference: Common Pitfalls in Interviews

- **Don't say "yes" to things you haven't used.** Say "I've read about it / I've used X which is similar." Interviewers can smell bluffing within two follow-ups.
- **Talk through trade-offs, not just answers.** "I'd use Redux for this app because..." is better than "I'd use Redux."
- **Mention complexity (time + space) on coding questions before they ask.**
- **For system design, always start with requirements clarification** (functional + non-functional, scale, read/write ratio).
- **Tests, observability, deployment, on-call** — sprinkle these into your answers; they signal seniority.
- **Honest "I don't know, but I'd find out by..."** beats fabricated confidence every time.

---

## Final Study Plan (2 weeks before interview)

| Day | Focus |
|---|---|
| 1–2 | JS deep dive (event loop, async, closures), TS basics |
| 3–4 | Node.js internals, streams, clustering |
| 5 | Express patterns, error handling, middleware |
| 6–7 | MongoDB indexing, aggregation, transactions |
| 8–9 | React (hooks, perf) OR Angular (RxJS, change detection) |
| 10 | REST/GraphQL, security |
| 11 | System design — practice 2 problems out loud |
| 12 | Coding problems on a whiteboard / plain text |
| 13 | Behavioral stories (write them down) |
| 14 | Mock interview, rest |

Good luck!
