
function getAttachmentCount() {
    var attachmentGr = new GlideRecord('sys_attachment');
    attachmentGr.addQuery('table_name', 'x_adga_project_a_0_lp_payout_task');
    attachmentGr.addQuery('table_sys_id', current.sys_id);
    attachmentGr.query();

    var attachmentCount = 0;
    while (attachmentGr.next()) {
        attachmentCount++;
    }

    return attachmentCount;
}

var attachmentNumber = getAttachmentCount() + 1;
var invoiceNumber;
invoiceNumber = 'INV/' + rsOrElectricityBill + '/' + year + '/' + attachmentNumber;


// MANAGE ATTACHMENT NUMBERING
// This script calculates the number of attachments associated with a specific record in the 'sys_attachment' table and generates an invoice number based on that count. The invoice number is formatted as 'INV/{rsOrElectricityBill}/{year}/{attachmentNumber}', where 'rsOrElectricityBill' and 'year' are variables that should be defined elsewhere in the code. The attachment count is incremented by 1 to account for the new attachment being added.