# OOPS CONCEPTS

* A __class__ is a blueprint, template, or recipe for creating objects. It defines what an object will contain (its data) and what it will be able to do (its behavior).

* An __object__ is an instance of a class.  It's the actual thing you can interact with, store data in, and invoke methods on.

* An __enum__ is a special data type that defines a fixed set of named constants. Unlike strings or integers, enums are type-safe, meaning the compiler ensures you can only use values that actually exist in your defined set.

* Enums can do more than just name constants. In many languages, each enum value can hold additional data and even define behavior. This makes them surprisingly powerful for modeling domain concepts.

```typescript
class Coin {
    static readonly PENNY = new Coin("PENNY", 1);
    static readonly NICKEL = new Coin("NICKEL", 5);
    static readonly DIME = new Coin("DIME", 10);
    static readonly QUARTER = new Coin("QUARTER", 25);

    private constructor(
        public readonly name: string,
        private readonly value: number
    ) {}

    getValue(): number {
        return this.value;
    }
}

// Usage
const total: number = Coin.DIME.getValue() + Coin.QUARTER.getValue(); // 35
```

* An __interface__ is a contract: a list of methods that any implementing class must provide. It specifies a set of behaviors that a class agrees to implement but leaves the details of those behaviors up to each implementation.

* An interface defines the _"what"_, while classes provide the _"how"_.

* This pattern is called __dependency injection__: instead of creating its own dependencies, the class receives them from the outside. And it only works because the dependency is typed as an interface, not a concrete class.

* __Encapsulation__ is the practice of grouping data (variables) and behavior (methods) that operate on that data into a single unit (typically a class) and restricting direct access to the internal details of that class.

* Encapsulation = Data hiding + Controlled access

* Encapsulation is primarily implemented using two language features: __access modifiers__ that control visibility, and __getters/setters__ that provide controlled access to private data.

* __Access modifiers__ are keywords that control which parts of your code can see and interact with a class's fields and methods

    * _private_: Accessible only within the same class. This is the primary tool for hiding data.
    * _protected_: Accessible within the same class and its subclasses. Useful when child classes need access to parent data.
    * _public_: Accessible from anywhere. This is what you use for the controlled interface.

* __Getters and Setters__ are public methods that provide controlled, indirect access to private attributes.

    * Getter (e.g., getBalance()): Provides read-only access to an attribute.
    * Setter (e.g., setAmount()): Allows modifying an attribute, often with validation logic built-in.

* __Abstraction__ is the process of hiding complex internal implementation details and exposing only the relevant, high-level functionality to the outside world. It allows developers to focus on __what an object does__, rather than __how it does it__.

* Abstraction = Hiding Complexity + Showing Essentials

* What makes abstract classes different from interfaces is that they let you share behavior, not just a contract.

* *Abstraction* focuses on hiding complexity. It's about simplifying what the user sees; *Encapsulation* focuses on hiding data. It's about bundling data and methods together to protect an object's internal state.

* __Inheritance__ allows one class (called the subclass or child class) to inherit the properties and behaviors of another class (called the superclass or parent class).

* Inheritance enables __code reuse__ by letting you define common logic once in a base class and then extend or specialize it in multiple derived classes.

* __Polymorphism__ allows the same method name or interface to exhibit different behaviors depending on the object that is invoking it.
