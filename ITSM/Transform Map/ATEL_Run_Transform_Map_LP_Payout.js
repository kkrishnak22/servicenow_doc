(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	try {
		var transformMapSysID = gs.getProperty('x_adga_project_a_0.lpSubmissionTransformSysID');
		//gs.info("transformMapSysID " + transformMapSysID);

		var attachmentDetailsUpdated = new global.ProjectOperationsUtils().updateAttachmentDetails(current.lp_payout_submission_data);

		if (attachmentDetailsUpdated == 'true' || attachmentDetailsUpdated == true) {
			var attachmentGR = new GlideRecord('sys_attachment');
			//gs.info("current.variables.lp_payout_submission_data " + current.lp_payout_submission_data);
			if (attachmentGR.get(current.lp_payout_submission_data)) {
				var fileName = attachmentGR.file_name;
				var variableTableName = attachmentGR.table_name;
				var dataSourceSysID = new global.ProjectOperationsUtils().createDataSoureAndTransformDatalP(fileName, variableTableName, current.sys_id);
				//gs.info("dataSourceSysID " + dataSourceSysID);
				var transformedImportset = new global.ProjectOperationsUtils().loadImportSet(dataSourceSysID, transformMapSysID);
				//gs.info("transformedImportset " + transformedImportset);

				var importSetRowGR = new GlideRecord("x_adga_project_a_0_import_set_table_lp_payout_task");
				importSetRowGR.addEncodedQuery('sys_import_set.sys_id=' + transformedImportset);
					importSetRowGR.query();
					while (importSetRowGR.next()) {
						importSetRowGR.lp_submission_ref = current.sys_id;
						importSetRowGR.update();
				}
				var gr = new GlideRecord('x_adga_project_a_0_lp_payout_submission_data');
				if (gr.get(current.sys_id)) {
					gr.lp_payout_submission_upload_summary = transformedImportset;
					gr.update();
				}			
			} 
		}
	} catch (ex) {
		var message = ex.message;
		//gs.info('Error Import Data from Excel: ' + message);
	}

})(current, previous);


// SI

var ProjectOperationsUtils = Class.create();
ProjectOperationsUtils.prototype = {
    initialize: function() {},

    createDataSoureAndTransformData: function(fileName, variableTableName, rpSysID) {
        var applicatonScope = "Project and Operations";
        var createDataSource = new GlideRecord("sys_data_source");
        createDataSource.name = fileName + " (Uploaded)";
        createDataSource.import_set_table_name = "x_adga_project_a_0_import_set_table_dma_payout_task";
        createDataSource.import_set_table_label = "Import Set Table DMA Payout Tasks";
        createDataSource.file_retrieval_method = "Attachment";
        createDataSource.type = "File";
        createDataSource.format = "Excel"; // For Excel Files
        createDataSource.sys_package.setDisplayValue(applicatonScope);
        createDataSource.sys_scope.setDisplayValue(applicatonScope);
        createDataSource.sheet_name = "1";
        createDataSource.header_row = "1";
        dataSourceSysID = createDataSource.insert();

        var attachment = new GlideSysAttachment();
        attachment.copy(variableTableName, rpSysID, createDataSource.sys_class_name, dataSourceSysID);
       // gs.info(createDataSource.sys_class_name);
        return dataSourceSysID;

    },
	createDataSoureAndTransformDatalP: function(fileName, variableTableName, rpSysID) {
        var applicatonScope = "Project and Operations";
        var createDataSource = new GlideRecord("sys_data_source");
        createDataSource.name = fileName + " (Uploaded)";
        createDataSource.import_set_table_name = "x_adga_project_a_0_import_set_table_lp_payout_task";
        createDataSource.import_set_table_label = "Import Set Table LP Payout Task";
        createDataSource.file_retrieval_method = "Attachment";
        createDataSource.type = "File";
        createDataSource.format = "Excel"; // For Excel Files
        createDataSource.sys_package.setDisplayValue(applicatonScope);
        createDataSource.sys_scope.setDisplayValue(applicatonScope);
        createDataSource.sheet_name = "1";
        createDataSource.header_row = "1";
        dataSourceSysID = createDataSource.insert();

        var attachment = new GlideSysAttachment();
        attachment.copy(variableTableName, rpSysID, createDataSource.sys_class_name, dataSourceSysID);
      // gs.info(createDataSource.sys_class_name);
        return dataSourceSysID;

    },
    loadImportSet: function(dataSourceID, transformMapIDs) {

        var dataSource = new GlideRecord("sys_data_source");
        dataSource.get(dataSourceID);

        var loader = new GlideImportSetLoader();
        var importSetRec = loader.getImportSetGr(dataSource);
        var ranload = loader.loadImportSetTable(importSetRec, dataSource);
        importSetRec.state = "loaded";
        importSetRec.update();

        var transformWorker = new GlideImportSetTransformerWorker(importSetRec.sys_id, transformMapIDs);
        transformWorker.setBackground(true);

        transformWorker.start();
        return importSetRec.sys_id;
    },

    updateAttachmentDetails: function(attSysID) {
        var attachmentGR = new GlideRecord('sys_attachment');
        if (attachmentGR.get(attSysID)) {
            var fileName = attachmentGR.file_name;
            var attachment = new GlideSysAttachment();
            var variableTableName = attachmentGR.table_name;
            variableTableName = variableTableName.replace('ZZ_YY', '');
            attachmentGR.table_name = variableTableName;
           // gs.info("Attachment Before");
            attachmentGR.update();
           // gs.info("Attachment Updated");
            return true;
        } else {
            return false;
        }
    },


    type: 'ProjectOperationsUtils'
};


var ATGL_SSA_Autoform_RotoPlanData = Class.create();
ATGL_SSA_Autoform_RotoPlanData.prototype = {
    initialize: function() {
    },
	createDataSoureAndTransformData: function(fileName, variableTableName, ritmSysID){
		var applicatonScope = "Site Supervision Application";
		var createDataSource = new GlideRecord("sys_data_source");
		createDataSource.name = fileName+" (Uploaded)";
		createDataSource.import_set_table_name = "x_adga_site_supe_0_rota_plan_import_set_table";
		createDataSource.import_set_table_label = "ROTA Plan Import Set Table";
		createDataSource.file_retrieval_method = "Attachment";
		createDataSource.type = "File";
		createDataSource.format = "Excel"; // For Excel Files
		createDataSource.sys_package.setDisplayValue(applicatonScope);
		createDataSource.sys_scope.setDisplayValue(applicatonScope);
		createDataSource.sheet_name = "1";
		createDataSource.header_row = "1";
		dataSourceSysID = createDataSource.insert();

		var attachment = new GlideSysAttachment();
		attachment.copy(variableTableName, ritmSysID, createDataSource.sys_class_name, dataSourceSysID);
		gs.info(createDataSource.sys_class_name);
		return dataSourceSysID;

	},

	scheduleImport: function(dataSourceID, transformMapIDs) {
		
		var schRec = new GlideRecord("sys_trigger");
		schRec.name = "Load Data Source: " + dataSourceID;
		schRec.trigger_type = 0;   // Run Once
		schRec.script = "new global.ATGL_SSA_Autoform_RotoPlanData().loadImportSet('" + dataSourceID + "', '" + transformMapIDs + "')";
		var nextAction = new GlideDateTime();
		nextAction.addSeconds(0);   // 2 seconds should be enough time however this can be changed.
		schRec.next_action = nextAction;
		schRec.insert();
	},

	loadImportSet: function(dataSourceID, transformMapIDs) {
		
		var dataSource = new GlideRecord("sys_data_source");
		dataSource.get(dataSourceID);
		
		var loader = new GlideImportSetLoader();
		var importSetRec = loader.getImportSetGr(dataSource);
		var ranload = loader.loadImportSetTable(importSetRec, dataSource);
		importSetRec.state = "loaded";
		importSetRec.update();

		var transformWorker = new GlideImportSetTransformerWorker(importSetRec.sys_id, transformMapIDs);
		transformWorker.setBackground(true);
		
		transformWorker.start();
		return importSetRec.sys_id;
	},





    type: 'ATGL_SSA_Autoform_RotoPlanData'
};