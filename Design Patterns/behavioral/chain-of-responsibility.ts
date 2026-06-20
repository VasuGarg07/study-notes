// Chain of Responsibility - Logger

interface Logger {
    setNext(handler: Logger): Logger;
    log(message: string, level: string): void;
}

abstract class AbstractLogger implements Logger {
    protected nextLogger?: Logger;

    public setNext(logger: Logger): Logger {
        this.nextLogger = logger;
        return logger;
    }

    public log(message: string, level: string) {
        if (this.nextLogger) {
            return this.nextLogger.log(message, level);
        }

        return null;
    }
}

class InfoLogger extends AbstractLogger {
    public log(message: string, level: string) {
        if (level === 'INFO') {
            console.log(`INFO: ${message}`);
        }
        super.log(message, level);
    }
}

class ErrorLogger extends AbstractLogger {
    public log(message: string, level: string) {
        if (level === 'ERROR') {
            console.log(`ERROR: ${message}`);
        }
        super.log(message, level);
    }
}

class DebugLogger extends AbstractLogger {
    public log(message: string, level: string) {
        if (level === 'DEBUG') {
            console.log(`DEBUG: ${message}`);
        }
        super.log(message, level);
    }
}

// Client code
const infoLogger = new InfoLogger();
const debugLogger = new DebugLogger();
const errorLogger = new ErrorLogger();

infoLogger.setNext(debugLogger).setNext(errorLogger);

infoLogger.log("System running", "INFO");
infoLogger.log("Debugging mode enabled", "DEBUG");
infoLogger.log("Something went wrong!", "ERROR");

