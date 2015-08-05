myApp.controller('BrowseDataCtrl', ['$scope', '$rootScope', 'DataService', '$stateParams', '$modal', '$state', '$cookieStore', 'ngGridCsvExportPlugin', 'ThemeService', '$log', function ($scope, $rootScope, DataService, $stateParams, $modal, $state, $cookieStore, ngGridCsvExportPlugin, ThemeService, $log) {
    $scope.title = "Data Browser";
    $scope.processing = false;
    $scope.loadingOutline = false;
    $scope.studyDefs = [];
    $scope.studyDef = null;
    $scope.studyDefId = $cookieStore.get('studyDefId');
    $scope.outline = [];
    $scope.selectedItem = null;
    $scope.filterIcon = ThemeService.filterIcon;
    $scope.selectedItems = [];
    $scope.hasData = false;
    $scope.studyDefFilters = {};

    $scope.viewFileTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text><a href=""  class="expression" ng-click="viewFile(row.entity,col)">{{getFileName(row.entity,col)}}</a></span></div>';
    $scope.cbTemplate = '<div class="ngCellText" ng-class="col.colIndex()" style="text-align: center;"><span ng-cell-text><input disabled="true" style="margin-top: 3px"  type="checkbox" ng-checked="row.getProperty(col.field)"></span></div>';

    $scope.columnDefs = [
        {field: 'name', displayName: ' '}
    ];

    $scope.gridOptions = {
        data: 'gridData',
        multiSelect: false,
        plugins: [new ngGridCsvExportPlugin.csvPlugin(null, $scope)],
        showColumnMenu: false,
        enableColumnReordering: true,
        enableColumnResize: true,
        selectedItems: $scope.selectedItems,
        columnDefs: 'columnDefs',
        rowTemplate: '<div ng-dblclick="openDetails()" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
    };

    $scope.getFileName = function (row, col) {
        var item = row[col.field];
        if (item) {
            return item.fileName;
        } else {
            return null;
        }
    };


    $scope.showHideGraph = function () {
        $scope.showGraph = !$scope.showGraph;
        $(window).resize();
    };

    $scope.editFilters = function () {
        var tempItem = {
            studyDefId: $scope.studyDefId,
            selectedFilterId:$scope.studyDefFilters.selectedFilter?$scope.studyDefFilters.selectedFilter.id:null
        };
        var d = $modal.open({
            keyboard: false,
            templateUrl: '../partials/browseDataFilters.html',
            controller: 'BrowseDataFiltersCtrl',
            windowClass: 'modalViewContent',
            backdropClick: false,
            resolve: {itemToEdit: function () {
                return tempItem;
            }}
        });
        $rootScope.isNavigating = true;
        $rootScope.currDialog = d;
        d.result.then(function (result) {
            $rootScope.isNavigating = false;
            $rootScope.currDialog = null;
            if (result) {

                $scope.studyDefFilters=result;

                if($scope.studyDefFilters.selectedFilter){
                    $scope.selectFilter($scope.studyDefFilters.selectedFilter);
                }
                if (!$scope.$$phase)
                    $scope.$apply();
            }
        });
    };

    $scope.viewFile = function (row, col) {
        var item = row[col.field];
        if (item) {
            var fileName = item.fileName;
            var tempPath = item.id;
            var d = $modal.open({
                templateUrl: '../partials/viewFileDialog.html',
                controller: 'ViewFileDialogCtrl',
                windowClass: 'modalViewContent',
                backdropClick: false,
                resolve: {
                    title: function () {
                        return fileName;
                    },
                    filePath: function () {
                        return tempPath;
                    },
                    useSigned: function () {
                        return item.useSigned;
                    },
                    useSignature: function () {
                        return item.useSignature;
                    }
                }
            });
            $rootScope.isNavigating = true;
            $rootScope.currDialog = d;

            d.result.then(function (result) {
                $rootScope.isNavigating = false;
                $rootScope.currDialog = null;
            });
        }
    };

    $scope.selectedStudy = function () {
        var result = null;
        angular.forEach($scope.studyDefs, function (item) {
            if (item.id == $scope.studyDefId) {
                result = item.name;
            }
        });
        return result;
    };

    $scope.selectStudy = function (item) {
        $scope.studyDef = item;
        $scope.studyDefId = item.id;
        $cookieStore.put('studyDefId', item.id);
    };

    $scope.refreshStudyDefs = function () {
        DataService.post('data/StudyDef/search', {searchContext: 'StudyEnrollment'}).then(function (result) {

            var items = result.data.items;
            $scope.studyDefs = items;

            if ($scope.studyDefs.length > 0 && !$scope.studyDefId) {
                $scope.studyDefId = $scope.studyDefs[0].id;
                $scope.studyDef = $scope.studyDefs[0];
            }

            if (!$scope.$$phase) {
                $scope.$apply();
            }

        });
    };

    $scope.parentClosed = function (node) {
        var vis = false;
        var parentNode = node.parent;
        while (parentNode != null) {
            if (parentNode.isClosed == true) {
                vis = true;
                parentNode = null;
            } else {
                parentNode = parentNode.parent;
            }
        }
        return vis;
    };

    $scope.refreshStudyDefs();

    $scope.toggleFolder = function (item, $event) {

        item.isClosed = !item.isClosed;
        $event.preventDefault();
        $event.stopPropagation();

        angular.forEach($scope.outline, function (node) {
            node.hide = $scope.parentClosed(node);
        });
    };

    $scope.getFolderIcon = function (item) {
        var result = ThemeService.tableIcon;
        if (item.items && item.numberOfChildren > 0) {
            if (item.isClosed) {
                result = ThemeService.folderCloseIcon;
            } else {
                result = ThemeService.folderOpenIcon;
            }
        }
        return result;
    };

    $scope.getIndent = function (item) {
        return {"padding-left": item.level * 20 + 15 + "px", "white-space": "nowrap"};
    };

    $scope.populateItems = function (summary, indentLevel, parent) {
        var result = [];
        if (summary.items) {
            angular.forEach(summary.items, function (item) {
                var newLevel = indentLevel;
                var isParent = false;

                if ((item.dataTypeId == 5 || item.dataTypeId == 10) || item.tableName == 'STUDY_DEF_FORM_DEF') {
                    item.level = indentLevel;
                    item.parent = parent;
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

    $scope.getLookupValue = function (valueSummary) {
        var val = '';
        if (valueSummary && valueSummary.lookupValues) {
            angular.forEach(valueSummary.lookupValues, function (item) {
                if (val.length > 0) {
                    val += ', ';
                }
                val += item.lookupValueName;
                if (item.numberValue) {
                    val += ' (' + item.numberValue + ')';
                }
                if (item.stringValue) {
                    val += ' (' + item.stringValue + ')';
                }
                if (item.otherValue) {
                	val += ' (' + item.otherValue + ')';
                }
            });
        }
        return val;
    };

    $scope.getValue = function (valueSummary, valueDefSummary, item) {
        var val = null;
        if (valueSummary) {
            if (valueDefSummary.defaultWidgetTypeId == 1) {//string
                val = valueSummary.stringValue;
            } else if (valueDefSummary.defaultWidgetTypeId == 2) {//yes/no
                if (valueSummary.boolValue == true) {
                    val = 'Yes';
                } else if (valueSummary.boolValue == false) {
                    val = 'No';
                }
            } else if (valueDefSummary.defaultWidgetTypeId == 3) {//date
                val = valueSummary.dateValue;
            } else if (valueDefSummary.defaultWidgetTypeId == 4) {//number
                val = valueSummary.numberValue;
            } else if (valueDefSummary.defaultWidgetTypeId == 5) {//list
                // to do
            } else if (valueDefSummary.defaultWidgetTypeId == 6) {//sig
                val = {useSignature: true};
                val.id = valueSummary.id;
                val.fileName = valueDefSummary.name;
            } else if (valueDefSummary.defaultWidgetTypeId == 7) {//file
                val = {};
                val.id = valueDefSummary.fileValueId;
                if (!val.id) {
                    val.id = valueSummary.id;
                }
                val.fileName = valueDefSummary.name;
            } else if (valueDefSummary.defaultWidgetTypeId == 8) {//view
                val = {};
                val.id = valueDefSummary.fileValueId;
                if (!val.id) {
                    val.id = valueSummary.id;
                }
                val.fileName = valueDefSummary.name;
            } else if (valueDefSummary.defaultWidgetTypeId == 9) {//lookup
                val = $scope.getLookupValue(valueSummary);
            } else if (valueDefSummary.defaultWidgetTypeId == 10) { //multi-lookup
                val = $scope.getLookupValue(valueSummary);
            } else if (valueDefSummary.defaultWidgetTypeId == 11) { //view & agreee
                val = {};
                val.id = valueDefSummary.fileValueId;
                if (!val.id) {
                    val.id = valueSummary.id;
                }
                val.fileName = valueDefSummary.name;
            } else if (valueDefSummary.defaultWidgetTypeId == 12) {// multi string
                val = valueSummary.stringValue;
            } else if (valueDefSummary.defaultWidgetTypeId == 14) {//view and sign
                val = {useSigned: true};
                val.id = item.formElementId;
                val.fileName = valueDefSummary.name;
            } else if (valueDefSummary.defaultWidgetTypeId == 15) {//desc
                // to do
            } else if (valueDefSummary.defaultWidgetTypeId == 16) {//sub
                // to do
            } else if (valueDefSummary.defaultWidgetTypeId == 17) {//check
                val = valueSummary.boolValue;
            } else if (valueDefSummary.defaultWidgetTypeId == 18) {//date & time
                val = valueSummary.dateValue;
            } else if (valueDefSummary.defaultWidgetTypeId == 19) {//rating
                val = valueSummary.numberValue;
            }
        }
        return val;
    };

    $scope.configureColumn = function (columnDef, valueDefSummary) {
        if (valueDefSummary) {
            if (valueDefSummary.defaultWidgetTypeId == 1) {//string
            } else if (valueDefSummary.defaultWidgetTypeId == 2) {//yes/no
            } else if (valueDefSummary.defaultWidgetTypeId == 3) {//date
                columnDef.cellFilter = 'date';
            } else if (valueDefSummary.defaultWidgetTypeId == 4) {//number
            } else if (valueDefSummary.defaultWidgetTypeId == 5) {//list
            } else if (valueDefSummary.defaultWidgetTypeId == 6) {//sig
                columnDef.cellTemplate = $scope.viewFileTemplate;
            } else if (valueDefSummary.defaultWidgetTypeId == 7) {//file
                columnDef.cellTemplate = $scope.viewFileTemplate;
            } else if (valueDefSummary.defaultWidgetTypeId == 8) {//view
                columnDef.cellTemplate = $scope.viewFileTemplate;
            } else if (valueDefSummary.defaultWidgetTypeId == 9) {//lookup
            } else if (valueDefSummary.defaultWidgetTypeId == 10) { //multi-lookup
            } else if (valueDefSummary.defaultWidgetTypeId == 11) { //view & agreee
                columnDef.cellTemplate = $scope.viewFileTemplate;
            } else if (valueDefSummary.defaultWidgetTypeId == 12) {// multi string
            } else if (valueDefSummary.defaultWidgetTypeId == 14) {//view and sign
                columnDef.cellTemplate = $scope.viewFileTemplate;
            } else if (valueDefSummary.defaultWidgetTypeId == 15) {//desc
            } else if (valueDefSummary.defaultWidgetTypeId == 16) {//sub
            } else if (valueDefSummary.defaultWidgetTypeId == 17) {//check
                columnDef.cellTemplate = $scope.cbTemplate;
            } else if (valueDefSummary.defaultWidgetTypeId == 18) {//date & time
                columnDef.cellFilter = 'date:"short"';
            } else if (valueDefSummary.defaultWidgetTypeId == 19) {//rating
            }
        }
    };

    $scope.outlineItemSelected = function (item, $event) {
        var t = $event.originalEvent.target;
        if (t != null && t.tagName == 'I') {
            $scope.toggleFolder(item, $event);
        } else {
            $scope.studyDefFilters.selectedFilter = null;
            $scope.selectItem(item, $event);
        }
    };

    $scope.selectItem = function (item) {
        $scope.gridOptions.$gridScope.hasUserChangedGridColumnWidths = false;
        $scope.selectedItem = item;
        $scope.columnDefs = [
            {field: 'name', displayName: 'Loading Data...'}
        ];
        $scope.gridData = [];
        $scope.hasData = false;
        $scope.showGraph = false;
        DataService.post('data/DataBrowser/view', {
                studyDefId: item.studyDefId,
                rowId: item.rowId,
                tableName: item.tableName
            }
        ).then(
            function (newItem) {
                $scope.result = newItem.data.item;
                $scope.hasData = true;
                var hasParticipant = false;
                var hasStudyEnrollment = false;

                angular.forEach($scope.result.rows, function (row) {
                    if (row.participantSummary) {
                        hasParticipant = true;
                    }
                    if (row.studyEnrollmentSummary) {
                        hasStudyEnrollment = true;
                    }
                });
                var cols = [];
                if (hasParticipant) {
                    cols.push({field: ('idTag'), displayName: 'EMPI'});
                    cols.push({field: ('participantStudyId'), displayName: 'Participant Study Id'});
                    cols.push({field: ('participantName'), displayName: 'Participant'});
                    cols.push({field: ('studyEnrollmentId'), displayName: 'Study Enrollment ID', visible: false});
                    cols.push({field: ('participantId'), displayName: 'Participant ID', visible: false});
                }

                if (hasStudyEnrollment) {
                    cols.push({field: ('idTag'), displayName: 'EMPI'});
                    cols.push({field: ('firstName'), displayName: 'First Name'});
                    cols.push({field: ('lastName'), displayName: 'Last Name'});
                    cols.push({field: ('id'), displayName: 'Study Enrollment ID', visible: true});
                    cols.push({field: ('participantId'), displayName: 'Participant ID', visible: true});
                    cols.push({field: ('email'), displayName: 'Email'});
                    cols.push({field: ('dateOfBirth'), displayName: 'Date Of Birth', cellFilter: 'date:short'});
                    cols.push({field: ('ldapId'), displayName: 'LDAP ID'});
                    cols.push({field: ('studyEnrollmentStatus'), displayName: 'Enrollment Status'});
                    cols.push({field: ('participantStudyId'), displayName: 'Participant Study ID'});
                    cols.push({field: ('secondaryStudyId'), displayName: 'Secondary Study ID'});
                    cols.push({field: ('dateAdded'), displayName: 'Date Added', cellFilter: 'date'});
                }

                var valueDefs = {};
                angular.forEach($scope.result.columns, function (valueDef) {
                    valueDefs[valueDef.id] = valueDef;
                    var colName = valueDef.variableName || valueDef.name;
                    var def = {field: ('id_' + valueDef.id), displayName: colName};
                    $scope.configureColumn(def, valueDef);
                    cols.push(def);
                });


                if ($scope.studyDefFilters.selectedFilter) {
                    angular.forEach(cols, function (col) {
                        col.visible = false;
                        angular.forEach($scope.studyDefFilters.selectedFilter.columns, function (colData) {
                            var colName = col.field;
                            if (colName.indexOf('id_') == 0) {
                                colName = colName.substr(3);
                            }
                            if (colName == colData.id && colData.visible) {
                                col.visible = true;
                            }
                        });
                    });
                }


                $scope.columnDefs = cols;

                // get row
                var rows = [];
                angular.forEach($scope.result.rows, function (row) {
                    var item = {};
                    if (row.participantSummary) {
                        item.participantName = row.participantSummary.lastName? row.participantSummary.lastName:'';
                        if(row.participantSummary.firstName){
                            if(item.participantName.length>0){
                                item.participantName+= ', ';
                            }
                            item.participantName+= row.participantSummary.firstName;
                        }

                        item.idTag = row.participantSummary.idTag;
                        item.studyEnrollmentId = row.participantSummary.enrollments[0].id;
                        item.participantId = row.participantSummary.id;
                    }
                    if (row.studyEnrollmentSummary) {
                        var r = row.studyEnrollmentSummary;
                        r.participantSummary = r.participantSummary || {};
                        item.id = r.id;
                        item.firstName = r.participantSummary.firstName;
                        item.lastName = r.participantSummary.lastName;
                        item.idTag = r.participantSummary.idTag;
                        item.studyEnrollmentId = r.studyEnrollmentId;
                        item.participantId = r.participantSummary.id;
                        item.dateOfBirth = r.participantSummary.dateOfBirth;
                        item.email = r.participantSummary.email;
                        item.ldapId = r.participantSummary.ldapId;
                        item.dateAdded = r.dateAdded;
                        item.participantStudyId = r.participantStudyId;
                        item.secondaryStudyId = r.secondaryStudyId;
                        if (r.studyEnrollmentStatusSummary) {
                            item.studyEnrollmentStatus = r.studyEnrollmentStatusSummary.objectStateTypeSummary.name;
                        }
                    }
                    angular.forEach(row.columns, function (col) {
                        var def = valueDefs[col.valueDefId];
                        if (def) {
                            var val = $scope.getValue(col.valueSummary, def, col);
                            item['id_' + col.valueDefId] = val;
                        }
                    });
                    rows.push(item);

                });
                $scope.gridData = rows;
            },
            function (error) {
            }
        );
    };

    $scope.plotGraph = function (columnToPlot) {
        $scope.columnToPlot = columnToPlot;
        var values = {};
        angular.forEach($scope.result.rows, function (row) {
            angular.forEach(row.columns, function (column) {
                if (column.valueDefId == columnToPlot.id) {
                    if (values[$scope.getValue(column.valueSummary, columnToPlot, column)] > 0) {
                        values[$scope.getValue(column.valueSummary, columnToPlot, column)]++;
                    } else
                        values[$scope.getValue(column.valueSummary, columnToPlot, column)] = 1;
                }
            });

        });
        var data = [];
        var categories = [];
        angular.forEach(values, function (value, key) {
            data.push([key, value]);
            categories.push(key);
        });
        $scope.chartConfig.title = {
            text: columnToPlot.name
        };
        $scope.chartConfig.xAxis = {
            categories: categories
        };
        $scope.chartConfig.series = [
            {
                name: columnToPlot.name,
                data: data
            }
        ];
    };

    $scope.compareColumn = function (columnToCompare) {
        var values = {};
        angular.forEach($scope.result.rows, function (row) {
            angular.forEach(row.columns, function (column) {
                if (column.valueDefId == columnToCompare.id) {
                    if (values[$scope.getValue(column.valueSummary, columnToCompare, column)] > 0) {
                        values[$scope.getValue(column.valueSummary, columnToCompare, column)]++;
                    } else
                        values[$scope.getValue(column.valueSummary, columnToCompare, column)] = 1;
                }
            });
        });
        var existingCategories = [];
        var normalizedData = [];
        angular.forEach(values, function (value, key) {
            if ($scope.chartConfig.xAxis.categories.indexOf(key) != -1) {
                var existingData = [key, value];
                existingData[0] = $.inArray(existingData[0], $scope.chartConfig.xAxis.categories);
                existingCategories.push(existingData[0]);
                normalizedData.push(existingData);
            }
        });
        for (var i = 0; i < $scope.chartConfig.xAxis.categories.length; i++) {
            if ($.inArray($scope.chartConfig.xAxis.categories[i], existingCategories) == -1) {
                normalizedData.push([$scope.chartConfig.xAxis.categories[i], 0]);
            }
        }
        $scope.chartConfig.series[1] = {
            name: columnToCompare.name,
            data: normalizedData
        };
        $scope.chartConfig.options.legend.enabled = true;
        $scope.chartConfig.title.text = 'Comparing data with same data type';
    };

    $scope.plotScatter = function (columnForX, columnForY) {
        var data = [];
        angular.forEach($scope.result.rows, function (row) {
            var x, y = null;
            angular.forEach(row.columns, function (column) {
                if (column.valueDefId == columnForX.id)
                    x = $scope.getValue(column.valueSummary, columnForX, column);
                if (column.valueDefId == columnForY.id)
                    y = $scope.getValue(column.valueSummary, columnForY, column);
            });
            data.push([x, y]);
        });

        $scope.chartConfig.title = {
            text: columnForX.name + ' Versus ' + columnForY.name
        };
        $scope.chartConfig.xAxis = {
            title: {
                text: columnForX.name
            },
            endOnTick: true
        };
        $scope.chartConfig.yAxis = {
            title: {
                text: columnForY.name
            }
        };
        $scope.chartConfig.options.plotOptions = {
            scatter: {
                marker: {
                    radius: 5
                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '<span style="color:{series.color}">' + columnForX.name + '</span>: <b>{point.x}</b><br/>' + '<span style="color:{series.color}">' + columnForY.name + '</span>: <b>{point.y}</b>'
                }
            }
        };
        $scope.chartConfig.series = [
            {
                data: data
            }
        ];
    };

    $scope.filterValidWidgetType = function (item) {
        var ValidWidgetType = [1, 2, 3, 4, 5, 9, 12, 13, 14, 15, 16, 17, 18, 19];
        if (ValidWidgetType.indexOf(item.defaultWidgetTypeId) != -1) {
            return true;
        }
    };

    $scope.filterSameWidgetType = function (item) {
        if ($scope.columnToPlot) {
            if ($scope.columnToPlot.defaultWidgetTypeId == item.defaultWidgetTypeId && $scope.columnToPlot.id != item.id) {
                return true;
            }
        }
    };


    $scope.selectFilter = function (item, $event) {
        if($event){
            $event.preventDefault();
        }

        var parts = item.form.split('_');
        var temp = {
            studyDefId: $scope.studyDefId,
            tableName: parts.slice(0, parts.length - 1).join('_'),
            rowId: parts[parts.length - 1]
        };
        var newItem = null;
        angular.forEach($scope.outline, function (outlineItem) {
            if (outlineItem.tableName == temp.tableName && outlineItem.rowId == temp.rowId) {
                newItem = outlineItem;
                return;
            }
        });
        $scope.studyDefFilters.selectedFilter = item;
        $scope.selectItem(newItem);

        DataService.post('data/UserSetting/update', {
                id: $scope.studyDefFilters.id,
                settingKey: $scope.studyDefId,
                name: 'STUDY_DEF_FILTERS',
                settingValue: angular.toJson($scope.studyDefFilters)
            }
        ).then(function (newItem) {
                $scope.studyDefFilters.id = newItem.data.item.id;
            });
    };

    $scope.canExport = function () {
        return !$scope.processing && $scope.hasData == true;
    };

    $scope.hasOutline = function () {
        return $scope.studyDefId != null;
    }


    $scope.$watch('studyDefId', function (newValue, oldValue) {
        if (newValue != null) {
            $scope.outline = [];
            $scope.loadingOutline = true;
            $scope.columnDefs = [
                {field: 'name', displayName: ' '}
            ];
            $scope.gridData = [];

            DataService.post('data/StudyOutline/view', {
                    studyDefId: $scope.studyDefId
                }
            ).then(
                function (newItem) {
                    $scope.outline = $scope.populateItems(newItem.data.item, 0);
                    $scope.outline.unshift({
                        caption: 'Enrollments',
                        studyDefId: $scope.studyDefId,
                        items: [],
                        level: 0,
                        numberOfChildren: 0,
                        rowId: 0,
                        tableName: 'STUDY_ENROLLMENT'
                    });
                    $scope.loadingOutline = false;
                    if ($scope.outline.length > 0) {

                        $scope.selectItem($scope.outline[0]);
                    }
                },
                function (error) {
                    $scope.loadingOutline = false;
                    $scope.studyDefId = null;
                    if ($scope.studyDefs.length > 0) {
                        $scope.studyDefId = $scope.studyDefs[0].id;
                    }
                }
            ).then(function () {
                    DataService.post('data/UserSetting/view', {
                            settingKey: $scope.studyDefId,
                            name: 'STUDY_DEF_FILTERS'
                        }
                    ).then(function (newItem) {
                            var settingValue = newItem.data.item ? newItem.data.item.settingValue : null;
                            var defFilter = null;
                            try {
                                if (settingValue) {
                                    defFilter = angular.fromJson(settingValue);
                                }
                            } catch (x) {
                            }

                            $scope.studyDefFilters = defFilter || {filters: []};


                            if ($scope.studyDefFilters.selectedFilter) {
                                var parts = $scope.studyDefFilters.selectedFilter.form.split('_');
                                var temp = {
                                    studyDefId: $scope.studyDefId,
                                    tableName: parts.slice(0, parts.length - 1).join('_'),
                                    rowId: parts[parts.length - 1]
                                };

                                var newItem = null;
                                angular.forEach($scope.outline, function (outlineItem) {
                                    if (outlineItem.tableName == temp.tableName && outlineItem.rowId == temp.rowId) {
                                        newItem = outlineItem;
                                        return;
                                    }
                                });

                                if (newItem) {
                                    $scope.selectItem(newItem);
                                }
                            }

                        });
                });
        }
    });

    $scope.chartConfig = {
        options: {
            chart: {
                type: ''
            },
            legend: {
                enabled: false
            }
        },
        credits: {
            enabled: false
        },
        title: {
            text: ''
        },
        yAxis: {
            title: {
                text: '# of occurrences'
            }
        }
    };

    $scope.openDetails = function () {
        $cookieStore.put('studyEnrollmentId-' + $scope.selectedItems[0].studyEnrollmentId, $scope.selectedItem.rowId);
        $state.transitionTo('studyEnrollmentDetail', {studyDefId: $scope.studyDefId, studyEnrollmentId: $scope.selectedItems[0].studyEnrollmentId, studyDefFormDefId: 0, participantId: $scope.selectedItems[0].participantId});
    };
}]);