myApp.factory( 'ThemeService',['$cookieStore','$cookies','$browser',
	function($cookieStore,$cookies,$browser) {
		var service = {};

		service.indentPixels=25;
        service.taskIcon='fa fa-file-text';
		service.commentIcon='fa fa-file-o';
		service.auditHistoryIcon='fa fa-clock-o';
		service.formHistoryIcon='fa fa-clock-o';
		service.participantStatusHistoryIcon='fa fa-clock-o';

		service.pendingMenuIcon = 'fa fa-pencil-square-o';
		service.enrollmentMenuIcon = 'fa fa-user';
		service.adminMenuIcon = 'fa fa-cogs';
		service.authorMenuIcon = 'fa fa-users';
		service.searchIcon = 'fa fa-search';
		service.clearIcon = 'fa fa-ban';
		service.iPadMenuIcon = 'fa fa-tablet';
		service.valueCommentEmptyIcon = 'fa fa-file-o';
		service.valueCommentFullIcon = 'fa fa-file-text-o';

		service.approvedIcon = 'fa fa-thumbs-up';
		service.deniedIcon = 'fa fa-thumbs-down';
		service.inProgressIcon = 'fa fa-star-half-o';
		service.completeIcon = 'fa fa-star';
		service.notStartedIcon = 'fa fa-star-o';
		service.pendingApprovalIcon= 'fa fa-lock';

		service.folderOpenIcon= 'fa fa-folder-open-o';
		service.folderCloseIcon= 'fa fa-folder-o';
		service.leafIcon= 'fa fa-angle-right';
		service.scheduleIcon = 'fa fa-bell-o';

		service.outlineIcon='fa fa-indent';
		service.visitIcon='fa fa-calendar';
        service.filterIcon='fa fa-filter';
        service.printIcon='fa fa-print';


		service.accessIcon='fa fa-lock';
		service.requiredIcon='fa fa-asterisk';
        service.requiresInitialsIcon='fa fa-check';
        service.moveUpIcon='fa fa-long-arrow-up';
        service.moveDownIcon='fa fa-long-arrow-down';

        service.tableIcon = 'fa fa-table';
        service.sendFormIcon = 'fa fa-location-arrow';

        service.profileIcon = 'fa fa-user';
        service.helpIcon= 'fa fa-question';

        service.automatedQueryIcon = 'fa fa-lightbulb-o';
        service.automatedQueryWorkingIcon = 'fa fa-refresh fa-spin';

		service.getWidgetIcon=function(widgetTypeId,open){
			var result = 'fa fa-pencil-square-o';
			if(widgetTypeId==1){ //string
				result='fa fa-text-width';
			}else if(widgetTypeId==2){//yesno
				result='fa fa-thumbs-up';
			}else if(widgetTypeId==3){//date
				result='fa fa-calendar';
			}else if(widgetTypeId==4){//number
				result='fa fa-building-o';
			}else if(widgetTypeId==5){//list
				if(open){
					result='fa fa-folder-open-o';
				}else{
					result='fa fa-folder-o';
				}
			}else if(widgetTypeId==6){//sig
				result='fa fa-pencil';
			}else if(widgetTypeId==7){//attach file
				result='fa fa-paperclip';
			}else if(widgetTypeId==8){//view file
				result='fa fa-file';
			}else if(widgetTypeId==9){//lookup
				result='fa fa-external-link-square';
			}else if(widgetTypeId==10){//multilookup
				result='fa fa-external-link';
			}else if(widgetTypeId==11){//view & agree
				result='fa fa-thumbs-up';
			}else if(widgetTypeId==12){//multi-line string
				result='fa fa-text-height';
			}else if(widgetTypeId==14){//view & sign
				result='fa fa-pencil-square-o';
			}else if(widgetTypeId==15){//description
				result='fa fa-align-left';
			}else if(widgetTypeId==16){//subform
				if(open){
					result='fa fa-folder-open-o';
				}else{
					result='fa fa-folder-o';
				}
			}else if(widgetTypeId==17){//checkbox
				result='fa fa-check-square-o';
			}else if(widgetTypeId==18){//datetime
				result='fa fa-calendar-o';
			}else if(widgetTypeId==19){//rating (stars)
				result='fa fa-star-o';
            }else if(widgetTypeId==20){//slider
                result='fa fa-arrows-h';
            }

			return result;
		};

		service.getElementIcon=function(item){
			var result = "fa fa-credit-card";

			if (item.elementSummary) {
				if (item.elementSummary.elementTypeId == 2) {
					result = service.getWidgetIcon(item.elementSummary.valueDefSummary.defaultWidgetTypeId,item.elementSummary.isOpen);
				} else if (item.elementSummary.elementTypeId == 3) {
					if(item.elementSummary.isOpen){
						result = "fa fa-folder-open";
					}else{
						result = "fa fa-folder";
					}
				} else if (item.elementSummary.elementTypeId == 1) {
					if(item.elementSummary.isOpen){
						result = "fa fa-chevron-down";
					}else{
						result = "fa fa-chevron-right";
					}
				}
			}
			return result;
		};

		return service;
	}]
);