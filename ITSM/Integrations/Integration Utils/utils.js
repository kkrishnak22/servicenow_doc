var ProjectOperationsUtils = Class.create();
ProjectOperationsUtils.prototype = {
	initialize: function () { },
	createTransaction: function (body, header, reftable, transactionType, httpMethod, source, transId) {
		var output = {};
		var transactionGR = new GlideRecord('x_adga_project_a_0_ev_transaction_log');
		transactionGR.initialize();
		transactionGR.request_payload = JSON.stringify(body);
		transactionGR.external_system_name = source;
		// transactionGR.u_transaction_id = transId;
		// transactionGR.u_correlation_id = header.correlationid;
		transactionGR.reference_table = reftable;
		transactionGR.transaction_status = "New";
		transactionGR.api_operation = httpMethod;
		transactionGR.transaction_type = transactionType;
		transactionGR.request_header = JSON.stringify(header);
		// transactionGR.u_nab_ticket_id = NabTicketID;
		var transactionsys_id = transactionGR.insert();
		if (transactionsys_id == null) {
			output.http_status = "400";
			output.status_message = 'Transaction log failed to create';
			gs.error(JSON.stringify(output));
			return output;
		} else {
			output.http_status = "200";
			output.status_message = 'Transaction log created';
			output.transys_id = transactionsys_id;
			return output;
		}

	},


	validate: function (header, action, source, externalnum, method) {
		var output = {};
		var externalGR = new GlideRecord('x_adga_project_a_0_ev_external_system');
		externalGR.addEncodedQuery('api_operationLIKE' + method);
		externalGR.query();
		if (!externalGR.next()) {
			output.http_status = "500";
			output.error_description = method + ' API Method is not configured for this ' + externalGR.external_system_name +
				' External system. Contact SOUL Administrator.';
			output.error = 'Invalid API Operation';
			gs.error(JSON.stringify(output));
			return output;
		} else {
			externalGR = new GlideRecord('x_adga_project_a_0_ev_external_system');
			externalGR.addEncodedQuery('external_system_name=' + source);
			externalGR.query();
			if (externalGR.next()) {
				output.http_status = "200";
				output.status_message = 'Success';
				output.categoryValue = externalGR.category;
				output.subcategoryValue = externalGR.sub_category;
				gs.error(JSON.stringify(output));
				return output;
			} else {
				output.http_status = "500";
				output.error_description = source +
					' External system is not configured in the SOUL platform. Contact SOUL Administrator.';
				output.error = 'Invalid External system name';
				gs.error(JSON.stringify(output));
				return output;
			}
		}
	},


	validateCiProcess: function (erpAssetID, evStationValue) {

		var output = {};
		var ciRecord = new GlideRecord('sn_cmdb_ci_class_charger');
		ciRecord.addQuery('u_cp_id', erpAssetID);
		ciRecord.query();
		if (!ciRecord.next()) {

			output.http_status = "500";
			output.error_description = "System unable to find the Configuration item against the provided CP ID: " + (erpAssetID);
			output.error = 'Invalid CPID';
			gs.error(JSON.stringify(output));
			return output;
		} else {


			output.http_status = "200";
			output.ciSysID = ciRecord.sys_id;
			var stationRecord = ciRecord.u_ev_station.getRefRecord();
			if (stationRecord.isValidRecord()) {
				output.stationSysID = stationRecord.sys_id;
			}
			//output.stationSysID = ciRecord.u_station_name;
			output.status_message = 'Success';
			gs.error(JSON.stringify(output));
			return output;
		}

	},

	checkForExistingINC: function (erpAssetIDValue, actionMethod) {
		var output = {};
		var incirecord = new GlideRecord('x_adga_project_a_0_ev_incident');
		//incirecord.addEncodedQuery('caller=26ad96c987dfd210bb96c8450cbb35e6');
		incirecord.addEncodedQuery('sys_id!=954ea39587d71210ffcaea080cbb355d');
		incirecord.query();
		if (incirecord.next()) {
			if (actionMethod == 'post') {
				incirecord.work_notes = 'Another event against same asset ' + erpAssetIDValue + ' occured.';
				incirecord.update();

				output.error_description = 'Work notes updated in existing active record ' + incirecord.number;
			}
			output.http_status = "200";

			output.inciSysID = incirecord.sys_id;
			output.inciNumber = incirecord.number;
			//output.error_description = 'API got triggered for Existing open record '+incirecord.number;
			output.tableName = 'incident';
			return output;
		} else {
			output.http_status = "500";
			output.error_description = 'No incident exist for ' + erpAssetIDValue;
			output.error = 'invalid_source';
			gs.error(JSON.stringify(output));
			return output;
		}
	},


	validatecategories: function (categoryValue, subcategoryValue) {

		var output = {};
		var categoryRecord = new GlideRecord('sys_choice');
		categoryRecord.addEncodedQuery('element=u_soul_category^name=x_adga_project_a_0_ev_incident^inactive=false^value=' + categoryValue);
		categoryRecord.query();
		if (categoryRecord.next()) {
			var categoryAns = categoryRecord.value;
			output.category = categoryAns;


			var subCategoryRecord = new GlideRecord('sys_choice');
			subCategoryRecord.addEncodedQuery('name=x_adga_project_a_0_ev_incident^element=u_soul_subcategory^dependent_value=' + categoryAns + '^inactive=false^value=' + subcategoryValue);
			subCategoryRecord.query();
			if (subCategoryRecord.next()) {
				var subcategoryAns = subCategoryRecord.value;
				output.subCategory = subcategoryAns;

				output.http_status = "200";
			} else {
				output.http_status = "400";
				output.error_description = 'Invalid Subcategory';
				output.error = 'Invalid Subcategory';
			}
		} else {
			output.http_status = "400";
			output.error_description = 'Invalid Category';
			output.error = 'Invalid Category';
		}
		return output;
	},


	checkForExistingEVINC: function (snTicketID, resolutionNotes) {
		var output = {};
		var evIncidentRecord = new GlideRecord('x_adga_project_a_0_ev_incident');
		evIncidentRecord.addQuery('number', snTicketID);
		evIncidentRecord.query();

		if (evIncidentRecord.next()) {
			if (evIncidentRecord.state != '4' && evIncidentRecord.state != '3' && evIncidentRecord.state != '7') {
				evIncidentRecord.state = '4';
				evIncidentRecord.resolution_notes = resolutionNotes;
				evIncidentRecord.update();
				output.http_status = "200";
				output.message = "Incident found and is not resolved.";
				output.inciNumber = evIncidentRecord.number;
				output.incidentState = evIncidentRecord.state.getDisplayValue();
				output.inciSysID = evIncidentRecord.sys_id;
			} else if (evIncidentRecord.state == '4') {
				output.http_status = "400";
				output.message = "Incident is already resolved.";
			} else if (evIncidentRecord.state == '3') {
				output.http_status = "400";
				output.message = "Incident is already Closed.";
			} else if (evIncidentRecord.state == '7') {
				output.http_status = "400";
				output.message = "Incident is already Cancelled.";
			}
		} else {
			output.http_status = "404";
			output.message = "Incident not found.";
		}

		return output;
	},


	datalookup: function (vendorCode, errorCode) {
		var output = {};
		var dataLookupGR = new GlideRecord('x_adga_project_a_0_ev_data_lookup');
		dataLookupGR.addQuery('classification', 'cpms_integration');
		dataLookupGR.addQuery('vendor_code', vendorCode);
		dataLookupGR.addQuery('error_code', errorCode);
		dataLookupGR.query();

		if (dataLookupGR.next()) {
			output.http_status = "200";
			output.status_message = "Success";
			output.vendor_code = dataLookupGR.vendor_code;
			output.error_code = dataLookupGR.error_code;
			output.category = dataLookupGR.category;
			output.sub_category = dataLookupGR.sub_category;

		} else {
			var externalSysDatalookup = new GlideRecord('x_adga_project_a_0_ev_external_system');
			externalSysDatalookup.addQuery('external_system_name', 'CPMS');
			externalSysDatalookup.query();
			if (externalSysDatalookup.next()) {
				output.http_status = "200";
				output.status_message = "Success";
				output.category = externalSysDatalookup.category;
				output.sub_category = externalSysDatalookup.sub_category;
				output.error_description = "No matching record found for Vendor Code and Error Code. The Category and Subcategory is set to Default ";
			}

			/*  output.http_status = "404";
			  output.error_description = "No matching record found for Vendor Code: " + vendorCode + " and Error Code: " + errorCode + " Please contact the system adminstrator";
			  output.error = "Record Not Found"; */
		}


		return output;
	},
	createLeadTransaction: function (body, header, reftable, transactionType, httpMethod, leadNumber, source, transId) {
		var output = {};
		var transactionGR = new GlideRecord('x_adga_project_a_0_ev_transaction_log');
		transactionGR.initialize();
		transactionGR.request_payload = JSON.stringify(body);
		transactionGR.external_system_name = source;
		transactionGR.reference_table = reftable;
		transactionGR.transaction_status = "New";
		transactionGR.api_operation = httpMethod;
		transactionGR.transaction_type = transactionType;
		transactionGR.request_header = JSON.stringify(header);

		var transactionsys_id = transactionGR.insert();
		if (transactionsys_id == null) {
			output.http_status = "400";
			output.status_message = 'Transaction log failed to create';
			gs.error(JSON.stringify(output));
			return output;
		} else {
			output.http_status = "200";
			output.status_message = 'Transaction log created';
			output.transys_id = transactionsys_id;
			return output;
		}

	},

	deleteAttachment: function (attachment_sys_id) {
		var att_gr = new GlideRecord('sys_attachment');
		att_gr.addQuery('sys_id', attachment_sys_id);
		att_gr.query();
		if (att_gr.next()) {
			att_gr.deleteRecord();
		}
	},

	/** BillPro Integration Functions Start */

	// Check if station is present - returns tru/false
	stationPresent: function (data) {
		var gr = new GlideRecord('sn_cmdb_ci_class_ev_station');
		gr.addQuery('u_project_id', data.StationID);
		gr.query();
		return gr.hasNext();
	},
	// Insert or update record into the site payment table based on transaction id
	addRecordToSitePaymentTable: function (data) {
		var gr = new GlideRecord('x_adga_project_a_0_site_payment_details');
		gr.addQuery('transaction_id', data.TransactionID);
		gr.addQuery('station_id', data.StationID);
		gr.query();

		var action;
		if (gr.next()) {
			action = 'update';
			gs.info("Updating record for Transaction ID: " + data.TransactionID);
		} else {
			gr.initialize();
			action = 'insert';
			gs.info("Inserting new record for Transaction ID: " + data.TransactionID);
		}

		gr.station_id = data.StationID;
		gr.setValue('station', data.stationSysId);
		gr.consumer_no = data.ConsumerNo;
		gr.consumer_id = data.ConsumerID;
		gr.bill_no = data.BillNo;
		gr.bill_month = data.BillMonth;
		gr.bill_date_on_bill = data.BillDateOnBill;
		gr.bill_due_date = data.BillDueDate;
		gr.bill_pro_id = data.BillProRefID;
		gr.payable_amount = data.PayableAmount;
		gr.paid_amount = data.PaidAmount;
		gr.paid_date = data.PaidDate;
		gr.paid_time = data.PaidTime;
		gr.transaction_id = data.TransactionID;
		gr.units_consumed = data.UnitsConsumed;
		gr.payment_tyoe = data.PaymentType;
		gr.assignment_group = gs.getProperty('x_adga_project_a_0.o&m_group_id');
		if (action === 'insert') {
			gr.state = '1'; // New
		}

		// Process attachments if any

		/*
		if (data.attachments && data.attachments.length > 0) {
			var attachment = new GlideSysAttachment();
			for (var i = 0; i < data.attachments.length; i++) {
				var file = data.attachments[i];
				try {
					// Make sure data exists
					if (file.data) {
						var attSysId = attachment.writeBase64(gr, file.file_name, file.content_type, file.data);
						gs.info("Attachment added: " + file.file_name + ", sys_id: " + attSysId);

					}
				} catch (e) {
					gs.error("Failed to attach file: " + file.file_name + ". Error: " + e.message);
				}
			}

		}
		*/
		if (data.attachments && data.attachments.length > 0) {
			var attachment = new GlideSysAttachment();

			for (var i = 0; i < data.attachments.length; i++) {
				var file = data.attachments[i];
				try {
					if (file.data) {
						var attSysId = attachment.writeBase64(gr, file.file_name, file.content_type, file.data);
						gs.info("Attachment added: " + file.file_name + ", sys_id: " + attSysId);

						// Map based on index
						if (i === 0) {
							gr.bill_copy_pdf = attSysId;
						} else if (i === 1) {
							gr.payment_copy_pdf = attSysId;
						}
					}
				} catch (e) {
					gs.error("Failed to attach file at index " + i + ". Error: " + e.message);
				}
			}
		}

		var sysId = (action === 'insert') ? gr.insert() : gr.update();
		gs.info("Record " + action + "d with sys_id: " + sysId);

		return {
			recID: sysId,
			action: action
		};
	},

	isActionUpdateRecord: function (data) {
		var isUpdate = false;
		var grTemp = new GlideRecord('x_adga_project_a_0_site_payment_details');
		grTemp.addQuery('station_id', data.StationID);
		grTemp.addQuery('transaction_id', data.TransactionID);
		grTemp.query();
		if (grTemp.next()) {
			isUpdate = true;
		}
		return isUpdate;
	},
	/** BillPro Integration Functions End */

	/******* BillPro Station Creation Functions Start ***********/
	// Triggers BillPro API to create a new station at their end
	triggerBillProStationApi: function (stationRecID) {
		// gs.info("Line 379 " + stationRecID);

		// Default values for station rec that will be created on billpro end (need to remove later)
		var data = {
			station_id: "", // Project ID
			consumer_name: "ADANI TOTAL ENERGIES E MOBILITY LTD.", // Static always
			consumer_id: "", // DISCOM consumer number
			station_name: "", // Name
			board: "", // Discom name
			req_id: stationRecID, // Unique ID
			circle: "" // State
		};

		var stationGr = new GlideRecord('sn_cmdb_ci_class_ev_station');
		if (stationGr.get(data.req_id)) {
			data.station_id = stationGr.u_project_id.toString();
			data.consumer_id = stationGr.u_discom_consumer_number.toString();
			data.station_name = stationGr.name.toString();
			data.board = stationGr.u_discom_vendor_code.name.toString().substring(0, 20);

			data.circle = stationGr.location.u_area.state.getDisplayValue().toString();

			// gs.info("DATA OBJ = " + JSON.stringify(data));

			var billProApiResBody = this.callBillProRestAPI(data);
			return billProApiResBody;
		} else {
			var err = "No station record found for sys_id on : sn_cmdb_ci_class_ev_station " + data.req_id;
			gs.error(err);
			return err;
		}
	},

	// Calls billpro api and returns responseBody
	callBillProRestAPI: function (data) {
		try {
			var currentDateObj = new GlideDate();

			var inputString = "adani" + currentDateObj.getByFormat('yyyyMMdd');
			var digest = new GlideDigest();
			var sha_key = digest.getSHA1Hex(inputString).toLowerCase();
			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATEL_BillPro_Integration', 'New Station Request');
			// HTTP Header - Req 

			r.setStringParameterNoEscape('sha_key', sha_key);
			// Content Variables - Req Body
			r.setStringParameterNoEscape('station_id', data.station_id);
			r.setStringParameterNoEscape('consumer_name', data.consumer_name);
			r.setStringParameterNoEscape('consumer_id', data.consumer_id);
			r.setStringParameterNoEscape('station_name', data.station_name);
			r.setStringParameterNoEscape('board', data.board);
			r.setStringParameterNoEscape('req_id', data.req_id);
			r.setStringParameterNoEscape('circle', data.circle);

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			// gs.info("responseBody: " + responseBody);
			// gs.info("httpStatus: " + httpStatus);

			return responseBody;

		} catch (ex) {
			var message = "BillPro REST API Call Failed: " + ex.message;
			gs.error(message);
			return message;
		}
	},

	/******* BillPro Station Creation Functions End ***********/
	//Create or update CPMS Consumer data

	addCPMSConsumerData: function (data) {
		var consumerGr = new GlideRecord('x_adga_project_a_0_consumer_customer_master');
		consumerGr.addQuery('customer_id', data.customerID);
		// consumerGr.addQuery('mobile_no', data.mobileNumber);
		consumerGr.query();

		var action;
		if (consumerGr.next()) {
			action = 'update';

		} else {
			consumerGr.initialize();
			consumerGr.customer_id = data.customerID;
			consumerGr.mobile_no = data.mobileNumber;
			action = 'insert';

		}

		consumerGr.date_of_registration = data.dateOfRegistration;
		consumerGr.username = data.userName;
		consumerGr.user_status = data.userStatus;
		consumerGr.country_code = data.countryCode;
		consumerGr.mobile_number_verification_status = data.mobileVerificationStatus;
		consumerGr.email = data.email;
		consumerGr.user_category = data.userCategory;
		consumerGr.account_created_on = data.createdOn;

		var sysId = (action === 'update') ? consumerGr.update() : consumerGr.insert();

		return {
			recID: sysId,
			action: action
		};
	},
	signDocument: function (stampedAgreement, leadNumber, certificateNo) {
		var output = {};
		var leadgr = new GlideRecord('x_adga_project_a_0_lead_generation');
		if (leadgr.get('number', leadNumber)) {
			if (stampedAgreement) {


				// gs.error(JSON.stringify(output));


				var eSignJsonProp = gs.getProperty('x_adga_project_a_0.atel.signdesk.e_signing.jsonfile');
				var signingJson = JSON.parse(eSignJsonProp);

				signingJson.signers_info = [];

				//default signer

				var deftSigner = new GlideRecord('x_adga_project_a_0_signer_info');
				deftSigner.addQuery('default_signer', true);
				deftSigner.query();

				//all signers to the lead
				var signerInfo = new GlideRecord('x_adga_project_a_0_signer_info');
				signerInfo.addQuery('lead', leadgr.sys_id);
				signerInfo.orderBy('number');
				signerInfo.query();

				var signer;
				// Coordinates to be used for signer positions
				var coords = [
					[{
						x1: 30,
						x2: 140,
						y1: 29,
						y2: 69
					}],
					[{
						x1: 170,
						x2: 280,
						y1: 29,
						y2: 69
					}],
					[{
						x1: 310,
						x2: 420,
						y1: 29,
						y2: 69
					}],
					[{
						x1: 450,
						x2: 560,
						y1: 29,
						y2: 69
					}],
					[{
						x1: 30,
						x2: 140,
						y1: 94,
						y2: 134
					}],
					[{
						x1: 170,
						x2: 280,
						y1: 94,
						y2: 134
					}],
					[{
						x1: 310,
						x2: 420,
						y1: 94,
						y2: 134
					}],
					[{
						x1: 450,
						x2: 560,
						y1: 94,
						y2: 134
					}]
				];

				/* Commented code can be used if the requirement changes to different signing sequence based on stamp duty payer */

				// if (leadgr.stamp_duty_paid_by.getDisplayValue() == 'First Party') {

				//     if (deftSigner.next()) {
				//         //  gs.info('line 141');
				//         signer = {
				//             document_to_be_signed: responseJson.reference_id,
				//             signer_email: deftSigner.signer_email.toString(),
				//             signer_mobile: deftSigner.signer_mobile.toString(),
				//             signer_name: deftSigner.signer_name.toString(),
				//             signature_type: deftSigner.signing_mode.getDisplayValue(),
				//             signer_ref_id: deftSigner.number.toString(),
				//             trigger_esign_request: true,
				//             access_type: "otp",
				//             page_number: "all",
				//             sequence: "1",
				//             signer_position: {
				//                 appearance: coords[0]
				//             }


				//         };


				//         signingJson.signers_info.push(signer);
				//     }

				//     // Assign values from the lead record to the JSON object
				//     var seq = 1;
				//     while (signerInfo.next()) {

				//         seq++;

				//         signer = {
				//             document_to_be_signed: responseJson.reference_id,
				//             signer_email: signerInfo.signer_email.toString(),
				//             signer_mobile: signerInfo.signer_mobile.toString(),
				//             signer_name: signerInfo.signer_name.toString(),
				//             signature_type: signerInfo.signing_mode.getDisplayValue(),
				//             signer_ref_id: signerInfo.number.toString(),
				//             trigger_esign_request: true,
				//             page_number: "all",
				//             sequence: seq,
				//             signer_position: {
				//                 appearance: coords[seq - 1] || coords[0] // Fallback to first coord if out of range
				//             }

				//         };


				//         signingJson.signers_info.push(signer);
				//     }
				//  } else if (leadgr.stamp_duty_paid_by.getDisplayValue() == 'Second Party') {

				// Assign values from the lead record to the JSON object

				seq = 0;
				while (signerInfo.next()) {

					seq++;

					signer = {
						document_to_be_signed: leadNumber,
						signer_email: signerInfo.signer_email.toString(),
						signer_mobile: signerInfo.signer_mobile.toString(),
						signer_name: signerInfo.signer_name.toString(),
						signature_type: signerInfo.signing_mode.getDisplayValue(),
						signer_ref_id: signerInfo.number.toString(),
						trigger_esign_request: true,
						page_number: "all",
						sequence: seq,
						signer_position: {
							appearance: coords[seq - 1] || coords[0] // Fallback to first coord if out of range
						}

					};


					signingJson.signers_info.push(signer);
				}

				if (deftSigner.next()) {
					seq++;
					//   gs.info('line 141');
					signer = {
						document_to_be_signed: leadNumber,
						signer_email: deftSigner.signer_email.toString(),
						signer_mobile: deftSigner.signer_mobile.toString(),
						signer_name: deftSigner.signer_name.toString(),
						signature_type: deftSigner.signing_mode.getDisplayValue(),
						signer_ref_id: deftSigner.number.toString(),
						trigger_esign_request: true,
						access_type: "otp",
						page_number: "all",
						sequence: seq,
						signer_position: {
							appearance: coords[seq - 1] || coords[0] // Fallback to first coord if out of range
						}

					};


					signingJson.signers_info.push(signer);
				}
				//  }
				// gs.info("responseJson.content: " + responseJson.content);
				signingJson.reference_id = leadNumber;

				signingJson.documents = [{
					signature_sequence: leadgr.signature_sequence.getValue(),
					reference_doc_id: leadNumber,
					content_type: "PDF",
					content: stampedAgreement
				}];
				signingJson.docket_title = "Agreement_" + leadgr.location_name;


				// Send Signing API Request
				try {
					// gs.info('Signing JSON Now: ' + JSON.stringify(signingJson));
					var signingHeader = gs.getProperty('x_adga_project_a_0.signing_api.key');
					var signMsg = new sn_ws.RESTMessageV2('x_adga_project_a_0.SignDeskSigningAPI', 'Default POST');

					signMsg.setRequestHeader('x-parse-rest-api-key', signingHeader);
					signMsg.setRequestBody(JSON.stringify(signingJson));

					var signResponse = signMsg.execute();
					var signResponseBody = signResponse.getBody();
					var signHttpStatus = signResponse.getStatusCode();

					// gs.info('signResponseBody: ' + signResponseBody + ' http Status: ' + signHttpStatus); // Cleaner log

					if (signHttpStatus == 200) {
						//  gs.info('signResponseBody: Into 200');


						// PARSE THE JSON STRING INTO AN OBJECT

						var parsedSignResponse = JSON.parse(signResponseBody);

						leadgr.signed_document_id = parsedSignResponse.document_id.toString();
						leadgr.work_notes = 'Signing API Response: \n' + signResponseBody;
						leadgr.signdesk_status = 'Stamping Completed & Signing Initiated';
						if (certificateNo) {
							leadgr.certificate_no = certificateNo;
							leadgr.certificate_issue_on = new GlideDate();
						}
						leadgr.update();

						output.http_status = '200';
						output.status_message = 'Success';
						if (output.http_status == '200') {
							gs.info('status is 200');
						}
						return output;

					} else {

						leadgr.work_notes = 'Signing API Response: \n' + signResponseBody;
						leadgr.signdesk_status = 'Stamping Completed & Signing Failed';
						if (certificateNo) {
							leadgr.certificate_no = certificateNo;
							leadgr.certificate_issue_on = new GlideDate();
						}
						leadgr.update();

						output.http_status = "500";
						output.status_message = 'Error';
						output.error = 'Unable to send the document for signing';
						gs.error(JSON.stringify(output));
						return output;
					}

				} catch (ex) {
					gs.error('Error in Signing API: ' + ex.message);



					output.http_status = "500";
					output.status_message = 'Error';
					output.error = 'Failed to process signing response: ' + ex.message;
					return output;
				}

			} else {
				output.http_status = "500";
				output.status_message = 'Error';
				output.error = 'Invalid content';

				gs.error(JSON.stringify(output));

				return output;
			}

		} else {
			output.http_status = "500";
			output.status_message = 'Error';
			output.error = 'Invalid Lead Number';

			gs.error(JSON.stringify(output));

			return output;
		}


	},



	triggerSapAPI: function (projectSysID) {

		var prArray = this.buildPrArrayForProject(projectSysID);
		var payload = {
			"POForPR": prArray
		};
		try {
			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'PO Details');
			// r.setStringParameterNoEscape('PRArray', prArray);
			r.setRequestBody(JSON.stringify(payload));

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				return {
					status: true,
					httpStatus: httpStatus,
					data: responseBody,
					reqPayload: payload
				};
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody,
					reqPayload: payload
				};
			}
		} catch (ex) {
			// Handle exceptions
			var message = ex.message;
			return {
				status: false,
				error: message,
				httpStatus: null,
				reqPayload: payload
			};
		}
	},

	buildPrArrayForProject: function (projectSysID) {
		var out = [];
		if (!projectSysID) return out;

		var prGr = new GlideRecord('x_adga_project_a_0_purchase_requisition');
		prGr.addQuery('project_number', projectSysID);
		prGr.query();

		while (prGr.next()) {
			try {
				var prSysId = prGr.getValue('sys_id');
				var prNumber = prGr.getValue('purchase_requisition') || '';

				var lineItems = this.getPrLineItemsArray(prSysId); // returns array

				out.push({
					PRID: prNumber,
					PRLineItem: lineItems,
				});
			} catch (e) {
				gs.error('Error processing PR record: ' + e.message);
			}
		}
		return out;
	},

	getPrLineItemsArray: function (prSysID) {
		var items = [];
		if (!prSysID) return items;

		var liGr = new GlideRecord('x_adga_project_a_0_pr_line_item');
		liGr.addQuery('parent', prSysID);
		liGr.orderBy('line_item'); //
		liGr.query();

		while (liGr.next()) {
			var li = liGr.getValue('line_item');
			if (li) items.push(li);
		}

		return items;
	},

	getWbsElementFromProject: function (projectSysID) {
		if (!projectSysID) return '';
		var wbsGr = new GlideRecord('x_adga_project_a_0_wbs_master_data');
		wbsGr.addEncodedQuery('u_initiation_task_number.parent=' + projectSysID);
		wbsGr.query();
		if (wbsGr.next()) return {
			wbsElement: wbsGr.getValue('u_wbs_element'),
			plant: wbsGr.getValue('u_plant')
		};
		return '';
	},

	triggerPRSapAPI: function (projectSysID) {

		var wbsObject = this.getWbsElementFromProject(projectSysID);
		var wbsElement = wbsObject.wbsElement;
		var plant = wbsObject.plant;
		try {
			if (!wbsElement) {
				return {
					status: false,
					error: 'Invalid wbs element',
					httpStatus: null
				};
			}

			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'PR Details');
			r.setStringParameterNoEscape('wbsElement', wbsElement); // Mandatory
			if (plant) {
				r.setStringParameterNoEscape('Plant', plant); // Non mandatory
			}

			// Execute the REST call
			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				try {
					var parsedResponse = JSON.parse(responseBody);
					return {
						status: true,
						httpStatus: httpStatus,
						data: parsedResponse
					};
				} catch (parseEx) {

					return {
						status: true,
						httpStatus: httpStatus,
						data: responseBody
					};
				}
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody
				};
			}
		} catch (ex) {
			// Handle exceptions
			var message = ex.message;
			return {
				status: false,
				error: message,
				httpStatus: null
			};
		}
	}

	,


	triggerWBSSapAPI: function (projectNumber) {
		try {
			if (!projectNumber) {
				return {
					status: false,
					error: 'Invalid project number',
					httpStatus: null
				};
			}

			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'WBS Details');
			r.setStringParameterNoEscape('uniqueCode', projectNumber);

			// Execute the REST call
			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				try {
					var parsedResponse = JSON.parse(responseBody);
					return {
						status: true,
						httpStatus: httpStatus,
						data: parsedResponse
					};
				} catch (parseEx) {

					return {
						status: true,
						httpStatus: httpStatus,
						data: responseBody
					};
				}
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody
				};
			}
		} catch (ex) {
			// Handle exceptions
			var message = ex.message;
			return {
				status: false,
				error: message,
				httpStatus: null
			};
		}
	},



	triggerASNSapAPI: function (swSysID) {

		var poArray = this.buildPoArrayForSiteworks(swSysID);
		var payload = {
			"ASNDelivery_Request": poArray
		};

		try {
			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'ASN');
			r.setRequestBody(JSON.stringify(payload));

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				return {
					status: true,
					httpStatus: httpStatus,
					data: responseBody,
					requestPayload: payload // ADD THIS
				};
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody,
					requestPayload: payload // ADD THIS
				};
			}

		} catch (ex) {
			return {
				status: false,
				error: ex.message,
				httpStatus: null,
				requestPayload: payload // ADD THIS
			};
		}
	},

	buildPoArrayForSiteworks: function (siteWorksRecSysID) {
		var poSet = {}; // unique sys_id collector
		var gr = new GlideRecord('x_adga_project_a_0_charger_specification');

		gr.addQuery('sw_reference', siteWorksRecSysID);
		gr.query();

		while (gr.next()) {

			var raw = '';
			if (gr.classification == 'charger specification') {
				raw = gr.getValue('charger_po_number');
			} else if (gr.classification == 'panel specification') {
				raw = gr.getValue('panel_po_number');
			}

			if (raw) {
				var parts = raw.split(',');
				for (var i = 0; i < parts.length; i++) {
					var id = parts[i].trim();
					if (id) poSet[id] = true; // unique sys_id
				}
			}
		}

		// convert to array of unique sys_ids
		var uniqueSysIds = Object.keys(poSet);

		// pass ONLY unique sys_ids
		var poArray = this.getSAPPONumberAndVendorForPO(uniqueSysIds.join(','));
		return poArray;
	},


	getSAPPONumberAndVendorForPO: function (poSysIds) {
		var poArray = [];
		var gr = new GlideRecord('x_adga_project_a_0_purchase_order_details');
		// sys_idINf1fcff3397d1f6901da1bb77f053af2e,71fcfb3397d1f6901da1bb77f053afdc
		gr.addQuery('sys_id', 'IN', poSysIds);
		gr.query();
		while (gr.next()) {
			var poNo = gr.getValue('po_no');
			var vendor = gr.getValue('vendor');
			poArray.push({
				PONumber: poNo,
				Vendor: vendor || ""
			});
		}
		return poArray;
	},


	// {
	// 	"GRNCreationRequest": [
	// 		{
	// 			"ASNInboundDelivery": "ASNNo1",
	// 			"ASNItems": ["10", "20", "30"
	// 			]
	// 		}
	// 	]
	// }

	triggerGRNSapAPI: function (projectSysID) {

		var asnArray = this.buildASNArray(projectSysID);
		var payload = {
			"GRNCreationRequest": asnArray
		};

		try {
			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'GRN');
			r.setRequestBody(JSON.stringify(payload));

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				return {
					status: true,
					httpStatus: httpStatus,
					data: responseBody,
					requestPayload: payload // ADD THIS
				};
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody,
					requestPayload: payload // ADD THIS
				};
			}

		} catch (ex) {
			return {
				status: false,
				error: ex.message,
				httpStatus: null,
				requestPayload: payload // ADD THIS
			};
		}
	},

	// buildASNArray: function (project) {
	// 	var asnHeaderGr = new GlideRecord('x_adga_project_a_0_asn_header');
	// 	asnHeaderGr.addQuery('project', project);
	// 	asnHeaderGr.query();

	// 	var asnArray = [];
	// 	while (asnHeaderGr.next()) {
	// 		//gs.info(asnHeaderGr.delivery);
	// 		asnArray.push(asnHeaderGr.delivery.getValue());
	// 	}
	// 	return asnArray ;

	// },


	buildASNArray: function (project) {

		var asnItemGr = new GlideRecord('x_adga_project_a_0_asn_items');
		asnItemGr.addQuery('project', project);
		asnItemGr.query();

		var grouped = {}; // parent → { delivery: '', items: [] }

		while (asnItemGr.next()) {

			var parent = asnItemGr.parent.getValue(); // ASN header sys_id
			var delivery = asnItemGr.parent.delivery.getValue(); // Delivery from items table
			var item = asnItemGr.item.getValue(); // Line item number

			// init group
			if (!grouped[parent]) {
				grouped[parent] = {
					ASNInboundDelivery: delivery,
					ASNItems: []
				};
			}

			// push item
			grouped[parent].ASNItems.push(item);
		}

		// convert grouped object → array format
		var asnArray = [];
		for (var key in grouped) {
			asnArray.push(grouped[key]);
		}

		return asnArray;
	},

	// 	{
	//     "GRNnumber":[
	//         "5002764413",
	//         "5002764414"
	//     ] 
	// }
	triggerQASapAPI: function (projectSysID) {

		var qaArray = this.buildQAArray(projectSysID);
		var payload = {
			"GRNnumber": qaArray
		};

		try {
			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'QA');
			r.setRequestBody(JSON.stringify(payload));

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				return {
					status: true,
					httpStatus: httpStatus,
					data: responseBody,
					requestPayload: payload
				};
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody,
					requestPayload: payload
				};
			}

		} catch (ex) {
			return {
				status: false,
				error: ex.message,
				httpStatus: null,
				requestPayload: payload // ADD THIS
			};
		}
	},
	buildQAArray: function (project) {
		var grnHeader = new GlideRecord('x_adga_project_a_0_grn_header');
		grnHeader.addQuery('project', project);
		grnHeader.query();
		var qaArray = [];
		while (grnHeader.next()) {
			qaArray.push(grnHeader.grn_mat_doc.getValue());
		}
		return qaArray;

	},

	// {
	//     "Reservation_Request": [
	//         {
	//             "GRNMatdoc": "5002764344",
	//             "Year": "2025"
	//         },
	//         {
	//             "GRNMatdoc": "5002764334",
	//             "Year": "2025"
	//         }
	//     ]
	// }
	triggerReservationSapAPI: function (projectSysID) {

		var reservationArray = this.buildReservationArray(projectSysID);
		var payload = {
			"Reservation_Request": reservationArray
		};

		try {
			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'Reservation');
			r.setRequestBody(JSON.stringify(payload));

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				return {
					status: true,
					httpStatus: httpStatus,
					data: responseBody,
					requestPayload: payload
				};
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody,
					requestPayload: payload
				};
			}

		} catch (ex) {
			return {
				status: false,
				error: ex.message,
				httpStatus: null,
				requestPayload: payload // ADD THIS
			};
		}
	},
	buildReservationArray: function (project) {
		var grnHeader = new GlideRecord('x_adga_project_a_0_grn_header');
		grnHeader.addQuery('project', project);
		grnHeader.query();
		var reservationArray = [];

		while (grnHeader.next()) {
			reservationArray.push({
				"GRNMatdoc": grnHeader.grn_mat_doc.getValue(),
				"Year": grnHeader.year.getValue()
			});
		}

		return reservationArray;

	},

	triggerChecklistCancellationSapAPI: function (checklistNumber) {

		try {
			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'ChecklistCancellation');
			r.setStringParameterNoEscape('checkListNumber', checklistNumber);

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				return {
					status: true,
					httpStatus: httpStatus,
					data: responseBody,
					requestPayload: {
						'checkListNumber': checklistNumber
					}
				};
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody,
					requestPayload: {
						'checkListNumber': checklistNumber
					} // ADD THIS
				};
			}

		} catch (ex) {
			return {
				status: false,
				error: ex.message,
				httpStatus: null,
				requestPayload: {
					'checkListNumber': checklistNumber
				} // ADD THIS
			};
		}
	},

	// showCompleteOnLPPayoutTask: function (sys_id) {
	// 	var expTaskGr = new GlideRecord('x_adga_project_a_0_expense_booking');
	// 	expTaskGr.addEncodedQuery('payment_document_numberISNOTEMPTY^payment_dateISNOTEMPTY^payout_task=' + sys_id);
	// 	expTaskGr.query();
	// 	if (expTaskGr.next()) {
	// 		return true;
	// 	} else {
	// 		return false;
	// 	}
	// },
	showCompleteOnLPPayoutTask: function (sys_id) {

		var expTaskGr = new GlideRecord('x_adga_project_a_0_expense_booking');
		expTaskGr.addQuery('payout_task', sys_id);
		expTaskGr.query();

		// If there are no records at all → do NOT allow completion
		if (!expTaskGr.hasNext()) {
			return false;
		}

		while (expTaskGr.next()) {

			var paymentDocNo = expTaskGr.getValue('payment_document_number');
			var paymentDate = expTaskGr.getValue('payment_date');

			// BOTH fields must be present for every record
			if (!paymentDocNo || !paymentDate) {
				return false; // fail fast
			}
		}

		// All records passed validation
		return true;
	},


	showCompleteOnSiteDiscomTask: function (sys_id) {
		var expTaskGr = new GlideRecord('x_adga_project_a_0_expense_booking');
		expTaskGr.addEncodedQuery('payment_document_numberISNOTEMPTY^payment_dateISNOTEMPTY^dma_payout_task=' + sys_id);
		expTaskGr.query();
		var expenseDataReceived = false;
		if (expTaskGr.next()) {
			expenseDataReceived = true;
		}


		var vendorTaskGr = new GlideRecord('x_adga_project_a_0_vendor_booking');
		vendorTaskGr.addEncodedQuery('payment_document_numberISNOTEMPTY^payment_dateISNOTEMPTY^parent=' + sys_id);
		vendorTaskGr.query();
		var vendorDataReceived = false;
		if (vendorTaskGr.next()) {
			vendorDataReceived = true;
		}

		if (expenseDataReceived && vendorDataReceived) {
			return true;

		} else {
			return false;
		}

	},



	triggerVendorSapAPI: function (payload) {

		try {
			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'VendorBooking');
			r.setRequestHeader("Content-Type", "application/json");
			r.setRequestBody(JSON.stringify(payload));

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				return {
					status: true,
					httpStatus: httpStatus,
					responseBody: responseBody,
					requestPayload: payload
				};
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody,
					requestPayload: payload
				};
			}

		} catch (ex) {
			return {
				status: false,
				error: ex.message,
				httpStatus: null,
				requestPayload: payload // ADD THIS
			};
		}
	},
	triggerExpenseSapAPI: function (payload) {

		try {
			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'ExpenseBooking');
			r.setRequestHeader("Content-Type", "application/json");
			r.setRequestBody(JSON.stringify(payload));

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				return {
					status: true,
					httpStatus: httpStatus,
					responseBody: responseBody,
					requestPayload: payload
				};
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody,
					requestPayload: payload
				};
			}

		} catch (ex) {
			return {
				status: false,
				error: ex.message,
				httpStatus: null,
				requestPayload: payload // ADD THIS
			};
		}
	},
	triggerDPRChecklistSapAPI: function (payload) {

		try {

			var r = new sn_ws.RESTMessageV2('x_adga_project_a_0.ATGL SAP Integration', 'DPRChecklist');

			r.setRequestHeader("Content-Type", "application/json");
			r.setRequestBody(JSON.stringify(payload));

			var response = r.execute();
			var responseBody = response.getBody();
			var httpStatus = response.getStatusCode();

			if (httpStatus == 200) {
				return {
					status: true,
					httpStatus: httpStatus,
					responseBody: responseBody,
					requestPayload: payload
				};
			} else {
				return {
					status: false,
					httpStatus: httpStatus,
					error: 'SAP API returned status: ' + httpStatus,
					responseBody: responseBody,
					requestPayload: payload
				};
			}

		} catch (ex) {
			return {
				status: false,
				error: ex.message,
				httpStatus: null,
				requestPayload: payload // ADD THIS
			};
		}
	},
	
	showConfirmPaymentDetails: function (swSysId) {
    var swGr = new GlideRecord('x_adga_project_a_0_siteworks');
    if (!swGr.get(swSysId)) {
        return false;
    }

    
    var baseCondition =
        swGr.coordinator == gs.getUserID() &&
        swGr.sub_state == 'Awaiting Demand note payment' &&
        swGr.state == '3' && // inprogress
        swGr.u_soul_category == '1' && // Site works
        swGr.u_soul_subcategory == '5' && // LEC
        !!swGr.dpr_number; // dpr present

    if (!baseCondition) {
        return false;
    }

    
    var dprGr = new GlideRecord('x_adga_project_a_0_dpr_lec');
    dprGr.addQuery('parent', swSysId);
    dprGr.query();

    // At least one DPR record must exist
    if (!dprGr.hasNext()) {
        return false;
    }

    while (dprGr.next()) {

        var mandatoryFields = [
            'dpr_number',
            'checklist_number'
        ];

        for (var i = 0; i < mandatoryFields.length; i++) {
            if (!dprGr.getValue(mandatoryFields[i])) {
                return false;
            }
        }
    }

    return true;
},


	type: 'ProjectOperationsUtils'
};