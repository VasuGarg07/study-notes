// Abstract Factory - Themed GUI


interface Button {
    render(): string;
}

interface Checkbox {
    render(): string;
}

interface GUIFactory {
    createButton(): Button;
    createCheckbox(): Checkbox;
}

class LightButton implements Button {
    public render() {
        return "Rendering Light Button"
    }
}

class LightCheckbox implements Checkbox {
    public render() {
        return "Rendering Light Checkbox"
    }
}

class DarkButton implements Button {
    public render() {
        return "Rendering Dark Button";
    }
}

class DarkCheckbox implements Checkbox {
    public render() {
        return "Rendering Dark Checkbox"
    }
}

class LightGUIFactory implements GUIFactory {
    public createButton(): Button {
        return new LightButton();
    }

    public createCheckbox(): Checkbox {
        return new LightCheckbox();
    }
}

class DarkGUIFactory implements GUIFactory {
    public createButton(): Button {
        return new DarkButton();
    }

    public createCheckbox(): Checkbox {
        return new DarkCheckbox();
    }
}

function client(factory: GUIFactory) {
    const button: Button = factory.createButton();
    const checkbox: Checkbox = factory.createCheckbox();

    console.log("Working with button: ", button.render());
    console.log("Working with checkbox: ", checkbox.render());
}

console.log("This is an example of Abstract Factory! \n\n")
console.log("Starting with Light GUI")
client(new LightGUIFactory());
console.log("\nFinishing with Dark GUI");
client(new DarkGUIFactory());