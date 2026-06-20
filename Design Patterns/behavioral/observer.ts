// Observer - Stock Price Tracker

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
    private price: number = 0;
    private stockName: string

    constructor(name: string) {
        this.stockName = name;
    }

    public subscribe(observer: Observer): void {
        if (this.observers.includes(observer)) return;
        this.observers.push(observer);
    }

    public unsubscribe(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }

    public notify(): void {
        this.observers.forEach(obs => obs.update(this.price))
    }

    public setPrice(num: number): void {
        this.price = num;
        this.notify();
    }
}

class Investor implements Observer {
    private investorName: string;

    constructor(name: string) {
        this.investorName = name;
    }

    update(price: number): void {
        console.log(`${this.investorName} notified of new Price: ${price}`)
    }
}

// ---- Client Code ----
const stock = new Stock("ACME");
const investor1 = new Investor("Alice")
const investor2 = new Investor("Bob");

stock.subscribe(investor1);
stock.subscribe(investor2);
stock.setPrice(100);
stock.setPrice(200);

stock.unsubscribe(investor2);
stock.setPrice(300)