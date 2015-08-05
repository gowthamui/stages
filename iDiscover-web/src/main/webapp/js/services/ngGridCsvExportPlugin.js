myApp.factory('ngGridCsvExportPlugin', [ '$filter', function ($filter) {
    var service = {};

    service.csvPlugin = function (opts,parentScope) {
        var self = this;
        self.grid = null;
        self.scope = null;
        self.services = null;

        self.init = function (scope, grid, services) {
            self.grid = grid;
            self.scope = scope;
            self.services = services;
            self.dateFilter=$filter('date');

            function showDs() {
                var keys = [];
                var headers=[];

                for (var f in grid.config.columnDefs) {
                    if (grid.config.columnDefs.hasOwnProperty(f)) {
                        keys.push(grid.config.columnDefs[f]);
                        headers.push(grid.config.columnDefs[f].displayName);
                    }
                }
                var csvData = '';

                function csvStringify(str,filter) {

                    if (str == null) { // we want to catch anything null-ish, hence just == not ===
                        return '';
                    }

                    if(filter && filter.indexOf('date')==0) {
                        var tempDate=new Date(str);
                        if (tempDate!='Invalid Date') {
                            return self.dateFilter(tempDate, 'yyyy-MM-dd HH:mm:ss')
                        }
                    }

                    if (typeof(str) === 'number') {
                        return '' + str;
                    }
                    if (typeof(str) === 'boolean') {
                        return (str ? 'TRUE' : 'FALSE');
                    }


                    if (typeof(str) === 'string') {
                        return str.replace(/"/g, '""');
                    }


                    return JSON.stringify(str).replace(/"/g, '""');
                }

                function swapLastCommaForNewline(str) {
                    var newStr = str.substr(0, str.length - 1);
                    return newStr + "\n";
                }

                for (var k in headers) {
                    csvData += '"' + csvStringify(headers[k],'string') + '",';
                }
                csvData = swapLastCommaForNewline(csvData);
                var gridData = grid.data;
                for (var gridRow in gridData) {
                    angular.forEach(keys,function(k){
                        var curCellRaw;

                        if (opts != null && opts.columnOverrides != null && opts.columnOverrides[k.field] != null) {
                            curCellRaw = opts.columnOverrides[keys[k]](
                                self.services.UtilityService.evalProperty(gridData[gridRow], k.field));
                        } else {
                            curCellRaw = self.services.UtilityService.evalProperty(gridData[gridRow], k.field);
                        }

                        csvData += '"' + csvStringify(curCellRaw, k.cellFilter) + '",';
                    });


                    csvData = swapLastCommaForNewline(csvData);
                }
                parentScope.exportUrl = encodeURIComponent(csvData);
                parentScope.exportData = csvData;

            }

            setTimeout(showDs, 0);
            scope.catHashKeys = function () {
                var hash = '';
                for (var idx in scope.renderedRows) {
                    hash += scope.renderedRows[idx].$$hashKey;
                }
                return hash;
            };
            if (opts && opts.customDataWatcher) {
                scope.$watch(opts.customDataWatcher, showDs);
            } else {
                scope.$watch(scope.catHashKeys, showDs);
            }
        };
    }
    return service;
}]
);
