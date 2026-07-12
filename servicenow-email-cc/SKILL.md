---
name: servicenow-email-cc
description: Add CC or BCC recipients in ServiceNow notification email scripts with email.addAddress. Use when Codex needs to find, explain, create, or modify ServiceNow mail scripts that copy a user, manager, account manager, requester, or dynamic recipient on outbound email notifications.
---

# ServiceNow Email CC

## Core Pattern

Use ServiceNow notification email scripts to add CC and BCC recipients. Add recipients with:

```javascript
email.addAddress(type, address, displayName);
```

Valid `type` values for this pattern are:

```javascript
"cc"
"bcc"
```

Do not use `email.addAddress()` for `"to"` recipients. For dynamic primary recipients, prefer triggering the notification through an event and passing recipients through event parameters.

## Repository Pattern

In this repository, the reference example lives at:

```text
Scripts/Functions/addAddress/addAddress.js
Scripts/Functions/addAddress/README.md
```

The key line is:

```javascript
email.addAddress('cc', temp.email.toString(), temp.name);
```

The sample builds the copied user from `current.parent.parent.account_manager`:

```javascript
var emailArr = [];

emailArr.push({
    email: current.parent.parent.account_manager.email.toString(),
    name: current.parent.parent.account_manager.name.toString()
});

for (var p = 0; p < emailArr.length; p++) {
    var temp = emailArr[p];
    email.addAddress('cc', temp.email.toString(), temp.name);
}
```

## Implementation Guidance

When asked to add a user to CC:

1. Locate the notification mail script or create a new Email Script for the notification.
2. Resolve the user record from `current`, a referenced field, or a GlideRecord query.
3. Read both `email` and a display name from that user.
4. Guard against empty email values when the source user may be optional.
5. Add the copied recipient with `email.addAddress('cc', userEmail, userName)`.
6. Reference the mail script from the notification body with `${mail_script:script_name}` when needed.

Use a minimal guard like:

```javascript
var user = current.assigned_to;

if (!user.nil() && user.email) {
    email.addAddress('cc', user.email.toString(), user.name.toString());
}
```

For multiple recipients, collect `{ email, name }` objects and loop over them:

```javascript
var recipients = [];

recipients.push({
    email: current.requested_for.email.toString(),
    name: current.requested_for.name.toString()
});

for (var i = 0; i < recipients.length; i++) {
    if (recipients[i].email) {
        email.addAddress('cc', recipients[i].email, recipients[i].name);
    }
}
```

## Common Variants

Add BCC instead of CC:

```javascript
email.addAddress('bcc', user.email.toString(), user.name.toString());
```

Add account manager to CC, matching the local repo example:

```javascript
var accountManager = current.parent.parent.account_manager;

if (!accountManager.nil() && accountManager.email) {
    email.addAddress(
        'cc',
        accountManager.email.toString(),
        accountManager.name.toString()
    );
}
```

Trigger dynamic primary recipients through an event:

```javascript
gs.eventQueue(
    'event_name',
    current,
    recipients
);
```
