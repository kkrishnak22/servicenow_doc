# Simple Guide to HR Task and Skill Management in ServiceNow

This explanation covers how to manage the special abilities (**Skills**) of HR staff and how the system automatically sends a new work item (**HR Case**) to the correct person or team.

---

## 1. What are HR Skills?

A **Skill** is a specific ability or knowledge an HR employee has (e.g., "Knowledge of US Visas," or "Handling Salary Issues").

### Key Points:

* **Creating a Skill:** You define skills in the system (e.g., creating a skill named "Test Skill").
* **Assigning Skills:** You connect these skills to employees (e.g., giving the "Leave Request" skill to Priya).
* **Why Skills Matter:** The system uses skills to ensure difficult or specific tasks go to someone qualified.
* **Best Practice:** Name the skill the same as the HR service it is related to for easy understanding.

### Two Ways to Give Skills to Employees:

| Method | Description | Advantage/Disadvantage |
| :--- | :--- | :--- |
| **A. Directly to One Person** | You find an employee and manually give them one or more skills. | **Okay for Small Teams.** **Bad for Big Teams** because managing one person at a time is slow, especially when people change jobs. |
| **B. To a Whole Group (Best Way)** | You create an HR **Group** (like "Payroll Team") and assign the skills to the **entire group**. | **Best for Large Companies.** New members automatically **get** the group's skills. Leaving members automatically **lose** the skills. Easy to manage! |

---

## 2. How HR Cases are Sent to the Right Person

When an employee asks an HR question (a new **HR Case**), the system uses two types of rules to find the perfect person to handle it:

### A. Assignment Rules (Finds the Right **Group**)

**Goal:** Decides which HR **group** (the team) should receive the new case.

* **How it Works:** The system checks the rules one by one (from Rule 1, Rule 2, etc.) and **stops** at the very first rule that matches the case.
* **Example:** A rule says: "If the case is about a salary question, **Assign it to the Payroll Team**."
* **Best Practice:** Use simple conditions (like case type) instead of complicated computer code (JavaScript) to keep the system easy to maintain.

### B. Matching Rules (Finds the Right **Person** in the Group)

**Goal:** After the case is sent to the right group (e.g., Payroll Team), this rule finds the **best person** within that team.

* **How it Works:** The matching rules are also checked in order.
* **How it Decides:** The system looks at several things (**Criteria**) to choose the best person:
    1.  **Least Loaded:** Gives the case to the person who has the **fewest open cases** (to share the work fairly).
    2.  **Skills:** Checks if the person has the **specific skills** needed for that particular task.
    3.  **Location:** Tries to find someone in the same **country** or region (helpful for language or local laws).

---

## Summary Flow:

1.  A new HR question (Case) arrives.
2.  The **Assignment Rule** says, "This is a travel question, send it to the **Travel Team** group."
3.  The **Matching Rule** looks inside the Travel Team and says, "Give this to **Raj**, because he is the least busy and has the 'Visa Expertise' skill."