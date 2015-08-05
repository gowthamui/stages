<%@ page import="org.ihc.hwcir.iDiscover.ClientDataAccess" %>
<%@ page import="org.ihc.hwcir.iDiscover.Constants" %>
<%@ page import="org.ihc.hwcir.iDiscover.WebUtilities" %>
<%@ page import="org.ihc.hwcir.iDiscover.common.Utilz" %>
<%@ page import="org.ihc.hwcir.iDiscover.models.*" %>
<%@ page import="javax.naming.Context" %>
<%@ page import="javax.naming.InitialContext" %>
<%@ page import="java.text.DateFormat" %>
<%@ page import="java.util.*" %>
<%@ page import="org.ihc.hwcir.iDiscover.BrowserInfo" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="my" tagdir="/WEB-INF/tags/" %>

<%
    BrowserInfo browserInfo = new BrowserInfo(request.getHeader("user-agent"));

    if(!browserInfo.isSupported()){
        String redirectURL = "../unauth/unsupportedBrowser.jsp";
        response.sendRedirect(redirectURL);
    }
%>

<%!

    public static String scrubString(String input){
        String result="";
        if(input!=null){
            result=input;
        }
        return result;
    }


    public static Integer IndentAmount = 15;
    Hashtable<Integer, Integer> hash = new Hashtable<Integer, Integer>();

    DateFormat dt = Utilz.ShortDateTimeFormat;

    public String getWidgetIcon(int widgetTypeId,boolean open){
        
        String result = "fa fa-pencil-square-o";
        if(widgetTypeId==1){ //string
            result="fa fa-text-width";
        }else if(widgetTypeId==2){//yesno
            result="fa fa-thumbs-up";
        }else if(widgetTypeId==3){//date
            result="fa fa-calendar";
        }else if(widgetTypeId==4){//number
            result="fa fa-building-o";
        }else if(widgetTypeId==5){//list
            if(open){
                result="fa fa-folder-open-o";
            }else{
                result="fa fa-folder-o";
            }
        }else if(widgetTypeId==6){//sig
            result="fa fa-pencil";
        }else if(widgetTypeId==7){//attach file
            result="fa fa-paperclip";
        }else if(widgetTypeId==8){//view file
            result="fa fa-file";
        }else if(widgetTypeId==9){//lookup
            result="fa fa-external-link-square";
        }else if(widgetTypeId==10){//multilookup
            result="fa fa-external-link";
        }else if(widgetTypeId==11){//view & agree
            result="fa fa-thumbs-up";
        }else if(widgetTypeId==12){//multi-line string
            result="fa fa-text-height";
        }else if(widgetTypeId==14){//view & sign
            result="fa fa-pencil-square-o";
        }else if(widgetTypeId==15){//description
            result="fa fa-align-left";
        }else if(widgetTypeId==16){//subform
            if(open){
                result="fa fa-folder-open-o";
            }else{
                result="fa fa-folder-o";
            }
        }else if(widgetTypeId==17){//checkbox
            result="fa fa-check-square-o";
        }else if(widgetTypeId==18){//datetime
            result="fa fa-calendar-o";
        }else if(widgetTypeId==19){//rating -stars
            result="fa fa-star-o";
        }else if(widgetTypeId==20){//slider
            result="fa fa-arrows-h";
        }

        return result;


    }

    public String getFolderIcon(FormElementSummary item){
        String result = "fa fa-credit-card";
        int elementTypeId =item.getElementSummary().getElementTypeSummary().getId();
        if (elementTypeId== 2) {
            result = getWidgetIcon(item.getElementSummary().getValueDefSummary().getDefaultWidgetTypeId(),true);
        } else if (elementTypeId== 1) {
            result = "fa fa-folder-open-o";
        } else if (elementTypeId == 3) {
            result = "fa fa-chevron-right";
        }
        return result;
    }

    public List<FormElementSummary> getChildElements(Integer parentId, List<FormElementSummary> elementSummaries, List<FormElementSummary> sortedElements) {
        for (FormElementSummary elementSummary : elementSummaries) {
            if (!sortedElements.contains(elementSummary) && elementSummary.getElementSummary().getParentElementId() == parentId) {
                sortedElements.add(elementSummary);
                Integer parentIndent = 0;
                if (hash.containsKey(parentId)) {
                    parentIndent = hash.get(parentId);
                }
                hash.put(elementSummary.getElementId(), IndentAmount + parentIndent);
                getChildElements(elementSummary.getElementSummary().getId(), elementSummaries, sortedElements);
            }
        }
        return sortedElements;
    }

    public void SortElements(List<FormElementSummary> elements) {
        Collections.sort(elements, new Comparator<FormElementSummary>() {

            public int compare(FormElementSummary o1, FormElementSummary o2) {
                return o1.getDisplaySeq() - o2.getDisplaySeq();
            }
        });
    }


    public List<FormElementSummary> CheckSubForm(int subFormId, int formDefId, int elementId, int formElementId, int valueListItemId,String username, ClientDataAccess dataAccess, int parentElementId) throws Exception {
        List<FormElementSummary> result = new ArrayList<FormElementSummary>();
        SubFormDetailSummary subFormDetailSummary = new SubFormDetailSummary();
        subFormDetailSummary.setFormId(subFormId);
        subFormDetailSummary.setFormElementId(formElementId);
        subFormDetailSummary.setValueListItemId(valueListItemId);
        subFormDetailSummary.setFormDefId(formDefId);
        subFormDetailSummary.setUserId(username);
        subFormDetailSummary = (SubFormDetailSummary) dataAccess.view(subFormDetailSummary).getItem();

        List<FormElementSummary> subElements = subFormDetailSummary.getElements();

        SortElements(subElements);

        List<FormElementSummary> sortedElements = new ArrayList<FormElementSummary>();
        sortedElements = getChildElements(0, subElements, sortedElements);
        sortedElements = CheckElements(sortedElements, username);

        Integer parentIndent = hash.get(elementId);
        parentIndent = parentIndent != null ? parentIndent : 0;

        for (FormElementSummary childEl : sortedElements) {
            result.add(childEl);
            Integer childIndent = hash.get(childEl.getElementId());
            childIndent = childIndent != null ? childIndent : 0;
            hash.put(childEl.getElementId(), parentIndent + childIndent);
        }
        return result;
    }


    public List<FormElementSummary> CheckElements(List<FormElementSummary> elements, String username) throws Exception {
        List<FormElementSummary> result = new ArrayList<FormElementSummary>();

        try {
            final Context context = new InitialContext();
            ClientDataAccess dataAccess = (ClientDataAccess) context.lookup(Constants.CLIENT_DATA_ACCESS);

            for (FormElementSummary el : elements) {
                if (el.getElementSummary().getValueDefSummary().getDataTypeId() == 10) { // subform
                    result.add(el);

                    int subFormId = 0;
                    if (el.getCurrentValueSummary() != null) {
                        subFormId = el.getCurrentValueSummary().getFormId();
                    }
                    if (subFormId > 0) {
                        List<FormElementSummary> subs = CheckSubForm(subFormId, el.getElementSummary().getValueDefSummary().getFormDefId(), el.getElementSummary().getId(),el.getId(),0, username, dataAccess, 0);
                        for (FormElementSummary s : subs) {
                            result.add(s);
                        }
                    }

                } else if (el.getElementSummary() != null && el.getElementSummary().getValueDefSummary() != null && el.getElementSummary().getValueDefSummary().getDataTypeId() == 5 && el.getCurrentValueSummary() != null && el.getCurrentValueSummary().getListValue() != null) {
                    ValueListSummary listSummary = (ValueListSummary) dataAccess.view(el.getCurrentValueSummary().getListValue()).getItem();
                    int index = 0;
                    result.add(el);
                    Integer parentIndent = hash.get(el.getElementId());
                    parentIndent = parentIndent != null ? parentIndent : 0;
                    el.setElementTypeId(3);

                    ValueDefSummary valueDefSummary = el.getElementSummary().getValueDefSummary();
                    for (ValueListItemSummary summary : listSummary.getListItems()) {

                        ElementSummary elementSummary = new ElementSummary();


                        ValueDefSummary listValueDefSummary = new ValueDefSummary();
                        listValueDefSummary.setDataTypeId(valueDefSummary.getListDataTypeId());
                        listValueDefSummary.setDefaultWidgetTypeId(valueDefSummary.getDefaultListWidgetTypeId());
                        listValueDefSummary.setMetadataClasses(valueDefSummary.getMetadataClasses());
                        listValueDefSummary.setMetadata(valueDefSummary.getMetadata());
                        listValueDefSummary.setValueId(valueDefSummary.getValueId());
                        listValueDefSummary.setName(valueDefSummary.getListCaption());
                        if (listValueDefSummary.getName() == null) {
                            listValueDefSummary.setName(valueDefSummary.getName());
                        }
                        if(summary.getName()!=null){
                            listValueDefSummary.setName(summary.getName());
                        }
                        listValueDefSummary.setDescription(valueDefSummary.getDescription());
                        elementSummary.setValueDefSummary(listValueDefSummary);
                        ElementTypeSummary elementTypeSummary = new ElementTypeSummary();
                        elementTypeSummary.setId(2);
                        elementSummary.setElementTypeSummary(elementTypeSummary);

                        FormElementSummary formElementSummary = new FormElementSummary();

                        formElementSummary.setElementSummary(elementSummary);
                        formElementSummary.setElementId(el.getElementSummary().getId() + index + 10000000);
                        formElementSummary.setCurrentValueSummary(summary.getCurrentValueSummary());
                        formElementSummary.setPreviousValueSummary(summary.getPreviousValueSummary());
                        formElementSummary.setElementTypeId(2);
                        formElementSummary.setParentElementId(el.getElementId());

                        hash.put(formElementSummary.getElementId(), parentIndent + IndentAmount);


                        if (valueDefSummary.getListDataTypeId() == 10) { // subform
                            result.add(formElementSummary);

                            formElementSummary.setElementTypeId(3);
                            if (summary.getCurrentValueSummary() != null) {
                                List<FormElementSummary> subs = CheckSubForm(summary.getCurrentValueSummary().getFormId(), valueDefSummary.getFormDefId(), formElementSummary.getElementId(),0,summary.getId(), username, dataAccess, formElementSummary.getElementId());
                                for (FormElementSummary s : subs) {

                                    Integer childIndent = hash.get(s.getElementId());
                                    if (childIndent != null) {
                                        hash.put(s.getElementId(), childIndent + 0);
                                    }
                                    result.add(s);
                                }
                            }
                        } else {
                            result.add(formElementSummary);
                        }
                        index++;
                    }
                } else {
                    result.add(el);
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return result;
    }

    public String formatString(String value, String defaultString){
        String result = value;
        if(value==null || value.trim().length()==0){
            result=defaultString;
        }
        return result;
    }

%>
<%

    Integer parentId = null;

    final Context context = new InitialContext();
    ClientDataAccess dataAccess = (ClientDataAccess) context.lookup(Constants.CLIENT_DATA_ACCESS);

    String studyFormId = request.getParameter("studyFormId");
    StudyFormDetailSummary formSummary = new StudyFormDetailSummary();
    formSummary.setStudyFormId(Integer.parseInt(studyFormId));
    formSummary.setUserId(WebUtilities.getUsername(request));
    formSummary = (StudyFormDetailSummary) dataAccess.view(formSummary).getItem();


    List<FormElementSummary> elements = formSummary.getElements();

    SortElements(elements);

    List<FormElementSummary> sortedElements = new ArrayList<FormElementSummary>();
    sortedElements = getChildElements(0, elements, sortedElements);

    sortedElements = CheckElements(sortedElements, WebUtilities.getUsername(request));

    ObjectStateSummary summary = new ObjectStateSummary();
    summary.setTableName("FORM");
    summary.setRowId(formSummary.getFormId());
    List<ObjectStateSummary> objectStateHistory = (List<ObjectStateSummary>) dataAccess.search(summary).getItems();

%>
<html>
<head>
    <title></title>
    <!-- favicon -->
    <link rel="icon" href="images/favicon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">

    <!-- css -->
    <link href="../../css/bootstrap.css" type="text/css" rel="stylesheet"/>
    <link href="../../css/font-awesome.min.css" rel="stylesheet"/>
    <link href="../../css/ng-grid.min.css" type="text/css" rel="stylesheet"/>
    <link href="../../css/app.css" rel="stylesheet"/>
</head>
<body>
<div class="container">
    <h3><%=formSummary.getStudyDefSummary().getName() %>&nbsp;
        <small><%=formSummary.getFormName() %>
        </small>
    </h3>
    <table class="table table-condensed table-bordered">
        <thead>

        <% if (formSummary.getStudyEnrollmentSummary() != null) { %>
        <tr>
            <th>Form ID</th>
            <th>Participant Study ID</th>
            <th>EMPI</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Current Status</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td><%=formSummary.getStudyFormId() %>
            </td>
            <td><%=formatString(formSummary.getStudyEnrollmentSummary().getParticipantStudyId(),"") %>
            </td>
            <td><%=formatString(formSummary.getStudyEnrollmentSummary().getParticipantSummary().getIdTag(),"")%>
            </td>
            <td><%=formatString(formSummary.getStudyEnrollmentSummary().getParticipantSummary().getFirstName(),"")%>
            </td>
            <td><%=formatString(formSummary.getStudyEnrollmentSummary().getParticipantSummary().getLastName(),"")%>
            </td>
            <td><%=formatString(formSummary.getObjectStateTypeSummary().getName(),"")%>
            </td>
        </tr>
        </tbody>
        <% } else { %>
        <tr>
            <th>Form ID</th>
            <th>Current Status</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td><%=formSummary.getStudyFormId() %>
            </td>
            <td><%=formSummary.getObjectStateTypeSummary().getName()%>
            </td>
        </tr>
        </tbody>
        <% } %>
    </table>


    <% if (objectStateHistory != null && objectStateHistory.size() > 0) { %>
    <table class="table table-condensed table-bordered">
        <thead>
        <tr>
            <th>Approval History</th>
            <th>Modified By</th>
            <th>Modified On</th>
            <th>Comments</th>
        </tr>
        </thead>
        <tbody>
            <%  for (ObjectStateSummary objectStateSummary: objectStateHistory) {
                String modifiedBy = objectStateSummary.getCreatedByUserId();
                String modifiedOn = dt.format(objectStateSummary.getCreatedDts());

            %>
            <tr>
                <td><%=objectStateSummary.getObjectStateTypeSummary().getName()%></td>
                <td><%=modifiedBy%></td>
                <td><%=modifiedOn%></td>
                <td><%=scrubString(objectStateSummary.getComments())%></td>
            </tr>
            <% } %>
        </tbody>
    </table>
    <% } %>

    <table class="table table-condensed table-bordered">
        <thead>
        <tr>
            <th style="min-width: 250px">Item</th>
            <th style="min-width: 200px">Value</th>
            <th style="white-space: nowrap">Modified By</th>
            <th style="white-space: nowrap">Modified On</th>

        </tr>
        </thead>
        <tbody>
        <%
            for (FormElementSummary element : sortedElements) {
                String modifiedBy = "";
                String modifiedOn = "";
                String previousModifiedBy = null;
                String previousModifiedOn = null;
                String valueName = "";
                int elementTypeId = element.getElementTypeId();
                if (element.getCurrentValueSummary() != null) {
                    modifiedBy = element.getCurrentValueSummary().getModifiedBy();
                    modifiedOn = dt.format(element.getCurrentValueSummary().getModifiedOn());
                }
                if (element.getPreviousValueSummary() != null) {
                    previousModifiedBy = element.getPreviousValueSummary().getModifiedBy();
                    previousModifiedOn = dt.format(element.getPreviousValueSummary().getModifiedOn());
                }
                if (element.getElementSummary() != null && element.getElementSummary().getValueDefSummary() != null) {
                    valueName = element.getElementSummary().getValueDefSummary().getName();
                }

                ValueSummary valueSummary = element.getCurrentValueSummary();
                ValueDefSummary valueDefSummary = element.getElementSummary().getValueDefSummary();
                ValueSummary previousValueSummary = element.getPreviousValueSummary();
                Integer iIndentAmount = hash.get(element.getElementId());
                if (iIndentAmount == null) {
                    iIndentAmount = 0;
                }
                String indentAmount = iIndentAmount + "px";
        %>
        <tr>
            <td>
                <div style="margin-left: <%=indentAmount%>">
                    <div style="float: left">
                        <i class="<%= getFolderIcon(element) %>"></i>&nbsp;
                    </div>
                    <div style="margin-left: 25px;">
                        <%= valueName %>
                    </div>
                </div>

            </td>
            <td>
                <my:reportValue valueSummary="<%=valueSummary%>" valueDefSummary="<%=valueDefSummary%>"
                                previousValueSummary="<%=previousValueSummary%>"></my:reportValue>
            </td>
            <td style="white-space: nowrap"><%=modifiedBy%>
                <% if (previousModifiedBy != null) {%>
                <br><span class="auditText"><%=previousModifiedBy%></span>
                <% } %>
            </td>
            <td style="white-space: nowrap"><%=modifiedOn%>
                <% if (previousModifiedOn != null) {%>
                <br><span class="auditText"><%=previousModifiedOn%></span>
                <% } %>
            </td>
        </tr>
        <%
            }
        %>
        </tbody>

    </table>
</div>
</body>
</html>