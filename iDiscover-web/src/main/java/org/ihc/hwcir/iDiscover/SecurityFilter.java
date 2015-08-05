package org.ihc.hwcir.iDiscover;


import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class SecurityFilter implements Filter {

    transient private static Logger logger = Logger.getLogger(SecurityFilter.class);


    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;

        boolean isTokenValid=true;
        String token=WebUtilities.getSamlToken(request);
        if(StringUtils.isEmpty(token)){
            isTokenValid=false;
        }else{
            Object oldToken = request.getSession().getAttribute("HAS_TOKEN");
            if(oldToken!=null && ((Boolean)oldToken)==true){
                isTokenValid=false;
                request.getSession().setAttribute("HAS_TOKEN",null);
            }else{
                request.getSession().setAttribute("HAS_TOKEN",new Boolean(true));
            }
        }

        if(!isTokenValid){
            ((HttpServletResponse)res).sendError(HttpServletResponse.SC_UNAUTHORIZED);
        }else{
            chain.doFilter(req, res);
        }
    }

    public void destroy() {
        //add code to release any resource
    }
}
