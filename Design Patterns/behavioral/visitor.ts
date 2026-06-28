// Visitor - Shapes

interface Shape {
    accept(visitor: ShapeVisitor): void;
}

class Circle implements Shape {
    public radius: number;

    constructor(rad: number) {
        this.radius = rad;
    }

    public accept(visitor: ShapeVisitor) {
        visitor.visitCircle(this);
    }
}

class Rectangle implements Shape {
    public width: number;
    public length: number;

    constructor(w: number, h: number) {
        this.width = w;
        this.length = h;
    }

    public accept(visitor: ShapeVisitor): void {
        visitor.visitRectangle(this);
    }
}

interface ShapeVisitor {
    visitCircle(circle: Circle): void
    visitRectangle(rectangle: Rectangle): void
}

class AreaVisitor implements ShapeVisitor {
    public visitCircle(circle: Circle): void {
        console.log("Area of circle:", (Math.PI * circle.radius * circle.radius).toFixed(2));
    }

    public visitRectangle(rectangle: Rectangle): void {
        console.log("Area of Rectangle:", rectangle.width * rectangle.length);
    }
}

class PerimeterVisitor implements ShapeVisitor {
    public visitCircle(circle: Circle): void {
        console.log("Perimeter of circle:", (2 * Math.PI * circle.radius).toFixed(2));
    }

    public visitRectangle(rectangle: Rectangle): void {
        console.log("Perimeter of Rectangle:", (2 * (rectangle.width + rectangle.length)));
    }
}

// ---- Client code ----
const shapes = [new Circle(10), new Rectangle(15, 20)];

const areaVisitor = new AreaVisitor()
shapes.forEach(shape => shape.accept(areaVisitor));

const perimeterVisitor = new PerimeterVisitor();
shapes.forEach(shape => shape.accept(perimeterVisitor));
