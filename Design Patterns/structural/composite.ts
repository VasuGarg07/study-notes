// Composite - File System

abstract class FileSystemComponent {
    protected name: string;
    protected parent: FileSystemComponent | null = null;

    constructor(name: string) {
        this.name = name;
    }

    public abstract getSize(): number;

    public getName(): string {
        return this.name;
    }

    public getParent(): FileSystemComponent | null {
        return this.parent;
    }

    public setParent(component: FileSystemComponent | null) {
        this.parent = component;
    }

    protected getIndent(): number {
        return (this.parent?.getIndent() || 0) + 1;
    }

    public abstract display(): void
}

class _File extends FileSystemComponent {
    protected size: number;

    constructor(name: string, size: number) {
        super(name);
        this.size = size;
    }

    public getSize(): number {
        return this.size;
    }

    public display(): void {
        console.log(
            `${' '.repeat(this.getIndent())}$File: ${this.getName()} (${this.getSize()})`
        );
    }
}

class _Folder extends FileSystemComponent {
    protected children: FileSystemComponent[] = [];

    public getSize(): number {
        let size = 0;
        this.children.forEach(component => {
            size += component.getSize();
        });

        return size;
    }

    public add(component: FileSystemComponent): void {
        this.children.push(component);
        component.setParent(this);
    }

    public remove(component: FileSystemComponent): void {
        const index = this.children.indexOf(component);
        if (index !== -1) {
            this.children.splice(index, 1);
            component.setParent(null);
        }
    }

    public display(): void {
        console.log(
            `${' '.repeat(this.getIndent())}Folder: ${this.getName()} (${this.getSize()})`
        );
        this.children.forEach(component => component.display());
    }
}

// ---- Client Code
const root = new _Folder('root');
root.add(new _File('file1.txt', 10))
root.add(new _File('file2.txt', 20))

const subFolder = new _Folder('subFolder');
subFolder.add(new _File('file3.txt', 30))
root.add(subFolder);

root.display()