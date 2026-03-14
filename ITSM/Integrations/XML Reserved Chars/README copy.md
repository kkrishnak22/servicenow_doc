




# What are XML Reserved Characters?

In **XML**, some characters have special meaning in the markup structure.

The main reserved characters are:

| Character | Meaning in XML               |
| --------- | ---------------------------- |
| `<`       | Start of a tag               |
| `>`       | End of a tag                 |
| `&`       | Start of an entity reference |
| `%`       | Used in DTD entities         |

Example XML:

```xml
<name>Krishna</name>
```

If you send something like:

```xml
<name>Tom & Jerry</name>
```

XML will **break** because `&` is treated as the start of an entity.

So XML converts them to **escaped values**.

| Character | Escaped Version |
| --------- | --------------- |
| `<`       | `&lt;`          |
| `>`       | `&gt;`          |
| `&`       | `&amp;`         |

Example:

```xml
<name>Tom &amp; Jerry</name>
```

---

# `setStringParameter()`

This method **automatically escapes XML characters**.

Example:

```javascript
var sm = new sn_ws.SOAPMessageV2('My SOAP Message','method');
sm.setStringParameter('comments', 'Tom & Jerry');
```

ServiceNow converts it automatically to:

```xml
<comments>Tom &amp; Jerry</comments>
```

So the request remains **valid XML**.

### When to use

Use this for **normal fields** like:

* `sys_created_by`
* `number`
* `short_description`
* `caller_id`

Basically **simple strings without HTML or special formatting**.

---

# `setStringParameterNoEscape()`

This method **does NOT escape special characters**.

Example:

```javascript
sm.setStringParameterNoEscape('comments', 'Tom & Jerry');
```

It will send:

```xml
<comments>Tom & Jerry</comments>
```

> `setStringParameter()` escapes XML reserved characters to maintain valid XML structure, while `setStringParameterNoEscape()` sends the string as-is without escaping, typically used for fields like work notes where special characters or HTML content must be preserved.
