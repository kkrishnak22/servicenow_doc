# ServiceNow PDFGenerationAPI

## Overview

This API is part of the ServiceNow PDF Generation Utilities plugin (`com.snc.apppdfgenerator`) and is provided within the `sn_pdfgeneratorutils` namespace. The plugin is activated by default.

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

## Main PDF Conversion Methods

The main function for PDF conversion is `convertToPDF(String html, String targetTable, String targetTableSysId, String pdfName)`. The four main attributes we need to input in this function are:
- HTML code for the template
- Target table name
- Target table sys_id
- Name for the generated PDF

## Method 1: convertToPDFWithHeaderFooter()

### Syntax
`pdfResponse = v.convertToPDFWithHeaderFooter(html, targetTable, targetTableSysId, pdfName, options);`

### Parameters
- `html` - HTML content to convert to PDF
- `targetTable` - Table name where PDF will be attached
- `targetTableSysId` - Sys ID of the specific record
- `pdfName` - Name for the generated PDF file
- `options` - Configuration object for PDF settings

### Configuration Options
```javascript
{
    "PageSize": "A4",                    // Paper size (A4, Letter, etc.)
    "GeneratePageNumber": "false",       // Show page numbers (true/false)
    "TopOrBottomMargin": "36",          // Top/bottom margin in points
    "LeftOrRightMargin": "24"           // Left/right margin in points
}
```

### Getting PDF Details
```javascript
pdfSysId = pdfResponse.sys_id || pdfResponse.attachment_id;
var downloadURL = "/sys_attachment.do?sys_id=" + pdfSysId + "&view=true";
gs.info(downloadURL);
```

- Extract attachment ID from response
- Create download URL for the PDF
- Log URL for debugging

## Method 2: convertToPDF() - Business Rule Example

### Complete Business Rule Code
```javascript
// Get HTML template from current record
var html = current.u_template.u_html_template;

// Define target table and record
var targetTable = 'sys_user';
var targetTableSysId = current.getValue('caller_id');

// Replace placeholders in HTML template
var UpdatedHTML = html.replace('Employee_name', current.getDisplayValue('caller_id'));
var Updateddate = UpdatedHTML.replace('Date', current.getDisplayValue('sys_created_by'));

// Set PDF name
var pdfName = current.getDisplayValue('caller_id');

// Create PDF instance and generate
var v = new sn_pdfgeneratorutils.PDFGenerationAPI();
var result = v.convertToPDF(Updateddate, targetTable, targetTableSysId, pdfName);

// Update the current record
current.update();
```

### Step-by-Step Breakdown

#### Step 1: Get HTML Template
`var html = current.u_template.u_html_template;`
- Retrieves HTML template from a related record
- `u_template` is a reference field
- `u_html_template` contains the HTML content

#### Step 2: Define Target Information
```javascript
var targetTable = 'sys_user';
var targetTableSysId = current.getValue('caller_id');
```
- `targetTable` - Table where PDF will be attached
- `targetTableSysId` - Specific record ID to attach PDF to

#### Step 3: Dynamic Content Replacement
```javascript
var UpdatedHTML = html.replace('Employee_name', current.getDisplayValue('caller_id'));
var Updateddate = UpdatedHTML.replace('Date', current.getDisplayValue('sys_created_by'));
```
- Replace placeholder text in HTML template
- `Employee_name` replaced with caller's display name
- `Date` replaced with record creator's display name
- Chain replacements for multiple substitutions

#### Step 4: Generate PDF
```javascript
var pdfName = current.getDisplayValue('caller_id');
var v = new sn_pdfgeneratorutils.PDFGenerationAPI();
var result = v.convertToPDF(Updateddate, targetTable, targetTableSysId, pdfName);
```
- Set PDF filename
- Create API instance
- Generate PDF with updated HTML content

#### Step 5: Update Record
`current.update();`
- Saves any changes made to the current record

## Key Differences Between Methods

### convertToPDFWithHeaderFooter()
- Supports advanced formatting options
- Can configure margins, page size, page numbers
- More control over PDF appearance

### convertToPDF()
- Simpler method with default settings
- No custom formatting options
- Faster for basic PDF generation

## Common Use Cases

### Template-Based PDFs
- Store HTML templates in custom tables
- Use placeholder text for dynamic content
- Replace placeholders with actual data before generation

### Attachment to Records
- PDFs automatically attached to specified records
- Use `targetTable` and `targetTableSysId` to control attachment location

### Dynamic Content
- Replace multiple placeholders using chained `.replace()` calls
- Use `getDisplayValue()` for user-friendly text
- Use `getValue()` for raw field values

## Best Practices

- Always store PDF generation instance in a variable
- Use meaningful variable names for clarity
- Handle HTML template retrieval safely
- Test placeholder replacement thoroughly
- Consider using `try/catch` blocks for error handling
- Log important information for debugging

## Troubleshooting Tips

- Verify HTML template contains expected placeholder text
- Check that reference fields exist and are populated
- Ensure target table and sys_id are valid
- Test PDF generation in different contexts
- Monitor system logs for generation errors

## Quick Reference

### Basic Setup
`var v = new sn_pdfgeneratorutils.PDFGenerationAPI();`

### Simple PDF
`var result = v.convertToPDF(html, targetTable, targetTableSysId, pdfName);`

### Advanced PDF with Options
`var result = v.convertToPDFWithHeaderFooter(html, targetTable, targetTableSysId, pdfName, options);`

### Get Download URL
```javascript
pdfSysId = pdfResponse.sys_id || pdfResponse.attachment_id;
var downloadURL = "/sys_attachment.do?sys_id=" + pdfSysId + "&view=true";
```




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
