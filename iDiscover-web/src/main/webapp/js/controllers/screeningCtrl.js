myApp.controller('ScreeningCtrl', ['$scope','$rootScope','DataService','ObjectStateService','ThemeService','$stateParams','$modal','$state', '$cookieStore','ngGridCsvExportPlugin', function ($scope,$rootScope,DataService,ObjectStateService,ThemeService,$stateParams,$modal,$state, $cookieStore,ngGridCsvExportPlugin) {
    $scope.title='Pre-Screening';
    $scope.selectedItems=[];
    $scope.gridData = [];
    $scope.processing=false;
	$scope.studyDefId = $cookieStore.get('studyDefId');
    $scope.objectStateTypeId=10;
    $scope.objectStates=[];
    $scope.studyDefs=[];
    $scope.filterIcon=ThemeService.filterIcon;

    $scope.gridOptions = {
        data: 'gridData',
        displayFooter: false,
        displaySelectionCheckbox: false,
        enableSorting:true,
        multiSelect: false,
        enableRowReordering:false,
        showFilter:true,
        plugins: [new ngGridCsvExportPlugin.csvPlugin(null,$scope)],
        showColumnMenu: false,
        sortInfo : {fields:['name'],directions:['asc']},
        selectedItems: $scope.selectedItems,
        columnDefs: [
            {field: 'id', displayName: 'Id',width:60,sortable:true},
            {field: 'studyDefSummary_name', displayName: 'Study'},
            {field: 'participantSummary_idTag', displayName: 'EMPI',width:150},
            {field: 'participantSummary_lastName', displayName: 'Last Name'},
            {field: 'participantSummary_firstName', displayName: 'First Name'},
            {field: 'participantStudyId', displayName: 'Participant Study ID',width:150},
            {field: 'secondaryStudyId', displayName: 'Secondary Study ID',width:150},
            {field: 'studyEnrollmentStatusSummary_objectStateTypeSummary_name', displayName: 'Participant Status',width:175}

        ],
        rowTemplate: '<div ng-dblclick="openDetails()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
        enableSorting: true
    };

    $scope.refreshStudyDefs = function(){
        DataService.post('data/StudyDef/search',{searchContext:'StudyEnrollment',objectStateSummary:{objectStateTypeSummary:{id:9}}}).then(function(result){
            $scope.studyDefs=result.data.items;

            var found=false;
            angular.forEach($scope.studyDefs, function(item){

               if($scope.studyDefId==item.id){
                   found=true;
               }
            });
            if(!found){
                $scope.studyDefId=null;
            }

            if($scope.studyDefs.length>0 && !$scope.studyDefId){
                $scope.studyDefId=$scope.studyDefs[0].id;
            }

            if(!$scope.$$phase){
                $scope.$apply();
            }

        });
    }

    ObjectStateService.getEnrollmentStates(function(results){
        var items = [];
        angular.forEach(results,function(item){
            if(item.id==10 || item.parentId==10){
                items.push(item);
            }
        });
        $scope.objectStates=items;;
        if(!$scope.$$phase){
            $scope.$apply();
        }
    });

    $scope.canEdit=function(){
        return $scope.selectedItems.length>0;
    };

    $scope.canAdd=function(){
        return true;
    };


    $scope.highlightRow=function(index){
        setTimeout(function(){
            $scope.gridOptions.selectItem(index,true);
            if (!$scope.$$phase)
                $scope.$apply();

        },10);
    };

    $scope.findItem = function (items,tempItemId) {
        var result = null;
        angular.forEach(items, function (value, key) {
            if (value.id == tempItemId) {
                result = value;
                return false;
            }
        });
        return result;
    };

    $scope.selectedStudy=function(){
        var result=null;
        angular.forEach($scope.studyDefs,function(item){
            if(item.id==$scope.studyDefId){
                result=item.name;
            }
        });
        return result;
    };

	$scope.selectStudy = function(item) {
		$scope.studyDefId = item.id;
		$cookieStore.put('studyDefId', item.id);
	};

	$scope.selectState = function(item) {
		$scope.objectStateTypeId = item.id;
	};

    $scope.selectedState=function(){
        var result=null;
        angular.forEach($scope.objectStates,function(item){
            if(item.id==$scope.objectStateTypeId){
                result=item.name;
            }
        });
        return result;
    }

    $scope.openDetails=function(){
        $state.transitionTo('studyEnrollmentDetail',{studyDefId:$scope.selectedItems[0].studyDefSummary.id,studyEnrollmentId:$scope.selectedItems[0].id,studyDefFormDefId:0,participantId:0});
    };

    $scope.openEnrollmentProperties=function(){
        var enrollmentToEdit=  $scope.selectedItems[0];
        var d = $modal.open({
            templateUrl:'../partials/editParticipantEnrollment.html',
            controller:'EditParticipantEnrollmentCtrl',
            backdropClick: false,
            resolve: {itemToEdit:function(){return enrollmentToEdit;}}
        });
        $rootScope.isNavigating=true;
        $rootScope.currDialog=d;
        d.result.then(function (result) {
            $rootScope.isNavigating=false;
            $rootScope.currDialog=null;
            if(result){

                if(enrollmentToEdit!=null){
                    // sync existing participant
                    angular.copy(result.item,enrollmentToEdit);
                    $scope.convertItem(enrollmentToEdit);
                }
                if (!$scope.$$phase)
                    $scope.$apply();
            }
        });
    };

    $scope.convertItem=function(item){
        if(item.studyDefSummary)
            item.studyDefSummary_name=item.studyDefSummary.name;
        if(item.participantSummary){
            item.participantSummary_idTag=item.participantSummary.idTag;
            item.participantSummary_lastName=item.participantSummary.lastName;
            item.participantSummary_firstName=item.participantSummary.firstName;
        }
        if(item.studyEnrollmentStatusSummary && item.studyEnrollmentStatusSummary.objectStateTypeSummary){
            item.studyEnrollmentStatusSummary_objectStateTypeSummary_name=item.studyEnrollmentStatusSummary.objectStateTypeSummary.name;
        }
    }

    $scope.addParticipant=function(){
        var itemToEdit = null;
        var d = $modal.open({
            templateUrl:'../partials/addParticipantToStudy.html',
            controller:'AddParticipantToStudyCtrl',
            windowClass: 'modalViewContent',
            backdropClick: false,
            resolve: {
                itemToEdit:function(){return itemToEdit},
                options:function(){return {studyId:$scope.studyDefId}}
            }
        });
        $rootScope.isNavigating=true;
        $rootScope.currDialog=d;
        d.result.then(function (result) {
            $rootScope.isNavigating=false;
            $rootScope.currDialog=null;
            if(result){
                $scope.refreshRows();
            }
        });
    };

    $scope.refreshRows=function(){
        $scope.processing=true;
        DataService.post('data/StudyEnrollment/search',{
            studyDefSummary:{
                id:$scope.studyDefId
            },
            studyEnrollmentStatusSummary:{
                objectStateTypeSummary:{
                    id:$scope.objectStateTypeId
                }
            },
            objectStateSummary:{
                objectStateTypeSummary:{
                    id:9
                }
            }
        }).then(function(result){
                var summary = result.data;
                $scope.processing=false;
                angular.forEach(summary.items,function(item){
                    $scope.convertItem(item);
                });
                $scope.gridData=summary.items;

            },function(data, status, headers, config){
                console.log('error %o',arguments);
            });
    }

    $scope.refreshStudyDefs();

    $scope.$watch('studyDefId',function(newValue,oldValue){
        if(newValue){
            $scope.refreshRows();
        }
    });

    $scope.$watch('objectStateTypeId',function(newValue,oldValue){
        if(newValue){
            $scope.refreshRows();
        }
    });

}]);