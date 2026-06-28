// Proxy - Image

interface Image {
    display(): void;
}

class RealImage implements Image {
    protected name: string;

    constructor(name: string) {
        this.name = name;
        console.log("Loading Image:", name);
    }

    display(): void {
        console.log(`Displaying Image: ${this.name}`);
    }
}

class ProxyImage implements Image {
    protected name: string;
    private image: RealImage | null;

    constructor(name: string) {
        this.name = name;
        this.image = null;
    }

    display(): void {
        if (!this.image) {
            this.image = new RealImage(this.name);
        }
        this.image.display();
    }
}

// ----- Client code
const fileName = 'photo1.png';
console.log(`Creating Proxy for ${fileName}`);
const image = new ProxyImage(fileName);
image.display();
image.display();