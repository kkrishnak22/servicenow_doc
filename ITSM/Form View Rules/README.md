**What happens when a user switches a form view in ServiceNow?**
When a user switches to a different view, that selected view is saved as a **user preference**, so the same view loads by default the next time the form opens.

---

**Can we override a user’s saved view preference?**
Yes. We can override it using **View Rules**, which force a specific view to load based on defined conditions (such as role or criteria).

---

**Do View Rules apply to all users?**
No. View Rules do **not apply to users who have no role** assigned.

---

**Why might a View Rule not work even if configured correctly?**
Because the user may already have a saved **user preference entry** for that view, which takes priority.

---

**How do you make a View Rule apply if a user preference already exists?**
Delete the existing user preference entry for that view.

---

**What should you do after deleting a user preference to ensure changes take effect?**
Clear the system cache so the new view rule is applied properly.

---

**How do you clear the ServiceNow system cache?**
Open this URL in the browser:
`instance-name.service-now.com/cache.do`

---

**In simple terms, what controls which view loads first?**
Priority order:

1. User Preference (highest priority)
2. View Rule
3. Default View

---
