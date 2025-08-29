var emailArr = [];

emailArr.push({
			email: current.parent.parent.account_manager.email.toString(),  // Email
			name: current.parent.parent.account_manager.name.toString() // Name
});

for (var p = 0; p < emailArr.length; p++) {
		var temp = emailArr[p];
		email.addAddress('cc', temp.email.toString(), temp.name);
}
