# ServiceNow PDFGenerationAPI
- This API is part of the ServiceNow PDF Generation Utilities plugin (com.snc.apppdfgenerator) and is provided within the sn_pdfgeneratorutils namespace. The plugin is activated by default.

## Creating a PDFGenerationAPI Instance

To create a `PDFGenerationAPI` object, use the following syntax:

`let varObj = new namespace.ClassName();`

**Example:**
`let v = new sn_pdfgeneratorutils.PDFGenerationAPI();`

## Breakdown

- `sn_pdfgeneratorutils` → namespace (package)
- `PDFGenerationAPI` → class inside the namespace  
- `new` → creates a new instance of that class
- `v` → variable holding the object so you can call its methods

## Summary

When you create an instance using `new sn_pdfgeneratorutils.PDFGenerationAPI()`:

- You're creating an instance of the PDFGenerationAPI class
- The variable `v` will hold this object
- You can now use `v` to call methods on the PDFGenerationAPI object




- The main function for PDF conversion is convertToPDF(String html, String targetTable, String targetTableSysId, String pdfName). Here, the four main attributes we need to input in this function are the HTML code we wrote for the template, the Target table name, its sysid, and the name we want our generated PDF to have.


- if target table as User table ‘sys_user’ here because we want the generated PDF to be available for the Employee to download at their User profile.





























# ☕ Java Reference — Calling Functions

In Java, there are **two main ways** to call a function (method):

---

## 1️⃣ Calling a **Static Method**
- Declared with the `static` keyword.
- Belongs to the **class itself**, not an instance.
- Called using the **class name**.

```java
class MathUtils {
    static int square(int x) {
        return x * x;
    }
}

public class Main {
    public static void main(String[] args) {
        int result = MathUtils.square(5); // ✅ static method call
        System.out.println(result); // 25
    }
}
```

---

## 2️⃣ Calling an **Instance Method**
- Declared **without** `static`.
- Belongs to an **object** of the class.
- You need to **create an object** to call it.

```java
class Calculator {
    int add(int a, int b) {
        return a + b;
    }
}

public class Main {
    public static void main(String[] args) {
        Calculator calc = new Calculator(); // create object
        int sum = calc.add(3, 4);           // ✅ instance method call
        System.out.println(sum); // 7
    }
}
```

---

## 📝 Summary
- **Static method** → `ClassName.methodName()`  
- **Instance method** → `objectName.methodName()`  
