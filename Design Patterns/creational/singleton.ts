// Singleton - Logger

class Logger {
    private static _instance: Logger;

    private constructor() { }

    public static get instance(): Logger {
        if (!Logger._instance) {
            Logger._instance = new Logger();
        }

        return Logger._instance;
    }

    log(message: string) {
        console.log(Date.now(), " Logging: ", message);
    }
}

const s1 = Logger.instance;
const s2 = Logger.instance;

if (s1 === s2) {
    console.log(
        'Singleton works, both variables contain the same instance.'
    );
} else {
    console.log('Singleton failed, variables contain different instances.');
}

s1.log("Hi from s1")
s2.log("Hi from s2")
