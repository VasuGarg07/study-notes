// Flyweight - Tree Rendering;

class TreeType {
    name: string;
    color: string;
    texture: string;

    constructor(...args: string[]) {
        this.name = args[0];
        this.color = args[1];
        this.texture = args[2];
    }

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
            this.flyweights[key] = new TreeType(...sharedState);
        }
        this.flyweights[key].draw(x, y);
    }

    public uniqueTrees(): void {
        console.log("Unique TreeTypes created:", Object.keys(this.flyweights).length, '\n');
    }
}


const factory = new TreeFactory();
factory.addTree(['Oak', 'green', 'oak-texture.png'], 1, 2)
factory.addTree(['Oak', 'green', 'oak-texture.png'], 3, 4)
factory.addTree(['Pine', 'darkgreen', 'pine-texture.png'], 5, 6)
factory.uniqueTrees();

factory.addTree(['Pine', 'darkgreen', 'pine-texture.png'], 5, 6)
factory.addTree(['Oak', 'green', 'oak-texture.png'], 3, 3)
factory.uniqueTrees();
