- **Class Diagrams**: perhaps most widely used in UML

- Consists of classes, its methods and attributes & relationship among objects.

- A **class** in class diagram is divided into 3 parts:
    - name (at the top)
    - attributes (middle)
    - methods (bottom)

- \<<interface/abstract/enumerations\>> can also be added before name in name compartment to define *Special Class Types*

- Notation of attribute is:
    -  `visibility name: type [multiplicity] = defaultValue`

- Notation of method is:
    - `visibility name(parameterList): returnType`

- Visibility is depicted as:
    - \+ for Public
    - \- for Private
    - \# for Protected

| Marker | Access Level | Accessibility |
|--------|--------------|---------------|
| \+     | Public       | From any class |
| \-     | Private      | From same class |
| \#     | Protected    | From same or inherited class |

- UML defines **6 types of relationships**, each with its own *arrow style* and *meaning*.

| Name | Arrow Style | Meaning | Coupling |
|----------|----------|----------|----------|
| Dependency | dashed arrow (..>)   | one class temporarily uses another   | 0 (weakest) |
| Association   | solid arrow (->)   |  "has-a" or "uses-a" relationship   | 1 |
| Aggregation | hollow diamond on 'whole' | "whole-part" relationship with independent parts | 2 |
| Composition | filled diamond on 'whole' | "whole-part" relationship with strong ownership | 3 |
| Inheritance | solid line with a hollow triangle on 'base' class | "is-a" relationship; subclass extends base class | 4 |
| Realization | dashed line with a hollow triangle on 'interface' | "can-do" relationship between class and interface | 5 (strongest) |