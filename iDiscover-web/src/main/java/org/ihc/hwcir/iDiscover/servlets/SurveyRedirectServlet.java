package org.ihc.hwcir.iDiscover.servlets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by mhebert on 3/25/14.
 */
public class SurveyRedirectServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String redirectPath=request.getRequestURI();
        redirectPath=redirectPath.replace("surveyLink","survey.jsp#");
        response.sendRedirect(redirectPath);
    }
}
