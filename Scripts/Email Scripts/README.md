
## Adding CC and BCC in Email Scripts

```javascript
email.addAddress(type, address, displayname);

// Example: Add CC recipient
email.addAddress("cc", "john.copy@example.com", "John Roberts");

// Example: Add BCC recipient
email.addAddress("bcc", "john.secret@example.com", "John Roberts");
```

👉 You can only include **CC** and **BCC** via an **Email Script**.

---

## 📬 Sending Dynamic Recipients via Event

If you want to send recipients dynamically, trigger the email using an **event**:

```javascript
gs.eventQueue(
  'event_name',         // Name of the event
  glideRecordObject,    // Record to attach the event to
  recipients            // Comma-separated list of recipients
);
```
