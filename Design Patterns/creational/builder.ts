// Builder Pattern - Burger Builder

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
    addExtra(extras: string): void;
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

console.log("Making First Burger... ")
builder.addBun('sesame');
builder.addPatty('beef');
builder.addExtra('cheese');
builder.addExtra('lettuce');
console.log("Burger 1 is Ready!!");
builder.getBurger().listContents()

console.log("Making Second Burger");
builder.addBun('regular');
builder.addPatty('veggie');
builder.addExtra('tomato');
console.log("Burger 2 is Ready!!");
builder.getBurger().listContents()


console.log("Making Third Burger");
builder.addBun('sesame');
builder.addPatty('chicken');
console.log("Burger 3 is Ready!!");
builder.getBurger().listContents()