### DRY Principle - "Don’t Repeat Yourself."

- The DRY principle says that each piece of knowledge in your system should live in exactly one place. When you need that knowledge somewhere else, you reference the single source rather than creating a second copy.

- It applies to: Business rules, Configuration, Data models, Documentation, Tests, etc.

- **The Rule of Three** - Before extracting shared logic, wait until you see the same pattern __three times__.

### KISS Principle - "Keep It Simple, Stupid."

- In software, KISS means writing code that is: 
    - Easy to read
    - Easy to understand
    - Easy to change.

- 5 practical guidelines to apply the KISS Principle:
    1. Write Code for Humans, Not Machines
    2. Avoid Premature Abstraction
    3. Favor Composition Over Inheritance
    4. Keep Functions Short
    5. Use Familiar Constructs

### YAGNI Principle - "You Aren’t Gonna Need It."

- “Always implement things when you actually need them, never when you just foresee that you need them.”

- In simple terms: Don’t build for tomorrow. Build for today.

- This doesn't mean you write sloppy code or ignore good design. It means you don't add layers of abstraction, extra interfaces, or speculative features until a real requirement justifies them.

### The Law of Demeter *

- The rule is straightforward. A method M on an object O should only call methods on:
    1. Itself (the object O)
    2. Its own fields (objects that O holds as instance variables)
    3. Its method parameters (objects passed into M)
    4. Objects it creates (objects instantiated within M)

- Benefits of Law of Demeter: Low Coupling, Better Encapsulation, Easier Refactoring, Improved Testability and Cleaner APIs.