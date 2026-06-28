# Behavioral Design Patterns

Behavioral patterns are concerned with **algorithms and the assignment of responsibilities** between objects — how objects communicate and how control flows between them.

---

## 13. Strategy

Lets you define a **family of algorithms**, encapsulate each in its own class, and make them interchangeable at runtime.

**When to use:** when you have several variants of an algorithm (sorting, payment, compression) and want to swap them without changing the client.

```typescript
interface PaymentStrategy {
    pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
    public pay(amount: number) { console.log(`Paid ${amount} using Credit Card`); }
}
class PaypalPayment implements PaymentStrategy {
    public pay(amount: number) { console.log(`Paid ${amount} using PayPal`); }
}
class BitcoinPayment implements PaymentStrategy {
    public pay(amount: number) { console.log(`Paid ${amount} using Bitcoin`); }
}

class ShoppingCart {
    constructor(private strategy: PaymentStrategy) { }

    public setPaymentMethod(strategy: PaymentStrategy) {
        this.strategy = strategy;
    }

    public checkout(amount: number) {
        this.strategy.pay(amount);
    }
}

const cart = new ShoppingCart(new CreditCardPayment());
cart.checkout(100);
cart.setPaymentMethod(new PaypalPayment());
cart.checkout(200);
```

The cart delegates to whichever strategy is currently set, with no knowledge of how each pays.

---

## 14. Iterator

Provides a standard way to **access elements of a collection sequentially** without exposing its internal structure.

**When to use:** when you want a uniform traversal API across different collection types, or multiple simultaneous traversals over the same collection.

```typescript
interface MyIterator<T> {
    hasNext(): boolean;
    next(): T | null;
}

interface IterableCollection<T> {
    createIterator(): MyIterator<T>;
}

class NameIterator implements MyIterator<string> {
    private index = 0;

    constructor(private names: string[]) { }

    public hasNext(): boolean {
        return this.index < this.names.length;
    }

    public next(): string | null {
        return this.names[this.index++];
    }
}

class NameRepository implements IterableCollection<string> {
    constructor(private names: string[]) { }

    public createIterator(): MyIterator<string> {
        return new NameIterator(this.names);
    }
}

const iterator = new NameRepository(["Alice", "Bob", "Charlie"]).createIterator();
while (iterator.hasNext()) {
    console.log(iterator.next());
}
```

The collection hands out an iterator; the client walks it via `hasNext()` / `next()` without touching the underlying array.

---

## 15. Observer

Defines a **one-to-many dependency** so that when one object (the subject) changes state, all its dependents (observers) are automatically notified and updated.

**When to use:** event systems, pub/sub, reactive UIs — anywhere many objects must react to changes in another.

```typescript
interface Observer {
    update(price: number): void;
}

interface Subject {
    subscribe(observer: Observer): void;
    unsubscribe(observer: Observer): void;
    notify(): void;
}

class Stock implements Subject {
    private observers: Observer[] = [];
    private price = 0;

    constructor(private stockName: string) { }

    public subscribe(observer: Observer): void {
        if (!this.observers.includes(observer)) this.observers.push(observer);
    }

    public unsubscribe(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index !== -1) this.observers.splice(index, 1);
    }

    public notify(): void {
        this.observers.forEach(obs => obs.update(this.price));
    }

    public setPrice(price: number): void {
        this.price = price;
        this.notify();
    }
}

class Investor implements Observer {
    constructor(private investorName: string) { }

    update(price: number): void {
        console.log(`${this.investorName} notified of new Price: ${price}`);
    }
}

const stock = new Stock("ACME");
const alice = new Investor("Alice");
stock.subscribe(alice);
stock.subscribe(new Investor("Bob"));
stock.setPrice(100); // both notified
```

Setting the price triggers `notify()`, which pushes the update to every subscribed investor.

---

## 16. Command

Turns a **request into a standalone object**, letting you parameterize actions, queue them, log them, or support undoable operations — all while decoupling the sender from the receiver.

**When to use:** undo/redo stacks, task queues, macro recording, or remote-control style invokers.

```typescript
class Light {
    public on() { console.log("Light is ON"); }
    public off() { console.log("Light is OFF"); }
}

interface Command {
    execute(): void;
    undo(): void;
}

class LightOnCommand implements Command {
    constructor(private light: Light) { }
    execute(): void { this.light.on(); }
    undo(): void { this.light.off(); }
}

class LightOffCommand implements Command {
    constructor(private light: Light) { }
    execute(): void { this.light.off(); }
    undo(): void { this.light.on(); }
}

class LightRemote {
    constructor(private command: Command) { }

    pressButton() { this.command.execute(); }
    pressUndo() { this.command.undo(); }
}

const light = new Light();
const remote = new LightRemote(new LightOnCommand(light));
remote.pressButton(); // Light is ON
remote.pressUndo();   // Light is OFF
```

The invoker (`LightRemote`) triggers commands without knowing what they do or which receiver they act on.

---

## 17. State

Lets an object **change its behavior when its internal state changes**, as if it were switching to a different class at runtime.

**When to use:** when an object's behavior depends on its state and it has many state-dependent conditionals — a vending machine, a TCP connection, a document workflow.

```typescript
class VendingMachine {
    private state!: VendingMachineState;

    constructor(state: VendingMachineState) {
        this.setState(state);
    }

    public setState(state: VendingMachineState): void {
        this.state = state;
        this.state.setContext(this);
    }

    public insertCoin() { this.state.insertCoin(); }
    public pressButton() { this.state.pressButton(); }
    public dispense() { this.state.dispense(); }
}

abstract class VendingMachineState {
    protected context!: VendingMachine;
    public setContext(context: VendingMachine) { this.context = context; }

    public abstract insertCoin(): void;
    public abstract pressButton(): void;
    public abstract dispense(): void;
}

class IdleState extends VendingMachineState {
    public insertCoin() { console.log("Coin inserted"); this.context.setState(new HasCoinState()); }
    public pressButton() { console.log("Insert coin first"); }
    public dispense() { console.log("Insert coin first"); }
}

class HasCoinState extends VendingMachineState {
    public insertCoin() { console.log("Waiting for Button Press"); }
    public pressButton() { console.log("Button Pressed"); this.context.setState(new DispensingState()); }
    public dispense() { console.log("Press Button First"); }
}

class DispensingState extends VendingMachineState {
    public insertCoin() { console.log("Action already completed"); }
    public pressButton() { console.log("Action already completed"); }
    public dispense() {
        console.log("Dispensing item...");
        this.context.setState(new IdleState());
    }
}

const machine = new VendingMachine(new IdleState());
machine.insertCoin();
machine.pressButton();
machine.dispense();
```

Each state handles the same operations differently and transitions the machine to the next state.

---

## 18. Template Method

Defines the **skeleton of an algorithm in a base class** but allows subclasses to override specific steps without changing the overall structure.

**When to use:** when several algorithms share the same overall sequence but differ in individual steps (parsers, build pipelines, report generators).

```typescript
abstract class DataParser {
    // The template method — fixed sequence
    public parseData() {
        this.readData();
        this.processData();
        this.saveData();
        this.hook();
    }

    protected abstract readData(): void;
    protected abstract processData(): void;
    protected abstract saveData(): void;

    protected hook(): void { } // optional override point
}

class CSVParser extends DataParser {
    protected readData() { console.log("Reading CSV data"); }
    protected processData() { console.log("Processing CSV data"); }
    protected saveData() { console.log("Saving CSV data"); }
}

class JSONParser extends DataParser {
    protected readData() { console.log("Reading JSON data"); }
    protected processData() { console.log("Processing JSON data"); }
    protected saveData() { console.log("Saving JSON data"); }
}

new CSVParser().parseData();
new JSONParser().parseData();
```

`parseData()` locks in the order of steps; subclasses fill in the details and may use the `hook()` extension point.

---

## 19. Chain of Responsibility

Lets you **pass requests along a chain of handlers**, where each handler decides whether to process the request or pass it to the next.

**When to use:** when more than one object may handle a request and the handler isn't known in advance — middleware pipelines, logging levels, approval workflows.

```typescript
interface Logger {
    setNext(handler: Logger): Logger;
    log(message: string, level: string): void;
}

abstract class AbstractLogger implements Logger {
    protected nextLogger?: Logger;

    public setNext(logger: Logger): Logger {
        this.nextLogger = logger;
        return logger; // enables chaining
    }

    public log(message: string, level: string) {
        this.nextLogger?.log(message, level);
    }
}

class InfoLogger extends AbstractLogger {
    public log(message: string, level: string) {
        if (level === 'INFO') console.log(`INFO: ${message}`);
        super.log(message, level);
    }
}
class DebugLogger extends AbstractLogger {
    public log(message: string, level: string) {
        if (level === 'DEBUG') console.log(`DEBUG: ${message}`);
        super.log(message, level);
    }
}
class ErrorLogger extends AbstractLogger {
    public log(message: string, level: string) {
        if (level === 'ERROR') console.log(`ERROR: ${message}`);
        super.log(message, level);
    }
}

const infoLogger = new InfoLogger();
infoLogger.setNext(new DebugLogger()).setNext(new ErrorLogger());

infoLogger.log("System running", "INFO");
infoLogger.log("Something went wrong!", "ERROR");
```

Each logger handles only the levels it cares about and forwards the rest down the chain.

---

## 20. Visitor

Lets you **add new operations to existing object structures** without modifying their classes.

**When to use:** when you have a stable set of element classes but frequently add new operations across all of them (e.g. computing area, perimeter, or exporting shapes).

```typescript
interface Shape {
    accept(visitor: ShapeVisitor): void;
}

class Circle implements Shape {
    constructor(public radius: number) { }
    public accept(visitor: ShapeVisitor) { visitor.visitCircle(this); }
}

class Rectangle implements Shape {
    constructor(public width: number, public length: number) { }
    public accept(visitor: ShapeVisitor) { visitor.visitRectangle(this); }
}

interface ShapeVisitor {
    visitCircle(circle: Circle): void;
    visitRectangle(rectangle: Rectangle): void;
}

class AreaVisitor implements ShapeVisitor {
    public visitCircle(c: Circle) {
        console.log("Area of circle:", (Math.PI * c.radius * c.radius).toFixed(2));
    }
    public visitRectangle(r: Rectangle) {
        console.log("Area of Rectangle:", r.width * r.length);
    }
}

class PerimeterVisitor implements ShapeVisitor {
    public visitCircle(c: Circle) {
        console.log("Perimeter of circle:", (2 * Math.PI * c.radius).toFixed(2));
    }
    public visitRectangle(r: Rectangle) {
        console.log("Perimeter of Rectangle:", 2 * (r.width + r.length));
    }
}

const shapes: Shape[] = [new Circle(10), new Rectangle(15, 20)];
shapes.forEach(s => s.accept(new AreaVisitor()));
shapes.forEach(s => s.accept(new PerimeterVisitor()));
```

A new operation is just a new visitor — the shape classes never change. (The trade-off: adding a new *shape* requires updating every visitor.)

---

## 21. Mediator

Defines an object (the **Mediator**) that encapsulates how a set of objects interact, so they no longer refer to each other directly.

**When to use:** when many objects communicate in complex ways and the resulting web of references is hard to maintain — chat rooms, UI dialogs, air-traffic control.

```typescript
interface ChatMediator {
    sendMessage(message: string, user: User): void;
    addUser(user: User): void;
}

class ChatRoom implements ChatMediator {
    private users: User[] = [];

    public addUser(user: User): void {
        if (!this.users.includes(user)) {
            this.users.push(user);
            console.log(`${user.name} joined the chat`);
        }
    }

    public sendMessage(message: string, sender: User): void {
        console.log(`${sender.name} sends: ${message}`);
        this.users
            .filter(u => u !== sender)
            .forEach(u => u.receive(message));
    }
}

class User {
    constructor(public name: string, private mediator: ChatMediator) { }

    public send(message: string) { this.mediator.sendMessage(message, this); }
    public receive(message: string) { console.log(`${this.name} receives: ${message}`); }
}

const room = new ChatRoom();
const alice = new User('Alice', room);
room.addUser(alice);
room.addUser(new User('Bob', room));
alice.send('Hello everyone!');
```

Users talk only to the mediator, which routes messages — they never hold references to one another.

---

## 22. Memento

Lets you **capture and store an object's internal state** so it can be restored later, without violating encapsulation.

**When to use:** undo/redo, snapshots, checkpoints — anywhere you need to roll an object back to a previous state.

```typescript
class EditorMemento {
    constructor(private state: string) { }
    public getState(): string { return this.state; }
}

class Editor {
    private content = '';

    public type(text: string): void {
        console.log("Typing:", text);
        this.content = text;
    }

    public save(): EditorMemento {
        return new EditorMemento(this.content);
    }

    public restore(memento: EditorMemento) {
        this.content = memento.getState();
    }

    public getContent(): string {
        console.log("Current Content:", this.content);
        return this.content;
    }
}

class EditorHistory {
    private history: EditorMemento[] = [];

    constructor(private editor: Editor) { }

    public backup() { this.history.push(this.editor.save()); }

    public undo() {
        console.log("Undo...");
        const memento = this.history.pop();
        memento && this.editor.restore(memento);
    }
}

const editor = new Editor();
const history = new EditorHistory(editor);

editor.type("Hello");
history.backup();
editor.type("Hello World");
editor.getContent(); // Hello World
history.undo();
editor.getContent(); // Hello
```

The editor (originator) produces mementos; the history (caretaker) stores them and triggers restores without inspecting their contents.
