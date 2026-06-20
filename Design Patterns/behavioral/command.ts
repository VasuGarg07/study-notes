// Command - Light Switch

class Light {
    public on() {
        console.log("Light is ON");
    }

    public off() {
        console.log("Light is OFF");
    }
}

interface Command {
    execute(): void;
    undo(): void;
}

class LightOnCommand implements Command {
    private light: Light;

    constructor(light: Light) {
        this.light = light;
    }

    execute(): void {
        this.light.on();
    }

    undo(): void {
        this.light.off();
    }
}

class LightOffCommand implements Command {
    private light: Light;

    constructor(light: Light) {
        this.light = light;
    }

    execute(): void {
        this.light.off();
    }

    undo(): void {
        this.light.on();
    }
}

class LightRemote {
    private onCommand: Command | null = null;
    private offCommand: Command | null = null;

    constructor(startCommand: Command, stopCommand: Command) {
        this.onCommand = startCommand;
        this.offCommand = stopCommand;
    }

    pressButton() {
        if (this.onCommand) {
            this.onCommand.execute();
        }
        if (this.offCommand) {
            this.offCommand.execute();
        }
    }
}

// ----- Client code ----
const light = new Light();
const lightOn = new LightOnCommand(light);
const lightOff = new LightOffCommand(light);
const remoteControl = new LightRemote(lightOn, lightOff);

remoteControl.pressButton();