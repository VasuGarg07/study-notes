// Prototype - Shapes

interface Shape {
    clone(): Shape;
    draw(): void;
}

class Circle implements Shape {
    public radius: number;
    public circularReference?: Circle

    constructor(radius: number) {
        this.radius = radius;
    }

    draw(): void {
        console.log("Drawing Circle with radius", this.radius);
    }

    clone(): Circle {
        const clone = new Circle(this.radius); // complex objects can also be added in constructor
        // Handle circular reference
        if (this.circularReference) {
            clone.circularReference = clone;
        }
        return clone;
    }
}

class Rectangle implements Shape {
    public width: number;
    public height: number;
    public circularReference?: Rectangle;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
    }


    draw(): void {
        console.log(`Drawing Rectangle with width ${this.width} and height ${this.height}.`);
    }


    clone(): Rectangle {
        const clone = new Rectangle(this.width, this.height); // complex objects can also be added in constructor
        // Handle circular reference
        if (this.circularReference) {
            clone.circularReference = clone;
        }
        return clone;
    }

}

const circle = new Circle(10);
circle.draw();
const clonedCircle = circle.clone();
clonedCircle.draw();

const rect = new Rectangle(20, 30);
rect.draw();
const clonedRect = rect.clone();
clonedRect.draw();

console.log("Original and clone are different objects: ", circle !== clonedCircle)