# Structural Design Patterns

Structural patterns describe how classes and objects are **composed into larger structures**, keeping those structures flexible and efficient as they grow.

---

## 6. Adapter

**Allows incompatible interfaces to work together** by converting the interface of one class into another that the client expects.

**When to use:** integrating a third-party or legacy class whose interface doesn't match the one your code relies on.

```typescript
class PaymentProcessor {
    public pay(amount: number): void {
        console.log("Processing payment of $", amount);
    }
}

class StripePayment {
    public makePayment(amount: number): void {
        console.log("Processing payment of $", amount, " through Stripe");
    }
}

class PayPalPayment {
    public send(amount: number): void {
        console.log("Processing payment of $", amount, " through Paypal");
    }
}

class PaymentAdapter extends PaymentProcessor {
    private adaptee: StripePayment | PayPalPayment;

    constructor(adaptee: StripePayment | PayPalPayment) {
        super();
        this.adaptee = adaptee;
    }

    public pay(amount: number): void {
        if (this.adaptee instanceof PayPalPayment) {
            this.adaptee.send(amount);
        } else {
            this.adaptee.makePayment(amount);
        }
    }
}

new PaymentAdapter(new StripePayment()).pay(100);
new PaymentAdapter(new PayPalPayment()).pay(200);
```

The adapter exposes the expected `pay()` interface and translates each call to the adaptee's own method.

---

## 7. Facade

**Provides a single, simplified interface to a complex subsystem.** Instead of forcing clients to coordinate many moving parts, a facade hides the internal complexity and exposes a clean entry point.

**When to use:** to give a simple API over a tangle of subsystems (e.g. one `watchMovie()` call instead of toggling the amplifier, projector, lights, and player by hand).

```typescript
class Amplifier {
    public on() { console.log("Amplifier on"); }
    public off() { console.log("Amplifier off"); }
    public setVolume(level: number) { console.log(`Amplifier volume set to ${level}`); }
}
class DVDPlayer {
    public on() { console.log("DVD Player on"); }
    public off() { console.log("DVD Player off"); }
    public play(movie: string) { console.log(`Playing "${movie}"`); }
    public stop() { console.log("Stopping DVD"); }
}
class Projector {
    public on() { console.log("Projector on"); }
    public off() { console.log("Projector off"); }
    public wideScreenMode() { console.log("Projector in widescreen mode"); }
}
class Lights {
    public dim(level: number) { console.log(`Dimming lights to ${level}`); }
    public on() { console.log("Lights on"); }
}

class HomeTheaterFacade {
    constructor(
        private amplifier = new Amplifier(),
        private dvdPlayer = new DVDPlayer(),
        private projector = new Projector(),
        private lights = new Lights(),
    ) { }

    public watchMovie(movieName: string) {
        this.lights.dim(10);
        this.projector.on();
        this.projector.wideScreenMode();
        this.amplifier.on();
        this.amplifier.setVolume(50);
        this.dvdPlayer.on();
        this.dvdPlayer.play(movieName);
    }

    public endMovie() {
        this.dvdPlayer.stop();
        this.dvdPlayer.off();
        this.amplifier.off();
        this.projector.off();
        this.lights.on();
    }
}

const homeTheatre = new HomeTheaterFacade();
homeTheatre.watchMovie("Inception");
homeTheatre.endMovie();
```

Clients call `watchMovie()` / `endMovie()` without knowing the orchestration behind them.

---

## 8. Decorator

Lets you **dynamically add new behavior or responsibilities** to objects without modifying their underlying code.

**When to use:** when you need to layer optional features at runtime and a subclass explosion would otherwise result.

```typescript
interface Notifier {
    send(message: string): void;
}

abstract class NotifierDecorator implements Notifier {
    protected notifier: Notifier;

    constructor(notifier: Notifier) {
        this.notifier = notifier;
    }

    send(message: string): void {
        this.notifier.send(message);
    }
}

class EmailNotifier implements Notifier {
    send(message: string): void {
        console.log('Sending Email: ', message);
    }
}

class SMSNotifier extends NotifierDecorator {
    send(message: string): void {
        super.send(message);
        console.log('Sending SMS: ', message);
    }
}

class SlackNotifier extends NotifierDecorator {
    send(message: string): void {
        super.send(message);
        console.log('Sending Slack: ', message);
    }
}

// Stack decorators to send through all three channels
const notifier = new SlackNotifier(new SMSNotifier(new EmailNotifier()));
notifier.send("Hello World");
```

Each decorator wraps another notifier, calling it first and then adding its own behavior.

---

## 9. Composite

Lets you treat **individual objects and compositions of objects uniformly** through a shared interface.

**When to use:** to represent part-whole tree hierarchies (files/folders, UI elements, org charts) where leaves and containers should respond to the same operations.

```typescript
abstract class FileSystemComponent {
    protected parent: FileSystemComponent | null = null;

    constructor(protected name: string) { }

    public abstract getSize(): number;
    public abstract display(): void;

    public getName(): string { return this.name; }
    public setParent(component: FileSystemComponent | null) { this.parent = component; }

    protected getIndent(): number {
        return (this.parent?.getIndent() || 0) + 1;
    }
}

class _File extends FileSystemComponent {
    constructor(name: string, protected size: number) {
        super(name);
    }

    public getSize(): number { return this.size; }

    public display(): void {
        console.log(`${' '.repeat(this.getIndent())}File: ${this.getName()} (${this.getSize()})`);
    }
}

class _Folder extends FileSystemComponent {
    protected children: FileSystemComponent[] = [];

    public getSize(): number {
        return this.children.reduce((sum, c) => sum + c.getSize(), 0);
    }

    public add(component: FileSystemComponent): void {
        this.children.push(component);
        component.setParent(this);
    }

    public display(): void {
        console.log(`${' '.repeat(this.getIndent())}Folder: ${this.getName()} (${this.getSize()})`);
        this.children.forEach(c => c.display());
    }
}

const root = new _Folder('root');
root.add(new _File('file1.txt', 10));
const subFolder = new _Folder('subFolder');
subFolder.add(new _File('file3.txt', 30));
root.add(subFolder);
root.display();
```

A folder computes its size by recursing into children, while the client treats files and folders identically.

---

## 10. Proxy

Provides a **placeholder or surrogate** for another object, allowing you to control access to it.

**When to use:** lazy initialization (virtual proxy), access control (protection proxy), caching, or logging — wherever you want to interpose logic before reaching the real object.

```typescript
interface Image {
    display(): void;
}

class RealImage implements Image {
    constructor(protected name: string) {
        console.log("Loading Image:", name); // expensive
    }

    display(): void {
        console.log(`Displaying Image: ${this.name}`);
    }
}

class ProxyImage implements Image {
    private image: RealImage | null = null;

    constructor(protected name: string) { }

    display(): void {
        if (!this.image) {
            this.image = new RealImage(this.name); // load on first use
        }
        this.image.display();
    }
}

const image = new ProxyImage('photo1.png');
image.display(); // loads, then displays
image.display(); // already loaded — just displays
```

The proxy defers the expensive load until the image is actually needed, then reuses it.

---

## 11. Bridge

Lets you **decouple an abstraction from its implementation**, so the two can vary independently.

**When to use:** when both an abstraction (e.g. remote controls) and its implementation (e.g. devices) have multiple variants and you want to avoid a combinatorial class explosion.

```typescript
class Device {
    protected enabled = false;
    protected volume = 40;

    constructor(private name: string) { }

    public isEnabled(): boolean { return this.enabled; }
    public enable() { this.enabled = true; console.log(`Turning ${this.name} on`); }
    public disable() { this.enabled = false; console.log(`Turning ${this.name} off`); }
    public getVolume(): number { return this.volume; }
    public setVolume(vol: number) {
        if (vol >= 0 && vol <= 100) {
            this.volume = vol;
            console.log(`${this.name} volume set to ${vol}`);
        }
    }
}

class TV extends Device { }
class Radio extends Device { }

class RemoteControl {
    constructor(protected device: Device) { }

    public togglePower() {
        this.device.isEnabled() ? this.device.disable() : this.device.enable();
    }
    public volumeUp() { this.device.setVolume(this.device.getVolume() + 10); }
    public volumeDown() { this.device.setVolume(this.device.getVolume() - 10); }
}

class AdvanceRemoteControl extends RemoteControl {
    public mute() { this.device.setVolume(0); }
}

const tvRemote = new RemoteControl(new TV('TV'));
tvRemote.togglePower();

const radioRemote = new AdvanceRemoteControl(new Radio('Radio'));
radioRemote.togglePower();
radioRemote.mute();
```

Any remote works with any device — the two hierarchies evolve on their own.

---

## 12. Flyweight

Focuses on **efficiently sharing common parts of object state** across many objects to reduce memory usage and boost performance.

**When to use:** when an application creates a huge number of similar objects whose intrinsic (shared) state can be factored out from their extrinsic (per-instance) state.

```typescript
// Intrinsic, shared state lives in the flyweight
class TreeType {
    constructor(
        public name: string,
        public color: string,
        public texture: string,
    ) { }

    // Extrinsic state (x, y) is passed in by the caller
    draw(x: number, y: number): void {
        console.log(`Drawing ${this.name} tree at (${x}, ${y}) with color ${this.color} and texture ${this.texture}`);
    }
}

class TreeFactory {
    private flyweights: Record<string, TreeType> = {};

    private getKey(state: string[]): string {
        return state.join('_');
    }

    public addTree(sharedState: string[], x: number, y: number): void {
        const key = this.getKey(sharedState);
        if (!(key in this.flyweights)) {
            this.flyweights[key] = new TreeType(sharedState[0], sharedState[1], sharedState[2]);
        }
        this.flyweights[key].draw(x, y);
    }

    public uniqueTrees(): void {
        console.log("Unique TreeTypes created:", Object.keys(this.flyweights).length);
    }
}

const factory = new TreeFactory();
factory.addTree(['Oak', 'green', 'oak-texture.png'], 1, 2);
factory.addTree(['Oak', 'green', 'oak-texture.png'], 3, 4); // reuses the Oak flyweight
factory.addTree(['Pine', 'darkgreen', 'pine-texture.png'], 5, 6);
factory.uniqueTrees(); // Unique TreeTypes created: 2
```

Thousands of trees can share a handful of `TreeType` flyweights; only the coordinates differ per tree.
