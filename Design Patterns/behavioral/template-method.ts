// Template Method - Data Parser

abstract class DataParser {
    public parseData() {
        this.readData();
        this.processData();
        this.saveData();
        this.hook();
    }

    protected abstract readData(): void;
    protected abstract processData(): void;
    protected abstract saveData(): void;

    protected hook(): void { }
}

class CSVParser extends DataParser {
    protected readData(): void {
        console.log("Reading CSV data");
    }
    protected processData(): void {
        console.log("Processing CSV data");
    }
    protected saveData(): void {
        console.log("Saving CSV data");
    }
}

class JSONParser extends DataParser {
    protected readData(): void {
        console.log("Reading JSON data");
    }
    protected processData(): void {
        console.log("Processing JSON data");
    }
    protected saveData(): void {
        console.log("Saving JSON data");
    }
}

// ---- Client code ----
const csvParser = new CSVParser();
csvParser.parseData();

const jsonParser = new JSONParser();
jsonParser.parseData();