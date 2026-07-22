function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }

    function callBackFun(response) {
        var answer = response.responseXML.documentElement.getAttribute('answer');
        var parsedResponse = JSON.parse(answer);

        if ((g_form.getValue('u_request_type') == 'Rule Creation / Change / Port Opening') && (g_form.getValue('traffic_type') == 'Internal') && parsedResponse && parsedResponse.allColumnsAreValid) {
            if (parsedResponse.typeOfCommunication == 'public') {
                g_form.clearValue('attach_the_completed_downloaded_template');
                g_form.addErrorMessage('File contain the public IP');
            }else{
				g_form.setReadOnly('traffic_type',true);
			}
        }

        // alert(answer);

        if (parsedResponse && parsedResponse.areHeadersEqual == false) {
            g_form.clearValue('attach_the_completed_downloaded_template');
            g_form.addErrorMessage('Invalid Headers in Excel');
        }

        if (parsedResponse && parsedResponse.allColumnsAreValid === false) {
            g_form.clearValue('attach_the_completed_downloaded_template');

            var errorsArray = parsedResponse.errors;
            var groupedErrors = {};

            errorsArray.forEach(function(err) {
                // Excel row shown to user = actual row in array + 1
                var displayRow = parseInt(err.row) + 1;

                if (!groupedErrors[displayRow]) {
                    groupedErrors[displayRow] = [];
                }

                var message = '• ' + err.message
                groupedErrors[displayRow].push(message);
            });

            var formattedMessage = '<b> Errors found in your uploaded Excel file:</b><br><br>';
            Object.keys(groupedErrors).forEach(function(row) {
                formattedMessage += groupedErrors[row].join('<br>') + '<br><br>';
            });

            g_form.addErrorMessage(formattedMessage);
        }



        if (parsedResponse && parsedResponse.allColumnsAreValid) {
            var typeOfCommunication = parsedResponse.typeOfCommunication;
            g_form.setValue('type_of_communication', typeOfCommunication);
        }
    }
    if (g_form.getValue('u_request_type') == 'Rule Creation / Change / Port Opening') {
        var att = new GlideAjax('global.AdaniAlgosecClientCallable');
        att.addParam('sysparm_name', "handleExcelValidation");
        att.addParam('sysparam_attSysId', newValue);
        att.addParam('sysparam_requestType', g_form.getValue('u_request_type'));
        att.getXML(callBackFun);
    } else if (g_form.getValue('u_request_type') == 'Application/Web Hosting') {
        var file_type = '';
        if (g_form.getValue("specific_ip_to_adani") == '') {
            file_type = g_form.getValue('all_ip_to_adani');
        } else {
            file_type = g_form.getValue("specific_ip_to_adani");
        }

        alert(file_type)
        var att = new GlideAjax('global.AdaniAlgosecClientCallable');
        att.addParam('sysparm_name', "handleBasicExcelValidation");
        att.addParam('file_sys_id', newValue);
        att.addParam('sysparam_requestType', g_form.getValue('u_request_type'));
        att.addParam('file_type', file_type);
        // alert(g_form.getValue('specific_ip_to_adani') || g_form.getValue('all_ip_to_adani'))
        att.getXML(callBackFun);
    }

}