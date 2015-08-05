package org.ihc.hwcir.iDiscover.servlets;

import org.apache.log4j.Logger;
import org.ihc.hwcir.iDiscover.*;
import org.ihc.hwcir.iDiscover.cdr.CDRBean;
import org.ihc.hwcir.iDiscover.common.Utilz;
import org.ihc.hwcir.iDiscover.models.ParticipantSearchSummary;
import org.ihc.hwcir.iDiscover.requests.DefaultResponse;

import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by mhebert on 6/2/14.
 */
public class MMISearchServlet extends HttpServlet {

    transient private static Logger logger = Logger.getLogger(SecurityUtilities.class);

    private CDRBean cdrBean=null;

    private CDRBean getCdrBean(){
        try{
            final javax.naming.Context context = new InitialContext();
            if(cdrBean==null){
                cdrBean=(CDRBean)context.lookup(Constants.CDR_BEAN);
            }


        }catch (Exception ex) {
            ex.printStackTrace();
        }
        return cdrBean;
    }


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        ParticipantSearchSummary summary = new ParticipantSearchSummary();
        summary.setFirstName("Pi");
        summary.setLastName("Te");
        DefaultResponse<ParticipantSearchSummary> participantResponse = getResponse(request,summary);
        response.setContentType("application/json");
        response.getWriter().write(Utilz.getGson().toJson(participantResponse));
    }

    private DefaultResponse<ParticipantSearchSummary> getResponse(HttpServletRequest request, ParticipantSearchSummary summary) {
        String samlToken = WebUtilities.getSamlToken(request);

        CDRBean cdrUtilz=getCdrBean();
        summary.setSamlToken(samlToken);
        DefaultResponse<ParticipantSearchSummary> participantResponse=cdrUtilz.searchByCDR(summary);
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

