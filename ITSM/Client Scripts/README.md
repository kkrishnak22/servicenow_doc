**What is a Client Script in ServiceNow?**
A Client Script is JavaScript that runs on the client side (browser) to control form behavior dynamically without server interaction.

---

**What are the types of Client Scripts?**

* onLoad — runs when form loads
* onChange — runs when field value changes
* onSubmit — runs when form is submitted
* onCellEdit — runs when list cell is edited

---

**What is the difference between onLoad and onChange?**

| onLoad               | onChange                      |
| -------------------- | ----------------------------- |
| Runs when form loads | Runs when field value changes |
| Runs once            | Runs multiple times           |

## 🔹 Intermediate Questions

**What is `isLoading` in onChange script?**
It is a variable that tells if the form is loading or not
---

**Why is `if (isLoading || !newValue) return;` used?**
To avoid execution when form loads or value is empty.

---

**Difference between Client Script and UI Policy**

| Client Script   | UI Policy         |
| --------------- | ----------------- |
| Requires coding | No code           |
| Flexible logic  | Simple conditions |


---

**How do you call server-side code from Client Script?**
Using **GlideAjax**.

---

**Why not use GlideRecord in Client Script?**
Because GlideRecord is server-side API and not allowed in client scripts.
But it can be used.

---

**How to stop form submission conditionally?**

```javascript
return false;
```
---

**Difference between getValue() and getDisplayValue()?**

| getValue       | getDisplayValue    |
| -------------- | ------------------ |
| Returns sys_id | Returns label      |
| Backend value  | User-visible value |

---

**Can client scripts enforce security?**
No. Client scripts run in browser and can be bypassed. Security must be enforced using ACLs or server logic.

---

**Does hiding a field using client script secure it?**
No. It only hides UI, not backend access.

---

**Which runs first: Client Script or UI Policy?**
onLoad client script runs first, then UI policies evaluate.

---

**Can we execute an OnChange Client Script during form load? If so, how?**

```javascript
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '')
    // Code written here will work onload
      return;
}

```
**What is `isTemplate` in an onChange Client Script?**
`isTemplate` is an internal boolean parameter that indicates whether a field value change was triggered by a template rather than a manual user action.

---

**What is `control` in an onChange Client Script?**
`control` represents the DHTML field element whose value changed. Note: it is not accessible in Mobile or Service Portal.

---

**What does the "Inherited" option do in a Client Script?**
It determines whether the client script also applies to extended tables that inherit from the current table.

---

**What does the "Global" checkbox do in a Client Script?**
If selected, the client script runs on all views of the table.

---

**What does the "View" field control in a Client Script?**
It specifies which form views the client script should run on. This option appears only when Global is unchecked.

---

**What is the purpose of "Isolate Script" in Client Scripts?**
It runs the script in strict mode with restricted access to DOM, jQuery, Prototype, and the window object for better security and stability.

---

**How can you disable script isolation for all client scripts?**
By setting the system property:

`glide.script.block.client.globals = false`


**Which Client Script runs when multiple Client Scripts exist on the same field or type (like onLoad or onChange)?**
When multiple client scripts apply to the same field or trigger type, they all execute, and their execution order is determined by the **Order** field value.

---

**What happens if Order is specified for Client Scripts?**
Scripts execute in ascending order (lowest number runs first). For example, Order 100 runs before Order 200.

---

**What happens if Order is not specified?**
If no order is set, ServiceNow treats it as default (usually 100), and execution order may become unpredictable when multiple scripts exist.

---

**Which runs first if two Client Scripts have the same Order value?**
Execution order is not guaranteed. It depends on internal processing and should not be relied upon.

---

**What are the key parameters for onCellEdit() client scripts?**

sysIDs: Array of sys_ids for items being edited.
table: The table of the edited items.
oldValues: Previous cell values.
newValue: New cell value.
callback: Determines whether to continue or halt further execution.


**What is strict mode in new client scripts, and how is it implemented?**

Strict mode ensures better security and coding practices.
It disables direct DOM access, jQuery, prototype, and window object usage.
To override strict mode for a script, select the “Isolate script” checkbox.

**How can a catalog client script update a list collector variable?**
Use the API g_form.refreshSlushbucket(fieldName) to refresh list collector variables.

**Why is the control parameter not accessible in Service Portal?**
The control parameter relies on traditional UI elements that are not present in Service Portal.
Service Portal uses AngularJS, which handles field updates differently.

**How can you modify the options in a choice list using a client script?**
Use g_form.removeOption() and g_form.addOption().

Example: 
```javascript
function onLoad() { g_form.removeOption('priority', '1'); g_form.addOption('priority', '5', 'Very Low', 4); }
```

**Why is it not recommended to use getXMLWait()**
It blocks the UI while waiting for a response.
This can make the application feel slow and unresponsive.


**g_user available in client script?**
Yes, we can get basic info of the current user like roles, name, etc


**What are the different ways to access server-side data in a Client Script?**
1. Using the getReference() method:
This method is used to retrieve related record data from the server. It allows you to fetch reference field data asynchronously in a Client Script. For example, if you have a reference field in a form, you can use getReference() to fetch additional data related to that reference field.

2. Using GlideAjax:
GlideAjax is a powerful way to call Script Includes from a Client Script. It allows you to send data to the server and retrieve the result asynchronously. This method is useful when you need to perform complex server-side logic or access large sets of data that cannot be efficiently handled directly on the client-side.


3. Using display Business Rule (BR):
A Display Business Rule can be used to execute server-side logic and return data to the client-side when a form is loaded. This is useful when you want to perform server-side actions, such as data population or validations, during form load phase.

**What are the different ways to make field mandatory?**
1. Client Script
2. UI Policy
3. Data Policy
4. Field Dictionary Level


**How to access dot walking fields??**
```javascript
g_form.getValue("caller_id.email");
```

**Tell me some g_form functions**
Glide Form Methods
```javascript
setValue()

getFormElement()

getValue()

getSection()

addOption()

getTableName()

removeOption()

getUniqueValue()

addInfoMessage()

hideRelatedLists()

addErrorMessage()

isMandatory()

clearMessage()

save()

clearOptions()

submit()

disableAttachments()

setDisabled()

enableAttachments()

setDisplay()

Flash()

setMandatory()

getActionName()

setVisible()

getControl()

setReadOnly()

getElement()

setSectonDisplay()

showErrorBox()

showRelatedList()

showFieldMsg()

showRelatedLists()

addDecoration()

isNewRecord()

removeOption()

hideFieldMsg()
```

**Which all objects we can access in client script?**
1. g_form: This object is used to interact with form fields, retrieve or set field values, manipulate field visibility, read-only status, and other form-related properties.
e.g. g_form.setValue('field_name', 'new_value');

2. g_scratchpad: This object is used to store temporary data on the client side that can be passed from server-side scripts (like Business Rules or Script Includes) to the client-side. It is useful for sharing data between server and client without modifying the form fields.
e.g. g_scratchpad.someData = 'value from server-side script';

3. g_user: This object provides information about the currently logged-in user, such as their username, roles, and other user-related data. It's helpful for conditionally controlling the behavior of client scripts based on the user's identity or role.
e.g. var currentUser= g_user.getUsername()

**What is g_form.submit() & refresh function?**

