
## Key Differences

| Method | Scope | Works With | Returns | Use Case |
|--------|-------|------------|---------|----------|
| `gs.nil(value)` | Global Applications | Any JavaScript variable/object | `true` if null/empty, `false` otherwise | General null checking |
| `GlideElement.nil()` | Both Global & Scoped | GlideRecord field elements only | `true` if field is null/empty, `false` otherwise | Field-specific null checking |
| `JSUtil.nil(value)` | Both Global & Scoped | Any JavaScript variable/object | `true` if null/empty, `false` otherwise | Scoped application alternative to gs.nil() |




### Basic Null Checking

```javascript
// Global Application - using gs.nil()
var myVar = '';
if (gs.nil(myVar)) {
    gs.log('Variable is null or empty');
}

// Scoped Application - using JSUtil.nil()
var myVar = '';
if (JSUtil.nil(myVar)) {
    gs.log('Variable is null or empty');
}
```

### GlideRecord Field Checking

```javascript
var gr = new GlideRecord('incident');
gr.get('INC0000123');

// Using GlideElement.nil() - RECOMMENDED
if (gr.caller_id.nil()) {
    gs.log('Caller ID is empty');
}

// Alternative using gs.nil() (Global only)
if (gs.nil(gr.caller_id)) {
    gs.log('Caller ID is empty');
}

// Alternative using JSUtil.nil() (Scoped)
if (JSUtil.nil(gr.caller_id)) {
    gs.log('Caller ID is empty');
}
```