

var currentURL = gs.getProperty('glide.servlet.uri');

action
    .setRedirectURL
    (
        currentURL
        + 'x_adga_pr_automa_0_pr_line_items.do?sys_id=-1%26sys_param_query=parent='
        + current.sys_id
    );
