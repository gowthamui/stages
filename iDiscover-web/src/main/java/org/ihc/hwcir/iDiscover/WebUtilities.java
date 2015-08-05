package org.ihc.hwcir.iDiscover;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.ihc.hwcir.iDiscover.entities.Users;
import org.ihc.hwcir.iDiscover.models.ModelConverter;
import org.ihc.hwcir.iDiscover.models.UserInfo;
import org.ihc.hwcir.iDiscover.models.UsersSummary;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * @author mhebert
 */
public class WebUtilities {

    transient private static Logger logger = Logger.getLogger(WebUtilities.class);

    public static UserInfo getUserInfo(HttpServletRequest request){
        UserInfo userInfo=new UserInfo();
        if(request.getAttribute(Constants.TAM_AUTHENTICATED_FILTER_USER)!=null){
            org.ihc.security.tam.User tamUser = (org.ihc.security.tam.User) request.getAttribute(Constants.TAM_AUTHENTICATED_FILTER_USER);
            if(tamUser!=null){
                userInfo.setUserId(tamUser.getUsername());
                userInfo.setFirstName(tamUser.getFirstName());
                userInfo.setLastName(tamUser.getLastName());
                userInfo.setEmail(tamUser.getEmail());
                userInfo.setMiddleName(tamUser.getMiddleName());
            }
        }
        return userInfo;
    }

    public static String getSamlToken(HttpServletRequest request){
        String token=null;
        if(request.getHeader(Constants.TAM_SAML_TOKEN)!=null){
            token =(String)request.getHeader(Constants.TAM_SAML_TOKEN);
            if(StringUtils.isEmpty(token)){
                token=null;
            }
        }
        if(token==null){
            HttpSession session = request.getSession(true);
            token = (String)session.getAttribute(Constants.TAM_SAML_TOKEN);
            if(StringUtils.isEmpty(token)){
                token=null;
            }
        }
        return token;
    }
    public static String getUsername(HttpServletRequest request) {
        String userId=null;
        if(request.getAttribute(Constants.TAM_AUTHENTICATED_FILTER_USER)!=null){
            org.ihc.security.tam.User tamUser = (org.ihc.security.tam.User) request.getAttribute(Constants.TAM_AUTHENTICATED_FILTER_USER);
            userId = tamUser.getUsername();
        }
        return userId;
    }

    public static boolean isLoggedIn(HttpServletRequest request){
        return getUsername(request)!=null;
    }

    public static void initializeSession(HttpServletRequest request,ClientDataAccess clientDataAccess){
        if(request.getAttribute(Constants.TAM_AUTHENTICATED_FILTER_USER)!=null){
            if(request.getSession().getAttribute(Constants.SESSION_INITIALIZED)==null){
                request.getSession().setAttribute(Constants.SESSION_INITIALIZED,true);
                org.ihc.security.tam.User tamUser = (org.ihc.security.tam.User) request.getAttribute(Constants.TAM_AUTHENTICATED_FILTER_USER);

                UsersSummary summary = new UsersSummary();
                summary.setId(tamUser.getUsername());
                Users currUser = clientDataAccess.getEntityManager().find(Users.class,tamUser.getUsername());
                if(currUser!=null){
                    summary= ModelConverter.convert(currUser);
                }
                summary.setFirstName(tamUser.getFirstName());
                summary.setLastName(tamUser.getLastName());
                summary.setEmail(tamUser.getEmail());
                summary.setUserId(tamUser.getUsername());
                clientDataAccess.update(summary);
            }
        }
    }

    public static byte[] convert(String path, ServletContext context) {
        byte[] bytes = null;
        try {
            // getBytes
            InputStream stream = context.getResourceAsStream(path);
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();

            int nRead;
            byte[] data = new byte[16384];
            while ((nRead = stream.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            buffer.flush();
            bytes = buffer.toByteArray();

        } catch (Exception ex) {
            logger.error(ex);
        }

        return bytes;
    }

}
