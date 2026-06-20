// Adapter - Payment Process

class PaymentProcessor {
    public pay(amount: number): void {
        console.log("Processing payment of $", amount);
    }
}

class StripePayment {
    public makePayment(amount: number): void {
        console.log("Processing payment of $", amount, " through Stripe");
    }
}

class PayPalPayment {
    public send(amount: number): void {
        console.log("Processing payment of $", amount, " through Paypal");
    }
}

class PaymentAdapter extends PaymentProcessor {
    private adaptee: StripePayment | PayPalPayment;

    constructor(adaptee: StripePayment | PayPalPayment) {
        super();
        this.adaptee = adaptee;
    }

    public pay(amount: number): void {
        if (this.adaptee instanceof PayPalPayment) {
            this.adaptee.send(amount);
        } else {
            this.adaptee.makePayment(amount);
        }
    }
}

console.log("Demonstrating Payment Via Different Processers");
const stripe = new StripePayment();
const stripeAdaptor = new PaymentAdapter(stripe);
stripeAdaptor.pay(100);

const paypal = new PayPalPayment();
const paypalAdaptor = new PaymentAdapter(paypal);
paypalAdaptor.pay(200);