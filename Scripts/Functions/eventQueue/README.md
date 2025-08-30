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
| `parm1`       | String   | ❌ No    | Optional string value, stored with the event instance.                      |
| `parm2`       | String   | ❌ No    | Optional string value, stored with the event instance.                      |
| `queue`       | String   | ❌ No    | Queue name. If not specified, defaults to `"events"`.                       |

---

## ⚡ Notes

- Minimum **2 parameters** required (`name`, `glideRecord`).
- Maximum **5 parameters** supported.
- Events are processed asynchronously by the Event Manager.
- Notifications and scripts can be attached to these events.

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

---

## 📚 Official References

- [ServiceNow Docs: Custom Event Queues](https://www.servicenow.com/community/developer-articles/custom-event-queues/ta-p/3045097)  
- [ServiceNow Community: gs.eventQueue() Explanation](https://www.servicenow.com/community/developer-forum/gs-eventqueue/m-p/1529244)  
- [ServiceNow Community: Event Queue Parameters](https://www.servicenow.com/community/developer-forum/mail-notification-using-event-queue/m-p/2995462)

---

## 📝 Summary

- `gs.eventQueue()` supports **up to 5 parameters**.  
- Useful for triggering events → notifications, business logic, scheduled jobs, etc.  
- Best practice: Register events in **Event Registry** before calling them.  
