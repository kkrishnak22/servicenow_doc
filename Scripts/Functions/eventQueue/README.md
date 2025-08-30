# ServiceNow `gs.eventQueue()`

The `gs.eventQueue()` method is used to trigger events in ServiceNow from the **server-side**.  
These events must first be registered in **System Policy → Events → Event Registry**.

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

## ⚡ Notes

- Minimum **2 parameters** required (`name`, `glideRecord`).  
- Maximum **5 parameters** supported.  
- Events are processed **asynchronously** by the Event Manager.  
- **parm1/parm2** can hold custom values (status, email, sys_id, etc.).  
  - ✅ Best practice: Pass **sys_id** if you might need more user details later.  
  - Use **email** only if you just want to display/send it as plain text.  
- These values don’t change the event itself, but they are **stored in the event log** (`sysevent` table) and can be consumed by Notifications or Script Actions.  
- Notifications → Can use `${event.parm1}`, `${event.parm2}`, `${current.field_name}` in email templates.  
- Script Actions → Server-side scripts that run when an event is fired (update records, call integrations, etc.).  

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

## 🔄 Custom Event Queues

By default, if the **Queue** parameter is left blank, the event is processed in the **Default queue** (`events`).  
This is fine for infrequent events.  

👉 But if your workflow triggers **many events in a short time**, define a **custom queue** to prevent slowdowns.

---

### 🛠️ Steps to Define a Custom Queue

1. Navigate to **Schedule [sys_trigger]**.  
2. Find the record with name **`text index events process`**.  
3. Look at the **Job context** field — it looks like:  
   ```javascript
   GlideEventManager('text_index').process();
   ```
4. Create a copy of this record for your queue:  
   - Change **Name** → e.g., `reminder_queue`  
   - Change **Job context** →  
     ```javascript
     GlideEventManager('reminder_queue').process();
     ```
   - Save with **Insert and Stay** (important).  

---

### 📌 Triggering an Event in Custom Queue

```javascript
gs.eventQueue("event.name", recordGr, "param1", "param2", "reminder_queue");
```

This ensures the event is processed by the **`reminder_queue`** processor instead of the default queue.

---

## 📚 Official References

- [ServiceNow Docs: Custom Event Queues](https://www.servicenow.com/community/developer-articles/custom-event-queues/ta-p/3045097)  
- [ServiceNow Community: gs.eventQueue() Explanation](https://www.servicenow.com/community/developer-forum/gs-eventqueue/m-p/1529244)  
- [ServiceNow Community: Event Queue Parameters](https://www.servicenow.com/community/developer-forum/mail-notification-using-event-queue/m-p/2995462)  

---

## 📝 Summary

- `gs.eventQueue()` supports **up to 5 parameters**.  
- Use for triggering **events → notifications → business logic → scheduled jobs**.  
- **parm1/parm2**: store custom context values, retrievable in notifications/scripts.  
- **Default queue** works for low frequency.  
- **Custom queues** recommended for high-volume events to optimize performance.  
