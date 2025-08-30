# ⚡ ServiceNow `gs.eventQueue()`

The `gs.eventQueue()` method is used to trigger events in ServiceNow from the **server-side**.  
These events must first be registered in **Event Registry (`sysevent_register`)**.

---

## 📌 Method Signature

```javascript
gs.eventQueue(String name, Object glideRecord, String parm1, String parm2, String queue);
```

---

## 📖 Parameters

| Parameter     | Type     | Required | Description                                                                 |
|---------------|----------|----------|-----------------------------------------------------------------------------|
| `name`        | String   | ✅ Yes   | Name of the event being queued (must exist in the Event Registry).          |
| `glideRecord` | Object   | ✅ Yes   | GlideRecord object, usually `current`.                                      |
| `parm1`       | String   | ❌ No    | Optional string value, stored with the event instance (`sysevent` table).   |
| `parm2`       | String   | ❌ No    | Optional string value, stored with the event instance (`sysevent` table).   |
| `queue`       | String   | ❌ No    | Queue name. If not specified, defaults to `"events"` (Default Queue).       |

---

## ⚡ Key Notes

- Minimum **2 parameters** required (`name`, `glideRecord`).  
- Maximum **5 parameters** supported.  
- Events are processed **asynchronously** by the Event Manager.  
- **parm1/parm2** can hold custom values (status, email, sys_id, etc.).  
  - ✅ Best practice: Pass **sys_id** if you might need more user details later.  
  - Use **email** only if you just want to display/send it as plain text.  
- Notifications → Can use `${event.parm1}`, `${event.parm2}`, `${current.field_name}`.  
- Script Actions → Run additional **server-side logic** when the event is fired.  

---

## ✅ Examples

### 1. Basic Example (2 params)
```javascript
gs.eventQueue("user.approval.triggered", current);
```

### 2. With Additional Parameters (4 params)
```javascript
gs.eventQueue("user.approval.result", current, "approved", gs.getUserID());
```

### 3. With Custom Queue (5 params)
```javascript
gs.eventQueue("task.reminder", current, "high_priority", "overdue", "reminder_queue");
```

### 4. Example with Email Passed
```javascript
gs.eventQueue("user.notify", current, "approved", "john.doe@example.com,abc@domain.com");
```

---

# ⚡ ServiceNow Event Queues

ServiceNow’s **event queues** manage and process system events **asynchronously**.  
Events trigger actions based on conditions, enabling tasks such as **notifications** or **workflows**.

---

## 🗂 Events in the `sysevent` Table
- Some OOB events have a value in the **Queue** column.  
- Others leave this field **blank** → defaults to `"events"` queue.  

---

## ⚙️ Event Processing is Asynchronous
- When you call `gs.eventQueue()`, ServiceNow inserts a record into the **`sysevent`** table.  
- The **Event Manager** picks it up and processes it **asynchronously**.  
- Caller does **not wait** for the event to complete.  

---

## 🗂 Default Queue: `"events"`
- If queue is **not specified**, events go into the `"events"` queue.  
- Events in the **same queue** are processed **sequentially**.  
- Example:  
  - Fire **10 events** into `"events"` → processed one after another (very fast, but not parallel).  

---

## 🔀 Different Queues (Parallel Processing)
- Queues like `"flow_engine"`, `"text_index"`, or **custom queues** each have their **own processor thread**.  
- This allows **parallel event execution** across queues.  
  - 5 events in `"events"` + 5 events in `"flow_engine"` → processed in **parallel**.  

---

## 🔄 Custom Event Queues

By default, if the **Queue** parameter is left blank, the event is processed in the `"events"` queue.  
This is fine for infrequent events, but for **high volume events**, a **custom queue** is recommended.

---

### 🛠️ Steps to Define a Custom Queue
1. Navigate to **Schedule [sys_trigger]**.  
2. Find record with name **`text index events process`**.  
3. Look at the **Job context**:  
   ```javascript
   GlideEventManager('text_index').process();
   ```
4. Duplicate the record → update fields:  
   - **Name**: `reminder_queue`  
   - **Job context**:  
     ```javascript
     GlideEventManager('reminder_queue').process();
     ```
   - Save using **Insert and Stay**.  

---

### 📌 Triggering an Event in Custom Queue

```javascript
gs.eventQueue("event.name", recordGr, "param1", "param2", "reminder_queue");
```

👉 This ensures the event is processed by the **`reminder_queue`** processor instead of the default queue.

---

## 📚 References
- [ServiceNow Docs: Custom Event Queues](https://www.servicenow.com/community/developer-articles/custom-event-queues/ta-p/3045097)  
- [ServiceNow Community: gs.eventQueue() Explanation](https://www.servicenow.com/community/developer-forum/gs-eventqueue/m-p/1529244)  
- [ServiceNow Community: Event Queue Parameters](https://www.servicenow.com/community/developer-forum/mail-notification-using-event-queue/m-p/2995462)  

---

## 📝 Summary

- `gs.eventQueue()` supports **2–5 parameters**.  
- Used to trigger **events → notifications → business logic → scheduled jobs**.  
- **parm1/parm2** store context values (status, email, sys_id, etc.).  
- **Default queue** works for low volume.  
- **Custom queues** recommended for heavy event loads (parallel processing).  
