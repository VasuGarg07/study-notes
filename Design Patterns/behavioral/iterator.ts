// Iterator - Name Repository

interface MyIterator<T> {
    hasNext(): boolean;
    next(): T | null;
}

interface IterableCollection<T> {
    createIterator(): MyIterator<T>;
}

class NameIterator implements MyIterator<string> {
    private names: string[] = [];
    private index: number;

    constructor(names: string[]) {
        this.names = names;
        this.index = 0;
    }

    public hasNext(): boolean {
        return this.index < this.names.length;
    }

    public next(): string | null {
        const name = this.names[this.index++];
        return name;
    }
}

class NameRepository implements IterableCollection<string> {
    private names: string[] = [];
    public iterator!: MyIterator<string>;

    constructor(names: string[]) {
        this.names = names;
    }

    public createIterator(): MyIterator<string> {
        return new NameIterator(this.names);
    }
}

// ---- CLient code ----
const nameRepo = new NameRepository(["Alice", "Bob", "Charlie"]);
const iterator = nameRepo.createIterator();

while (iterator.hasNext()) {
    console.log(iterator.next())
}