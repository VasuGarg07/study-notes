- **Single Responsibility Principle (SRP)** - A class should have one, and only one, reason to change.

- **Open-Closed Principle (OCP)** - Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification. 

    - *Open for Extension*: The behavior of the entity can be extended. 

    - *Closed for Modification*: The existing, working code should not be changed.

- **Liskov Substitution Principle (LSP)** - If a class S extends or implements class T, then you should be able to use S anywhere T is expected, without breaking the program's behavior or logic.

- LSP is what makes **polymorphism** truly powerful. You can write generic algorithms that operate on a base type, confident that they will work correctly with any current or future subtype.

- LSP-compliant design: correctness is enforced at compile time, not discovered at runtime through exceptions.

- **Interface Segregation Principle (ISP)** - Keep your interfaces focused. Each interface should represent a specific capability or behavior. If a class doesn’t need a method, it shouldn’t be forced to implement it.

- Rule of thumb suggests "design interfaces based on client needs."

- ISP and LSP are closely aligned.
    - ISP ensures that interfaces are minimal and relevant.
    - LSP ensures that implementations of those interfaces behave correctly and predictably.

- **Dependency Inversion Principle (DIP)** is a principle that states “Depend on abstractions, not concrete implementations.” i.e. -

    1. High-level modules should not depend on low-level modules. Both should depend on abstractions (e.g., interfaces).
    2. Abstractions should not depend on details. Details (concrete implementations) should depend on abstractions.

- *Dependency Injection (DI)* technique is one of the most common ways to achieve DIP in practice