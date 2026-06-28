# Fundamentals of System Design

1. **Verttical Scaling** - Optimise processes and increase throughput using **same machine** Increase more power in single machine, expect more output from it. But it has its limit such as hardware limitation or excessive cost.

2. **Cron Job** - Preparing things beforehand (called Preprocessing) at non-peak hours.

3. **Resilience** - Keep **backup** machines that can swap out with main machines to avoid Single Point of Failures.

4. **Horizontal Scaling** - Buy more machines of same type (both main units and backup units, say 10 + 4) in order to get more work done. .

5. **Micro-service Architecture** - Divide responsibilities of the entire application into separate services (or group of services) such that introducing changes in one service does not affect every other service. Also, scaling each service happens on their own pace according to demand. Some can grow 5x while others can grow 2x or stay 1x.

6. **Distributed Systems** - Scaling at infrastructure level. Duplicating entire system, distributed geographically over the globe, that may need to interact with each other as well. It makes the overall system more fault tolerant and give quicker response to local requests by distributing traffic load. Think of it like, *"Opening up a branch of your shop in a different city."*

7. **Load Balancer** - It is not the customer's responsibility to approach the system nearest to it. He/she will make simply make request to one place. That is where we intoduce "Load Balancers" whose sole job is to smartly or you can say calculatively, redirect that request to the system that can provide the response in quickest time possible. Load balancers are a special kind of *Reverse Proxy* whose sole job is to distribute the traffic over multiple systems.

8. **Decoupling** -  Decoupling the system such that we can separate the concerns and handle each system more efficiently. For example, a delivery sytem delivers good. It does not know nor care whether its food, clothing or something else. Similarly, a restaurant does not care if a delivery agent picks the order or the customer get it themselves.

9. **Logging and Metrics** - Logging everything so we can find out, at what time, something failed, where it failed, steps before it and after it. And to take the events, condense them, making sense out of it, is called metrics.

10. **Extensibility** - Keeping the system extensible, such that it can adapt to a wider scope in future. Like the delivery system example from Decoupling.