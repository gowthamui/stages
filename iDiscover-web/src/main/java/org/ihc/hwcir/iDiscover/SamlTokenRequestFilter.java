package org.ihc.hwcir.iDiscover;

import java.io.IOException;
import java.util.Calendar;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.ihc.security.tam.saml.XmlUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.datatype.DatatypeConfigurationException;
import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * Created by mhebert on 6/9/14.
 */
public class SamlTokenRequestFilter implements Filter {

    public static final String SAML_HEADER = "ih-saml20";
    private static Logger logger = Logger.getLogger(SamlTokenRequestFilter.class);

    public void destroy() {
        // TODO Auto-generated method stub

    }

    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest)req;
        HttpServletResponse response = (HttpServletResponse)res;
        logger.debug("saml before callto addSamlToken :" + request.getHeader(SAML_HEADER) + request.getRequestURI());
        addSamlToken(request, response);
        chain.doFilter(req, res);

    }

    public void init(FilterConfig arg0) throws ServletException {
        // TODO Auto-generated method stub

    }

    private void addSamlToken(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String samlHeader = req.getHeader(SAML_HEADER);
        HttpSession session = req.getSession(true);
        String saml = (String)session.getAttribute(SAML_HEADER);
        if (StringUtils.isNotEmpty(saml)) {
            if (!isTimestampValid(saml)) {
                session.removeAttribute(SAML_HEADER);
                saml = null;
                logger.debug("session saml was expired.  getting a new one");
            }
        }
        if(StringUtils.isNotEmpty(samlHeader)) {
            saml=samlHeader;
            logger.debug("Saml before setting to Session attribute-----------------"+saml);
            session.setAttribute(SAML_HEADER, saml);
        }
        if (StringUtils.isEmpty(saml)) {
            logger.debug("SAML token not found returning 401");
            res.setHeader("WWW-Authenticate",
                    "Basic realm=\"SAML\"");
            res.sendError(401);
            res.flushBuffer();
        }

    }

    private boolean isTimestampValid(String saml) {
        Document doc = XmlUtils.parseText(saml);
        Element samlElement = doc.getDocumentElement();
        Element conditions =  null;
        boolean result = true;
        NodeList list = samlElement.getElementsByTagNameNS("urn:oasis:names:tc:SAML:2.0:assertion", "Conditions");
        if (list == null || list.getLength() == 0) {
            conditions = null;
        }
        else {
            conditions = (Element)list.item(0);
            Calendar notBefore = toCalendar(conditions.getAttribute("NotBefore"));
            Calendar notOnOrAfter = toCalendar(conditions.getAttribute("NotOnOrAfter"));
            Calendar now = Calendar.getInstance();
            if (now.before(notBefore)) {
                result = false;
            }
            else if (now.after(notOnOrAfter)) {
                result = false;
            }
            else {
                result = true;
            }
        }
        return result;
    }

    private Calendar toCalendar(String xmlDateTime) {
        DatatypeFactory factory = null;
        try {
            factory = DatatypeFactory.newInstance();
        } catch (DatatypeConfigurationException e) {
            // TODO Auto-generated catch block
            logger.debug("DatatypeConfigurationException occurred trying to validate " +
                    "the conditions timestamps", e);
            e.printStackTrace();
        }
        //TODO: Possible null pointer exception for factory.
        XMLGregorianCalendar calendar = factory.newXMLGregorianCalendar(xmlDateTime);
        return calendar.toGregorianCalendar();
    }

}
