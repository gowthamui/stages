myApp.directive('participantSchedule', ['$filter','DataService','ThemeService','$filter','$log','$location','ThemeService', '$cookieStore', '$state', function ($filter,DataService,ThemeService,$filter,$log,$location,ThemeService, $cookieStore, $state) {
		return {
			replace:true,
			templateUrl: '../partials/participantSchedule.html',
			scope: {
				studyEnrollmentId:'=',
                studyDefId:'='
			},
			link: function (scope, element, attrs, ngModel) {
				scope.items = [];
				scope.processing=false;
				scope.title="Schedule";
				scope.timeoutKey=null;
				scope.getVisitIcon=function(){
					return ThemeService.visitIcon;
				};
				scope.getTargetDateClass=function(item){
					return (item.targetDate || item.name)?'participantScheduleTargetDate':'participantScheduleNoTargetDate';
				};
				scope.getTargetDateColor=function(item){
					var result='black';
					if(item.targetDate){
						var refDate= new Date(item.targetDate);
						var d = new Date();
						var fromSeconds= item.secondsFromRef || 0;
						refDate.setSeconds(refDate.getSeconds()+fromSeconds);
						if(refDate<d){
							result='red';
						}
					}
					return result;
				};
				scope.getTargetDateCaption=function(item){
					var result = '';
					if(item.targetDate){
                        var refDate= new Date(item.targetDate);
                        var d = new Date();
                        var fromSeconds= item.secondsFromRef || 0;
                        refDate.setSeconds(refDate.getSeconds()+fromSeconds);
						result= $filter('date')(refDate);
					}else if (item.name){
						if(item.objectStateType){
							result = item.name+' ('+item.objectStateType+')';
						}else{
							result = item.name;
						}

					}
					else{
						result = 'Not Defined';
					}
					return result;
				};
				scope.getTimeWindowCaption=function(item){
					var result ='';
					if(item.secondsBeforeRef > 0){
						var dayBefore =item.secondsBeforeRef/(24*60*60);
						if(dayBefore>1){
							result+='up to '+dayBefore +' days before';
						}else{
							result+='up to '+dayBefore +' day before';
						}
					}
					if(item.secondsAfterRef > 0){
						var dayAfter =item.secondsAfterRef/(24*60*60);
						if(result.length>0){
							result+=' and ';
						}
						if(dayAfter>1){
							result+='up to '+dayAfter +' days after';
						}else{
							result+='up to '+dayAfter +' day after';
						}
					}

					return result;
				};
				scope.refreshRows=function(){
					scope.processing=true;
					DataService.post('data/ParticipantSchedule/view',{studyEnrollmentId:scope.studyEnrollmentId,studyDefId:scope.studyDefId}).then(function(result){
						scope.processing=false;
						scope.items= result.data.items;
					},function(data, status, headers, config){
						console.log('error %o',arguments);
					});
				};
				scope.selectForm = function(item) {
					$cookieStore.put('studyEnrollmentId-' + scope.studyEnrollmentId, item.rowId);
					$state.go('.', {}, {reload: true});
				};
				scope.refreshRows();
			}
		};
	}]);