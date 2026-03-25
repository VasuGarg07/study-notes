### Creational Design Pattern

1. **Singleton Pattern**: A creational pattern that guarantees a class has **only one instance** and provides a **global point of access** to it.
2. **Builder Pattern**: A creational pattern that lets you **construct complex objects step-by-step**, separating the construction logic from the final representation. (e.g. SqlQueryBuilder)
3. **Factory Method Pattern**: A creational pattern that **provides an interface** for creating objects in a **superclass**, but **allows subclasses to alter** the type of objects that will be created.
4. **Abstract Factory Pattern**: A creational pattern that provides an **interface for creating families** of related or dependent objects without specifying their concrete classes.
    - The key word is **families**. 
    - *Factory Method* deals with creating one product at a time. 
    - *Abstract Factory* deals with creating multiple products that must work together. A GUI factory does not just create buttons. It creates buttons, checkboxes, text fields, and menus that all share the same visual style.
5. **Prototype Pattern**: A creational design pattern that lets you create new objects by **cloning existing ones**, instead of instantiating them from scratch.
    - Prototype implementations should do *Deep Copy* when the object contains mutable reference types.

### Structural Design Pattern

6. **Adapter Pattern**: A structural design pattern that **allows incompatible interfaces to work together** by converting the interface of one class into another that the client expects.
7. **Facade Pattern**: A structural design pattern that **provides a single, simplified interface to a complex subsystem**. Instead of forcing clients to coordinate many moving parts, a facade hides the internal complexity and exposes a clean, easy-to-use entry point.
8. **Decorator Pattern**: A structural pattern that lets you **dynamically add new behavior or responsibilities** to objects without modifying their underlying code.
9. **Composite Pattern**: A structural pattern that lets you treat individual objects and compositions of objects uniformly.
10. **Proxy Pattern**: A structural pattern that provides a placeholder or surrogate for another object, allowing you to control access to it.
11. **Bridge Pattern**: A structural pattern that lets you decouple an abstraction from its implementation, allowing the two to vary independently.
12. **Flyweight Pattern**: A structural pattern that focuses on efficiently sharing common parts of object state across many objects to reduce memory usage and boost performance.

