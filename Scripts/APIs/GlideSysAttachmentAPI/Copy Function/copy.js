


var attachment = new GlideSysAttachment();
var incidentSysID = '9e7f9864532023004247ddeeff7b121f';
var incGR = new GlideRecord('incident');
incGR.get(incidentSysID);


var copiedAttachments = attachment.copy('incident', incidentSysID, 'problem', '8f74a828532023004247ddeeff7b1295');
gs.info('Array of sys ids ' + copiedAttachments);


