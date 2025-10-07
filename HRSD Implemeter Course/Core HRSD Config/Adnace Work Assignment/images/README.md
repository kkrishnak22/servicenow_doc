Of course. Here are comprehensive notes on **Advanced Work Assignment (AWA)** in ServiceNow, combining the key points from your transcript and information from the official documentation.

### What is Advanced Work Assignment (AWA)?

**Advanced Work Assignment (AWA)** is a smart routing system in ServiceNow. Its main job is to automatically assign "work items" (like HR cases, chats, or incidents) to the best available agent. It's much more intelligent than simple assignment rules because it considers three key factors :[3][4]

1.  **Availability:** Is the agent online and ready to accept new work?
2.  **Capacity:** Does the agent have enough "space" in their workload to take on a new task?
3.  **Skills (Optional):** Does the agent have the specific skills required to handle this particular task?

The entire process happens within the **Agent Workspace**, which is the multi-tabbed interface where agents manage their work.[5]

***

### The Big Picture: How AWA Routes Work

Here is the flow of how a work item gets from creation to an agent's inbox:

**Work Item** → **Service Channel** → **Queue** → **Assignment Rule** → **Agent**

Let's break down each step.

#### 1. Service Channels: The "In-Doors"

A **Service Channel** defines *what type* of work will be routed by AWA. Think of it as the main entrance for different kinds of tasks.[2]

*   **Example:** You will have separate service channels for:
    *   **HR Cases** (from the `sn_hr_core_case` table)
    *   **Chats** (from the `interaction` table)
    *   **Incidents** (from the `incident` table)
*   You can set a default **capacity** for all agents for this channel (e.g., an agent can handle 8 cases at once).
*   You can also set **capacity overrides** for specific, more complex case types. For example:
    *   A standard HR case might count as **1** unit of capacity.
    *   A complex Employee Relations case might count as **4** units.
    *   An urgent Payroll case might count as **3** units.
*   This means an agent with a total capacity of 8 could handle one Employee Relations case (4 units), one Payroll case (3 units), and one standard case (1 unit) at the same time.

#### 2. Queues: The "Waiting Rooms"

Once a work item enters a channel, it's sent to a **Queue**. A queue is a virtual waiting room for a specific type of work, waiting to be assigned to an agent group.[7]

*   **How it works:** Queues use **conditions** to grab the right work items from the channel.
*   **Example:** You can have separate queues for:
    *   **Employee Relations Queue:** Condition = "HR Service's table is Employee Relations Case."
    *   **Payroll Queue:** Condition = "HR Service's table is Payroll Case."
    *   **General HR Queue:** This would be the last queue in the order, catching all cases that didn't match the specific queues above it.
*   **Sorting:** Within a queue, you can define how to prioritize work items. A common setup is to sort first by **Priority**, then by **Age** (oldest first).

#### 3. Assignment Eligibility (Inside the Queue): Who Gets the Work?

This section of the queue defines *which groups* of agents are eligible to receive work from this queue and *when*.

*   **Primary Group:** The first group that should receive the work.
    *   **Example:** For the Payroll Queue, the "HR Payroll" group is the primary. They are eligible to receive cases immediately (**0 seconds**).
*   **Overflow Groups:** These are backup groups that get the work if the primary group is at full capacity.
    *   **Example:** If the "HR Payroll" group is at capacity for 30 minutes, the work can overflow to the "HR Tier 2" group. If the backlog continues for another 10 minutes (40 minutes total), it can then overflow to "HR Tier 3."

#### 4. Assignment Rules: How to Pick an Agent

An **Assignment Rule** is the logic used to select a *specific agent* from the eligible group. This is different from the older, simpler assignment rules that just assign to a group.

*   **Assignment Methods:**
    *   **Most Capacity:** Gives the work to the agent with the most available capacity. This is great for balancing workloads in real-time.
    *   **Last Assigned (Round Robin):** Rotates the work through the agents in the group (Agent A, then B, then C, then A again). This is good for ensuring work is distributed evenly over a long period.
*   **Other Key Settings:**
    *   **Skills:** You can require agents to have specific skills (e.g., español language skill) to be assigned the work.
    *   **Agent Rejection:** You can allow agents to reject a work item. If enabled, the item will be offered to the next available agent. If disabled, the work is automatically pushed to the agent's inbox, and they cannot refuse it. This is often used for high-priority or escalated tasks.

***

### Important Concepts & Best Practices

*   **Don't Use Old Assignment Methods:** When using AWA, you should **not** use HR Case Templates or legacy assignment rules to assign work to groups or users. AWA should handle all assignments.
*   **Individual Capacity Overrides:** While you set a default capacity at the channel level, you can override it for a specific agent. For example, a shift lead who also does coaching might have their capacity set to half the normal amount (e.g., 4 instead of 8). This should be used sparingly.
*   **HR Agent Workspace:** This is the user interface where AWA delivers work items to an agent's inbox. It's a mandatory component for using AWA. You can use the **UI Builder** to configure the layout and branding of this workspace.
*   **Guided Setup:** ServiceNow provides a Guided Setup for both AWA and the HR Agent Workspace to help you configure everything correctly. The speaker highly recommends using it.

[1](https://www.servicenow.com/docs/bundle/yokohama-servicenow-platform/page/administer/advanced-work-assignment/task/installing-awa.html)
[2](https://www.youtube.com/watch?v=fANNto5TG-0)
[3](https://www.servicenow.com/docs/bundle/washingtondc-servicenow-platform/page/administer/advanced-work-assignment/concept/awa-overview.html)
[4](https://www.servicenow.com/docs/bundle/xanadu-servicenow-platform/page/administer/advanced-work-assignment/concept/awa-overview.html)
[5](https://www.servicenow.com/community/agent-chat-routing-and-sidebar/advanced-work-assignment-awa-faqs/ta-p/2306792)
[6](https://www.youtube.com/watch?v=tIskSHya9PU)
[7](https://www.youtube.com/watch?v=E2n1t1mqq6Y)
[8](https://www.servicenow.com/docs/bundle/zurich-conversational-interfaces/page/administer/advanced-work-assignment/task/installing-awa.html)
[9](https://www.servicenow.com/docs/bundle/yokohama-customer-service-management/page/product/customer-service-management/task/configure-awa-channel-case-tasks.html)
[10](https://www.servicenow.com/docs/bundle/xanadu-servicenow-platform/page/administer/advanced-work-assignment/concept/awa-application-landing-page.html)