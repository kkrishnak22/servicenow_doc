
```javascript: new x_bgstm_prism.PrismClientUtils().filterApproversBasedOnRole(current.sys_id,'level_4_approver');```

// This script is used as a reference qualifier to filter approvers based on their role for a specific record. It utilizes the 'PrismClientUtils' class from the 'x_bgstm_prism' namespace to call the 'filterApproversBasedOnRole' method. The method takes the current record's sys_id and the role name 'level_4_approver' as parameters to filter the approvers accordingly. This ensures that only users with the specified role will be available for selection as approvers in the related field.

function filterApproversBasedOnRole(salesSysId, fieldName) {
    gs.info("PRISM REF Q" + fieldName + salesSysId)
    //  var salesSysId = current.getUniqueValue();

    if (!salesSysId)
        return 'sys_idISEMPTY';

    // Get approval labels from existing function
    var response = this.getApproverLabels(salesSysId);

    if (!response)
        return 'sys_idISEMPTY';

    var parsed = JSON.parse(response);

    if (!parsed || !parsed.labels)
        return 'sys_idISEMPTY';

    var labelMap = parsed.labels;

    var label = labelMap[fieldName];

    // Hidden / not required field
    if (!label || label == 'NA')
        return 'sys_idISEMPTY';

    var roleMap = {
        'Delivery Approver': 'x_bgstm_prism.delivery_approver',
        'Finance Approver': 'x_bgstm_prism.finance_approver',
        'Business Approver': 'x_bgstm_prism.business_approver',
        'BUD Approver': 'x_bgstm_prism.bud_approver'
    };

    var roleName = roleMap[label];

    if (!roleName)
        return 'sys_idISEMPTY';

    return 'sys_class_name=x_bgstm_prism_user_master^active=true^roles=' + roleName + '^EQ';
}