(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var requestBody = request.body.data;
	var responseObj = {
		success: false,
		message: ''
	};
	gs.log(JSON.stringify(requestBody),"debug_algosec");
	// Basic validations
	if (JSUtil.nil(requestBody.type)) {
		return response.setError(new sn_ws_err.BadRequestError('Missing value for parameter: type'));
	}
	if (JSUtil.nil(requestBody.ritm_sys_id)) {
		return response.setError(new sn_ws_err.BadRequestError('Missing value for parameter: ritm_sys_id'));
	}
	if (JSUtil.nil(requestBody.status)) {
		return response.setError(new sn_ws_err.BadRequestError('Missing value for parameter: status'));
	}

	var type = requestBody.type.toLowerCase();
	var result;
	var scriptIncludeUtil = new global.Adani_Algosec_Integration();

	switch (type) {
		case 'communication_status':
			result = scriptIncludeUtil.handleCommunicationStatus(requestBody);
			break;
		case 'risk_status':
			result = scriptIncludeUtil.handleRiskStatus(requestBody);
			break;
		case 'validation_status':
			result = scriptIncludeUtil.handleValidationStatus(requestBody);
			break;
		case 'change_close':
			result = scriptIncludeUtil.handleChangeClose(requestBody);
			break;
		case 'close_ritm':
			result = scriptIncludeUtil.handleRITMClosure(requestBody);
			break;
	}

	// handle errors if result is not success
	if (!result.success) {
		switch (result.errorCode) {
			case 'NotFoundError':
				return response.setError(new sn_ws_err.NotFoundError(result.message));
			case 'BadRequestError':
				return response.setError(new sn_ws_err.BadRequestError(result.message));
			case 'InternalServerError':
				return response.setError(new sn_ws_err.InternalServerError(result.message));

		}
	}

	// If success
	responseObj.success = true;
	responseObj.status = "Success";
	responseObj.message = result.message;
	response.setBody(responseObj);

})(request, response);
