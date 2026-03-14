**What are Business Rules? What are the different type of Business Rules?**

A business rule is a server-side script that runs when a record is displayed, inserted, updated, or deleted, or when a table is queried.

There are 5 type of business rules.
1. Display BR.
2. Before BR.
3. After BR.
4. Asynch BR.
5. Query BR

**What is the difference between after and asynch BR?**
After BR : This type of BR is used when some field changes needs to be reflected immediately after user saves the record. Mostly used to update/insert record into another table once insert/update/delete operation is performed on current record.

Below is an example where After BR can be used
- On reassignment of incident, add comments in associated problem record.

Asynch BR : As name suggest, it runs asynchronously. Whenever Asynch BR is triggered, system creates new entry in event queue to process. Execution time varies for Asynch BR based on the load on event queue.

An Async Business Rule in ServiceNow executes server-side logic in the background after a record is committed to the database, without forcing the user to wait for completion. It is best used for long-running, non-time-critical processes (e.g., API calls, heavy calculations, or updating related records).


**Explain Before Query Business Rule:**

It is a type of business rule in ServiceNow that we
can use to limit that what all records user can
access from a given table
or in other words we can also say that it is used
for data segregation on an instance.
Query business executes before the query is sent
to the database and

![alt text](image.png)

**Query BR VS ACLs**

1. Query BR provide access restriction only in Row Level while ACL provide
access restriction Global, table (Row) and field level.

2. When Query BR is restricting the access than user will not see any
message by default at the bottom of page related to access restriction
but while if it is restricted from ACL than message such as “Numbers of
rows removed from the list by Security constraints: 20” displayed to
user which basically degrades the user experience.

3. We cannot debug Query Business Rule from Debug Security module but
we can debug ACL from the game.

4. In ServiceNow the records are first queried and then after ACL rules are applied


**What are the different objects accessible in BR?**
- Current
- Previous
- gs
- g_scratchpad

Note: `Previous object is null in Asynch BR`, as there could be multiple updates on same record while BR is in queue for execution which might create conflict on which version needs to be considered as previous.

**How to prevent form submission via Business Rule?**
We can use 'current.setAbortAction(true)' in Business Rule script to abort action. This will stop data updation in database.

**How to identify if current operation is insert, update or delete in Business Rules?**

We can use current.operation() in BR. Depending on current operation, it returns update, delete or insert value.

**Can we excecute schedule job from BR?** 
yes

```javascript
//Execute a scheduled script job
var job = new GlideRecord("sysauto_script");
if (job.get("name", "YOUR_JOB_NAME_HERE")) {
    SncTriggerSynchronizer.executeNow(job);
} else {
  //some error messaging here probably makes sense
}
```

**How to use current.update in br**

```javascript
current.status = 1;
current.setWorkflow(false);
current.update();
current.setWorkflow(true);
```


**What is gs.getSession().isInteractive() and why should you use it in a "Before Query" rule?**
gs.getSession().isInteractive() returns true when the action is triggered by a human user through the UI, and false when triggered by a background script, scheduled job, integration, or automation. This matters enormously in Before Query rules. If your Before Query rule restricts what records users can see, you likely don't want that same restriction applied when an admin background script or integration is querying the table — it would return wrong/incomplete data and cause silent bugs in automation.


**What is the complete execution order when a user saves a form in ServiceNow? Where exactly do Business Rules fit?**

Before Query BR → Display BR → onLoad Client Script 
→ onLoad UI Policy → onChange Client Script → UI Policy 
→ Before BR → Database Write → After BR → Async BR

Note
```javascript
gr.addQuery('non_existent_field', 'value'); // silently ignored!
gr.query(); // returns ALL records

```

**Execution Order of a BR, workflow,flow and other engines**
1. Start
2. Before Business Rules (Order < 1000)
   * Scripts configured to execute before the database operation with an order less than 1000.
3. Before Engines (No specific order)
   * Approval engine (for task and sys_approval_approver tables)
   * Assignment rules engine (for task tables)
   * Data policy engine
   * Escalation engine
   * Field normalization engine
   * Role engine (for sys_user, sys_user_group, sys_user_grmember, and sys_user_role tables)
   * Execution plan engine (for task tables)
   * Update version engine (for sys_update_xml table)
   * Data lookup engine inserts or updates
   * Workflow engine (for default workflows)
4. Before Business Rules (Order >= 1000)
   * Scripts configured to execute before the database operation with an order greater than or equal to 1000.
5. Database Operation
   * Insert, update, delete.
6. After Business Rules (Order < 1000)
   * Scripts configured to execute after the database operation with an order less than 1000.
7. After Engines (No specific order)
   * Label engine
   * Listener engine
   * Table notifications engine
   * Role engine (for sys_user, sys_user_group, sys_user_grmember, and sys_user_role tables)
   * Text indexing engine
   * Update sync engine
   * Workflow engine (for deferred workflows)
   * Trigger engine (for all Flow Designer flows)
8. Email Notifications (Based on weight)
   * Notifications sent on an insert, update, or delete
   * Event-based notifications
9. After Business Rules (Only active records, Order >= 1000)
   * Scripts configured to execute after the database operation with an order greater than or equal to 1000.
10. End