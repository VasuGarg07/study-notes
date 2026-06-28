// Strategy - Payment

interface PaymentStrategy {
    pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
    public pay(amount: number): void {
        console.log(`Paid ${amount} using Credit Card`)
    }
}

class PaypalPayment implements PaymentStrategy {
    public pay(amount: number): void {
        console.log(`Paid ${amount} using PayPal`)
    }
}

class BitcoinPayment implements PaymentStrategy {
    public pay(amount: number): void {
        console.log(`Paid ${amount} using Bitcoin`)
    }
}

class ShoppingCart {
    private strategy!: PaymentStrategy;

    constructor(strategy: PaymentStrategy) {
        this.setPaymentMethod(strategy);
    }

    public setPaymentMethod(strategy: PaymentStrategy) {
        this.strategy = strategy;
    }

    public checkout(amount: number) {
        if (!this.strategy) {
            console.log("No payment method selected");
            return;
        }
        this.strategy.pay(amount);
    }
}

//  ---- Client Code ----
const shoppingCart = new ShoppingCart(new CreditCardPayment());
shoppingCart.checkout(100);

shoppingCart.setPaymentMethod(new PaypalPayment());
shoppingCart.checkout(200);

shoppingCart.setPaymentMethod(new BitcoinPayment());
shoppingCart.checkout(300);