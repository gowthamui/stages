myApp.controller('ParticipantSearchCtrl', ['$scope', 'DataService', 'ThemeService', '$modalInstance', 'participant','$http', function ($scope, DataService, ThemeService, $modalInstance, participant,$http) {
    $scope.title = 'Search for Participant';
    $scope.selectedItems = [];
    $scope.gridData = [];
    $scope.alerts = [];
    $scope.form = {};
    $scope.processing = false;
    $scope.errorMessage = null;
    $scope.searchIcon = ThemeService.searchIcon;

    participant = participant || {};
    $scope.item = {
        idTag: participant.idTag,
        firstName: participant.firstName,
        lastName: participant.lastName
    }

    $scope.gridOptions = {
        data: 'gridData',
        displayFooter: false,
        displaySelectionCheckbox: false,
        multiSelect: false,
        enableRowReordering: false,
        showColumnMenu: false,
        enableSorting: true,
        showFilter: true,
        selectedItems: $scope.selectedItems,
        columnDefs: [
            {field: 'empi', displayName: 'EMPI', width: '100'},
            {field: 'firstName', displayName: 'First Name'},
            {field: 'middleName', displayName: 'Middle Name'},
            {field: 'lastName', displayName: 'Last Name'},
            {field: 'gender', displayName: 'Gender', width: '70'},
            {field: 'dateOfBirth', width: '100', displayName: 'Date of Birth', cellFilter: "date:'shortDate'"}
        ],
        enableSorting: true
    };

    $scope.canSelect = function () {
        return $scope.selectedItems.length > 0;
    }

    $scope.close = function () {
        $modalInstance.close();
    }

    $scope.clear = function () {
        $scope.item.idTag = null;
        $scope.item.firstName = null;
        $scope.item.lastName = null;
    }

    $scope.select = function () {
        var result = null;
        if ($scope.selectedItems.length > 0) {
            result = $scope.selectedItems[0];
        }
        $modalInstance.close(result);
    }

    $scope.search = function () {

        $scope.alerts = [];
        $scope.errorMessage = null;
        $scope.gridData = [];
        var searchItem = angular.copy($scope.item, {});
        searchItem.empi = $scope.item.idTag;

        if (!searchItem.empi) {
            var errorMessage="";
            if (!$scope.item.firstName || $scope.item.firstName.trim().length<2) {
                errorMessage+="First Name must have at least two characters.  ";
            }
            if (!$scope.item.lastName || $scope.item.lastName.trim().length<2) {
                errorMessage+="Last Name must have at least two characters.  ";
            }
            if(errorMessage.length>0){
                $scope.alerts.push({type: 'error', msg: errorMessage});
            }
        }

        if ($scope.alerts.length == 0) {
            $scope.processing = true;
            $http.post('saml/initiate', searchItem).success(function (result) {
                $scope.processing = false;

                $scope.gridData = result.items || [];
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
                if ($scope.gridData.length == 0) {
                    $scope.alerts.push({type: 'error', msg: "No Participants Found."});
                }

            }).error(function (item) {
                $scope.processing = false;
                $scope.alerts.push({type: 'error', msg: "Error:" + item});
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        }
    }

    if (($scope.item.idTag && $scope.item.idTag.length > 0) || ($scope.item.firstName && $scope.item.firstName.length > 0) || ($scope.item.lastName && $scope.item.lastName.length > 0)) {
        $scope.search();
    }
}]);