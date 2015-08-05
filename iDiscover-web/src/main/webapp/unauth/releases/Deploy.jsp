<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@ page contentType="text/html; charset=iso-8859-1" language="java"  %>
<%@page import="org.ihc.hwcir.iDiscover.ClientDataAccess" %>
<%@ page import="org.ihc.hwcir.iDiscover.Constants" %>
<%@ page import="org.ihc.hwcir.iDiscover.entities.AppFile" %>
<%@ page import="javax.naming.Context" %>
<%@ page import="javax.naming.InitialContext" %>

<%



    final Context context = new InitialContext();
    ClientDataAccess dataAccess=(ClientDataAccess)context.lookup(Constants.CLIENT_DATA_ACCESS);

    AppFile appFile = dataAccess.currentIOSClient();

    String versionNo = "0.0";
    if(appFile!=null && appFile.getVersion()!=null){
        versionNo=appFile.getVersion();
    }

    String hostName=request.getServerName();
    int port=request.getServerPort();

    String serverName="https://rsoweb.co.ihc.com/iDiscover-web";
%>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>ResearchDoc</title>

    <!-- favicon -->
    <link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">

    <style>
        #spacer{
            margin-top:70px;
        }
        #title {
            margin: 0px auto;
            text-align: center;

        }
        #downloadBox {
            margin: 0px auto;
            margin-top:30px;
            margin-bottom:10px;

            text-align:center;
        }
    </style>
</head>
<body>
<div id="spacer"/>
<div id="title">
    <a href="itms-services://?action=download-manifest&url=<%=serverName%>/unauth/releases/DeployPlist.jsp">
        <img src="Icon-72@2x.png"/>
    </a>
    <div id="downloadBox">
        <a href="itms-services://?action=download-manifest&url=<%=serverName%>/unauth/releases/DeployPlist.jsp">Download ResearchDoc iPad App ~ Version <%=versionNo%></a>
    </div>
</div>
</body>
</html>