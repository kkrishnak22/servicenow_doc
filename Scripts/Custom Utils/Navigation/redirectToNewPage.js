
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
