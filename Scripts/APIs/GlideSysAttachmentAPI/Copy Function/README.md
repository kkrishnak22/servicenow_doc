# GlideSysAttachment - copy()

## Method Signature
```javascript
copy(String sourceTable, String sourceID, String targetTable, String targetID)
```

## Description
Copies all attachments from the source record to the target record and returns an array of sys_ids.

Copying an attachment also copies any attributes assigned to it. You can view a list of assigned attributes in the Attachment Attributes [sys_attachment_list] table, or run `fetchAllAttributes()`.

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `sourceTable` | String | Name of the table with the attachments to be copied. |
| `sourceID` | String | Source table's sys_id. |
| `targetTable` | String | Name of the table on which to add the attachments. |
| `targetID` | String | Target table's sys_id. |

## Returns

| Type | Description |
|------|-------------|
| String | Array of sys_ids of the attachments that were copied. |

## Example Usage
```javascript
var gsa = new GlideSysAttachment();
var copiedAttachments = gsa.copy('incident', 'source_sys_id', 'problem', 'target_sys_id');
gs.info('Copied attachments: ' + copiedAttachments);
```