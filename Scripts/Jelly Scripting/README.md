# ServiceNow Jelly Scripting – README


---

## 📌 What is Jelly?

**Jelly** is ServiceNow’s **XML-based server-side templating language** used to generate dynamic HTML before it reaches the browser.

Jelly runs **on the ServiceNow server**, not in the browser.

---

## 📂 Basic File Structure

A Jelly file looks like this:

```xml
<?xml version="1.0" encoding="utf-8" ?>

<j:jelly
    trim="false"
    xmlns:j="jelly:core"
    xmlns:g="glide">

    <!-- Your UI goes here -->

</j:jelly>
```

---

### 1️⃣ XML Declaration

```xml
<?xml version="1.0" encoding="utf-8" ?>
```

This tells ServiceNow:

* This is an **XML document**
* Uses **UTF-8 encoding**

Jelly is XML-based, not HTML-based.

---

### 2️⃣ Root Tag

```xml
<j:jelly>
```

This is the **main container** for all Jelly code. Nothing works outside this tag.

---

### 3️⃣ Namespace Declarations

```xml
xmlns:j="jelly:core"
xmlns:g="glide"
```

Namespaces define **what special tags you can use**.

| Namespace | Purpose                           |
| --------- | --------------------------------- |
| `j:`      | Core logic (if, loops, variables) |
| `g:`      | ServiceNow APIs and UI helpers    |

---

## 🧠 Core Jelly Tags

### Conditions

```xml
<j:if test="${condition}">
  Show this
</j:if>
```

### Loops

```xml
<j:forEach items="${list}" var="item">
  <div>${item}</div>
</j:forEach>
```

### Variables

```xml
<j:set var="myVar" value="Hello" />
```

---

## ⚙️ ServiceNow Logic with `g:evaluate`

This lets you run **server-side JavaScript** inside Jelly.

```xml
<g:evaluate>
  var userName = gs.getUserName();
</g:evaluate>

<div>Welcome, ${userName}</div>
```

### What Happens

* JavaScript runs on the server
* Variable becomes available in HTML
* Browser receives final rendered page

---

## 🔁 Data Flow

```
Browser
  ↓
ServiceNow Server
  → Runs Jelly
  → Runs Glide API
  → Generates HTML
  ↓
Browser renders HTML
```

---

## 🧩 Working with Database Records

### Example: Fetch Incidents

```xml
<g:evaluate>
  var gr = new GlideRecord('incident');
  gr.query();
  var incidents = [];

  while (gr.next()) {
    incidents.push(gr.number.toString());
  }
</g:evaluate>

<j:forEach items="${incidents}" var="inc">
  <div>${inc}</div>
</j:forEach>
```

---

## 🧱 UI Components

### Button

```xml
<button onclick="alert('Clicked!')">Click Me</button>
```

### Reference Field

```xml
<g:reference
  name="caller_id"
  table="sys_user"
  displayValue="true" />
```

---

## 🧠 Best Practices

* ✅ Keep business logic in **Script Includes**
* ✅ Use Jelly only for UI rendering
* ❌ Avoid large JS blocks in `<g:evaluate>`
* ✅ Sanitize user inputs
* ✅ Comment your code

---

## 🔥 Calling Script Includes

### Server Side

```xml
<g:evaluate>
  var myScript = new MyScriptInclude();
  var result = myScript.getData();
</g:evaluate>

<div>${result}</div>
```

---

## 📦 Debugging Tips

### Print Server Logs

```xml
<g:evaluate>
  gs.info('Jelly Page Loaded');
</g:evaluate>
```

Check logs in:

> System Logs → All

---

## ⚔️ Jelly vs Service Portal

| Feature     | Jelly             | Service Portal |
| ----------- | ----------------- | -------------- |
| Rendering   | Server-side       | Client-side    |
| Framework   | XML + JS          | AngularJS      |
| Performance | Fast initial load | Dynamic UI     |
| Modern UX   | Limited           | Excellent      |

---

## 🎯 When to Use Jelly

Use Jelly when:

* Working on **Classic UI**
* Maintaining **Legacy Apps**
* Building **Admin Tools**

Avoid Jelly when:

* Building modern portals
* Creating customer-facing UIs

---

## 🚀 Learning Path

### Beginner

* UI Pages
* `j:if`, `j:forEach`
* `g:evaluate`

### Intermediate

* Script Includes
* GlideRecord
* UI Macros

### Advanced

* Custom form rendering
* Secure data handling
* Performance tuning

---

## 🧠 Full-Stack Dev Mapping

| Concept  | React/Node   | ServiceNow      |
| -------- | ------------ | --------------- |
| API      | Express      | Script Include  |
| Template | JSX          | Jelly           |
| State    | useState     | Glide Variables |
| Routing  | React Router | UI Pages        |

---

## 📚 Resources

* ServiceNow Docs
* ServiceNow Community
* UI Pages & UI Macros Training

---

## 🏁 Final Notes

> Learn Jelly to **debug and extend legacy systems**, not to build modern frontends.

If you master Jelly + Script Includes + Service Portal, you become a **full-spectrum ServiceNow Developer** 💪

---

## ✨ Want More?

I can provide:

* Sample **Admin Dashboard in Jelly**
* Jelly + Script Include Architecture
* Real-world **Enterprise UI Page Templates**

Just ask 😎
