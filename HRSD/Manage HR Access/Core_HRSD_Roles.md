


# ServiceNow HRSD: Groups and Roles for Access Management

This document summarizes the core concepts of how ServiceNow HR Service Delivery (HRSD) manages access to sensitive HR information using a structured system of **Groups** and **Roles**.

---

## 1. HRSD Access Management Summary

ServiceNow enforces access control by following a structured, three-step process:

1.  **Group Creation:** An administrative **group** is established (e.g., "HR Agents" or "HR Admins").
2.  **User Assignment:** **Users** (employees) are added to this group.
3.  **Role Assignment:** A **relevant role** is assigned to the group.

This structure ensures that all users added to a group automatically inherit the permissions associated with the assigned role.

### Key Access Principles:

| Concept | Description |
| :--- | :--- |
| **Role Permissions** | Roles grant permissions to use specific applications or access certain modules within those applications, controlling what data a user can see and what actions they can perform. |
| **Dynamic Access** | Access is managed by group membership. Users **gain** access when added to a group and **lose** access (the associated roles) when removed from a group. |
| **Predefined Roles** | ServiceNow provides predefined roles to ensure the appropriate, secure, and least-privilege level of access to applications, modules, and underlying data tables. |

---

## 2. Key HR Roles in ServiceNow

The following are the essential HR roles discussed in the training module:

| Role Name | Assigned To | Primary Access and Functionality | Limitations/Scope |
| :--- | :--- | :--- | :--- |
| **HR Basic Role** | **HR Agents** | **Minimum required role**. Allows agents to create, work on, and close cases, as well as complete related tasks. | Access is generally **limited to the specific cases they handle**. They **do not have access to management modules**. |
| **HR Manager Role** | **HR Managers** | Allows access to **additional management-type modules** within the HR application. | Grants a broader view than HR Basic, but typically less than Admin access. |
| **HR Admin Role** | **HR Admins** | Inherits the ability to **see all modules** within the core HR basic application. | This is the highest level of access for core HR functionality. |

---

## 3. Interview Questions and Answers

This section includes practical interview questions based on the HRSD Groups and Roles model, along with detailed answers.

### Foundational Concepts

| Q. No. | Interview Question | Answer |
| :--- | :--- | :--- |
| **1.** | **How does ServiceNow HRSD manage access to HR information?** | ServiceNow manages access by creating **Groups**, assigning **Users** to those groups, and then granting a **Role** to the group. This structure ensures users inherit the necessary permissions based on their function. |
| **2.** | **Explain the three-step structured process ServiceNow uses to grant access (Group $\rightarrow$ User $\rightarrow$ Role).** | 1. **Create Group** (e.g., "Payroll Team"). 2. **Add Users** to that group. 3. **Assign a Role** (e.g., `sn_hr_core.manager`) to the group. The users then automatically inherit the permissions of that role. |
| **3.** | **What is the benefit of assigning a role to a group rather than directly to individual users?** | It is more **efficient** and **scalable**. Access is centrally managed; you only modify one group's role, and all members' access updates instantly. It also simplifies auditing and compliance. |
| **4.** | **What happens to a user's access permissions if they are removed from an HR group in ServiceNow?** | They automatically **lose** the associated roles and, therefore, lose the ability to perform the related tasks or access the functionality tied to that role. |
| **5.** | **Are roles typically predefined, or are they often created on a per-user basis?** | Roles in ServiceNow are generally **predefined** to ensure consistency, security, and the appropriate level of access to applications, modules, and underlying data tables. |

### Specific HR Roles

| Q. No. | Interview Question | Answer |
| :--- | :--- | :--- |
| **6.** | **Which HR role is considered the minimum required for an HR team member in ServiceNow, and what are their primary responsibilities/limitations?** | The **HR Basic Role** is the minimum. It allows agents to **create, work on, and close cases**. The limitation is that their access is generally **restricted to the specific cases they are handling**, and they cannot access management or administrative modules. |
| **7.** | **If an HR Agent needs to view management reports or modules, which role would typically be assigned, and how is this access usually granted?** | The **HR Manager Role** would be assigned. This is granted by **creating a separate group** for managers, adding the user to that group, and assigning the Manager role. |
| **8.** | **What level of access does the HR Admin role provide within the core HR application?** | The HR Admin role grants the ability to **see all modules** within the core HR basic application, giving them the broadest administrative control over the application's configuration and data. |
| **9.** | **Do the Core HR roles (Basic, Manager, Admin) automatically cover access for other HR applications like Lifecycle Events or the Service Portal?** | No. The module states that other applications, such as **Lifecycle Events** and **Service Portal**, have their **own specific HR roles** that must be assigned separately. |

### Practical Application

| Q. No. | Interview Question | Answer |
| :--- | :--- | :--- |
| **10.** | **Imagine you need to onboard 10 new HR Agents. Briefly describe the most efficient way to grant them the necessary access.** | The most efficient way is to ensure a dedicated "HR Agents" **group** already exists with the **HR Basic Role** assigned. You then simply **add all 10 new users** to that existing group. They will automatically inherit the required role and permissions. |
| **11.** | **Why is it important for HR agents with the HR Basic role to have their access limited to only the cases they handle?** | This is crucial for maintaining **data privacy** and adhering to the **principle of least privilege**. It ensures agents only view the highly sensitive HR data (PII) required to complete their specific tasks, reducing security and compliance risks. |

![alt text](./images/core_hrsd_roles.png)