package org.ihc.hwcir.iDiscover.servlets;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.ihc.enterprise.empi.EnterprisePersonProxy;
import org.ihc.hwcir.iDiscover.*;
import org.ihc.hwcir.iDiscover.common.Utilz;
import org.ihc.hwcir.iDiscover.models.ParticipantSearchSummary;
import org.ihc.hwcir.iDiscover.requests.DefaultResponse;

import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * Created by mhebert on 6/2/14.
 */
public class InitiateServlet extends HttpServlet {

    transient private static Logger logger = Logger.getLogger(SecurityUtilities.class);


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        ParticipantSearchSummary summary = new ParticipantSearchSummary();
        summary.setFirstName("Pi");
        summary.setLastName("Te");
        DefaultResponse<ParticipantSearchSummary> participantResponse = getResponse(request,summary);
        response.setContentType("application/json");
        response.getWriter().write(Utilz.getGson().toJson(participantResponse));
    }

    private DefaultResponse<ParticipantSearchSummary> getResponse(HttpServletRequest request, ParticipantSearchSummary summary) {
        DefaultResponse<ParticipantSearchSummary> participantResponse = new DefaultResponse<>();
        String samlToken = WebUtilities.getSamlToken(request);
        String username = WebUtilities.getUsername(request);

        if (StringUtils.isEmpty(samlToken)) {
            participantResponse.setHasError(true);
            participantResponse.setErrorMessage("NO SAML TOKEN: " + samlToken);
        } else {

            try {
                EnterprisePersonProxy proxy = new EnterprisePersonProxy(username, samlToken);
                participantResponse.setItems(proxy.searchForParticipant(summary));
            } catch (Exception ex) {
                participantResponse.setHasError(true);
                participantResponse.setErrorMessage("USER SAML TOKEN: " + Utilz.convert(ex));
                logger.warn(ex);
                ex.printStackTrace();

            }
        }
        return participantResponse;
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String body = Utilz.getBody(request);
        ParticipantSearchSummary summary = Utilz.getGson().fromJson(body, ParticipantSearchSummary.class);
        DefaultResponse<ParticipantSearchSummary> participantResponse = getResponse(request,summary);
        response.setContentType("application/json");
        response.getWriter().write(Utilz.getGson().toJson(participantResponse));

    }

}

