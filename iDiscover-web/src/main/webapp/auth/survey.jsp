<%@ page import="org.ihc.hwcir.iDiscover.BrowserInfo" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%
    BrowserInfo browserInfo = new BrowserInfo(request.getHeader("user-agent"));

    if(!browserInfo.isSupported()){
        String redirectURL = "../unauth/unsupportedBrowser.jsp";
        response.sendRedirect(redirectURL);
    }
%>


<jsp:include page="surveyBody.jsp" />