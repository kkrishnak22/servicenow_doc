
// 1st
var currentURL = gs.getProperty('glide.servlet.uri');

action
    .setRedirectURL
    (
        currentURL 
        + 'x_adga_pr_automa_0_pr_line_items.do?sysparm_stack=x_adga_pr_automa_0_pr_line_items.do&sys_id=-1&sysparm_query=parent='
        + current.sys_id
        + '^email_address=abc@gmail.com'

    );

// 2nd
action.setRedirectURL(new GlideRecord('table_name'));


// 3rd 
// https://atglsouldev.service-now.com/x_adga_pr_automa_0_pr_line_items.do?sys_id=-1&sysparm_query=parent=a646daf747c236d0f73ef6a8536d4324^email_address=rikin.patel@inputzero.com^pr_type=Service%20Capex

 var baseURL = gs.getProperty('glide.servlet.uri');

	var prLineItem =
        baseURL +
        'x_adga_pr_automa_0_pr_line_items.do?' +
        'sys_id=-1' +
        '&sysparm_query=parent=' + current.sys_id +
        '^email_address=' + current.email_address +
        '^pr_type=' + current.pr_type;

    action.setRedirectURL(prLineItem);
	action.setReturnURL(current);
