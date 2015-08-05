myApp.controller('BrowseDataFiltersCtrl', ['$scope', '$rootScope', '$modal', 'DataService', 'ThemeService', '$modalInstance','$timeout', '$log', 'itemToEdit', function ($scope, $rootScope, $modal, DataService, ThemeService, $modalInstance,$timeout, $log, itemToEdit) {
    $scope.item = angular.copy(itemToEdit ? itemToEdit : {});

    $scope.title = 'Edit Filters';
    $scope.studyDefFilters={filters:[]};
    $scope.selectedFilter = null;
    $scope.dialogVisible = true;
    $scope.loadingFilter = false;
    $scope.outline = [];
    $scope.loadingOutline = true;
    $scope.selectedItems=[];
    $scope.gridData = [];
    $scope.visibleSelectAll=false;

    var cbTemplate= '<div class="ngCellText" ng-class="col.colIndex()" style="text-align: center;"><span ng-cell-text><input style="margin-top: 3px"  data-ng-click="toggleCell(row,col,$event)" type="checkbox" ng-checked="row.getProperty(col.field)"></span></div>';

    var myHeaderCellTemplate = '<div class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{\'cursor\': col.cursor}" ng-class="{ \'ngSorted\': !noSortVisible }">' +
        '<div ng-click="col.sort($event)" ng-class="\'colt\' + col.index" class="ngHeaderText"> <input style="margin-top: 5px" type="checkbox" data-ng-checked="visibleSelectAll" data-ng-click="toggleCol(col,$event)"> {{col.displayName}}</div>' +
        '<div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div>' +
        '<div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div>' +
        '<div class="ngSortPriority">{{col.sortPriority}}</div>' +
        '<div ng-class="{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }" ng-click="togglePin(col)" ng-show="col.pinnable"></div>' +
        '</div>' +
        '<div ng-show="col.resizable" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>';


    $scope.gridOptions = {
        data: 'gridData',
        displayFooter: false,
        showSelectionCheckbox: false,
        displaySelectionCheckbox: false,
        enableSorting:false,
        multiSelect: false,
        showColumnMenu: false,
        showFilter:false,
        enableCellSelection:true,
        enableRowSelection:true,
        enableRowReordering:true,
        selectedItems: $scope.selectedItems,
        columnDefs: [
            {field: 'name', displayName: 'Name'},
            {field: 'dataTypeSummary.name', displayName: 'Data Type'},
            {field: 'visible',enableCellEdit:false, displayName:'Visible?',headerCellTemplate: myHeaderCellTemplate,cellTemplate:cbTemplate,width:100}
        ]
    };

    $scope.toggleCell=function(row,column,$event){
        //$event.preventDefault();
        //$event.stopPropagation();
        row.entity[column.field]=!row.entity[column.field];
    }

    $scope.toggleCol=function(column,$event){
        $event.preventDefault();
        $event.stopPropagation();

        $scope.visibleSelectAll=!$scope.visibleSelectAll;
        angular.forEach($scope.gridData,function(item){
            item.visible=$scope.visibleSelectAll;
        });

    }

    $scope.canDeleteFilter = function () {
        return $scope.selectedFilter != null;
    }


    $scope.deleteFilter = function () {
        var index = $scope.studyDefFilters.filters.indexOf($scope.selectedFilter);
        $scope.studyDefFilters.filters.splice(index, 1);
        if (index < $scope.studyDefFilters.filters.length) {
            $scope.selectFilter($scope.studyDefFilters.filters[index]);
        } else if ($scope.studyDefFilters.filters.length > 0) {
            $scope.selectFilter($scope.studyDefFilters.filters[index - 1]);
        } else {
            $scope.selectFilter(null);
        }
    }

    $scope.selectFilter = function (item) {
        $scope.loadingFilter = true;

        var oldValue=$scope.selectedFilter;
        if(oldValue){
            oldValue.columns=[];
            angular.forEach($scope.gridData,function(item){
                oldValue.columns.push(item);
            });
        }

        $scope.selectedFilter = item;
        $scope.gridData.length=0;
        $scope.selectedItems.length=0;
        if (item) {
            $scope.selectedFilter.columns = $scope.selectedFilter.columns || [];
        }
        $scope.formChanged();
        $timeout(function(){
            $(window).resize();
        },10);
        $scope.loadingFilter = false;
    }

    $scope.addFilter = function () {
        var newFilter = {};
        newFilter.name = 'New Filter';
        if($scope.outline && $scope.outline.length>0){
            newFilter.form=$scope.outline[0].id;
        }
        newFilter.id = new Date().getTime();
        $scope.studyDefFilters.filters.push(newFilter);
        $scope.selectFilter(newFilter);
    }


    $scope.filterSelected = function (item, $event) {
        $scope.selectFilter(item);
    };

    $scope.save = function () {

        if($scope.selectedFilter){
            $scope.selectedFilter.columns=[];
            angular.forEach($scope.gridData,function(item){
                $scope.selectedFilter.columns.push(item);
            });
        }


        var ob={
            id:$scope.studyDefFilters.id,
            filters:[]
        };

        angular.forEach($scope.studyDefFilters.filters,function(item){
            var filter={};
            filter.form=item.form;
            filter.name=item.name;
            filter.id=item.id;
            filter.columns=item.columns;

            ob.filters.push(filter);
        });


        var settingValue=angular.toJson(ob);


        DataService.post('data/UserSetting/update',{
                id:$scope.studyDefFilters.id,
                settingKey:$scope.item.studyDefId,
                name:'STUDY_DEF_FILTERS',
                settingValue:settingValue
            }
        ).then(function(newItem){
                $scope.studyDefFilters.id=newItem.data.item.id;
                $scope.loadingOutline = false;

                $scope.studyDefFilters.selectedFilter=$scope.selectedFilter;
                $modalInstance.close($scope.studyDefFilters);
            });


    };

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.dialogChanged = function (visible) {
        $scope.dialogVisible = !visible;
    }

    $scope.close = function (result) {
        $modalInstance.close();
    };

    $scope.populateItems = function (item, index) {
        return [];
    }

    $scope.populateItems = function (summary, indentLevel, parent) {
        var result = [];
        if (summary.items) {
            angular.forEach(summary.items, function (item) {
                var newLevel = indentLevel;
                var isParent = false;

                if ((item.dataTypeId == 5 || item.dataTypeId == 10) || item.tableName == 'STUDY_DEF_FORM_DEF') {
                    item.level = indentLevel;
                    item.parent = parent;
                    item.caption = Array(item.level * 2 + 1).join("-") + (item.level > 0 ? " " : "") + item.caption;
                    item.id=item.tableName+'_'+item.rowId;
                    result.push(item);
                    newLevel = indentLevel + 1;
                    isParent = true;
                }
                if (item.items) {
                    var tempItems = $scope.populateItems(item, newLevel, isParent ? item : parent);
                    item.numberOfChildren = tempItems.length;
                    result.push.apply(result, tempItems);
                }
            });
        }
        return result;
    };

    $scope.getColumns = function (item) {

        DataService.post('data/DataBrowser/view', {
                studyDefId: item.studyDefId,
                rowId: item.rowId,
                tableName: item.tableName,
                showColumnsOnly: true
            }
        ).then(
            function (newItem) {
                
                var cols=[];

                if (newItem.data.item.hasParticipantSummary) {
                    cols.push({id: ('idTag'), name: 'EMPI',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('participantStudyId'), name: 'Participant Study Id',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('participantName'), name: 'Participant',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('studyEnrollmentId'), name: 'Study Enrollment ID',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('participantId'), name: 'Participant ID',dataTypeSummary: {name:'String'}});
                }

                if (newItem.data.item.hasEnrollmentSummary) {
                    cols.push({id: ('idTag'), name: 'EMPI',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('firstName'), name: 'First Name',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('lastName'), name: 'Last Name',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('id'), name: 'Study Enrollment ID',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('participantId'), name: 'Participant ID',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('email'), name: 'Email',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('dateOfBirth'), name: 'Date Of Birth',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('ldapId'), name: 'LDAP ID',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('studyEnrollmentStatus'), name: 'Enrollment Status',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('participantStudyId'), name: 'Participant Study ID',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('secondaryStudyId'), name: 'Secondary Study ID',dataTypeSummary: {name:'String'}});
                    cols.push({id: ('dateAdded'), name: 'Date Added', dataTypeSummary: {name:'DateTime'}});
                }

                angular.forEach(newItem.data.item.columns,function(col){
                    cols.push(col);
                });

                // set default to visible
                angular.forEach(cols,function(col){
                    col.visible=true;
                });
                
                $scope.gridData=cols;

                if($scope.selectedFilter){
                    angular.forEach($scope.gridData,function(item){
                        angular.forEach($scope.selectedFilter.columns,function(col){
                            if(col.id==item.id){
                                item.visible=col.visible;
                            }
                        });
                    });
                }

               
                $timeout(function(){
                    $(window).resize();
                },10);
            }
        );
    }

    $scope.getStudyDetails = function () {
        $scope.outline = [];
        $scope.loadingOutline = true;

        DataService.post('data/StudyOutline/view', {
            studyDefId: $scope.item.studyDefId
        }).then(
            function (newItem) {
                $scope.outline = $scope.populateItems(newItem.data.item, 0);
                $scope.outline.unshift({
                    caption: 'Enrollments',
                    studyDefId: $scope.studyDefId,
                    items: [],
                    level: 0,
                    numberOfChildren: 0,
                    tableName: 'STUDY_ENROLLMENT',
                    id:'STUDY_ENROLLMENT_0'
                });
            },
            function (error) {

            }
        ).then(function(){
            DataService.post('data/UserSetting/view',{
                    settingKey:$scope.item.studyDefId,
                    name:'STUDY_DEF_FILTERS'
                }
            ).then(function(newItem){
                var settingValue=newItem.data.item? newItem.data.item.settingValue : null;
                var defFilter=null;
                try{
                    if(settingValue){
                        defFilter=angular.fromJson(settingValue);
                    }
                }catch(x){}

                $scope.studyDefFilters=defFilter || {filters:[]};
                $scope.studyDefFilters.id=newItem.data.item? newItem.data.item.id : null;
                $scope.studyDefFilters.filters=$scope.studyDefFilters.filters || [];

                if($scope.studyDefFilters.filters && $scope.studyDefFilters.filters.length>0){
                    var foundFilter=false;
                    angular.forEach($scope.studyDefFilters.filters,function(tempItem){
                        if(tempItem.id==$scope.item.selectedFilterId){
                            foundFilter=true;
                            $scope.selectFilter(tempItem);
                        }
                    });

                    if(!foundFilter){
                        $scope.selectFilter($scope.studyDefFilters.filters[0]);
                    }
                }

                $scope.loadingOutline = false;
                if(!$scope.$$phase){
                    $scope.$apply();
                }
            });
        });
    }

    $scope.formChanged=function(){

        if($scope.selectedFilter){
            var newValue=$scope.selectedFilter.form;
            if (newValue != null && newValue.split) {
                var parts = newValue.split('_');
                var temp={
                    studyDefId:$scope.item.studyDefId,
                    tableName:parts.slice(0,parts.length-1).join('_'),
                    rowId:parts[parts.length-1]
                };
                $scope.getColumns(temp);
            }
        }
    }

    $timeout(function(){
        $(window).resize();
    },100);

    $scope.getStudyDetails();

}]);