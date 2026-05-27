
< becomes &lt;
> becomes &gt;
& becomes &amp;




# Calling a UI Page
```javascript
    var rec_sys_id = g_form.getUniqueValue();
	var dialog = new GlideDialogWindow("x_bgstm_prism_Manage FTE Plan");
	dialog.setWidth(987);
	dialog.setTitle("");
	// dialog.setPreference('sys_id', rec_sys_id);
	dialog.setPreference('sysparm_parent_id', rec_sys_id); // Works 
	dialog.setPreference('rec_id', rec_sys_id); // Does not work
	dialog.render();
```
# How to use ref fields in ui page
<g:ui_reference name="my_var" query="active=true" id="u_name" table="sys_user" style="width:180px"/>

