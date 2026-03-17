- **Use Case Diagram** - shows the interactions between external entities (actors) and the functionality a system provides (use cases).

- Answers 1 fundamental question: *"Who can do what with this system?"*

- Captures scope and user goals, nothing more.

### Building Blocks of Use Case Diagram

- **Actor** is anything that interacts with the system from outside. Drawn as stick figures.
    - *Primary actors* initiate interactions with the system. (e.g) - Admin, User
    -  *Secondary actors* are called upon by the system to help fulfill a use case. (e.g) - Payment Gateways, 3rd-party API

- **Use Cases** is a specific goal or function that the system provides to an actor. Drawn as ovals with a descriptive name inside.

- **System Boundary** is a rectangle that encloses all the use cases. system name is written at the top of the rectangle. Actors sit outside, Use cases sit inside.

- **Relationships**  are the lines connecting actors to use cases, and use cases to each other.
    1. *Association* is a _solid_ line connecting an actor to a use case
    2. *Include* means one use case always triggers another as a mandatory part of its execution. The dashed arrow with the label \<<include\>> points from the base use case to the included use case.
    3. *Extend* means one use case optionally adds behavior to another under certain conditions. Dashed arrow with label \<<extend\>> points from the extending use case back to the base use case.
    4. *Generalization* shows inheritance between actors or between use cases. Directed arrow with a triangle arrowhead from child to parent

### How to Draw a Use Case Diagram Step-by-Step 

1. **Identify Actors:** who or what interacts with this system from outside?
2. **List the Use Cases:** what does each actor want to accomplish?
3. **Define the System Boundary:** Draw a box around all the use cases and label it with the name of your system.
4. **Draw Associations:** Connect each actor to the use cases they participate in with solid lines.
5. **Add Include, Extend, and Generalization Relationships:** Look for mandatory dependencies and optional extensions.