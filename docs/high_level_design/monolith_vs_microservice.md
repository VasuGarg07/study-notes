## Monolith Architecture
A monolithic architecture is a traditional model of a software program, which is built as a unified unit that is self-contained and independent from other applications.

{{ image('monolith.png', 'Monolith Architecture') }}  

The common misconception: **"Monolith does not mean the entire system runs on single machine"**. There can be multiple instances of the monolith system as you scale horizontally. Monolith simply means that each unit is self-contained. 


## Microservice Architecture
A microservice is a single business unit, containing all the data and logic of a particular business concern. It is created with Separation of Concerns.

{{ image('microservice.png', 'Microservice Architecture') }}  

It does not necessarily mean making tiny machines that interact with each other all the time. But simply, a service catering to a single business concern.

### Advantages of Microservices:
1. The microservice architecture is easier to reason about/design for a complicated system.
2. They allow new members to train for shorter periods and have less context before touching a system.
3. Deployments are fluid and continuous for each service.
4. They allow decoupling service logic on the basis of business responsibility
5. They are more available as a single service having a bug does not bring down the entire system. This is called a single point of failure.
6. Individual services can be written in different languages.
7. The developer teams can talk to each other through API sheets instead of working on the same repository, which requires conflict resolution.
8. New services can be tested easily and individually. The testing structure is close to unit testing compared to a monolith.

### Monoliths are favorable when:
1. The technical/developer team is very small
2. The service is simple to think of as a whole.
3. The service requires very high efficiency, where network calls are avoided as much as possible.
4. All developers must have a context of all services.