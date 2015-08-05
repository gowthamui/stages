myApp.controller('SurveyFormCtrl', ['$scope','$state','$log','DataService','$rootScope','$stateParams','NotificationService','MetadataService','ThemeService', function ($scope,$state,$log,DataService,$rootScope,$stateParams,NotificationService,MetadataService,ThemeService) {

    $scope.invalidState=false;
    $scope.metadataService=MetadataService;
    $scope.data={
        link:$stateParams.link,
        studyDefFormDefId:$stateParams.studyDefFormDefId
    };
    $log.log('$stateParams %o',$stateParams);

    $scope.$on(NotificationService.modifiedElements, function(event, modifiedValues) {
        angular.forEach(modifiedValues,function(item){

            angular.forEach($scope.data.elements,function(formElement){
                if(formElement.id==item.id){
                    // show hide
                    formElement.isDisabled=item.isDisabled;
                    if([1,3].indexOf(formElement.elementSummary.elementTypeId)>=0 || $scope.isSubForm(formElement)){
                        // close/open if header
                        if(item.isDisabled){
                            formElement.elementSummary.isOpen = false;
                            $scope.toggleChildren(formElement,true);
                        }else{
                            formElement.elementSummary.isOpen = true;
                            $scope.toggleChildren(formElement,false);
                        }
                    }
                    // sync value
                    MetadataService.syncValueSummary(formElement,'currentValueSummary',item.currentValueSummary);
                }
            });



        });
    });

    var orderItems = function (items, parentId, parentHierarchy) {
        var kids = [];
        var result = [];
        angular.forEach(items, function (value, key) {
            value.currentValueSummary=value.currentValueSummary || {};
            if ((!parentId && !value.elementSummary.parentElementId) || (value.elementSummary.parentElementId == parentId)) {
                kids.push(value);
            }
        });
        kids.sort(function (a, b) {
            return a.displaySeq - b.displaySeq;
        });
        angular.forEach(kids, function (value, key) {

            // check to see if item is open
            if([1,3].indexOf(value.elementSummary.elementTypeId)>=0){
                value.elementSummary.isOpen=true;
            }
            result.push(value);
            value.hierarchy = parentHierarchy ? parentHierarchy : '';
            value.hierarchy += '.' + value.elementSummary.id;
            var myKids = orderItems(items, value.elementSummary.id, value.hierarchy);
            angular.forEach(myKids, function (kidVal) {
                result.push(kidVal);
            });
        });
        return result;
    };


    $scope.isCalculatedValue=function(element){
        var result=false;
        if(element.elementSummary && element.elementSummary.valueDefSummary && element.elementSummary.valueDefSummary.isCalculatedValue==true){
            result=true;
        }
        return result;
    }

    $scope.formattedValue=function(el){
        var result = null;
        if(el){
            var v= MetadataService.currentValue(el.currentValueSummary,el.elementSummary.valueDefSummary);
            result=v.formattedValue;
        }
        return result;
    }

    $scope.openCloseRow = function(element, openRow,callback){
        if([1,3].indexOf(element.elementSummary.elementTypeId)>=0){
            element.elementSummary.isOpen = openRow;
            $scope.toggleChildren(element,!openRow);
            if(callback){
                callback();
            }
        }
        else if (element.elementSummary.valueDefSummary.defaultWidgetTypeId == 16) {     // subform
            if (openRow) {
                element.elementSummary.isOpen = true;
                if (element.elementSummary.isOpen && !element.isLoaded) {
                    element.isLoaded = true;
                    element.isLoading = true;

                    var formId = 0;
                    if (element.currentValueSummary.formId > 0) {
                        formId = element.currentValueSummary.formId;
                    }

                    var subFormRequest ={formId: formId, formDefId: element.elementSummary.valueDefSummary.formDefId, valueSummary: element.currentValueSummary};
                    if(!element.isListItem){
                        subFormRequest.formElementId=element.id;
                    }else{
                        subFormRequest.valueListItemId=element.id;
                    }
                    DataService.post('data/SubFormDetail/view', subFormRequest).then(
                        function (newItem) {
                            element.isLoading = false;
                            var index = $scope.data.elements.indexOf(element);
                            var orderedItems = orderItems(newItem.data.item.elements);

                            angular.forEach(orderedItems,function(item){
                                item.subForm = element;
                                item.hierarchy=element.hierarchy+item.hierarchy;

                                $scope.data.elements.splice(index+1, 0, item);
                                index++;
                            });

                            $scope.hideDisabled();
                            if(callback){
                                callback();
                            }
                        },
                        function (error) {
                            element.isLoading = false;
                            if(callback){
                                callback();
                            }
                        }
                    );
                }else{
                    element.elementSummary.isOpen = true;
                    $scope.toggleChildren(element,false);
                    if(callback){
                        callback();
                    }
                }
            }else{
                element.elementSummary.isOpen = false;
                $scope.toggleChildren(element,true);
                if(callback){
                    callback();
                }
            }
        }else if (element.elementSummary.valueDefSummary.defaultWidgetTypeId == 5) {
            if (openRow) {
                element.elementSummary.isOpen = true;
                if (element.elementSummary.isOpen && !element.isLoaded) {
                    element.isLoaded = true;
                    element.isLoading = true;
                    if(!element.currentValueSummary.listValue){
                        element.isLoading = false;
                    }else{
                        DataService.post('data/ValueList/view',element.currentValueSummary.listValue).then(function(newItem){
                            element.isLoading=false;
                            var listItems = newItem.data.item.listItems;
                            angular.forEach(listItems,function(item,index){
                                item.displaySeq=index;
                            });
                            $scope.addListItems(listItems,element);

                        },function(data, status, headers, config){
                            console.log('error %o',arguments);
                        });
                    }
                    if(callback){
                        callback();
                    }
                }else{
                    element.elementSummary.isOpen = true;
                    $scope.toggleChildren(element,false);
                }
                if(callback){
                    callback();
                }
            }else{
                element.elementSummary.isOpen = false;
                $scope.toggleChildren(element,true);
                if(callback){
                    callback();
                }
            }
        }
    }

    $scope.getLevels=function(hierarchy){
        var count = 0;
        var levels = hierarchy.split('.');
        angular.forEach(levels,function(item){
            if(item && item.length>0){
                count++;
            }
        });
        return count;
    }

    $scope.getIndent = function (item) {
        var levels = 0;
        if(item.hierarchy){
            levels = $scope.getLevels(item.hierarchy);
        }
        return {
            "margin-left": levels * ThemeService.indentPixels + 'px'
        }
    }

    $scope.isHeader=function(element){
        var typeId=element.elementSummary.valueDefSummary.defaultWidgetTypeId;
        return (element.elementTypeId==1 || element.elementTypeId==3 || ((typeId==15 || typeId==16) && element.elementSummary.elementTypeId==2));
    }

    $scope.isSubPage=function(element){
        return (element.elementTypeId==3);
    }

    $scope.getColumnSpan=function(element){
        if($scope.isHeader(element)){
            return 3;
        }else{
            return 1;
        }
    }

    $scope.initialsModified=function(bytes,el){
        el.currentValueSummary.initials=bytes;
        el.currentValueSummary.updateInitials=true;
        el.currentValueSummary.hasInitials=true;
        $scope.recordAudit(el);
    }

    $scope.needsInitials=function(valueDef){
        return MetadataService.getMetadata(valueDef).requiresUserInitials==true;
    }

    $scope.getRowClass=function(el,index){
        var result=null;

        if($scope.isHeader(el)){
            result='surveyElementHeader';
        }else if($scope.isSubForm(el)){
            result='surveyElementSubForm';
        }else if($scope.isDescription(el)){
            result='surveyElementDescription';
        }else if($scope.isSubPage(el)){
            result='surveyElementSubPage';
        }
        return result;
    }

    $scope.addListItems=function(listItems,element){
        var newElements = [];

        var listValueDefSummary={
            dataTypeId:element.elementSummary.valueDefSummary.listDataTypeId,
            defaultWidgetTypeId:element.elementSummary.valueDefSummary.defaultListWidgetTypeId ,
            formDefId:element.elementSummary.valueDefSummary.formDefId ,
            listCaption:element.elementSummary.valueDefSummary.listCaption,
            name:element.elementSummary.valueDefSummary.name,
            description:element.elementSummary.valueDefSummary.description,
            lookupGroupId:element.elementSummary.valueDefSummary.lookupGroupId,
            lookupGroupSummary:element.elementSummary.valueDefSummary.lookupGroupSummary
        };

        if(listItems){
            angular.forEach(listItems,function(listItem){
                var result='';
                if(listItem.name){
                    result=listItem.name;
                }else if(listValueDefSummary.listCaption){
                    result=listValueDefSummary.listCaption;
                }else{
                    result=listValueDefSummary.name;
                }

                var newEl ={
                    elementSummary:{},
                    elementTypeId:2,
                    id:listItem.id

                };
                angular.copy(listItem,newEl.elementSummary);
                newEl.id=listItem.id;
                newEl.valueListId=listItem.valueListId;
                newEl.currentValueSummary = listItem.currentValueSummary;
                newEl.isListItem=true;
                newEl.elementSummary.elementTypeId=2;
                newEl.elementSummary.valueDefSummary=listValueDefSummary;
                newEl.caption=result;
                newEl.previousValueSummary=listItem.previousValueSummary;
                newEl.itemIsListItem=true;
                newElements.push(newEl);
            });
        }

        var orderedItems = orderItems(newElements);
        var index = $scope.data.elements.indexOf(element);
        var parentH=element.hierarchy;
        while(index+1<$scope.data.elements.length){
            var h=$scope.data.elements[index+1].hierarchy;
            if(h.substr(0,parentH.length)==parentH){
                index++;
            }else{
                break;
            }
        }
        angular.forEach(orderedItems,function(item){
            item.subForm = element;
            item.hierarchy=element.hierarchy+item.hierarchy;
            $scope.data.elements.splice(index+1, 0, item);
            index++;
        });

        $scope.hideDisabled();
    }

    $scope.addListItem=function(element){
        $scope.processing=true;
        var _s=$scope;
        var callback=function(){
            var itemSummary={
                valueListId:element.currentValueSummary.id,
                currentValueSummary:{},
                dataTypeId:element.elementSummary.valueDefSummary.listDataTypeId
            };

            DataService.post('data/ValueListItem/update', itemSummary).then(
                function (newItem) {
                    _s.processing=false;
                    element.currentValueSummary.id=newItem.data.item.valueListId;
                    $scope.addListItems([newItem.data.item],element);
                },
                function (error) {
                    $log.log("unknown error: %o",error);
                    _s.processing=false;
                    if (!_s.$$phase)
                        _s.$apply();
                }
            );

        }

        $scope.updateList(element,callback);


    }

    $scope.deleteListItem=function(element){
        $scope.processing=true;

        var index = $scope.data.elements.indexOf(element);
        var startIndex=index;
        var parentH=element.hierarchy;
        while(index+1<$scope.data.elements.length){
            var h=$scope.data.elements[index+1].hierarchy;
            if(h.substr(0,parentH.length)==parentH){
                index++;
            }else{
                break;
            }
        }
        $scope.data.elements.splice(startIndex, index-startIndex+1);

        DataService.post('data/ValueListItem/delete', element.elementSummary).then(
            function (newItem) {
                $scope.processing=false;

            },
            function (error) {
                $log.log("unknown error: %o",error);
                $scope.processing=false;
                if (!$scope.$$phase)
                    $scope.$apply();
            }
        );

    }

    $scope.isList=function(element){
        return element.elementSummary.valueDefSummary.defaultWidgetTypeId == 5;
    }

    $scope.updateList=function(element,successCallback,errorCallback){
        var itemToEdit = {};
        angular.copy(element,itemToEdit);


        DataService.post('data/FormElement/update',itemToEdit).then(
            function (newItem) {
                if(newItem.data.hasError){
                    $log.log(error);
                }else{
                    if(newItem.data.item.currentValueSummary.dateValue){
                        newItem.data.item.currentValueSummary.dateValue=$scope.parseDate(newItem.data.item.currentValueSummary.dateValue);
                    }
                    element.currentValueSummary=newItem.data.item.currentValueSummary;
                    element.previousValueSummary=newItem.data.item.previousValueSummary;
                }
                if(successCallback){
                    successCallback();
                }
            },
            function (error) {
                $log.log(error);
                if(errorCallback){
                    errorCallback();
                }
            }
        );
    }

    $scope.renameListCaption=function(element,onOff){
        element.isRenamingCaption=onOff;
    }

    $scope.updateListCaption=function(element){
        element.isRenamingCaption=false;
        element.name = element.caption;
        if(element.currentValueSummary){
            if(element.currentValueSummary.dataTypeSummary){
                element.dataTypeId=element.currentValueSummary.dataTypeSummary.id;
            }else if(element.elementSummary.valueDefSummary){
                element.dataTypeId=element.elementSummary.valueDefSummary.dataTypeId;
            }
        }
        DataService.post('data/ValueListItem/update', element).then(
            function (newItem) {
                $scope.processing=false;
            },
            function (error) {
                $log.log("unknown error: %o",error);
                $scope.processing=false;
            }
        );
    }

    $scope.getCaptionClass=function(element){
        var result=null;
        if(element.elementSummary.valueDefSummary.defaultWidgetTypeId==15 && element.elementSummary.elementTypeId==2){
            result='descriptionCaption';
        }
        return result;
    }

    $scope.getRequiredIcon=function() {
        return ThemeService.requiredIcon;
    };

    $scope.isSubForm=function(element){
        var result =false;
        if(element.elementSummary){
            if(element.elementSummary.valueDefSummary){
                result = element.elementSummary.valueDefSummary.dataTypeId==10 && element.elementSummary.isOpen;
            }
        }
        return result;
    }

    $scope.isDescription=function(element){
        var result =false;
        if(element.elementSummary){
            if(element.elementSummary.valueDefSummary){
                result = element.elementSummary.valueDefSummary.defaultWidgetTypeId==15;
            }
        }
        return result;
    }

    $scope.isHidden=function(element){
        return element.hide || element.isDisabled==true;
    }

    $scope.isParentOpen=function(hierarchy,elements){
        var result=true;
        var parts = hierarchy?hierarchy.split('.'):[];
        var currIndex=parts.length-1;
        var tempId;
        var initialFound=false;//ignore initial item
        while(currIndex>=0){
            tempId=parseInt(parts[currIndex]);
            if(tempId>0){
                if(initialFound==true){
                    // find in elements
                    angular.forEach(elements,function(item){
                        if(item.elementSummary){
                            if(item.elementSummary.id==tempId){
                                if(item.elementSummary.isOpen==false){
                                    currIndex=-1;
                                    result=false;
                                }
                            }
                        }
                    });
                }
                initialFound=true;
            }
            currIndex--;
        }
        return result;
    }

    $scope.toggleChildren=function(root,showHide){
        var parentHierarchy= (root.hierarchy || '');//+'.'+root.id;
        angular.forEach($scope.data.elements,function(item){
            var childHierarchy = item.hierarchy || '';
            if(childHierarchy.length>=parentHierarchy.length && item!=root){
                if(childHierarchy.substring(0,parentHierarchy.length)==parentHierarchy){
                    if(showHide){
                        item.hide=true;
                    }else{
                        // check if parent is open
                        item.hide=!$scope.isParentOpen(item.hierarchy,$scope.data.elements);

                    }
                }
            }
        });
    }

    $scope.canToggle=function(element){
        var result = true;
        if(element.currentValueSummary)
            result = element.currentValueSummary.valueNoteId!=1;
        if(result)
            result =element.elementSummary.valueDefSummary.defaultWidgetTypeId == 16 || element.elementSummary.valueDefSummary.defaultWidgetTypeId == 5 || element.elementSummary.elementTypeId == 3 || element.elementSummary.elementTypeId == 1;
        return result;
    }

    $scope.getFolderClass = function (item) {
        return ThemeService.getElementIcon(item);
    }

    $scope.toggleRow = function (element,callback) {
        var temp = $scope.canToggle(element);
        if(temp)
            $scope.openCloseRow(element,!element.elementSummary.isOpen,callback);
    }


    $scope.checkState=function(){
        if([2,1].indexOf($scope.data.detail.objectStateTypeSummary.id)>=0){
            $scope.invalidState=false;
        }else{
            $scope.invalidState=true;
        }
    }

    $scope.hideDisabled=function(){
        angular.forEach($scope.data.elements,function(item){
            if(item.isDisabled){
                item.elementSummary.isOpen = false;
                $scope.toggleChildren(item,true);
            }
        });
    }

    $scope.refreshForm=function(){
        $scope.loading=true;
        $scope.loadingText="Loading...";
        DataService.post('data/PendingSurvey/view',{studyDefFormDefId:$scope.data.studyDefFormDefId,link:$scope.data.link}).then(function(result){
            var r=result.data.item;
            $scope.data.elements = orderItems(r.studyFormDetailSummary.elements);
            $scope.hideDisabled();
            $scope.data.detail=r.studyFormDetailSummary;
            $scope.data.form=result.data.item;
            $scope.loading=false;
            $scope.checkState();

        },function(data, status, headers, config){
            console.log('error %o',arguments);
        });
    }

    $scope.recordAudit=function(selectedFormElement){
        var itemToEdit = {};

        $log.log('recording audit %o',selectedFormElement);
        angular.copy(selectedFormElement,itemToEdit);

        var updateUrl='data/FormElement/update';
        if(selectedFormElement.itemIsListItem){
            updateUrl='data/ValueListItem/update';
            if(itemToEdit.currentValueSummary){
                if(itemToEdit.currentValueSummary.dataTypeSummary){
                    itemToEdit.dataTypeId=itemToEdit.currentValueSummary.dataTypeSummary.id;
                }else if(itemToEdit.elementSummary.valueDefSummary){
                    itemToEdit.dataTypeId=itemToEdit.elementSummary.valueDefSummary.dataTypeId;
                }
            }
        }
        DataService.post(updateUrl,itemToEdit).then(
            function (newItem) {
                if(newItem.data.hasError){
                    $log.log(error);
                }
                $rootScope.$broadcast(NotificationService.modifiedElements, newItem.data.item.modifiedElements);
            },
            function (error) {
                $log.log(error);
            }
        );
    }

    $scope.submitForm=function(){
        $scope.loading=true;
        $scope.loadingText="Submitting...";
        DataService.post('data/PendingSurvey/update',{
            studyDefFormDefId:$scope.data.studyDefFormDefId,
            studyFormDetailSummary:{
                formId:$scope.data.detail.formId
            }
        }).then(function(result){
            var r=result.data.item;
            $scope.data.detail.objectStateTypeSummary=r.studyFormDetailSummary.objectStateTypeSummary;
            $scope.loading=false;
            $scope.checkState();

        },function(data, status, headers, config){
            console.log('error %o',arguments);
        });
    }
    $scope.refreshForm();

}]);