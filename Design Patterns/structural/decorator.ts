// Decorator - notification system

interface Notifier {
    send(message: string): void
}

abstract class NotifierDecorator implements Notifier {
    protected notifier: Notifier

    constructor(notifier: Notifier) {
        this.notifier = notifier;
    }

    send(message: string): void {
        this.notifier.send(message);
    }
}


class EmailNotifier implements Notifier {
    send(message: string): void {
        console.log('Sending Email: ', message);
    }
}

class SMSNotifier extends NotifierDecorator {
    send(message: string): void {
        super.send(message);
        console.log('Sending SMS: ', message);
    }
}

class SlackNotifier extends NotifierDecorator {
    send(message: string): void {
        super.send(message);
        console.log('Sending Slack: ', message);
    }
}

const emailNotifier = new EmailNotifier();
const smsNotifier = new SMSNotifier(emailNotifier);
const slackNotifier = new SlackNotifier(smsNotifier);

slackNotifier.send("Hello World")