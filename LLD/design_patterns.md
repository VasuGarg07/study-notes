- A **design pattern** is a reusable solution (*template or blueprint*) to a **commonly occurring problem** in software design.

- Not a finished piece of code you can copy-paste.

- Why Should You Use Design Patterns?
    1. **Reusability** - “Don’t just solve the problem. Solve it well, and solve it once”.
    2. **Maintainability** - “Clean design today prevents chaos tomorrow.”
    3. **Readability** - “Good code is read more often than it is written.”
    4. **Flexibility** - “Design for change. Because change will come.”

- The classic *“Gang of Four” (GoF)* book categorized design patterns into **three** groups:

1. **Creational Patterns** - Deal with object creation mechanisms. 

| Pattern | Intent | When to Use |
|---|---|---|
| Singleton | Ensure a class has only one instance with global access | Configuration managers, connection pools, logging |
| Factory Method | Define interface for creating objects, let subclasses decide which class | When a class cannot anticipate the type of objects it must create |
| Abstract Factory | Create families of related objects without specifying concrete classes | Cross-platform UI, consistent product families |
| Builder | Construct complex objects step by step | Objects with many optional parameters, immutable objects |
| Prototype | Create objects by cloning existing instances | When object creation is expensive, configuration templates |

2. **Structural Patterns** - Deal with how classes and objects are composed to form larger structures.

| Pattern | Intent | When to Use |
|---|---|---|
| Adapter | Convert interface of a class into another interface clients expect | Integrating legacy code, third-party libraries |
| Bridge | Decouple abstraction from implementation so both can vary | Platform-independent abstractions, driver architectures |
| Composite | Compose objects into tree structures, treat individual and composite uniformly | File systems, UI components, organization hierarchies |
| Decorator | Attach additional responsibilities dynamically | Adding features without subclass explosion, I/O streams |
| Facade | Provide unified interface to a set of interfaces | Simplifying complex subsystems, API design |
| Flyweight | Share fine-grained objects efficiently | Large numbers of similar objects, text rendering |
| Proxy | Provide surrogate for another object to control access | Lazy loading, access control, remote objects |

3. **Behavioral Patterns** - Deal with algorithms and the assignment of responsibilities between objects. 

| Pattern | Intent | When to Use |
|---|---|---|
| Chain of Responsibility | Pass request along chain until one handler processes it | Middleware, event handling, logging levels |
| Command | Encapsulate request as object | Undo/redo, queuing operations, transactions |
| Interpreter | Define grammar and interpreter for a language | DSLs, expression evaluation, simple parsers |
| Iterator | Access elements sequentially without exposing representation | Traversing collections uniformly |
| Mediator | Centralize complex communication between objects | Chat rooms, air traffic control, MVC controllers |
| Memento | Capture and restore object state without violating encapsulation | Undo, save/restore, checkpoints |
| Observer | One-to-many dependency with automatic notification | Event systems, data binding, pub/sub |
| State | Alter behavior when internal state changes | Finite state machines, workflow engines |
| Strategy | Define family of interchangeable algorithms | Sorting, compression, payment processing |
| Template Method | Define algorithm skeleton, let subclasses fill in steps | Frameworks, standardized processes |
| Visitor | Add operations without changing element classes | AST processing, serialization, reporting |