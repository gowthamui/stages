myApp.controller('ImportDataCtrl', ['$scope', '$rootScope', 'DataService', '$stateParams', '$filter', '$cookieStore', '$cookies', '$log', function ($scope, $rootScope, DataService, $stateParams, $filter, $cookieStore, $cookies, $log) {
    $scope.title = 'Import Data';
    $scope.studyDefs = [];
    $scope.studyDefId = null;
    $scope.selectedFile = {};
    $scope.mimeType;
    $scope.bytes;
    $scope.fileName;
    $scope.columns = [];
    $scope.availableColumns = [];
    $scope.participantColumns = [];
    $scope.alerts = [];
    $scope.form = {};
    $scope.selectableDataTypes = [1, 2, 3, 4, 8];
    $scope.mapEMPI = true;

    $scope.noMappingId = '-- No Mapping --';
    $scope.participantIdTag = null;
    $scope.facilityId = null;
    $scope.participantStatusId= $scope.noMappingId;
    $scope.participantStudyId = $scope.noMappingId;
    $scope.secondaryStudyId = $scope.noMappingId;
    $scope.participantFirstName = $scope.noMappingId;
    $scope.participantMiddleName = $scope.noMappingId;
    $scope.participantLastName = $scope.noMappingId;
    $scope.participantDateOfBirth = $scope.noMappingId;
    $scope.participantEmail = $scope.noMappingId;
    $scope.accountNumber = null;
    $scope.mapViaAccountNumber = false;
    $scope.studyStatuses = [];
    $scope.newColumn = null;
    $scope.rows = [];
    $scope.completedRows = [];
    $scope.originalRows = [];
    $scope.mappingName = '';
    $scope.selectedMapping = null;


    $scope.availableMappings = function () {
        var keys = Object.keys($cookies);
        var results = [];
        angular.forEach(keys, function (key) {
            // convert old cookie based mappings
            if (key.indexOf('importData_') == 0) {
                if(!localStorage.getItem(key)){
                    localStorage.setItem(key, JSON.stringify($cookieStore.get(key)));
                }
            }

        });
        for ( var i = 0, len = localStorage.length; i < len; ++i ) {
            var key = localStorage.key(i);
            if (key.indexOf('importData_') == 0) {
                results.push({id: key, name: key.substr('importData_'.length)});
            }
        }
        return results;
    }

    $scope.saveMapping = function () {
        localStorage.setItem('importData_' + $scope.mappingName, JSON.stringify($scope.columns));
    }

    $scope.loadMapping = function () {

        var mapping = null;
        angular.forEach($scope.availableMappings(), function (item) {
            if (item.name == $scope.selectedMapping) {
                mapping = item;
                return;
            }
        });

        if (mapping) {
            var item = localStorage.getItem(mapping.id);
            try {
                item =JSON.parse(item);
                if (angular.isArray(item)) {
                    $scope.columns = item;
                }
            }catch (x){}
            $scope.mappingName = mapping.name;
        }
    }


    $scope.getNumberOfRecords = function () {
        if ($scope.rows && $scope.rows.length > 0) {
            return '(' + $scope.rows.length + ' records)';
        } else {
            return '';
        }

    }

    $scope.refreshStudyDefs = function () {
        DataService.post('data/StudyDef/search', {searchContext: 'StudyEnrollment', objectStateSummary: {objectStateTypeSummary: {id: 9}}}).then(function (result) {
            $scope.studyDefs = result.data.items;

            if ($scope.studyDefs.length > 0 && !$scope.studyDefId) {
                $scope.studyDefId = $scope.studyDefs[0].id;
            }

            if (!$scope.$$phase) {
                $scope.$apply();
            }

        });
    }

    $scope.getChildren = function (items, parentId) {
        var results = [];
        angular.forEach(items, function (item) {
            if (item.parentId == parentId) {
                if (parentId) {
                    item.name = ' -- ' + item.name;
                }
                results.push(item);
                var tmp = $scope.getChildren(items, item.id);
                angular.forEach(tmp, function (tmpItem) {
                    results.push(tmpItem);
                });
            }
        });
        return results;
    }

    DataService.post('data/ObjectStateType/search', {tableName: 'STUDY_ENROLLMENT'}).then(function (result) {
        var results = [];
        var tmp = $filter('orderBy')(result.data.items, 'name');

        $scope.studyStatuses = $scope.getChildren(tmp, null);
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });

    $scope.clearFileElement = function ($event) {
        $scope.mimeType = null;
        $scope.bytes = null;
        $scope.fileName = null;
        $scope.selectedFile = {};
        var e = $($event.currentTarget);
    }

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.cancelImport = function () {
        $scope.processing = false;
        $scope.rows.length =0;
    }

    $scope.clearItem = function (col) {
        col.selectedItem = null;
        col.mappedValue = null;
        col.dateFormat = null;
    };

    $scope.eraseVisible = function (col) {
        return {
            visibility: col.selectedItem ? 'visible' : 'hidden'
        };
    };

    $scope.importData = function () {
        var meta = {
            participantStatusId: $scope.participantStatusId != $scope.noMappingId ? $scope.participantStatusId : null,
            accountNumber: $scope.accountNumber,
            studyDefId: $scope.studyDefId,
            mimeType: $scope.mimeType,
            fileName: $scope.fileName,
            facilityId: $scope.facilityId,
            participantIdTag: $scope.participantIdTag != $scope.noMappingId ? $scope.participantIdTag : null,
            participantStudyId: $scope.participantStudyId != $scope.noMappingId ? $scope.participantStudyId : null,
            secondaryStudyId: $scope.secondaryStudyId != $scope.noMappingId ? $scope.secondaryStudyId : null,
            participantFirstName: $scope.participantFirstName != $scope.noMappingId ? $scope.participantFirstName : null,
            participantMiddleName: $scope.participantMiddleName != $scope.noMappingId ? $scope.participantMiddleName : null,
            participantLastName: $scope.participantLastName != $scope.noMappingId ? $scope.participantLastName : null,
            participantDateOfBirth: $scope.participantDateOfBirth != $scope.noMappingId ? $scope.participantDateOfBirth : null,
            participantEmail: $scope.participantEmail != $scope.noMappingId ? $scope.participantEmail : null,
            mapViaAccountNumber: $scope.mapViaAccountNumber,
            mapEMPI: $scope.mapEMPI,
            columnMappings: [],
            headers: $scope.headers
        }

        $scope.rows = $scope.originalRows.slice();

        angular.forEach($scope.columns, function (col) {
            if (col.selectedItem) {
                meta.columnMappings.push({
                    columnName: col.columnName,
                    formDefElementId: col.selectedItem.tarFormDefElementId,
                    mappedValue: col.mappedValue,
                    dateFormat: col.dateFormat,
                    conditionValue: col.conditionValue,
                    conditionColumn: col.conditionColumn
                });
            }
        });

        $scope.completedRows = [];
        $scope.processRow(meta);
    }

    $scope.processRow = function (meta) {
        $scope.completionStatus = $scope.completedRows.length + ' complete.  ' + $scope.rows.length + ' remaining';
        if ($scope.rows.length > 0) {
            $scope.processing = true;

            var data = angular.copy(meta);
            var row = $scope.rows[0];
            data.rows = [row];
            $scope.rows.splice(0, 1);

            DataService.post('data/ImportFile/update', data).then(function (result) {
                $scope.completedRows.push({
                    row: row,
                    hasError: result.data ? result.data.hasError : true,
                    errorMessage: result.data.errorMessage
                });

                $scope.processRow(meta);
            });
        }else{
            $scope.processing = false;
        }

    }

    $scope.selectedFileChangedDelegate = function () {

        if ($scope.selectedFile.fileRef)
            $scope.fileName = $scope.selectedFile.fileRef.name;

        $scope.processing = true;
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.mimeType = e.target.result.substr(5, e.target.result.indexOf(';') - 5);
            $scope.bytes = e.target.result.substr(e.target.result.indexOf('base64,') + 7);

            DataService.post('data/CSV/view', {
                mimeType: $scope.mimeType,
                fileName: $scope.fileName,
                bytes: $scope.bytes
            }).then(function (result) {
                console.log(result.data.item);
                if (result.data.item) {
                    $scope.headers = [];
                    $scope.columns = [];
                    $scope.availableColumns = [];
                    $scope.participantColumns = [
                        {columnName: $scope.noMappingId},
                        {columnName: 'Auto Populate'}
                    ];
                    $scope.originalRows = result.data.item.rows.slice();
                    $scope.rows = result.data.item.rows;
                    angular.forEach(result.data.item.columns, function (item) {
                        $scope.headers.push(item);
                        $scope.columns.push({
                            columnName: item,
                            formDefElementId: null,
                            formDefElement: null,
                            mappedValue: null
                        });


                        $scope.participantColumns.push({
                            columnName: item
                        });
                        $scope.availableColumns.push({
                            columnName: item
                        });

                    });
                }
                $scope.processing = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }, function (err) {
                $scope.processing = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });

            $scope.processing = false;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };
        reader.onerror = function (theFile) {
            console.log('Error');
            $scope.processing = false;
        };
        reader.readAsDataURL($scope.selectedFile.fileRef);

        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }

    $scope.removeColumn = function (col) {
        var index = $scope.columns.indexOf(col);
        $scope.columns.splice(index, 1);
    }

    $scope.addColumn = function () {
        var c = {
            columnName: $scope.newColumn
        };
        $scope.columns.push(c);
    }

    $scope.isValid = function () {

        var selectedColumns = 0;
        angular.forEach($scope.columns, function (col) {
            if (col.selectedItem) {
                selectedColumns++;
            }
        });
        return ($scope.mapEMPI == true && ($scope.participantIdTag || ($scope.accountNumber && $scope.facilityId)) || ($scope.mapEMPI == false && $scope.participantStudyId))
            && $scope.studyDefId > 0;
    }
    $scope.refreshStudyDefs();

    $scope.clearResults = function () {
        $scope.rows = $scope.originalRows.slice();
        $scope.completedRows = [];
    }
}]);