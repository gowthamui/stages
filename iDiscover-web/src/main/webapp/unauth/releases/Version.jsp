<%@page language="java"  %>
<%@page import="org.ihc.hwcir.iDiscover.ClientDataAccess" %>
<%@page import="org.ihc.hwcir.iDiscover.Constants" %>
<%@ page import="org.ihc.hwcir.iDiscover.common.Mailer" %>
<%@ page import="org.ihc.hwcir.iDiscover.entities.AppFile" %>
<%@ page import="javax.mail.internet.InternetAddress" %>
<%@ page import="javax.naming.Context" %>
<%@ page import="javax.naming.InitialContext" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.List" %>

<%
    final Context context = new InitialContext();
    ClientDataAccess dataAccess=(ClientDataAccess)context.lookup(Constants.CLIENT_DATA_ACCESS);

    AppFile appFile = dataAccess.currentIOSClient();

    String versionNo = "0.0";
    if(appFile!=null && appFile.getVersion()!=null){
        versionNo=appFile.getVersion();
    }
%>
<%=versionNo%>

