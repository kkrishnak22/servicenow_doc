(function runTransformScript(source, map, log, target) {
    ignore = true;
    //Utility Functions
    function toStr(val) {
        return (val !== null && val !== undefined) ? val.toString().trim() : '';
    }
 
    function abort(msg) {
        gs.error("HHHHHH ABORT: " + msg);
        target.setAbortAction(true);
        target.setAbortMessage(msg);
        ignore = true;
    }
 
    // Mandatory Field Validation
 
    var mandatoryFields = [
        'u_requested_for',
        'u_last_name',
        'u_employee_code_login_id',
        'u_ad_account_type',
        'u_first_name',
        'u_business_unit',
        'u_location2',
        'u_office_contact_number',
        'u_job_function_list',
        'u_reporting_manager_employee_code',
        'u_provision_email_access',
        'u_provision_ms_teams_access',
        'u_provision_vconnect_access',
        'u_enable_mobil_cess_to_emails',
        'u_enable_web_access_to_emails',
        'u_request_deta__justification'
    ];
 
    for (var i = 0; i < mandatoryFields.length; i++) {
        var field = mandatoryFields[i];
        if (!toStr(source[field])) {
            abort("Mandatory field missing: " + field);
            return;
        }
    }
 
    // Yes / No Validation
    var yesNoFields = [
        'u_provision_email_access',
        'u_provision_ms_teams_access',
        'u_provision_vconnect_access',
        'u_enable_mobil_cess_to_emails',
        'u_enable_web_access_to_emails'
    ];
 
    for (var j = 0; j < yesNoFields.length; j++) {
        var f = yesNoFields[j];
        var val = toStr(source[f]).toLowerCase();
 
        if (val !== 'yes' && val !== 'no') {
            abort("Invalid value for " + f + ". Allowed values: Yes or No");
            return;
        }
    }
 
    var accountType = toStr(source.u_ad_account_type).toLowerCase();
    var allowedAccountTypes = ['common', 'employee', 'service', 'vendor'];
 
    if (allowedAccountTypes.indexOf(accountType) === -1) {
        abort("Invalid AD Account Type: " + source.u_ad_account_type);
        return;
    }
 
    if (accountType === 'vendor' && !toStr(source.u_vendor_company_name)) {
        abort("Vendor company name is mandatory");
        return;
    }
 
    //Job Function Lookup
 
    var jf = new GlideRecord("u_service_request_data");
    jf.addQuery("name", toStr(source.u_job_function_list));
    jf.query();
 
    if (!jf.next()) {
        abort("Invalid Job Function: " + source.u_job_function_list);
        return;
    }
    var jobFunctionSysId = jf.getUniqueValue();
    //Reporting Manager Lookup
 
    var mgr = new GlideRecord("sys_user");
    mgr.addQuery("user_name", toStr(source.u_reporting_manager_employee_code));
    mgr.query();
    if (!mgr.next()) {
        abort("Invalid Reporting Manager: " + source.u_reporting_manager_employee_code);
        return;
    }
    //Location Lookup
 
    var loc2 = new GlideRecord("u_service_request_data");
    loc2.addQuery("u_display_value", toStr(source.u_location2));
    loc2.query();
 
    if (!loc2.next()) {
        abort("Invalid Location: " + source.u_location2);
        return;
    }
 
    var location2SysId = loc2.getUniqueValue();
 
    var locationName = source.u_location;
    if (!locationName) {
        abort("Location is empty in source");
        return;
    }
 
    locationName = locationName.toString().trim();
    var loc = new GlideRecord("cmn_location");
    loc.addQuery("name", "STARTSWITH", locationName);
    loc.query();
    if (!loc.next()) {
        abort("Invalid Location: " + locationName);
        return;
    }
    //for reference variables → use sys_id
    var locationSysId = loc.getUniqueValue();
    //Business Unit Lookup
 
    var bu = new GlideRecord("core_company");
    bu.addQuery("name", toStr(source.u_business_unit));
    bu.query();
 
    if (!bu.next()) {
        abort("Invalid Business Unit: " + source.u_business_unit);
        return;
    }
 
    var businessUnitSysId = bu.getDisplayValue();
 
 
    //Email Validation
 
    var usrEmail = new GlideRecord("sys_user");
    usrEmail.addQuery("email", toStr(source.u_email_id));
    usrEmail.query();
 
    if (!usrEmail.hasNext()) {
        abort("Invalid Email ID: " + source.u_email_id);
        return;
    }
 
 
 
    //Requested For Lookup
 
    var reqFor = new GlideRecord("sys_user");
    reqFor.addQuery("user_name", toStr(source.u_requested_for));
    reqFor.query();
 
    if (!reqFor.next()) {
        abort("Invalid Requested For: " + source.u_requested_for);
        return;
    }
 
    var requestedForSysId = reqFor.getUniqueValue();
 
    //Catalog Item
 
    var catalogItemSysId = gs.getProperty('LoginCreationId');
    if (!catalogItemSysId) {
        abort("LoginCreationId system property missing");
        return;
    }
 
    var cart = new sn_sc.CartJS();
 
    var item = {
        sysparm_id: catalogItemSysId,
        sysparm_quantity: '1',
        variables: {
            requested_for: requestedForSysId,
 
            first_name: toStr(source.u_first_name),
            last_name: toStr(source.u_last_name),
            employee_code_login_id: toStr(source.u_employee_code_login_id),
            email_id: toStr(source.u_email_id),
            ad_account_type: accountType,
            business_unit: businessUnitSysId,
            location_id: location2SysId,
            location: locationSysId,
            phone_number: toStr(source.u_phone_number),
            office_contact_number: toStr(source.u_office_contact_number),
            mobile_number: toStr(source.u_mobile_number),
 
            job_function_list: jobFunctionSysId,
            reporting_manager_employee_code: toStr(source.u_reporting_manager_employee_code),
 
            vendor_company_name: toStr(source.u_vendor_company_name),
 
            provision_email_access: toStr(source.u_provision_email_access),
            provision_ms_teams_access: toStr(source.u_provision_ms_teams_access),
            provision_vconnect_access: toStr(source.u_provision_vconnect_access),
 
            enable_mobile_access_to_emails: toStr(source.u_enable_mobil_cess_to_emails),
            enable_web_access_to_emails: toStr(source.u_enable_web_access_to_emails),
            business_cost_center: toStr(source.u_business_cost_cente),
            should_be_member_of_group: toStr(source.u_should_be_member_of_group),
            photo: toStr(source.u_photo),
            business_justification: toStr(source.u_request_deta__justification)
        }
    };
 
    var cartDetails = cart.addToCart(item);
    var rc = cart.orderNow(cartDetails);
    //Link RITM to Source
 
    var ritmGR = new GlideRecord("sc_req_item");
    ritmGR.addQuery("request", rc.sys_id);
    ritmGR.orderBy("sys_created_on");
    ritmGR.query();
 
    if (ritmGR.next()) {
        source.sys_target_table = ritmGR.getTableName();
        source.sys_target_sys_id = ritmGR.getUniqueValue();
        source.update();
        ritmGR.variables.photo = base64ToAttachment(ritmGR, "text.png", "image/png", source.u_photo.toString());
        ritmGR.update();
 
    }
 
    function base64ToAttachment(recordGr, att_name, att_content_type, att_payload) {
        var attachment = new GlideSysAttachment();
        return attachment.write(recordGr, att_name, att_content_type, GlideStringUtil.base64DecodeAsBytes(att_payload));
    }
})(source, map, log, target);
 
