
(function refineQuery(current, parent) {


    // Applies to table: SiteWorks [x_adga_project_a_0_siteworks]
    // Queries from table: x_adga_project_a_0_asn_items


	function getSAPPoNumbersFromAsset(lead) {
		if (!lead) return '';

		// Collect all PO sys_ids referenced on charger_specification rows for this lead
		var poSysIdSet = {}; // use as set
		var chargerGr = new GlideRecord('x_adga_project_a_0_charger_specification');
		chargerGr.addQuery('lead', lead);
		chargerGr.query();
		while (chargerGr.next()) {
			try {
				var classification = String(chargerGr.getValue('classification') || '').trim().toLowerCase();

				// based on classification choose correct field (these store backend sys_ids CSV)
				var poCsvField = '';
				if (classification === 'charger specification') {
					poCsvField = chargerGr.getValue('charger_po_number') || '';
				} else if (classification === 'panel specification') {
					poCsvField = chargerGr.getValue('panel_po_number') || '';
				} else {
					// ignore other classifications
					continue;
				}

				if (!poCsvField) continue;

				// split CSV tokens and add to set
				var tokens = poCsvField.split(',');
				for (var t = 0; t < tokens.length; t++) {
					var tok = String(tokens[t] || '').trim();
					if (tok) poSysIdSet[tok] = true;
				}
			} catch (e) {
				gs.error('getSAPPoNumbersFromAsset: error processing charger_spec row: ' + e.message);
			}
		}

		// If no sys_ids found return empty
		var poSysIds = Object.keys(poSysIdSet);
		if (poSysIds.length === 0) return '';

		// Now lookup purchase_order_details to resolve sys_id -> po_no (display value)
		// Build CSV for GlideRecord 'IN' (comma separated sys_ids)
		var sysIdCsv = poSysIds.join(',');

		var poNoSet = {}; // unique set of display PO numbers
		var podGr = new GlideRecord('x_adga_project_a_0_purchase_order_details');
		podGr.addQuery('sys_id', 'IN', sysIdCsv);
		podGr.query();
		while (podGr.next()) {
			try {
				var poNo = String(podGr.getValue('po_no') || '').trim();
				if (poNo) poNoSet[poNo] = true;
			} catch (e2) {
				gs.error('getSAPPoNumbersFromAsset: error reading purchase_order_details: ' + e2.message);
			}
		}

		var poNos = Object.keys(poNoSet);
		if (poNos.length === 0) return '';

		// Return CSV of display PO numbers, useful in addQuery('parent.purchase_order','IN', sapPOCSV)
		return poNos.join(',');
	}


	//************************Works************************** */
	var project = parent.parent.getValue();
	var sapPOCSV = getSAPPoNumbersFromAsset(parent.parent.parent.parent.getValue());
	
	// var sapPOCSV = getSAPPoNumbersFromAsset(parent.parent.getValue());
	
	current.addQuery('parent.purchase_order', 'IN', sapPOCSV);
	current.addQuery('project', project);

    current.addQuery('site_works',parent.sys_id);

	
	
	
	


})(current, parent);
