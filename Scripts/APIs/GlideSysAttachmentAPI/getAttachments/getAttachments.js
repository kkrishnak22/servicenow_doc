var attachment = new GlideSysAttachment();

var agr = attachment.getAttachments('problem', '8f74a828532023004247ddeeff7b1295'); 
// Returns glide record containing the meta data each attachment

while(agr.next())
gs.info(agr.getValue('file_name'));