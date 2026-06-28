# Creational Design Patterns

Creational patterns deal with **object creation mechanisms**. They abstract the instantiation process so that the system stays independent of how its objects are created, composed, and represented.

---

## 1. Singleton

Guarantees a class has **only one instance** and provides a **global point of access** to it.

**When to use:** shared resources such as loggers, configuration managers, or connection pools where exactly one instance must coordinate access.

```typescript
class Logger {
    private static _instance: Logger;

    private constructor() { }

    public static get instance(): Logger {
        if (!Logger._instance) {
            Logger._instance = new Logger();
        }
        return Logger._instance;
    }

    log(message: string) {
        console.log(Date.now(), " Logging: ", message);
    }
}

const s1 = Logger.instance;
const s2 = Logger.instance;

console.log(s1 === s2); // true — both variables hold the same instance

s1.log("Hi from s1");
s2.log("Hi from s2");
```

The private constructor blocks direct instantiation; the static accessor lazily creates the instance on first use and returns the same one thereafter.

---

## 2. Builder

Lets you **construct complex objects step-by-step**, separating the construction logic from the final representation.

**When to use:** objects with many optional parts or configurations (e.g. a `SqlQueryBuilder`), where a telescoping constructor would be unwieldy.

```typescript
type BunType = 'regular' | 'sesame';
type PattyType = "beef" | "chicken" | "veggie";

class Burger {
    public bun!: BunType;
    public patty!: PattyType;
    public extras: string[] = [];

    public listContents(): void {
        console.log(`Burger with ${this.bun} bun, ${this.patty} patty, extras: ${this.extras.length ? this.extras.join(', ') : 'none'}`);
    }
}

interface Builder {
    addBun(bun: BunType): void;
    addPatty(patty: PattyType): void;
    addExtra(extra: string): void;
}

class BurgerBuilder implements Builder {
    private burger!: Burger;

    constructor() {
        this.reset();
    }

    private reset() {
        this.burger = new Burger();
    }

    public addBun(bun: BunType): void {
        this.burger.bun = bun;
    }

    public addPatty(patty: PattyType): void {
        this.burger.patty = patty;
    }

    public addExtra(extra: string): void {
        this.burger.extras.push(extra);
    }

    public getBurger(): Burger {
        const burg = this.burger;
        this.reset();
        return burg;
    }
}

const builder = new BurgerBuilder();
builder.addBun('sesame');
builder.addPatty('beef');
builder.addExtra('cheese');
builder.getBurger().listContents();
```

Each `add*` call configures one part; `getBurger()` returns the finished product and resets the builder for the next build.

---

## 3. Factory Method

**Provides an interface** for creating objects in a **superclass**, but **allows subclasses to alter** the type of objects that will be created.

**When to use:** when a class can't anticipate the type of objects it must create, and you want to delegate that decision to subclasses.

```typescript
interface Transport {
    deliver(): void;
}

class Truck implements Transport {
    public deliver(): void {
        console.log("Delivering by land in a truck");
    }
}

class Ship implements Transport {
    public deliver(): void {
        console.log("Delivering by sea in a ship");
    }
}

abstract class Logistics {
    public abstract createTransport(): Transport; // the factory method

    public planDelivery(): void {
        const transport = this.createTransport();
        transport.deliver();
    }
}

class RoadLogistics extends Logistics {
    public createTransport(): Transport {
        return new Truck();
    }
}

class SeaLogistics extends Logistics {
    public createTransport(): Transport {
        return new Ship();
    }
}

new RoadLogistics().planDelivery(); // Delivering by land in a truck
new SeaLogistics().planDelivery();  // Delivering by sea in a ship
```

`planDelivery()` works with the `Transport` abstraction; subclasses decide which concrete transport to instantiate.

---

## 4. Abstract Factory

Provides an **interface for creating families** of related or dependent objects without specifying their concrete classes.

The key word is **families**:

- *Factory Method* deals with creating one product at a time.
- *Abstract Factory* deals with creating multiple products that must work together. A GUI factory does not just create buttons — it creates buttons, checkboxes, text fields, and menus that all share the same visual style.

```typescript
interface Button { render(): string; }
interface Checkbox { render(): string; }

interface GUIFactory {
    createButton(): Button;
    createCheckbox(): Checkbox;
}

class LightButton implements Button {
    public render() { return "Rendering Light Button"; }
}
class LightCheckbox implements Checkbox {
    public render() { return "Rendering Light Checkbox"; }
}
class DarkButton implements Button {
    public render() { return "Rendering Dark Button"; }
}
class DarkCheckbox implements Checkbox {
    public render() { return "Rendering Dark Checkbox"; }
}

class LightGUIFactory implements GUIFactory {
    public createButton(): Button { return new LightButton(); }
    public createCheckbox(): Checkbox { return new LightCheckbox(); }
}
class DarkGUIFactory implements GUIFactory {
    public createButton(): Button { return new DarkButton(); }
    public createCheckbox(): Checkbox { return new DarkCheckbox(); }
}

function client(factory: GUIFactory) {
    console.log(factory.createButton().render());
    console.log(factory.createCheckbox().render());
}

client(new LightGUIFactory());
client(new DarkGUIFactory());
```

The client works only with the `GUIFactory` interface, so swapping the factory swaps an entire consistent family of widgets.

---

## 5. Prototype

Lets you create new objects by **cloning existing ones**, instead of instantiating them from scratch.

**When to use:** when object creation is expensive, or when you need copies of objects whose concrete classes you don't want to depend on. Prototype implementations should do a **deep copy** when the object contains mutable reference types.

```typescript
interface Shape {
    clone(): Shape;
    draw(): void;
}

class Circle implements Shape {
    public radius: number;
    public circularReference?: Circle;

    constructor(radius: number) {
        this.radius = radius;
    }

    draw(): void {
        console.log("Drawing Circle with radius", this.radius);
    }

    clone(): Circle {
        const clone = new Circle(this.radius);
        // Handle circular reference
        if (this.circularReference) {
            clone.circularReference = clone;
        }
        return clone;
    }
}

const circle = new Circle(10);
const clonedCircle = circle.clone();
clonedCircle.draw();

console.log(circle !== clonedCircle); // true — distinct objects
```

Each shape knows how to copy itself, including any special handling for circular references.
