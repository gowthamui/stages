myApp.factory( 'ObjectStateService',['$cookieStore','$cookies','$browser','$filter','DataService',function($cookieStore,$cookies,$browser,$filter,DataService) {
    var service ={};


    service.getChildren=function(items,parentId){
        var results = [];
        angular.forEach(items,function(item){
            if(item.parentId==parentId){
                if(parentId){
                    item.name=' -- '+item.name;
                }
                results.push(item);
                var tmp = service.getChildren(items,item.id);
                angular.forEach(tmp,function(tmpItem){
                    results.push(tmpItem);
                });
            }
        });
        return results;
    }
    service.getEnrollmentStates=function(callback){
        DataService.post('data/ObjectStateType/search',{tableName:'STUDY_ENROLLMENT'}).then(function(result){
            var tmp=$filter('orderBy')(result.data.items,'name');
            var results=service.getChildren(tmp,null);
            if(callback){
                callback(results);
            }
        });
    }

    service.getMetadata=function(valueDefSummary){
        var result ={};
        if(valueDefSummary){
            if(!valueDefSummary.metadataObject){
                try{
                    valueDefSummary.metadataObject=JSON.parse(valueDefSummary.metadata);
                }catch(x){}
            }
            if(valueDefSummary.metadataObject){
                result=valueDefSummary.metadataObject;
            }
        }
        return result;
    };

    service.syncValueSummary=function(scope,property,newValue){
        if(!scope[property]){
            scope[property]=newValue;
        }
        else if(newValue)
        {
            // sync some properties regardless
            scope[property].id=newValue.id;
            if(!scope[property].modifiedBy){
                scope[property].modifiedBy=newValue.modifiedBy;
            }
            if(!scope[property].modifiedOn){
                scope[property].modifiedOn=newValue.modifiedOn;
            }


            var modDate = newValue.modifiedOn;
            if(!angular.isDate(modDate)){
                modDate=new Date(modDate);
            }

            var oldDate = scope[property].modifiedOn;
            var hasOldDate=false;
            if(angular.isDate(oldDate)){
                hasOldDate=true;
            }
            if(!hasOldDate || modDate>oldDate){
                for(prop in newValue){
                    scope[property][prop]=newValue[prop];
                }
            }
            scope[property].clearValue=false;
        }
    }

    service.isRequired=function(valueDefSummary){
        return service.getMetadata(valueDefSummary).isRequired==true;
    };

    service.requiresUserInitials=function(valueDefSummary){
        return service.getMetadata(valueDefSummary).requiresUserInitials==true;
    };

    service.currentValue=function(valueSummary,valueDefSummary){
        var meta = service.getMetadata(valueDefSummary);
        var currValue = valueSummary || {};
        var currDef=valueDefSummary;
        var result=null;
        var formattedResult=null;

        var wtype=currDef.defaultWidgetTypeId;
        if(wtype==1){      // string
            if(currValue.stringValue && currValue.stringValue.trim().length>0){
                result= currValue.stringValue;
                formattedResult=result;
            }
        }else if(wtype==12){      // multiLinestring
            if(currValue.stringValue && currValue.stringValue.trim().length>0){
                result= currValue.stringValue;
                formattedResult=result;
            }
        }else if(wtype==2){      // yes or no
            result=currValue.boolValue;
            if(currValue.boolValue!=null){
                formattedResult=currValue.boolValue==true?"Yes":"No";
            }
        }else if(wtype==3){      // date
            result = currValue.dateValue;
            if(result){
                formattedResult=$filter('date')(result,'shortDate');
            }
        }else if(wtype==4){      // number
            result = currValue.numberValue;
            if(result){
                formattedResult=result;
                // check number format
                if (meta.hasNumberFormat) {
                    if (meta.numberFormatId == 1) {   //currency
                        formattedResult = $filter('currency')(result);
                    } else if (meta.numberFormatId == 3) { //two decimals
                        formattedResult = $filter('number')(result,2);
                    } else if (meta.numberFormatId == 2) { //whole number
                        formattedResult = $filter('number')(result,0);
                    }  else if (meta.numberFormatId == 4) { //percentage
                        formattedResult = $filter('number')(result*100,2);
                    } else if (meta.numberFormatId == 5) { //four decimals
                        formattedResult = $filter('number')(result,4);
                    } else if (meta.numberFormatId == 6) { // percent four decimals
                        formattedResult = $filter('number')(result*100,4);
                    }
                }
                // check for units
                if(currValue.lookupValueSummary){
                    if(currValue.lookupValueSummary){
                        formattedResult+=' '+currValue.lookupValueSummary.name;
                        if(currValue.otherValue){
                            if(currValue.otherValue.length>0){
                                formattedResult+=': '+currValue.otherValue;
                            }
                        }
                    }
                }
            }
        }else if(wtype==5){      // list
            result = currValue.listValue;
            if(result){
                formattedResult='Modified by '+currValue.modifiedBy;
            }
        }else if(wtype==6){      // sig
            result = currValue.signatureValue;
            if(result){
                if(currValue.modifiedOn){
                    formattedResult = 'Signed on '+$filter('date')(currValue.modifiedOn,'short');
                }else{
                    formattedResult= 'Signed on '+$filter('date')(currValue.createdOn,'short');
                }
            }
        }else if(wtype==7){      // file
            result = currValue.fileValue;
            if(result){
                if(currValue.fileValue.name){
                    formattedResult = currValue.fileValue.name;
                }else{
                    formattedResult= 'View file...';
                }
            }
        }else if(wtype==8){      // view-file
            result = currValue.dateValue;

            if(result){
                formattedResult= 'Viewed by '+currValue.modifiedBy+' on '+$filter('date')(currValue.modifiedOn,'short');
            }else{
                formattedResult= 'View file...';
            }

        }else if(wtype==9 || wtype==10){      // lookup
            if(currValue.lookupValues){
                result = currValue.lookupValues;
                formattedResult='';
                angular.forEach(currValue.lookupValues,function(item){
                    if(formattedResult.length>0){
                        formattedResult+=', ';
                    }
                    formattedResult+=item.lookupValueName;
                    if(item.otherValue){
                        if(item.otherValue.length>0){
                            formattedResult+=': '+item.otherValue;
                        }
                    }
                });
            }
        }else if(wtype==11){      // view and agree
            result= currValue.boolValue;
            if(result!=null){
                if(result){
                    formattedResult= 'Agreed on '+$filter('date')(currValue.modifiedOn,'short');
                }else{
                    formattedResult= 'Disagreed on '+$filter('date')(currValue.modifiedOn,'short');
                }
            }
        }else if(wtype==14){      // view and sign

            var complete=false;
            if(currValue.valueConsentSummary){
                complete = currValue.valueConsentSummary.complete;
            }
            if(complete){
                result=currValue.valueConsentSummary;
                formattedResult = 'Complete';
            }else{
                formattedResult = 'Not Complete';
            }
        }else if(wtype==16){      // subform
            result={};
            formattedResult='';
        }else if(wtype==17){      // checkbox
            result=currValue.boolValue;
            if(result){
                formattedResult=result?'Checked':'Not Checked';
            }
        }else if(wtype==18){      // datetime
            result=currValue.dateValue;
            if(result){
                result  = $filter('date')(currValue.dateValue,'short');
            }
        }else if(wtype==19){      // rating
            result=currValue.numberValue;
            formattedResult=currValue.numberValue;
        }
        return {
            value:result,
            formattedValue:formattedResult,
            hasValue: result!=null
        };
    }

    service.isValidSSN=function(strSSN)
    {
        var result = false;
        if(strSSN){
            var pattern = /^\d{3}-\d{2}-\d{4}$/;
            result = strSSN.match(pattern);
        }
        return result;
    }


    service.isValidEmailAddress=function(strEmail)
    {
        var result = false;
        if(strEmail){
            var pattern =/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            result = strEmail.match(pattern);
        }
        return result;
    }

    service.isValidURL=function(strURL)
    {
        var result = false;
        if (strURL) {
            var pattern  = /^^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&%\$#_=]*)?$/;
            result = strURL.match(pattern);
        }
        return result;
    }

    service.isValidPhone=function(strPhone)
    {
        var result = false;
        var pattern=/^[01]?[- .]?(\([2-9]\d{2}\)|[2-9]\d{2})[- .]?\d{3}[- .]?\d{4}$/;
        if (strPhone) {
            result = strPhone.match(pattern);
        }
        return result;
    }

    service.isValidZipCode=function(zipCode)
    {
        var result = false;
        var pattern = /^\d{5}(?:[-\s]\d{4})?$/;
        if (zipCode) {
            result = zipCode.match(pattern);
        }
        return result;
    }

    service.isValid=function(valueSummary,valueDefSummary){
        var meta = service.getMetadata(valueDefSummary);
        var validationErrors = {hasRequiredError:false,hasValidationErrors:false,requiresInitials:false};
        var isRequired=service.isRequired(valueDefSummary);
        var requiresInitials=service.requiresUserInitials(valueDefSummary);

        validationErrors.IsRequired = isRequired;
        var errorList='';
        var currVal = service.currentValue(valueSummary,valueDefSummary).value;
        var hasVal = currVal!=null;
        validationErrors.hasValue=hasVal;
        validationErrors.currVal=currVal;

        if (isRequired && !hasVal) {
            errorList+="'"+valueDefSummary.name+"' is required.\n";
            validationErrors.hasRequiredError=true;
        }

        if(requiresInitials && !valueSummary.hasInitials){
            validationErrors.requiresInitials=true;
        }

        // string errors
        var dataTypeId=valueDefSummary.dataTypeId;
        if(!dataTypeId || dataTypeId<1){
            if(valueDefSummary.dataTypeSummary){
                dataTypeId=valueDefSummary.dataTypeSummary.id;
            }
        }
        if (dataTypeId== 1) {

            var currStrValue = currVal;
            if (currStrValue != null) {
                if (meta.hasMinLength && currStrValue.length < meta.minLength) {
                    validationErrors.hasValidationErrors = true;
                    errorList+="'"+valueDefSummary.name+"' must be "+meta.minLength+" or more characters.\n";
                }
                if (meta.hasMaxLength && currStrValue.length > meta.maxLength) {
                    validationErrors.hasValidationErrors = true;
                    errorList+="'"+valueDefSummary.name+"' must be "+meta.maxLength+" or less characters.\n";
                }

                if (meta.hasStringFormat) {
                    if (meta.stringFormatId == 4) {
                        if (!service.isValidEmailAddress (currStrValue)) {
                            validationErrors.hasValidationErrors = true;
                            errorList+="'"+valueDefSummary.name+"' must be a valid email address.  ex: angie@imail.org\n";
                        }
                    } else if (meta.stringFormatId == 2) {
                        if (!service.isValidPhone (currStrValue)) {
                            validationErrors.hasValidationErrors = true;
                            errorList+="'"+valueDefSummary.name+"' must be a valid phone number. ex: (801) 555-2300\n";
                        }
                    } else if (meta.stringFormatId == 1) {
                        if (!service.isValidSSN (currStrValue)) {
                            validationErrors.hasValidationErrors = true;
                            errorList+="'"+valueDefSummary.name+"' must be a valid SSN.  Ex: 111-11-1111\n";
                        }
                    } else if (meta.stringFormatId == 5) {
                        if (!service.isValidURL (currStrValue)) {
                            validationErrors.hasValidationErrors = true;
                            errorList+="'"+valueDefSummary.name+"' must be a valid URL.  Ex: http://www.ihc.com\n";
                        }
                    } else if (meta.stringFormatId == 3) {
                        if (!service.isValidZipCode (currStrValue)) {
                            validationErrors.hasValidationErrors = true;
                            errorList+="'"+valueDefSummary.name+"' must be a valid Zip Code.  Ex: 84117 or 84117-7102\n";
                        }
                    }
                }
            }
        }

        // number errors
        if (dataTypeId == 4) {
            var currNumValue = currVal;
            if (currNumValue != null) {
                if (meta.hasMin && currNumValue  < meta.min) {
                    validationErrors.hasValidationErrors = true;
                    errorList+="'"+valueDefSummary.name+"' must be greater than or equal to "+meta.min+".\n";
                }
                if (meta.hasMax && currNumValue > meta.max) {
                    validationErrors.hasValidationErrors = true;
                    errorList+="'"+valueDefSummary.name+"' must be less than or equal to "+meta.max+".\n";
                }
            }
        }

        // date errors
        if (dataTypeId== 3) {

            var isDateTime = valueDefSummary.defaultWidgetTypeId==18;//datetime

            var fn = function(dt){
                var result=null;
                if(isDateTime){
                    result=$filter('date')(dt);
                }else{
                    result=$filter('date')(dt,'shortDate');
                }
                return result;
            }

            var currDateValue = currVal;
            if (currDateValue != null) {
                if (meta.hasMinDate && currDateValue  < meta.minDate) {
                    validationErrors.hasValidationErrors = true;
                    errorList+="'"+valueDefSummary.name+"' must be greater than or equal to "+fn(meta.minDate)+".\n";
                }
                if (meta.hasMaxDate && currDateValue > meta.maxDate) {
                    validationErrors.hasValidationErrors = true;
                    errorList+="'"+valueDefSummary.name+"' must be less than or equal to "+fn(meta.maxDate)+".\n";
                }
            }
        }

        validationErrors.errorMessage = errorList;
        if (errorList.length>0) {
            validationErrors.hasErrors = true;
        }
        return validationErrors;
    };

    service.findWithAttr = function(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
        }
    };

    return service;
}]
);



