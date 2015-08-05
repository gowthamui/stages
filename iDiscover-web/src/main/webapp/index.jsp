<%@ page import="org.ihc.hwcir.iDiscover.BrowserInfo" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    BrowserInfo browserInfo = new BrowserInfo(request.getHeader("user-agent"));

    String redirectURL = "auth/index.jsp";
    if(!browserInfo.isSupported()){
        redirectURL = "unauth/unsupportedBrowser.jsp";
    }
    response.sendRedirect(redirectURL);
%>
<html>
<head>
    <title></title>
</head>
<body>

</body>
</html>