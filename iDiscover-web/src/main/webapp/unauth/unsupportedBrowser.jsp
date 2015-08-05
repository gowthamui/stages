<%@ page import="org.ihc.hwcir.iDiscover.BrowserInfo" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    BrowserInfo browserInfo = new BrowserInfo(request.getHeader("user-agent"));
%>
<html>
<head>
    <title>ResearchDoc - Unsupported Browser</title>
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.0-rc1/css/bootstrap.min.css">
    <link rel="shrotcut icon" href="../images/favicon.ico">
    <style>
        .unsupported{
            background-color: #0f4787;
            color: #ffffff;
            font-family: "Garamond","Helvetica Neue",Helvetica,"Myriad Pro","Lucida Grande",sans-serif;
        }

        .unsupported .title {
            font-size: 112px;
        }

        .unsupported .subTitle{
            font-size: 50px;
        }

        .unsupported a{
            color: #ffffff;
            text-decoration: none;
        }
        .unsupported .smallTitle{
            font-size: 30px;
        }

        .unsupported .button{
            cursor: pointer;
            padding: 5px;
            padding-left: 10px;
            padding-right: 10px;
            padding-top: 7px;
            border-radius: 3px;
            border: solid 1px;
            border-color: white;
            font-size: 20px;
            font-family: "Garamond","Helvetica Neue",Helvetica,"Myriad Pro","Lucida Grande",sans-serif;
            font-weight: lighter;

        }

        .chromeIcon{
            width: 135px;
            height: 135px;
            margin: 0 auto 20px;
        }
        a.unsupported:hover{
            text-decoration: none ;
            color: white;
        }

        .unsupportedButton:hover{
            text-decoration: none ;
            background-color: white;
            color: #5f9e3a;
        }
    </style>
</head>
<body class="unsupported">

<div class="title" style="text-align: center; margin-top: 50px">
    <a href="../index.jsp" class="unsupported"><img src="../images/ResearchDocWhite.png" height="200px"></a>
</div>
<div class="subTitle" style="text-align: center;">
    Your Web Browser is Not Supported

    <div style="margin-bottom: 15px" class="smallTitle">Only the Google Chrome browser is supported currently</div>
    <div style="margin-bottom: 15px;font-size:20px" >Please contact your IT representative to have Chrome installed</div>

</div>
</body>
</html>

