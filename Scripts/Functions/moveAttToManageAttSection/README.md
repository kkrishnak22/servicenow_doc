(function executeRule(current, previous) {

	/* ── Validate comment authorship ── */
	var isValid = false;
	var latestComment = current.comments.getJournalEntry(1);

	if (latestComment != undefined) {
		var commentStr = latestComment + '';
		var userName = gs.getUserDisplayName();
		var index = commentStr.indexOf(userName);

		if (index > -1 && index <= 22) {
			isValid = true;
		}
	}

	/* ── Enforce comment before doing anything else ── */
	if (!isValid) {
		gs.addErrorMessage('Comments are mandatory');
		current.state = 'requested';
		current.setAbortAction(true);
		return; // exit early – no point continuing
	}

	/* On rejection while awaiting proposal approval */
	//if (current.document_id.sub_stage == 'awaiting_proposal_approval') {

	// 	var salesId = current.getValue('document_id');
	// 	if (!salesId) return;

	// 	var salesGR = new GlideRecord('x_bgstm_prism_sales');
	// 	if (!salesGR.get(salesId)) return;

	// 	var attachmentSysId = salesGR.getValue('proposal_attachement');
	// 	if (!attachmentSysId) return;

		/* 
		 *  When the file was uploaded the table_name was prefixed with ZZ_YY
		 *  (e.g. "ZZ_YYx_bgstm_prism_sales") which hides it from Manage Attachments.
		 *  Switching it back to the real table name makes it visible again.
		 */
	/*	var attGR = new GlideRecord('sys_attachment');
		attGR.addQuery('sys_id', attachmentSysId);
		attGR.setLimit(1);
		attGR.query();

	if (attGR.next()) {
			attGR.setValue('table_name', 'x_bgstm_prism_sales');
			attGR.update();
		}*/

		/* ── Clear the proposal_attachment pointer on the sales record ── */
		// if (current.state == 'rejected') {
		// 	salesGR.setValue('proposal_attachement', '');
		// }
		// salesGR.update();
	// }

})(current, previous);


var PrismGlobalUtils = Class.create();
PrismGlobalUtils.prototype = {
	initialize: function () {
	},

	/**
	 * Reveals a hidden attachment by resetting its table_name to the
	 * correct value, making it visible in Manage Attachments.
	 *
	 * @param {String} attachmentSysId - sys_id of the sys_attachment record
	 * @param {String} targetTableName - the real table_name it should belong to
	 * @returns {Object} { success: Boolean, message: String }
	 */
	revealAttachment: function (attachmentSysId, targetTableName) {

		if (!attachmentSysId || !targetTableName) {
			return { success: false, message: 'Missing attachmentSysId or targetTableName' };
		}

		var attGR = new GlideRecord('sys_attachment');
		if (!attGR.get(attachmentSysId)) {
			gs.info('PrismGlobalUtils.revealAttachment | No sys_attachment found for sys_id: ' + attachmentSysId);
			return { success: false, message: 'Attachment record not found' };
		}

		var currentTableName = attGR.getValue('table_name');

		if (currentTableName === targetTableName) {
			gs.info('PrismGlobalUtils.revealAttachment | table_name already correct, no change needed: ' + currentTableName);
			return { success: true, message: 'Already correct' };
		}

		gs.info('PrismGlobalUtils.revealAttachment | Changing table_name from "' + currentTableName + '" to "' + targetTableName + '"');

		attGR.setValue('table_name', targetTableName);
		attGR.update();

		return { success: true, message: 'table_name updated' };
	},

	/**
	 * Convenience wrapper: reveals the attachment referenced by a field
	 * on a given record, and clears that field's value on the record.
	 * Does NOT call .update() on the record — caller controls when to save.
	 *
	 * @param {GlideRecord} recordGR - the record holding the attachment pointer field
	 * @param {String} fieldName - name of the field storing the attachment sys_id
	 * @param {String} targetTableName - table_name the attachment should belong to
	 * @returns {Object} { success: Boolean, message: String }
	 */
	revealAndDetachAttachment: function (recordGR, fieldName, targetTableName) {

		if (!recordGR || !fieldName || !targetTableName) {
			return { success: false, message: 'Missing recordGR, fieldName, or targetTableName' };
		}

		var attachmentSysId = recordGR.getValue(fieldName);

		if (!attachmentSysId) {
			gs.info('PrismGlobalUtils.revealAndDetachAttachment | No value set on field: ' + fieldName);
			return { success: false, message: 'No attachment set on field' };
		}

		var revealResult = this.revealAttachment(attachmentSysId, targetTableName);

		if (revealResult.success) {
			recordGR.setValue(fieldName, '');
			gs.info('PrismGlobalUtils.revealAndDetachAttachment | Cleared field: ' + fieldName);
		}

		return revealResult;
	},

	type: 'PrismGlobalUtils'
};


if (typeof window == 'undefined') {
	current.stage = 'negotiation';
	current.sub_stage = 'proposal_negotiation';
	// Clear the prop attachment
	
	var globalUtils = new global.PrismGlobalUtils();
	var result = globalUtils.revealAndDetachAttachment(current, 'proposal_attachement', 'x_bgstm_prism_sales');

	current.update();
	action.setRedirectURL(current);
}

TODO: organise this propoerlt

basically when users clicks a btn this fun is called so that it clears the att and moves it to manage attachment (rec level).
/* 
		 *  When the file was uploaded the table_name was prefixed with ZZ_YY
		 *  (e.g. "ZZ_YYx_bgstm_prism_sales") which hides it from Manage Attachments.
		 *  Switching it back to the real table name makes it visible again.
		 */