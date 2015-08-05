<%@ page contentType="text/html;charset=UTF-8" language="java" %>


<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title></title>
    <meta name="description" content="">
    <%--<meta name="viewport" content="width=device-width">--%>
    <meta name = "viewport" content = "user-scalable=no, initial-scale=1.0, maximum-scale=1.0, width=device-width">

    <!-- favicon -->
    <link rel="icon" href="../images/favicon.ico" type="image/x-icon">

    <link rel="shortcut icon" href="../images/favicon.ico" type="image/x-icon">

    <!-- css -->
    <link href="../css/bootstrap.css" type="text/css" rel="stylesheet"/>
    <link href="../css/font-awesome.min.css" type="text/css" rel="stylesheet"/>
    <link href="../css/app.css" type="text/css" rel="stylesheet" />
    <link href="../css/survey.css" type="text/css" rel="stylesheet" />

</head>


<body ng-app="myApp" class="coloredBackground">


<!-- bootstrap navbar -->
<div survey-navbar></div>

<!-- ui routes hook -->
<div ui-view></div>

<!-- framework libs-->
<script src="../lib/jquery.min.js" type="text/javascript" ></script>
<script src="../lib/angular/angular.min.js" type="text/javascript"></script>
<script src="../lib/angular/angular-cookies.min.js" type="text/javascript"></script>
<script src="../lib/angular/angular-sanitize.min.js" type="text/javascript"></script>
<script src="../lib/ui-utils.min.js" type="text/javascript" ></script>
<script src="../lib/angular-ui-router.min.js" type="text/javascript" ></script>
<script src="../lib/ui-bootstrap-tpls-0.8.0.min.js"></script>

<!-- Other Libs -->
<script src="../lib/signature_pad.min.js" type="text/javascript"></script>

<!-- TODO compile/optimise these during build -->
<script src="../js/surveyApp.js"></script>

<%--Controllers--%>
<script src="../js/controllers/surveyHomeCtrl.js"></script>
<script src="../js/controllers/surveyEditSignatureDialogCtrl.js"></script>
<script src="../js/controllers/surveyFormCtrl.js"></script>
<script src="../js/controllers/viewFileDialogCtrl.js"></script>
<script src="../js/controllers/editFileDialogCtrl.js"></script>
<script src="../js/controllers/lookupCtrlDialog.js"></script>
<script src="../js/controllers/viewAndAgreeDialogCtrl.js"></script>
<script src="../js/controllers/viewAndSignDialogCtrl.js"></script>
<script src="../js/controllers/editInitialsDialogCtrl.js"></script>

<%--Directives--%>
<script src="../js/directives/surveyNavbar.js"></script>
<script src="../js/directives/surveyStringWidget.js"></script>
<script src="../js/directives/surveyYesNoWidget.js"></script>
<script src="../js/directives/surveyCheckboxWidget.js"></script>
<script src="../js/directives/surveyDateWidget.js"></script>
<script src="../js/directives/surveyDateTimeWidget.js"></script>
<script src="../js/directives/surveyNumberWidget.js"></script>
<script src="../js/directives/surveySignatureWidget.js"></script>
<script src="../js/directives/surveyAttachFileWidget.js"></script>
<script src="../js/directives/surveyLookupWidget.js"></script>
<script src="../js/directives/surveyViewAgreeWidget.js"></script>
<script src="../js/directives/surveyViewFileWidget.js"></script>
<script src="../js/directives/surveyMultiLineStringWidget.js"></script>
<script src="../js/directives/surveyViewSignWidget.js"></script>
<script src="../js/directives/surveyRatingWidget.js"></script>
<script src="../js/directives/dateFix.js"></script>
<script src="../js/directives/dateTimeFix.js"></script>
<script src="../js/directives/signaturePad.js"></script>
<script src="../js/directives/file.js"></script>
<script src="../js/directives/ngModelOnBlur.js"></script>
<script src="../js/directives/initialsPad.js"></script>
<script src="../js/directives/initialCtrl.js"></script>
<script src="../js/directives/surveySliderWidget.js"></script>




<%--Services--%>
<script src="../js/services/themeService.js"></script>
<script src="../js/services/metadataService.js"></script>
<script src="../js/services/notificationService.js"></script>
<script src="../js/services/userService.js"></script>
<script src="../js/services/configService.js"></script>
<script src="../js/services/dataService.js"></script>


<%--Template Overrides--%>
<script id="template/modal/window.html" type="text/ng-template">
    <div tabindex="-1" class="modal fade {{ windowClass }} in" ng-style="{'z-index': 1050 + index*10, display: 'block'}" ng-click="close($event)">
        <div class="modal-dialog"><div class="modal-content" ng-transclude></div></div>
    </div>
</script>
<script id="template/modal/backdrop.html" type="text/ng-template">
    <div class="modal-backdrop fade in"
         ng-style="{'z-index': 1040 + (index && 1 || 0) + index*10}"
            ></div>
</script>

</body>

</html>