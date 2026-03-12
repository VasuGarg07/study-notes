* __Association__ represents a relationship between two classes where one object uses, communicates with, or references another object.

* Association reflects a _"has-a"_ or _"uses-a"_ relationship.
* Associated objects are loosely coupled and can exist independently of one another.
* The association can be __Unidirectional__ or __Bidirectional__, and can follow different multiplicity patterns: __One-to-One__, __One-to-Many__, __Many-to-Many__.

* __Aggregation__ is a specialized form of association that models a __whole-part relationship__ with __loose ownership__. One class (the __"whole"__) contains references to other class objects (the __"parts"__), but the parts can exist independently of the whole.

* It's often described as a "has-a" relationship where the whole does not control the part's lifecycle.

* __Composition__ is a special type of association that signifies __strong ownership__ between objects. The “whole” class is __fully responsible__ for creating, managing, and destroying the “part” objects. In fact, the parts __cannot exist without__ the whole

* “Favor composition over inheritance.” — GoF Design Principle

* _Association_ is a __general connection__: two classes simply know about each other.

* _Aggregation_ is a __grouping__: the whole and parts can exist independently.

* _Composition_ is an __ownership__: the part’s existence is bound to the whole.

* A __Dependency__ exists when __one class relies on another__ to fulfill a responsibility, but does so __without retaining a permanent reference__ to it.

* Dependency reflects a __one-time interaction__, often through method parameters, local variables, or return types.

* __"Uses-a"__ relationship: The class uses another to accomplish a task, but does not retain it.

* __Dependency Injection__ is a design technique where a class receives the objects it depends on, instead of creating them itself.

* __Realization__ represents a __contract fulfillment__ relationship. Think of it as a promise: the interface declares "these methods must exist," and the implementing class promises to provide them

* Realization: "can-do" relationship; Inheritance: "is-a" relationship