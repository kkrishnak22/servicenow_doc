**What is UI Action**
Ui Actions are rules that define custom actions or buttons on forms and lists.

**

**gsftSubmit?**

It is used to call server side code. basically it helps to write the server side logic in a client callable ui action 
```javascript
gsftSubmit(null, g_form.getFormElement(), 'ui_action_name');

if (typeof window == 'undefined') {
    // server side code
}
```


**action.setRedirectURL(current);**
**action.setReturnURL(fixchg);**
**action.openGlideRecord(incGR);**