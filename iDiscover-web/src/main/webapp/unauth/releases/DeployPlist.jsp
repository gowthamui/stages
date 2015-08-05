<%@page language="java"  %>
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
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>items</key>
        <array>
            <dict>
                <key>assets</key>
                <array>
                    <dict>
                        <key>kind</key>
                        <string>software-package</string>
                        <key>url</key>
                        <string><%=serverName%>/unauth/releases/appFile/iDiscoverclient-<%=versionNo%>.ipa</string>
                    </dict>
                    <dict>
                        <key>kind</key>
                        <string>display-image</string>
                        <key>needs-shine</key>
                        <false/>
                        <key>url</key>
                        <string><%=serverName%>/unauth/releases/Icon-72.png</string>
                    </dict>
                </array>
                <key>metadata</key>
                <dict>
                    <key>bundle-identifier</key>
                    <string>org.ihc.hwcir.idiscover</string>
                    <key>bundle-version</key>
                    <string><%=versionNo%></string>
                    <key>kind</key>
                    <string>software</string>
                    <key>subtitle</key>
                    <string></string>
                    <key>title</key>
                    <string>Discover</string>
                </dict>
            </dict>
        </array>
    </dict>
</plist>
