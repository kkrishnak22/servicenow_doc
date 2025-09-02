v = new sn_pdfgeneratorutils.PDFGenerationAPI();
pdfResponse = v.convertToPDFWithHeaderFooter(html, targetTable, targetTableSysId, pdfName, {
	"PageSize": "A4",
	"GeneratePageNumber": "false",
	"TopOrBottomMargin": "36",
	"LeftOrRightMargin": "24"
});
pdfSysId = pdfResponse.sys_id || pdfResponse.attachment_id;
var downloadURL = "/sys_attachment.do?sys_id=" + pdfSysId + "&view=true";

gs.info(downloadURL);


// In BR we can attach the pdf to the record by using following code
var html = current.u_template.u_html_template;
    var targetTable = 'sys_user';
    var UpdatedHTML =html.replace('Employee_name',current.getDisplayValue('caller_id'));
    var Updateddate = UpdatedHTML.replace('Date', current.getDisplayValue('sys_created_by'));

    var targetTableSysId = current.getValue('caller_id');
    var pdfName = current.getDisplayValue('caller_id');

    var v = new sn_pdfgeneratorutils.PDFGenerationAPI;

    var result = v.convertToPDF(Updateddate, targetTable, targetTableSysId, pdfName);
    current.update();