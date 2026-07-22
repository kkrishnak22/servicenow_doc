(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	// Name: LP Monthly Revenue Reports
	// 	Applies to table:  LP Payout Task
	// Queries from table  LP Monthly Revenue Report


	// current:  LP Monthly Revenue Report
	// parent: LP Payout Task
	current.addQuery('sys_id', parent.parent_task.sys_id);

})(current, parent);
