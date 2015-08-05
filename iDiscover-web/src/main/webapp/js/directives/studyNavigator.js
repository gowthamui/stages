myApp.directive('studyNavigator', ['$filter','DataService','ThemeService','$log','$location','NotificationService','$timeout', '$cookieStore',
	function ($filter,DataService,ThemeService,$log,$location,NotificationService,$timeout, $cookieStore) {
	return {
		replace:true,
		templateUrl: '../partials/studyNavigator.html',
		scope: {
			studyEnrollmentId:'=',
            studyDefId:'=',
			currentState:'='
		},
		link: function (scope, element, attrs, ngModel) {
			scope.items = [];
			scope.processing=false;
			scope.syncing=false;
			scope.title="";
			scope.timeoutKey=null;

			scope.queueSyncRows=function(){
				$timeout.cancel(scope.timeoutKey);
				scope.timeoutKey=$timeout(function(){
					scope.syncRows();
				},1000);
			}

			scope.$on(NotificationService.modifiedElements, function(event, modifiedValues) {
				scope.queueSyncRows();
			});

			scope.$on(NotificationService.userActionUpdated, function(event, modifiedValues) {
				scope.syncRows();
			});

			scope.getIndent=function(item){
				return {"margin-left":item.level*25+"px"};
			}

			scope.getSubTitle=function(item){
				var result = "";
				if (item.numberOfQuestions > 0) {
					result = item.numberOfQuestionsAnswered +" of "+item.numberOfQuestions+" answered";
				}

				return result;
			}

			scope.getStatusLabel=function(item){
				var result="";
				if (item.objectStateTypeSummary != null) {
					result=item.objectStateTypeSummary.name;
				}else{
					if (item.numberOfQuestionsAnswered > 0) {
						result = "In Progress";
					}else{
						result = "Not Started";
					}
				}
				return result;
			}

			scope.getIcon=function(item){
				var iconClass="";
				if (item.objectStateTypeSummary != null) {
					if (item.objectStateTypeSummary.id == 4) {
						iconClass = ThemeService.approvedIcon;
					}else if (item.objectStateTypeSummary.id == 5) {
						iconClass = ThemeService.deniedIcon;
					}else if (item.objectStateTypeSummary.id == 7) {
						iconClass = ThemeService.inProgressIcon;
					}else if (item.objectStateTypeSummary.id == 6) {
						iconClass = ThemeService.completeIcon;
					}else if (item.objectStateTypeSummary.id == 1) {
						iconClass = ThemeService.notStartedIcon;
					}else if (item.objectStateTypeSummary.id == 2) {
						iconClass = ThemeService.inProgressIcon;
					}else if (item.objectStateTypeSummary.id == 3) {
						iconClass = ThemeService.pendingApprovalIcon;
					}
				} else {
					if (item.numberOfQuestionsAnswered > 0) {
						iconClass = ThemeService.inProgressIcon;
					} else {
						iconClass = ThemeService.notStartedIcon;
					}
				}
				return iconClass;
			}

			scope.parentClosed=function(node){
				var index = scope.items.indexOf(node);
				var vis=false;
				var parentNode=node.parent;
				while(parentNode!=null){
					if(parentNode.isClosed==true){
						vis=true;
						parentNode=null;
					}else{
						parentNode=parentNode.parent;
					}
				}
				return vis;
			}

			scope.toggleFolder=function(item){
				item.isClosed=!item.isClosed;

				angular.forEach(scope.items,function(node){
					node.hide = scope.parentClosed(node);
				});
			}

			scope.getFolderIcon=function(item){
				var result = ThemeService.leafIcon;
				if(item.items && item.items.length>0){
					if(item.isClosed){
						result = ThemeService.folderCloseIcon;
					}else{
						result = ThemeService.folderOpenIcon;
					}
				}else if(!item.parent){
                    result = ThemeService.folderOpenIcon;
                }
				return result;
			}

			scope.populateItems=function(summary,indentLevel,parent){
				var result = [];
				if(summary.items){
                    var displaySeq=0;
					angular.forEach(summary.items,function(item){
						item.parent=parent;
						item.level=indentLevel;
                        item.displaySeq=item.displaySeq || displaySeq;
                        displaySeq++;
						result.push(item);
						if(item.items){
							var tempItems = scope.populateItems(item,indentLevel+1,item);
							result.push.apply(result,tempItems);
						}
					});
				}

				return result;
			}

			scope.getHierarchy=function(item){
				var result = "";
				while (item!=null && item.tableName!='SUMMARY') {
					if (result.length> 0) {
						result = item.tableName + "|" + item.rowId +"."+result;
					} else {
						result = item.tableName + "|" + item.rowId;
					}
					item = item.parent;
				}
				return result;
			};

			scope.getStudyDefFormDefId=function(hierarchy){
				var parts = hierarchy.split('.');
				var subparts = parts[0].split('|');
				return subparts[1];
			};

			scope.goto = function(item, $event) {
				if ($event) {
					$event.preventDefault();
					$event.stopPropagation();
				}
				if("STUDY_DEF_FORM_DEF"==item.tableName){
					var newState={};
                    if(scope.currentState.data){
                        newState.participantId=scope.currentState.data.participantId;
                    }
					newState.studyDefFormDefId=item.rowId;
					newState.hierarchy=null;
                    newState.item=item;
					scope.currentState.data = newState;

				}else if("FORM_DEF_ELEMENT"==item.tableName){
                    var newState={};
                    if(scope.currentState.data){
                        newState.participantId=scope.currentState.data.participantId;
                    }
					newState.hierarchy=scope.getHierarchy(item);
					newState.studyDefFormDefId=scope.getStudyDefFormDefId(newState.hierarchy);
					scope.currentState.data = newState;
                    newState.item=item;

				}else if("SUMMARY"==item.tableName){
                    var newState={};
                    if(scope.currentState.data){
                        newState.participantId=scope.currentState.data.participantId;
                    }
                    newState.hierarchy=scope.getHierarchy(item);
                    newState.studyDefFormDefId=null;
                    newState.outline=scope.items;
                    newState.item=item;

                    if(scope.currentState && scope.currentState.data.studyDefFormDefId){
                        scope.currentState.data = newState;
                    }

                }
				$cookieStore.put('studyEnrollmentId-' + scope.studyEnrollmentId, item.rowId);
			}

			scope.refreshRows=function(){
				scope.processing=true;
				scope.title="Loading...";
				DataService.post('data/StudyEnrollmentOutline/view',{studyEnrollmentId:scope.studyEnrollmentId,studyDefId:scope.studyDefId}).then(function(result){
					scope.processing=false;
					scope.title="Navigator";
					if(result.data.item){
                        var p={items:[],caption:'Form Summary',tableName:"SUMMARY"};
                        var tempitems=scope.populateItems(result.data.item,1,p);
                        tempitems.unshift(p);
                        scope.items=tempitems;

						var newState=angular.copy(scope.currentState.data || {});
						newState.participantId=result.data.item.participantId;

						if(!(newState.studyDefFormDefId>0)){
							newState.item=p;
                            newState.outline=tempitems;
						}
						if ($cookieStore.get('studyEnrollmentId-' + scope.studyEnrollmentId)){
							var foundRow=findInNavigator(result.data.item.items, $cookieStore.get('studyEnrollmentId-' + scope.studyEnrollmentId));
                            if(foundRow){
                                scope.goto(foundRow);
                                scope.$parent.toggleNavigator();
                            }else{
                                scope.currentState.data = newState;
                            }
                        }else{
							scope.currentState.data = newState;
                        }

					};
				},function(data, status, headers, config){
					console.log('error %o',arguments);
				});
			}

			function findInNavigator(items, rowId) {
                var result =null;
				for (var int = 0; int < items.length; int++) {
					if(items[int].rowId == rowId) {
                        result = items[int];

						break;
					} else
						if (items[int].items.length > 0){
							result = findInNavigator(items[int].items, rowId);
                            if(result!=null){
                                break;
                            }
                        }
				};
                return result;
			}

			scope.syncRows=function(){
				scope.syncing=true;
				DataService.post('data/StudyEnrollmentOutline/view',{studyEnrollmentId:scope.studyEnrollmentId,studyDefId:scope.studyDefId}).then(function(result){
					scope.syncing=false;
					if(result.data.item){
						var newItems=scope.populateItems(result.data.item,0);
						if(newItems.length>scope.items.length){
							scope.items.length=newItems.length;
						}
						angular.forEach(newItems,function(item,index){
							if(scope.items.length>index){
								for(var propt in item){
									scope.items[index][propt]=item[propt];
								}
							}else{
								scope.items.push(item);
							}
						});
					}
				},function(data, status, headers, config){
					console.log('error %o',arguments);
				});
			}

			scope.isSelected=function(item){
				if(item==scope.selectedItem){
					return 'studyNavigatorItemSelected';
				}else{
					return null;
				}
			}

			scope.$watch('studyEnrollmentId', function (newValue,oldValue) {
				if(parseInt(newValue)>0 || parseInt(scope.studyDefId)>0){
					scope.refreshRows();
				}else{
					scope.title="Information Not Available";
				}
			});

            scope.$watch('currentState.data', function (newValue,oldValue) {
                if(newValue){
                    angular.forEach(scope.items,function(item){
                        if(newValue && newValue.item && newValue.item.rowId==item.rowId && newValue.item.tableName==item.tableName){
                            if(scope.selectedItem!=item){
                                scope.selectedItem=item;
                            }
                        }
                    });
                }
            });
		}
	};
}]);