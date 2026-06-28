// Mediator - Chat Room

interface ChatMediator {
    sendMessage(message: string, user: User): void;
    addUser(user: User): void;
}

class ChatRoom implements ChatMediator {
    private users: User[] = [];

    public addUser(user: User): void {
        if (this.users.includes(user)) return;
        this.users.push(user);
        console.log(`${user.name} joined the chat`);
    }

    public sendMessage(message: string, sender: User): void {
        console.log(`${sender.name} sends: ${message}`);
        this.users.forEach(user => {
            if (user !== sender) {
                user.receive(message);
            }
        });

    }
}

class User {
    public name: string;
    private mediator: ChatMediator;

    constructor(name: string, mediator: ChatMediator) {
        this.name = name;
        this.mediator = mediator;
    }

    public send(message: string) {
        this.mediator.sendMessage(message, this);
    }

    public receive(message: string) {
        console.log(`${this.name} receives: ${message}`);
    }
}

// ---- Client Code ----
const room = new ChatRoom();
const alice = new User('Alice', room)
room.addUser(alice);
room.addUser(new User('Bob', room));
room.addUser(new User('Charlie', room));
alice.send('Hello everyone!');