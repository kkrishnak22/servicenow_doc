var Adani_Algosec_Integration = Class.create();
Adani_Algosec_Integration.prototype = {
    initialize: function() {},

    handleRITMClosure: function(data) {
        var ritmGR = new GlideRecord('sc_req_item');
        ritmGR.addQuery('sys_id', data.ritm_sys_id);
        ritmGR.query();
        if (!ritmGR.next()) {
            return {
                success: false,
                errorCode: 'NotFoundError',
                message: 'No RITM found with sys_id: ' + data.ritm_sys_id + ' in state Waiting for Approval.'
            };
        }
        var notes = '';
        if (data.status == 'closed_complete') {
            ritmGR.state = 3; // Closed Complete
        } else if (data.status == 'closed_in_complete') {
            ritmGR.state = 4; // Closed Incomplete
        }

        notes = 'RITM Closed By Algosec';
        if (data.remarks) {
            notes += '\nRemarks from algosec: ' + data.remarks;
        }
        ritmGR.comments = notes;
        ritmGR.update();
        return {
            success: true,
            message: "RITM Closed " + ritmGR.number + " State is " + ritmGR.state.getDisplayValue()
        };
    },
    // accept comm status when approval is not trigerred
    handleCommunicationStatus: function(data) {
        var ritmGR = new GlideRecord('sc_req_item');
        ritmGR.addQuery('sys_id', data.ritm_sys_id);
        ritmGR.addQuery('state', '10'); // Waiting for Approval
        // ritmGR.addQuery('stage', 'submitted');
        ritmGR.query();

        if (!ritmGR.next()) {
            return {
                success: false,
                errorCode: 'NotFoundError',
                message: 'No RITM found with sys_id: ' + data.ritm_sys_id + ' in state Waiting for Approval.'
            };
        }

        var status = data.status.toLowerCase();
        var notes = '';
        if (status === 'open') {
            ritmGR.variables.u_communication_status = 'open';
            notes = 'Algosec reported communication as open.';
            if (data.remarks) {
                notes += '\nRemarks from algosec: ' + data.remarks;
            }
            ritmGR.comments = notes;
            ritmGR.update();

            return {
                success: true,
                message: "Communication marked as Open."
            };

        } else if (status === 'close') {
            ritmGR.variables.u_communication_status = 'close';
            notes = 'Algosec reported communication as close.';
            ritmGR.comments = 'Algosec reported communication as close.';
            if (data.remarks) {
                notes += '\nRemarks from algosec: ' + data.remarks;
            }
            ritmGR.update();
            return {
                success: true,
                message: "Communication marked as Close."
            };

        } else {
            ritmGR.comments = "Invalid communication status: " + status + '.';
            if (data.remarks) {
                ritmGR.comments = "Remarks from algosec: " + data.remarks;
            }
            ritmGR.update();
            return {
                success: false,
                errorCode: 'BadRequestError',
                message: "Invalid communication status: " + status
            };
        }
    },
    // Accept risk score before 3rd level approval is trigerred means we need risk scrore to tigger 3rd level approval and 2nd level approval wont happen without risk score
    handleRiskStatus: function(data) {
        var entity = "";
        var ritmGR1 = new GlideRecord('sc_req_item');
        if (ritmGR1.get(data.ritm_sys_id)) {
            entity = ritmGR1.request.requested_for.u_line_of_business.u_entity;
        }

        var level3Stage = "";
        if (entity == "ACL" || entity == 'NDTV') {
            level3Stage = new global.AdaniApprovalGenericFlow().getStage(data.ritm_sys_id, 2);
        } else {
            level3Stage = new global.AdaniApprovalGenericFlow().getStage(data.ritm_sys_id, 3);
        }

        var ritmGR = new GlideRecord('sc_req_item');
        ritmGR.addQuery('sys_id', data.ritm_sys_id);
        ritmGR.addQuery('state', '10'); // Waiting for Approval
        ritmGR.addQuery('stage', '!=', level3Stage.toString()); // BU CISO
        ritmGR.query();

        if (!ritmGR.next()) {
            return {
                success: false,
                errorCode: 'NotFoundError',
                message: 'No RITM found with sys_id: ' + data.ritm_sys_id + ' in state Waiting for Approval.'
            };
        }

        var status = data.status;
        if (['high', 'medium', 'low', 'no_risk'].indexOf(status) > -1) {
            ritmGR.variables.u_risk_score = status;

            ritmGR.comments = 'Algosec reported risk score as ' + status + '. Please find the risk details in variables section';
            if (data.remarks) {
                ritmGR.variables.u_risk_details = data.remarks;
            }
            ritmGR.update();
            return {
                success: true,
                message: "Risk Score marked as " + status + "."
            };
        } else {
            ritmGR.comments = "Invalid risk score: " + status + '.';
            if (data.remarks) {
                ritmGR.comments = "Remarks from algosec: " + data.remarks;
            }
            ritmGR.update();
            return {
                success: false,
                errorCode: 'BadRequestError',
                message: "Invalid risk scrore: " + status
            };
        }
    },

    // Accept the request when change is in scheduled / implement state
    handleValidationStatus: function(data) {
        try {
            // Mandatory fields should be present in body else return mandatory fields error
            var mandatoryFields = [
                "work_end",
                "work_notes",
                // Post Implementation Review
                "attachment",
            ];

            var missingFields = mandatoryFields.filter(function(field) {
                return !data.hasOwnProperty(field) || data[field] === null || data[field] === undefined || data[field] === '';
            });

            if (missingFields.length > 0) {
                return {
                    success: false,
                    errorCode: 'MissingMandatoryFields',
                    message: 'The following mandatory fields are missing or empty: ' + missingFields.join(', ')
                };
            }
            // 
            var ritmGR = this._getRITM(data.ritm_sys_id);
            if (!ritmGR) {
                return this._errorResponse('NotFoundError', 'No RITM found with sys_id: ' + data.ritm_sys_id + '.');
            }

            var changeGR = this._getChangeRequestFromRITM(ritmGR);
            if (!changeGR) {
                return this._errorResponse('NotFoundError', 'No related Change Request for RITM: ' + data.ritm_sys_id + '.');
            }

            var attachmentSysId = this._addAttachmentToRecord(changeGR, data.attachment, 'Closure_Attachment.pdf', 'application/pdf');
            if (!attachmentSysId) {
                changeGR.comments = "Attachment upload failed";
                changeGR.update();
                return this._errorResponse('InternalServerError', 'Attachment upload failed.');
            }

            // From Payload
            changeGR.u_state_code = data.u_state_code || '1'; // Success

            changeGR.work_end = data.work_end;
            changeGR.comments = data.work_notes;
            changeGR.u_pir_date_time = data.work_end; // Same as work_end

            changeGR.u_pir_details = gs.getProperty('adani.algosec.change.request.pir.details');
            // Updated to resolve the issue
            changeGR.u_pir_assigned_to = changeGR.assigned_to;
            // // Eye Maker
            // if (data.u_eye_maker) {
            // 	changeGR.u_eye_maker = data.u_eye_maker;
            // } else {
            // 	changeGR.u_eye_maker = gs.getProperty('adani.algosec.integration.user.for.eye.maker');
            // }
            // // Eye Checker
            // if (data.u_eye_checker) {
            // 	changeGR.u_eye_checker = data.u_eye_checker;
            // } else {
            // 	changeGR.u_eye_checker = gs.getProperty('adani.algosec.integration.user');
            // }


            // Eye Maker
            var defaultEyeMakerSysId = gs.getProperty('adani.algosec.integration.user.for.eye.maker');
            var eyeMakerEmail = data.u_eye_maker;
            var eyeMakerSysId = eyeMakerEmail ? this.getValidUserByEmailOrDefault(eyeMakerEmail, defaultEyeMakerSysId) : defaultEyeMakerSysId;
            changeGR.u_eye_maker = eyeMakerSysId;

            // Eye Checker
            var defaultEyeCheckerSysId = gs.getProperty('adani.algosec.integration.user');
            var eyeCheckerEmail = data.u_eye_checker;
            var eyeCheckerSysId = eyeCheckerEmail ? this.getValidUserByEmailOrDefault(eyeCheckerEmail, defaultEyeCheckerSysId) : defaultEyeCheckerSysId;
            changeGR.u_eye_checker = eyeCheckerSysId;

            // Attachment
            changeGR.u_closure_attachment = attachmentSysId;
            changeGR.state = '0'; // Review 


            ritmGR.u_on_hold_reason = '5'; //Under Observartion
            ritmGR.comments = 'Ticket is now Implemented in Algosec';
            if (data.remarks) {
                ritmGR.work_notes = "Remarks from algosec: " + data.remarks;
            }
            var ritmRecUpdated = ritmGR.update();
            var recordUpdated = changeGR.update();

            if (!recordUpdated || !ritmRecUpdated) {
                changeGR.comments = "Record Update Failed.";
                changeGR.update();
                return this._errorResponse('InternalServerError', 'Record Update Failed.');
            }
            return {
                success: true,
                message: "Record Updated Successfully."
            };

        } catch (e) {
            return this._errorResponse('InternalServerError', 'Unexpected error: ' + e.message);
        }
    },
    // Accept the request when change is in review state
    handleChangeClose: function(data) {
        try {
            // Mandatory fields should be present in body else return mandatory fields error
            var mandatoryFields = [
                "close_code",
                "close_notes",
                "work_notes",
            ];

            var missingFields = mandatoryFields.filter(function(field) {
                return !data.hasOwnProperty(field) || data[field] === null || data[field] === undefined || data[field] === '';
            });

            if (missingFields.length > 0) {
                return {
                    success: false,
                    errorCode: 'MissingMandatoryFields',
                    message: 'The following mandatory fields are missing or empty: ' + missingFields.join(', ')
                };
            }

            var ritmGR = this._getRITM(data.ritm_sys_id);
            if (!ritmGR) {
                return this._errorResponse('NotFoundError', 'No RITM found with sys_id: ' + data.ritm_sys_id + '.');
            }

            // 2. Get related Change Request
            var changeGR = new GlideRecord('change_request');
            changeGR.addQuery('parent', ritmGR.sys_id);
            // changeGR.addQuery('state', '0'); // Review
            changeGR.addEncodedQuery('state=0^ORstate=-1'); // Review/implement
            changeGR.query();

            if (!changeGR.next()) {
                return this._errorResponse('NotFoundError', 'Related Change Request not found for RITM: ' + data.ritm_sys_id);
            }
            // From Payload
            changeGR.close_code = data.close_code,
                changeGR.close_notes = data.close_notes,
                changeGR.comments = data.work_notes,

                changeGR.u_sacm_change_comments = "Firewall ACL successfully implemented as per approved change request. ",
                changeGR.u_pir_change_manager_comments = "Firewall ACL successfully implemented as per approved change request. ",
                changeGR.u_change_review_comments = "Firewall ACL successfully implemented as per approved change request. ",

                changeGR.state = '3'; // Closed

            changeGR.update();

            // Close Request also
            ritmGR.request.state = '3'; // Closed Complete
            ritmGR.request.stage = 'closed_complete'; // Closed Complete

            // Close RITM
            ritmGR.state = '3'; // Closed Complete
            ritmGR.stage = 'complete'; // Completed
            ritmGR.comments = 'Closed by integration.';
            if (data.remarks) {
                ritmGR.comments = "Remarks from algosec: " + data.remarks;
            }
            ritmGR.update();

            return {
                success: true,
                message: 'RITM and related Change Request have been closed successfully.'
            };

        } catch (e) {
            return this._errorResponse('InternalServerError', 'Unexpected error: ' + e.message);
        }
    },


    _getRITM: function(ritmSysId) {
        var ritmGR = new GlideRecord('sc_req_item');
        ritmGR.addQuery('sys_id', ritmSysId);
        ritmGR.query();
        return ritmGR.next() ? ritmGR : null;
    },

    _getChangeRequestFromRITM: function(ritmGR) {
        var firewallCatalogSysID = gs.getProperty('adani.algosec.firewall.catalog.sys_id');
        var changeGR = new GlideRecord('change_request');
        changeGR.addQuery('parent', ritmGR.getUniqueValue());
        changeGR.addEncodedQuery('stateIN-2,-1^parent.ref_sc_req_item.cat_item=' + firewallCatalogSysID); // State is in Schedule / Implement and cat item is firewall
        changeGR.query();
        return changeGR.next() ? changeGR : null;
    },

    _addAttachmentToRecord: function(targetGR, base64Data, fileName, mimeType) {
        try {
            var attachmentUtil = new GlideSysAttachment();
            return attachmentUtil.write(
                targetGR,
                fileName,
                mimeType,
                GlideStringUtil.base64DecodeAsBytes(base64Data)
            );
        } catch (e) {
            gs.error("Attachment failure: " + e.message);
            return null;
        }
    },

    _errorResponse: function(code, message) {
        return {
            success: false,
            errorCode: code,
            message: message
        };
    },

    handleAuthentication: function() {

        var username = gs.getProperty('adani.algosec.authentication.username').toString();
        var password = gs.getProperty('adani.algosec.authentication.password').toString();

        try {
            var r = new sn_ws.RESTMessageV2('ADANI-Algosec Integration', 'Authenticate API');
            r.setStringParameterNoEscape('username', username);
            r.setStringParameterNoEscape('password', password);

            var response = r.execute();
            var httpStatus = response.getStatusCode();
            var responseBody = response.getBody();
            var parsed = JSON.parse(responseBody);

            if (httpStatus == 200 && parsed.status == "Success") {
                return {
                    success: true,
                    sessionId: parsed.data.sessionId
                };
            } else {
                return {
                    success: false,
                    error: parsed.messages && parsed.messages.length > 0 ? parsed.messages[0].message : "Authentication failed",
                    status: httpStatus
                };
            }
        } catch (ex) {
            return {
                success: false,
                error: ex.message
            };
        }
    },


    handleRitmInfo: function(params) {
        try {

            var attachmentDetails = this.getAttachmentInBase64(params.attachmentID);
            if (!attachmentDetails) {
                return {
                    success: false,
                    error: "Invalid or missing attachment."
                };
            }

            var s = new sn_ws.SOAPMessageV2('Algosec ticket Creation', 'createTicket');

            s.setStringParameter('fileNameValue', attachmentDetails.fileName);
            s.setStringParameterNoEscape('fileBase64', attachmentDetails.fileBase64);
            s.setStringParameterNoEscape('sessionId', params.sessionId);
            s.setStringParameter('requestorDetails', params.requestorDetails);
            s.setStringParameter('subject', params.subject);
            s.setStringParameter('description', params.description);
            // customFields
            s.setStringParameterNoEscape('ritmSysId', params.ritmSysId);
            s.setStringParameterNoEscape('ritmNumber', params.ritmNumber);
            s.setStringParameterNoEscape('commType', params.commType);
            s.setStringParameterNoEscape('requirementType', params.requirementType);
            s.setStringParameterNoEscape('requestType', params.requestType);
            s.setStringParameterNoEscape('accessType', params.accessType);

            // need to send expiry date only on temporary
            if (params.expiryDate) {
                s.setStringParameterNoEscape('expire', params.expiryDate);
            } else {
                s.setStringParameterNoEscape('expire', this.addOneYearToCurrentDate());
            }


            var paramsList = [
                "fileNameValue=" + attachmentDetails.fileName,
                "fileBase64=" + attachmentDetails.fileBase64,
                "sessionId=" + params.sessionId,
                "requestorDetails=" + params.requestorDetails,
                "subject=" + params.subject,
                "description=" + params.description,
                "ritmSysId=" + params.ritmSysId,
                "ritmNumber=" + params.ritmNumber,
                "commType=" + params.commType,
                "requirementType=" + params.requirementType,
                "requestType=" + params.requestType,
                "accessType=" + params.accessType,
                "expire=" + (params.expiryDate ? params.expiryDate : this.addOneYearToCurrentDate())
            ];



            //gs.log(s.getRequestBody(),"ResponseTest payload");
            var response = s.execute();
			response.waitForResponse(600); // 10 mins max
            var responseBody = response.getBody();
            var status = response.getStatusCode();
            gs.log(attachmentDetails.fileName, "ResponseTest filename");
            gs.log(attachmentDetails.fileBase64, "ResponseTest fileb64");
            gs.log(JSON.stringify(params), "ResponseTest params");
            gs.log(JSON.stringify(responseBody), 'ResponseTest response');

            // extract the change req id from the soap response body

            var xmlDoc = new XMLDocument2();
            xmlDoc.parseXML(responseBody);
            var ticketID = xmlDoc.getNodeText("//ticketId") || "";

            return {
                success: status === 200 && ticketID,
                statusCode: status,
                responseBody: responseBody,
                ticketID: ticketID
            };

        } catch (ex) {
            return {
                success: false,
                error: ex.message
            };
        }
    },


    addOneYearToCurrentDate: function() {
        // Get today's date as a GlideDateTime
        var gdt = new GlideDateTime();

        // Save original date for logging
        var today = gdt.getDate(); // "yyyy-MM-dd"

        // Add 1 year (365 days = 31,536,000 seconds)
        gdt.addSeconds(31536000);

        var newExpiry = gdt.getDate(); // returns just the date part
        return newExpiry.toString();
    },

    getAttachmentInBase64: function(attachmentSysID) {
        var attGr = new GlideRecord('sys_attachment');
        if (attGr.get(attachmentSysID)) {
            var fileName = attGr.file_name;
            // var fileBase64 = this.attachmentToBase64(attGr);
            var gst = new GlideSysAttachment();
            var bytes = gst.getBytes(attGr);
            var base64Content = GlideStringUtil.base64Encode(bytes);
            var fileBase64 = base64Content;
            return {
                fileName: fileName,
                fileBase64: fileBase64
            };
        }
        return null;
    },

    /** 
    attachmentToBase64: function (attGr) {
    	var gst = new GlideSysAttachment();
    	var bytes = gst.getBytes(attGr);
    	var base64Content = GlideStringUtil.base64Encode(bytes);
    	return base64Content;
    },
    */

    updateTrafficChangeRequestInfo: function(params) {

        try {
            var r = new sn_ws.RESTMessageV2('ADANI-Algosec Integration', 'Algosec Updates Traffic Change Request');
            r.setStringParameterNoEscape('name', params.name);
            r.setStringParameterNoEscape('value', params.value);
            r.setStringParameterNoEscape('cookie', params.sessionId);
            r.setStringParameterNoEscape('changeRequestID', params.changeRequestID);
            var response = r.execute();
            var responseBody = response.getBody();
            var httpStatus = response.getStatusCode();

            return {
                success: httpStatus == 200,
                statusCode: httpStatus,
                responseBody: responseBody
            };
        } catch (ex) {

            return {
                success: false,
                error: ex.message
            };
        }

    },
    // Returns the last date of cab approval
    setPlannedEndDate: function() {
        var cabMeetingDays = [1, 3, 5]; // Monday, Wednesday, Friday
        var cabCount = 0;
        var gdt = new GlideDate();
        var todayStr = gdt.getDate(); // "2025-07-04" // yyyy-mm-dd
        var date = new GlideDateTime(todayStr + " 00:00:00");
        // Count next 4 CAB meeting days
        while (cabCount < 4) {
            date.addDays(1);
            var dow = date.getDayOfWeek(); // 1 = Monday
            if (cabMeetingDays.indexOf(dow) !== -1) {
                cabCount++;
            }
        }
        // Add 7 PM (19:00:00) as seconds (19 * 3600 = 68400)
        date.addSeconds(68400);
        return date.toString();
    },
    addAttachmentsToIncRecord: function(incNum, changeNum, ritmNum) {
        var attachment = new GlideSysAttachment();
        // Get the Incident record
        var recInc = new GlideRecord('incident');
        if (!recInc.get('number', incNum)) {
            gs.error('Incident not found: ' + incNum);
            return;
        }
        // Get Change Request and fetch attachment from u_closure_attachment
        var recChange = new GlideRecord('change_request');
        if (recChange.get('number', changeNum)) {
            var changeAttachmentSysId = recChange.u_closure_attachment;
            if (changeAttachmentSysId) {
                var attachGR = new GlideRecord('sys_attachment');
                if (attachGR.get(changeAttachmentSysId)) {
                    var content = attachment.getContentStream(attachGR.sys_id);
                    attachment.writeContentStream(recInc, attachGR.file_name.toString(), attachGR.content_type.toString(), content);

                }
            }
        }

        // Get RITM and fetch variable attachment from attach_the_completed_downloaded_template
        var recRitm = new GlideRecord('sc_req_item');
        if (recRitm.get('number', ritmNum)) {
            var ritmAttachmentSysId = recRitm.variables.attach_the_completed_downloaded_template;
            if (ritmAttachmentSysId) {
                var attachGR = new GlideRecord('sys_attachment');
                if (attachGR.get(ritmAttachmentSysId)) {
                    var content = attachment.getContentStream(attachGR.sys_id);
                    attachment.writeContentStream(recInc, attachGR.file_name.toString(), attachGR.content_type.toString(), content);

                }
            }
        }
    },
    getBackendVariable: function(keyName) {
        var algosecbackendvariables;
        var algosecJSON = gs.getProperty('adani.algosec.backend.variables.names'); // JSON array of objects
        algosecbackendvariables = JSON.parse(algosecJSON);
        for (var i = 0; i < algosecbackendvariables.length; i++) {
            if (algosecbackendvariables[i][keyName]) {
                return algosecbackendvariables[i][keyName];
            }
        }
        return null;
    },

    handleIncident: function(data) {
        try {
            // 1. Validate mandatory fields
            var mandatoryFields = ["state", "resolution_notes", "description", "short_description"];
            var missingFields = mandatoryFields.filter(function(field) {
                return !data.hasOwnProperty(field) || data[field] === null || data[field] === undefined || data[field].toString().trim() === '';
            });

            if (missingFields.length > 0) {
                return this._errorResponse("MissingMandatoryFields", "Missing or empty fields: " + missingFields.join(", "));
            }

            var algosecState = data.state;

            if (algosecState == 'closed' || algosecState == 'resolved') {

                var integrationUserID = gs.getProperty("adani.algosec.integration.user") + "";
                var assignmentGroupID = gs.getProperty("adani.algosec.firewall.assignment.group") + "";
                var locationID = this._getUserLocation(integrationUserID);

                var incGr = new GlideRecord("incident");
                incGr.initialize();

                incGr.caller_id = integrationUserID;
                incGr.location = locationID;
                incGr.u_classification_type = gs.getProperty('adani.algosec.firewall.incident.u_classification_type');
                incGr.category = gs.getProperty('adani.algosec.firewall.incident.category');
                incGr.subcategory = "Algosec_Rule_Cleanup";
                incGr.assignment_group = assignmentGroupID;
                incGr.short_description = data.short_description;
                incGr.description = data.description;

                var incSysID = incGr.insert();
                if (!incSysID) {
                    gs.error("Incident creation failed.");
                    return this._errorResponse("InternalServerError", "Incident creation failed.");
                }

                if (incGr.get(incSysID)) {

                    incGr.assigned_to = integrationUserID;
                    incGr.state = '2'; // In progress
                    incGr.update();
                }

                if (incGr.get(incSysID)) {

                    incGr.u_resolution_category_code = "Firewall";
                    incGr.close_code = "Rule_Cleanup";
                    incGr.close_notes = "Resolution Notes";
                    incGr.state = '6'; // Resolved
                    incGr.update();
                }
                if (incGr.get(incSysID)) {
                    incGr.state = '7'; // Closed
                    incGr.comments = 'Closed by Integration';
                    incGr.update();
                }


                var incNumber = incGr.number || this._getIncidentNumberBySysId(incSysID);
                return {
                    success: true,
                    message: "Incident created and closed successfully. Incident Number is: " + incNumber
                };
            } else {
                return {
                    success: false,
                    errorCode: 'BadRequestError',
                    message: "Invalid State: " + algosecState
                };
            }

        } catch (e) {
            gs.error("Exception occurred: " + e.message);
            return this._errorResponse("InternalServerError", "Unexpected error: " + e.message);
        }
    },

    // Helper to fetch incident number if needed
    _getIncidentNumberBySysId: function(sys_id) {
        var gr = new GlideRecord("incident");
        if (gr.get(sys_id)) {
            return gr.number;
        }
        return null;
    },
    _getUserLocation: function(userID) {
        var gr = new GlideRecord('sys_user');
        if (gr.get(userID)) {
            return gr.location;
        }
    },

    addAttachmentToChangeRecord: function(changeSysID) {
        var attachment = new GlideSysAttachment();
        var changeGr = new GlideRecord('change_request');
        if (changeGr.get(changeSysID)) {
            // Get RITM and fetch variable attachment from attach_the_completed_downloaded_template
            var recRitm = new GlideRecord('sc_req_item');
            if (recRitm.get(changeGr.parent.sys_id)) {
                var ritmAttachmentSysId = recRitm.variables.attach_the_completed_downloaded_template;
                if (ritmAttachmentSysId) {
                    var attachGR = new GlideRecord('sys_attachment');
                    if (attachGR.get(ritmAttachmentSysId)) {
                        var content = attachment.getContentStream(attachGR.sys_id);
                        var attachmentID = attachment.writeContentStream(changeGr, attachGR.file_name.toString(), attachGR.content_type.toString(), content);
                        // var attachmentWorkNotes = "";

                        if (attachmentID) {
                            // attachmentWorkNotes = "Excel added to the associated change request record " + changeGr.number.getDisplayValue().toString();
                            // recRitm.work_notes = attachmentWorkNotes;
                            // recRitm.update();
                            return {
                                success: true,
                                attachmentID: attachmentID,
                                changeNumber: changeGr.number.toString()
                            };
                        } else {
                            // attachmentWorkNotes =  "Failed to add attachment on change request record " + changeGr.number.getDisplayValue().toString();
                            // recRitm.work_notes = attachmentWorkNotes;
                            // recRitm.update();
                            return {
                                success: false,
                                changeNumber: changeGr.number.toString()
                            };
                        }
                    }
                }
            }
        }
    },


    checkIfChangeIsNotInCancellState: function(ritmSysID) {
        // If change rec is not there or if change is present (state =! cancelled)

        var changeGr = new GlideRecord('change_request');
        changeGr.addQuery('parent', ritmSysID);
        changeGr.query();

        if (changeGr.next()) {
            return changeGr.state != '4'; // Return true if not cancelled
        }
        return true; // No associated change, proceed
    },
    getValidUserByEmailOrDefault: function(email, defaultUserSysId) {
        var userGR = new GlideRecord('sys_user');
        userGR.addQuery('active', 'true');
        userGR.addQuery('email', email);

        userGR.query();
        if (userGR.next()) {
            return userGR.sys_id;
        }
        return defaultUserSysId;
    },

    sendRitmDataToAlgosec: function(incidentSysId) {

        var incGR = new GlideRecord('incident');
        if (!incGR.get(incidentSysId)) {
            gs.error("Incident not found: " + incidentSysId);
            return;
        }

        if (!incGR.parent) {
            gs.error("Incident has no parent RITM: " + incidentSysId);
            return;
        }

        var ritmGR = new GlideRecord('sc_req_item');
        if (ritmGR.get(incGR.parent.sys_id.toString())) {

            // Step 1: Authenticate
            var authResponse = this.handleAuthentication();
            if (!authResponse.success) {
                ritmGR.variables.u_api_status = 'failure';
                ritmGR.work_notes = "Authentication failed: " + authResponse.error;
                incGR.work_notes = "Authentication failed: " + authResponse.error;
                ritmGR.update();
                incGR.update();
                return;
            }


            // Step 2: Send RITM data
            var ritmResponse = this.handleRitmInfo({
                sessionId: authResponse.sessionId,
                attachmentID: ritmGR.variables.attach_the_completed_downloaded_template,
                requestorDetails: ritmGR.variables.u_requested_for.email,
                subject: ritmGR.short_description,
                ritmNumber: ritmGR.number,
                ritmSysId: ritmGR.sys_id,
                requestType: ritmGR.variables.new_requirement_existing_reference,
                commType: ritmGR.variables.communication_business_requirement,
                accessType: ritmGR.variables.type_of_communication,
                description: ritmGR.variables.u_description,
                requirementType: ritmGR.variables.u_rule_type,
                expiryDate: ritmGR.variables.expiry_date
            });

            if (ritmResponse.success && ritmResponse.ticketID) {

                ritmGR.variables.algosec_changerequestid = ritmResponse.ticketID;
                ritmGR.variables.u_api_status = 'success';
                ritmGR.work_notes = "Request details successfully sent to Algosec. Algosec Ticket ID is: " + ritmResponse.ticketID;
                incGR.work_notes = "Request details successfully sent to Algosec.";
            } else {
                // ritm comments
                ritmGR.variables.u_api_status = 'failure';
                ritmGR.work_notes = "Failed to send request to Algosec: " + JSON.stringify(ritmResponse);

                // inc comments

                incGR.work_notes = "Failed to send request to Algosec: Response Body is " + JSON.stringify(ritmResponse);

                incGR.work_notes = "RITM Data is " + [
                    "sessionId=" + authResponse.sessionId,
                    "attachmentID=" + ritmGR.variables.attach_the_completed_downloaded_template,
                    "requestorDetails=" + ritmGR.variables.u_requested_for.email,
                    "subject=" + ritmGR.short_description,
                    "ritmNumber=" + ritmGR.number,
                    "ritmSysId=" + ritmGR.sys_id,
                    "requestType=" + ritmGR.variables.new_requirement_existing_reference,
                    "commType=" + ritmGR.variables.communication_business_requirement,
                    "accessType=" + ritmGR.variables.type_of_communication,
                    "description=" + ritmGR.variables.u_description,
                    "requirementType=" + ritmGR.variables.u_rule_type,
                    "expiryDate=" + ritmGR.variables.expiry_date
                ].join(", ");

            }

            ritmGR.update();
            incGR.update();
        } else {
            gs.error("Parent RITM not found for Incident: " + incidentSysId);
            return;
        }
        // if (!ritmGR.get(incGR.parent)) {
        // 	gs.error("Parent RITM not found for Incident: " + incidentSysId);
        // 	return;
        // }


    },


    sendToAlgosec: function(backendNameKey, value, table_name, rec_sys_id, algosec_change_number) {
        try {
            var result = sn_fd.FlowAPI.getRunner().subflow('global.adani_algosec_send_change_request_details_to_algosec').inForeground().withInputs({
                table_name: table_name,
                record_sys_id: rec_sys_id,
                algosec_change_number: algosec_change_number,
                backend_variable_name: this.getBackendVariable(backendNameKey),
                value: value
            }).run();
            var outputs = result.getOutputs();

            // Get Outputs:
            var message = outputs['message']; // String
            var status = outputs['status']; // Choice
            var count = outputs['count']; // Choice

        } catch (ex) {
            gs.error(ex.getMessage());
        }
    },

    canShowFirewallButton: function(incGR) {

        if (!incGR || !incGR.isValidRecord())
            return false;


        if (!incGR.parent)
            return false;

        var ritm = new GlideRecord('sc_req_item');
        ritm.addQuery('sys_id', incGR.parent);
        ritm.addQuery('cat_item', '8ce6e9c3dbd8d150ec58622fd39619cc');
        ritm.addQuery("variables.u_request_type", "Rule Creation / Change / Port Opening");
        ritm.query();

        if (ritm.next())
            return true;

        return false;
    },

    type: 'Adani_Algosec_Integration'
};