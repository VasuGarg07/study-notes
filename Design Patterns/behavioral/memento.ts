// Memento - text editor

class EditorMemento {
    private state: string;

    constructor(state: string) {
        this.state = state;
    }

    public getState(): string {
        return this.state
    }
}

class Editor {
    private content: string = '';

    public type(text: string): void {
        console.log("Typing:", text);
        this.content = text;
    }

    public save(): EditorMemento {
        return new EditorMemento(this.content);
    }

    public restore(memento: EditorMemento) {
        this.content = memento.getState();
    }

    public getContent(): string {
        console.log("Current Content:", this.content);
        return this.content;
    }
}

class EditorHistory {
    private history: EditorMemento[] = [];
    private editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    public backup() {
        this.history.push(this.editor.save());
    }

    public undo() {
        console.log("Undo...")
        const memento = this.history.pop();
        memento && this.editor.restore(memento);
    }
}

// ----- Client Code -----
const originator = new Editor();
const caretaker = new EditorHistory(originator);

originator.type("Hello");
caretaker.backup();

originator.type("Hello World");
caretaker.backup();

originator.getContent();
caretaker.undo();
originator.getContent();