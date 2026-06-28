// Factory Method - Logistics

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
    public abstract createTransport(): Transport;

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

console.log("Road Logistics is operational!")
const roadLogistics = new RoadLogistics();
roadLogistics.planDelivery();

console.log("Sea logistics is also operational now!!");
const seaLogistics = new SeaLogistics();
seaLogistics.planDelivery();