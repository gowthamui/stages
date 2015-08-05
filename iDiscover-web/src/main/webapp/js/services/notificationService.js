myApp.factory( 'NotificationService',
	function() {
		var result={};
		result.modifiedElements='modifiedElements';
		result.userActionUpdated='userActionUpdated';
        result.autoPopulateAll='autoPopulateAll';

		return result;
	}
);