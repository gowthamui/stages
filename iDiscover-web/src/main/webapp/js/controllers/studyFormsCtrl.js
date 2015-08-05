myApp.controller('StudyFormsCtrl', ['$scope','$rootScope','DataService','ThemeService','$stateParams','$state', function ($scope,$rootScope,DataService,ThemeService,$stateParams,$state) {
    $scope.title='Study Forms';
    $scope.processing=false;
    $scope.studyDefs=[];
    $scope.studyDef=null;
    $scope.studyDefId=null;
    $scope.formDefId=null;
    $scope.filterIcon=ThemeService.filterIcon;

    $scope.selectedItems=[];
    $scope.gridData = [];

    $scope.gridOptions = {
        data: 'gridData',
        displayFooter: false,
        displaySelectionCheckbox: false,
        enableSorting:true,
        multiSelect: false,
        enableRowReordering:false,
        showFilter:true,
        showColumnMenu: false,
        sortInfo : {fields:['studyDef','formDef'],directions:['asc','asc']},
        selectedItems: $scope.selectedItems,
        columnDefs: [
            {field: 'studyDefId', displayName: 'Id', width:60},
            {field: 'studyDef', displayName: 'Study'},
            {field: 'studyDefState', displayName: 'Study Status', width:150},
            {field: 'formDef', displayName: 'Form'},
            {field: 'formState', displayName: 'Form Status', width:150}
        ],
        rowTemplate: '<div ng-dblclick="openEdit()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>',
        enableSorting: true
    };

    $scope.selectedStudy=function(){
        var result=null;
        angular.forEach($scope.studyDefs,function(item){
            if(item.id==$scope.studyDefId){
                result=item.name;
            }
        });
        return result;
    }

    $scope.canEdit=function(){
        return $scope.selectedItems.length>0;
    };


    $scope.openEdit=function(){
        $state.transitionTo('studyEnrollmentDetail',{studyDefId:$scope.selectedItems[0].studyDefId,studyEnrollmentId:0,studyDefFormDefId:$scope.selectedItems[0].studyDefFormDefId,participantId:0});
    };

    $scope.selectStudy = function(item) {
        $scope.studyDef = item;
        $scope.studyDefId = item.id;
    };

    $scope.refreshStudyDefs = function(){
        DataService.post('data/StudyDef/search',{searchContext:'StudyEnrollment'}).then(function(result){

            var items = [{id:0,name:'-- All Studies --'}];
            angular.forEach(result.data.items,function(item){
                var hasStudyForm =false;
                angular.forEach(item.formDefSummaries,function(formDef){
                    if(formDef.formTypeSummary.id==2){
                        hasStudyForm=true;
                    }
                });
                if(hasStudyForm){
                    items.push(item);
                }
            });

            $scope.studyDefs=items;

            if($scope.studyDefs.length>0 && !$scope.studyDefId){
                $scope.studyDefId=$scope.studyDefs[0].id;
                $scope.studyDef=$scope.studyDefs[0];
            }

            if(!$scope.$$phase){
                $scope.$apply();
            }

        });
    }
    $scope.refreshRows = function(){
        $scope.processing=true;
        DataService.post('data/StudyForms/search',{studyDefId:$scope.studyDefId}).then(function(result){
            var summary = result.data.items;
            $scope.gridData=summary;
            $scope.processing=false;

        });
    }
    $scope.refreshStudyDefs();

    $scope.$watch('studyDefId',function(newValue,oldValue){
        if(newValue!=null){
            $scope.refreshRows();
        }
    });

}]);