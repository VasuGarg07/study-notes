// State - Vending Machine

class VendingMachine {
    private state!: VendingMachineState;

    constructor(state: VendingMachineState) {
        this.setState(state);
    }

    public setState(state: VendingMachineState): void {
        this.state = state;
        this.state.setContext(this);
    }

    public insertCoin() { this.state.insertCoin() }
    public pressButton() { this.state.pressButton() }
    public dispense() { this.state.dispense() }
}

abstract class VendingMachineState {
    protected context!: VendingMachine;

    public setContext(context: VendingMachine) {
        this.context = context;
    }

    public abstract insertCoin(): void;
    public abstract pressButton(): void;
    public abstract dispense(): void;
}

class IdleState extends VendingMachineState {
    public insertCoin(): void {
        console.log("Coin inserted");
        this.context.setState(new HasCoinState());
    }

    public pressButton(): void {
        console.log("Insert coin first");
    }

    public dispense(): void {
        console.log("Insert coin first");
    }
}

class HasCoinState extends VendingMachineState {
    public insertCoin(): void {
        console.log("Waiting for Button Press");
    }

    public pressButton(): void {
        console.log("Button Pressed");
        this.context.setState(new DispensingState())
    }

    public dispense(): void {
        console.log("Press Button First");
    }
}

class DispensingState extends VendingMachineState {
    public insertCoin(): void {
        console.log("Action already completed");
    }

    public pressButton(): void {
        console.log("Action already completed");
    }

    public dispense(): void {
        console.log("Dispensing item...");
        console.log("Ready for next customer");
        this.context.setState(new IdleState());
    }
}

//  ----- Client Code -----
const vendingMachine = new VendingMachine(new IdleState());
vendingMachine.pressButton();
vendingMachine.insertCoin();
vendingMachine.pressButton();
vendingMachine.dispense();