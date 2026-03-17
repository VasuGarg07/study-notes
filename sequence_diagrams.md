- **Sequence Diagram** - shows how objects in a system interact with each other, step by step.

- It focuses on the order of messages exchanged.

- It help answer: _“Who is doing what, and when?”_

### Building Blocks of Sequence Diagram

- An **actor** is an external entity that initiates an interaction with the system. Appear at the top as stick figures or labeled boxes.

- A **participant** is an internal object or component within your system that sends or receives messages. Drawn as labeled rectangles at the top of the diagram.

- **Lifelines** - The dashed vertical line extending below each actor and participant.  It represents the passage of time, top is earlier, bottom is later. 

- **Activation Bars** - When a participant is actively processing something, show this with an activation bar, a thin rectangle drawn on top of the lifeline.

- **Messages** are the horizontal arrows between lifelines, showing what one object says to another. Each arrow is labeled with the message content (method name with parameters).

- Types of Messages in Sequence Diagrams
    - *Synchronous Messages* - solid line with a filled arrowhead.
    - *Asynchronous Messages* - solid line with an open arrowhead
    - *Return Messages* - dashed line with an open arrowhead. (technically optional in UML)
    - *Self-Messages* - a looped arrow that *starts and ends* on the **same lifeline**
    - **Create Messages** - indicates that the sender is instantiating a new object. New participant doesn't exist at the start of the diagram. It appears at the point where it's created.

### Combined Fragments

- A combined fragment is a labeled rectangle (called a frame) drawn over a section of the diagram. 
- The label in the top-left corner tells you what kind of control flow it represents.

- **alt/else (Conditional Branching):**
    - The frame is divided horizontally into sections by dashed lines
    - Each section has a guard condition, only the section whose condition is true executes.

- **loop (Repetition):**
    - execute a frame repeatedly while a condition holds

- **opt (Optional):**
    - models conditional behavior that either happens or doesn't.
    - no "else" branch. 

- **par (Parallel Execution):**
    - frame is divided into sections
    - each section executes concurrently