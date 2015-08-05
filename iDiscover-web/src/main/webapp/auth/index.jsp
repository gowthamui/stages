<%@ page import="org.ihc.hwcir.iDiscover.BrowserInfo" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%


    BrowserInfo browserInfo = new BrowserInfo(request.getHeader("user-agent"));

    if(!browserInfo.isSupported()){
        String  redirectURL = "../unauth/unsupportedBrowser.jsp";
        response.sendRedirect(redirectURL);
    }

%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">

    <!-- favicon -->
    <link rel="icon" href="../images/favicon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="../images/favicon.ico" type="image/x-icon">


    <!-- css -->
    <link href="../css/bootstrap.css" type="text/css" rel="stylesheet"/>
    <link href="../css/font-awesome.min.css" type="text/css" rel="stylesheet"/>
    <link href="../css/ng-grid.min.css" type="text/css" rel="stylesheet" />
    <link href="../css/app.css" type="text/css" rel="stylesheet" />

    <%--Fonts--%>
    <%--<link href='//fonts.googleapis.com/css?family=EB+Garamond' rel='stylesheet' type='text/css'>--%>
</head>


<body ng-app="myApp">

<!-- bootstrap navbar -->
<div ng-include="'../partials/navbar.html'"></div>

<!-- ui routes hook -->
<div ui-view></div>

<!-- footer -->
<div ng-include="'../partials/footer.html'"></div>

<%--navigating backdrop--%>
<div ng-if="isNavigating" class="navBackdrop" onclick="return false;"></div>

<!-- framework libs-->
<script src="../lib/jquery.min.js" type="text/javascript" ></script>
<script src="../lib/angular/angular.min.js" type="text/javascript"></script>
<script src="../lib/angular/angular-cookies.min.js" type="text/javascript"></script>
<script src="../lib/angular/angular-sanitize.min.js" type="text/javascript"></script>
<script src="../lib/ui-utils.min.js" type="text/javascript" ></script>
<script src="../lib/angular-ui-router.min.js" type="text/javascript" ></script>
<script src="../lib/ng-grid-2.0.8.min.js" type="text/javascript"></script>
<script src="../lib/ui-bootstrap-tpls-0.8.0.min.js"></script>

<!-- Other Libs -->
<script src="../lib/highcharts/highcharts.js" type="text/javascript"></script>
<script src="../lib/highcharts/highcharts-more.js" type="text/javascript"></script>
<script src="../lib/highcharts/modules/drilldown.js" type="text/javascript"></script>
<script src="../lib/highcharts/modules/exporting.js" type="text/javascript"></script>
<script src="../lib/highcharts/modules/export-csv.js" type="text/javascript"></script>
<script src="../lib/highcharts/modules/no-data-to-display.js" type="text/javascript"></script>
<script src="../lib/highcharts-ng.min.js" type="text/javascript"></script>
<script src="../lib/signature_pad.min.js" type="text/javascript"></script>


<!-- TODO compile/optimise these during build -->
<script src="../js/app.js"></script>

<%--Services--%>
<script src="../js/services/configService.js"></script>
<script src="../js/services/notificationService.js"></script>
<script src="../js/services/dataService.js"></script>
<script src="../js/services/userService.js"></script>
<script src="../js/services/themeService.js"></script>
<script src="../js/services/metadataService.js"></script>
<script src="../js/services/chartService.js"></script>
<script src="../js/services/objectStateService.js"></script>
<script src="../js/services/ngGridCsvExportPlugin.js"></script>

<!--Controllers-->
<script src="../js/controllers/loginCtrl.js"></script>
<script src="../js/controllers/homeCtrl.js"></script>
<script src="../js/controllers/lookupGroupsCtrl.js"></script>
<script src="../js/controllers/organizationsCtrl.js"></script>
<script src="../js/controllers/studyEnrollmentsCtrl.js"></script>
<script src="../js/controllers/pendingCtrl.js"></script>
<script src="../js/controllers/studyDefCtrl.js"></script>
<script src="../js/controllers/studyDefDetailCtrl.js"></script>
<script src="../js/controllers/formDefDetailCtrl.js"></script>
<script src="../js/controllers/editFormDefElementCtrl.js"></script>
<script src="../js/controllers/addRootFormDefElementCtrl.js"></script>
<script src="../js/controllers/deleteDialogCtrl.js"></script>
<script src="../js/controllers/editOrganizationCtrl.js"></script>
<script src="../js/controllers/editStudyDefCtrl.js"></script>
<script src="../js/controllers/editFormDefCtrl.js"></script>
<script src="../js/controllers/editStudyDefFormDefCtrl.js"></script>
<script src="../js/controllers/editParticipantCtrl.js"></script>
<script src="../js/controllers/studyEnrollmentDetailCtrl.js"></script>
<script src="../js/controllers/formDetailCtrl.js"></script>
<script src="../js/controllers/auditHistoryCtrl.js"></script>
<script src="../js/controllers/modulesCtrl.js"></script>
<script src="../js/controllers/commentsDialogCtrl.js"></script>
<script src="../js/controllers/otherValueDialogCtrl.js"></script>
<script src="../js/controllers/multiLineStringDialogCtrl.js"></script>
<script src="../js/controllers/viewAndAgreeDialogCtrl.js"></script>
<script src="../js/controllers/viewFileDialogCtrl.js"></script>
<script src="../js/controllers/viewAndSignDialogCtrl.js"></script>
<script src="../js/controllers/showCommentsDialogCtrl.js"></script>
<script src="../js/controllers/editSignatureDialogCtrl.js"></script>
<script src="../js/controllers/editFileDialogCtrl.js"></script>
<script src="../js/controllers/consentCheckboxDialogCtrl.js"></script>
<script src="../js/controllers/consentSignatureDialogCtrl.js"></script>
<script src="../js/controllers/objectStateHistoryCtrl.js"></script>
<script src="../js/controllers/usersCtrl.js"></script>
<script src="../js/controllers/editUsersCtrl.js"></script>
<script src="../js/controllers/editLookupGroupCtrl.js"></script>
<script src="../js/controllers/groupsCtrl.js"></script>
<script src="../js/controllers/editGroupsCtrl.js"></script>
<script src="../js/controllers/studyDefDashboardCtrl.js"></script>
<script src="../js/controllers/addParticipantToStudyCtrl.js"></script>
<script src="../js/controllers/participantSearchCtrl.js"></script>
<script src="../js/controllers/rolesCtrl.js"></script>
<script src="../js/controllers/editRoleCtrl.js"></script>
<script src="../js/controllers/valueNoteCtrl.js"></script>
<script src="../js/controllers/lookupSearchCtrl.js"></script>
<script src="../js/controllers/formTemplateSearchCtrl.js"></script>
<script src="../js/controllers/configureAccessDialogCtrl.js"></script>
<script src="../js/controllers/notificationEditorCtrl.js"></script>
<script src="../js/controllers/outlineItemLookupDialog.js"></script>
<script src="../js/controllers/scheduleCtrl.js"></script>
<script src="../js/controllers/lookupCtrlDialog.js"></script>
<script src="../js/controllers/importDataCtrl.js"></script>
<script src="../js/controllers/editInitialsDialogCtrl.js"></script>
<script src="../js/controllers/screeningCtrl.js"></script>
<script src="../js/controllers/editParticipantEnrollmentCtrl.js"></script>
<script src="../js/controllers/queryResults.js"></script>
<script src="../js/controllers/studyFormsCtrl.js"></script>
<script src="../js/controllers/editStudyFromTaskCtrl.js"></script>
<script src="../js/controllers/globalSearchCtrl.js"></script>
<script src="../js/controllers/browseDataCtrl.js"></script>
<script src="../js/controllers/queryLibraryCtrl.js"></script>
<script src="../js/controllers/editQueryCtrl.js"></script>
<script src="../js/controllers/queryLibrarySearchCtrl.js"></script>
<script src="../js/controllers/autoPopulateResultsDialogCtrl.js"></script>
<script src="../js/controllers/shareFormCtrl.js"></script>
<script src="../js/controllers/pasteLookupCtrl.js"></script>
<script src="../js/controllers/browseDataFiltersCtrl.js"></script>

<%--Filters--%>

<!--Directives-->
<script src="../js/directives/recursive.js"></script>
<script src="../js/directives/formattedValue.js"></script>
<script src="../js/directives/auditText.js"></script>
<script src="../js/directives/simpleFormattedValue.js"></script>
<script src="../js/directives/editObjectPermissions.js"></script>
<script src="../js/directives/ngModelOnBlur.js"></script>
<script src="../js/directives/lookupItem.js"></script>
<script src="../js/directives/file.js"></script>
<script src="../js/directives/signaturePad.js"></script>
<script src="../js/directives/consentCheckboxes.js"></script>
<script src="../js/directives/consentSignatures.js"></script>
<script src="../js/directives/selectFormDefElement.js"></script>
<script src="../js/directives/participantLookup.js"></script>
<script src="../js/directives/dateFix.js"></script>
<script src="../js/directives/dateTimeFix.js"></script>
<script src="../js/directives/ngFocus.js"></script>
<script src="../js/directives/lookupEditor.js"></script>
<script src="../js/directives/loadingControl.js"></script>
<script src="../js/directives/highChart.js"></script>
<script src="../js/directives/studyNavigator.js"></script>
<script src="../js/directives/notificationEditor.js"></script>
<script src="../js/directives/outlineItemLookup.js"></script>
<script src="../js/directives/participantSchedule.js"></script>
<script src="../js/directives/scrollToBottom.js"></script>
<script src="../js/directives/ratingWidget.js"></script>
<script src="../js/directives/lookupCtrl.js"></script>
<script src="../js/directives/terminologyTags.js"></script>
<script src="../js/directives/initialCtrl.js"></script>
<script src="../js/directives/initialsPad.js"></script>
<script src="../js/directives/shouldFocus.js"></script>
<script src="../js/directives/queryLookup.js"></script>
<script src="../js/directives/autoPopulateCtrl.js"></script>
<script src="../js/directives/autoPopulateAllCtrl.js"></script>
<script src="../js/directives/hideModal.js"></script>
<script src="../js/directives/expressionInstructions.js"></script>
<script src="../js/directives/requiredIndicator.js"></script>
<script src="../js/directives/chartReview.js"></script>
<script src="../js/directives/checklistModel.js"></script>
<script src="../js/directives/blobUrl.js"></script>
<script src="../js/directives/datetimepicker.js"></script>
<script src="../js/directives/currency.js"></script>

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