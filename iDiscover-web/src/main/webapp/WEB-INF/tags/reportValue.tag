<%@ tag import="org.ihc.hwcir.iDiscover.WebUtilities" %>
<%@ tag import="org.ihc.hwcir.iDiscover.common.Utilz" %>
<%@ tag import="java.text.DateFormat" %>
<%@ taglib prefix="my" tagdir="/WEB-INF/tags" %>
<%@ tag body-content="empty" %>
<%@ attribute name="valueSummary" required="true" type="org.ihc.hwcir.iDiscover.models.ValueSummary" %>
<%@ attribute name="previousValueSummary" type="org.ihc.hwcir.iDiscover.models.ValueSummary" %>
<%@ attribute name="valueDefSummary" required="true" type="org.ihc.hwcir.iDiscover.models.ValueDefSummary" %>

<%
    String formattedResult = null;
    DateFormat dt = Utilz.ShortDateTimeFormat;


%>

<%

    String auditValue= Utilz.getFormattedValue(previousValueSummary, valueDefSummary);

    try {
        if (valueSummary != null && valueDefSummary != null) {
            formattedResult= Utilz.getFormattedValue(valueSummary, valueDefSummary);

        }
    } catch (Exception ex) {
        ex.printStackTrace();
    }

    if (formattedResult == null) {
        formattedResult = "";
    }

%>
<div>

    <%=formattedResult%>

    <% if(auditValue!=null) {%>
    <br>
    <span class="auditText"><%=auditValue%></span>
    <% } %>
</div>

