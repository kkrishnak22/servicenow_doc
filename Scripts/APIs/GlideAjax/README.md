**What is the GlideAjax class, and how is it used?**
GlideAjax allows executing server-side code from the client asynchronously

**How does asynchronous GlideAjax differ from synchronous?**
Asynchronous GlideAjax uses a callback function to handle server responses.
Synchronous GlideAjax blocks client interaction until the server response is received.


**Provide an example of asynchronous GlideAjax in ServiceNow.**
```javascript
var ga = new GlideAjax('HelloWorld');  
ga.addParam('sysparm_name', 'sayHello');  
ga.addParam('sysparm_dynamic_data', 'dynamic value');  
ga.getXML(function(response) {  
    var answer = response.responseXML.documentElement.getAttribute('answer');  
    alert(answer);  
});  
```

