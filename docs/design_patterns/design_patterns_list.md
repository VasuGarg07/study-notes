# Design Patterns

A quick-reference catalogue of the 23 Gang of Four design patterns. Each pattern below links to a detailed page with explanation and a TypeScript example.

- **[Creational Patterns](creational.md)** — object creation mechanisms.
- **[Structural Patterns](structural.md)** — composing classes and objects into larger structures.
- **[Behavioral Patterns](behavioral.md)** — communication and responsibilities between objects.

---

### Creational Design Patterns

1. **Singleton Pattern**: A creational pattern that guarantees a class has **only one instance** and provides a **global point of access** to it.
2. **Builder Pattern**: A creational pattern that lets you **construct complex objects step-by-step**, separating the construction logic from the final representation. (e.g. SqlQueryBuilder)
3. **Factory Method Pattern**: A creational pattern that **provides an interface** for creating objects in a **superclass**, but **allows subclasses to alter** the type of objects that will be created.
4. **Abstract Factory Pattern**: A creational pattern that provides an **interface for creating families** of related or dependent objects without specifying their concrete classes.
    - The key word is **families**. 
    - *Factory Method* deals with creating one product at a time. 
    - *Abstract Factory* deals with creating multiple products that must work together. A GUI factory does not just create buttons. It creates buttons, checkboxes, text fields, and menus that all share the same visual style.
5. **Prototype Pattern**: A creational design pattern that lets you create new objects by **cloning existing ones**, instead of instantiating them from scratch.
    - Prototype implementations should do *Deep Copy* when the object contains mutable reference types.

### Structural Design Patterns

6. **Adapter Pattern**: A structural design pattern that **allows incompatible interfaces to work together** by converting the interface of one class into another that the client expects.
7. **Facade Pattern**: A structural design pattern that **provides a single, simplified interface to a complex subsystem**. Instead of forcing clients to coordinate many moving parts, a facade hides the internal complexity and exposes a clean, easy-to-use entry point.
8. **Decorator Pattern**: A structural pattern that lets you **dynamically add new behavior or responsibilities** to objects without modifying their underlying code.
9. **Composite Pattern**: A structural pattern that lets you treat individual objects and compositions of objects uniformly.
10. **Proxy Pattern**: A structural pattern that provides a placeholder or surrogate for another object, allowing you to control access to it.
11. **Bridge Pattern**: A structural pattern that lets you decouple an abstraction from its implementation, allowing the two to vary independently.
12. **Flyweight Pattern**: A structural pattern that focuses on efficiently sharing common parts of object state across many objects to reduce memory usage and boost performance.

### Behavioral Design Patterns

13. **Strategy Pattern**: a behavioral pattern that lets you define a family of algorithms, encapsulate each one in its own class, and make them interchangeable at runtime.
14. **Iterator Patter**: a behavioral pattern that provides a standard way to access elements of a collection sequentially without exposing its internal structure.
15. **Observer Pattern**: a behavioral pattern that defines a one-to-many dependency between objects so that when one object (the subject) changes its state, all its dependents (observers) are automatically notified and updated.
16. **Command Pattern**: a behavioral pattern that turns a request into a standalone object, allowing you to parameterize actions, queue them, log them, or support undoable operations all while decoupling the sender from the receiver.
17. **State Pattern**: a behavioral design pattern that lets an object change its behavior when its internal state changes, as if it were switching to a different class at runtime.
18. **Template Method Pattern**: a behavioral design pattern that defines the skeleton of an algorithm in a base class, but allows subclasses to override specific steps of the algorithm without changing its overall structure.
19. **Chain of Responsibility Pattern**: a behavioral pattern that lets you pass requests along a chain of handlers, allowing each handler to decide whether to process the request or pass it to the next handler in the chain.
20. **Visitor Pattern**: a behavioral pattern that lets you add new operations to existing object structures without modifying their classes.
21. **Mediator Pattern**: a behavioral pattern that defines an object (the Mediator) to encapsulate how a set of objects interact.
22. **Memento Pattern**: a behavioral design pattern that lets you capture and store an object’s internal state so it can be restored later, without violating encapsulation.