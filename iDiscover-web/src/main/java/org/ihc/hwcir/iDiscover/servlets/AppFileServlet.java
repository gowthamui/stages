package org.ihc.hwcir.iDiscover.servlets;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.ihc.hwcir.iDiscover.common.ByteArrayToBase64TypeAdapter;
import org.ihc.hwcir.iDiscover.ClientDataAccess;
import org.ihc.hwcir.iDiscover.Constants;
import org.ihc.hwcir.iDiscover.common.DateAdapter;
import org.ihc.hwcir.iDiscover.common.Utilz;
import org.ihc.hwcir.iDiscover.entities.AppFile;
import org.ihc.hwcir.iDiscover.models.AppFileSummary;
import org.ihc.hwcir.iDiscover.models.ModelConverter;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.Date;

/**
 * @author mhebert
 */
public class AppFileServlet extends HttpServlet {
    private Gson gson=new GsonBuilder().
            registerTypeHierarchyAdapter(Date.class, new DateAdapter()).
            registerTypeHierarchyAdapter(byte[].class, new ByteArrayToBase64TypeAdapter()).create();


    // appFileTypeId/name/version
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        if(!Constants.APP_FILE_UPLOAD_KEY.equalsIgnoreCase(request.getHeader(Constants.APP_FILE_UPLOAD_HEADER))){
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        }else{
            InputStream inputStream=request.getInputStream();
            byte[]  bytes = Utilz.convert(inputStream);

            String[] parts= request.getPathInfo().split("/");
            try {
                final Context context = new InitialContext();
                ClientDataAccess dataAccess = (ClientDataAccess) context.lookup(Constants.CLIENT_DATA_ACCESS);

                AppFile appFile=null;
                int appFileTypeId =    Integer.parseInt(parts[1]);
                if(appFileTypeId==1){
                    appFile=dataAccess.currentIOSClient();
                }

                AppFileSummary appFileSummary = null;
                if(appFile==null){
                    appFileSummary=new AppFileSummary();
                    appFileSummary.setName(parts[2]);
                    appFileSummary.setVersion(parts[3]);
                    appFileSummary.setAppFileTypeId(appFileTypeId);
                    appFileSummary.setBytes(bytes);
                    appFileSummary.setFileSize(new BigDecimal(bytes.length));
                    appFileSummary.setMimeType("application/octet-stream");
                }else{
                    appFileSummary= ModelConverter.convert(appFile);
                    appFileSummary.setName(parts[2]);
                    appFileSummary.setVersion(parts[3]);
                    appFileSummary.setBytes(bytes);
                    appFileSummary.setMimeType("application/octet-stream");
                    appFileSummary.setFileSize(new BigDecimal(bytes.length));
                }
                dataAccess.updateAppFile(appFileSummary);
            } catch (Exception ex) {
                ex.printStackTrace();
                response.getOutputStream().println("ERROR: " + ex.getMessage());
            }
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        try {
            final Context context = new InitialContext();
            ClientDataAccess dataAccess = (ClientDataAccess) context.lookup(Constants.CLIENT_DATA_ACCESS);

            if (request.getPathInfo() != null) {
                if (request.getPathInfo().indexOf(".ipa") > 0) {

                    AppFile appFile=dataAccess.currentIOSClient();
                    if(appFile!=null){
                        String mimeType = appFile.getMimeType();
                        byte[] bytes = null;
                        if(appFile.getBytes()!=null){
                            bytes=appFile.getBytes().getBytes(1, (int) appFile.getBytes().length());
                        }

                        boolean isDownload=true;
                        if(mimeType!=null){
                            if(mimeType.toLowerCase().startsWith("image") || mimeType.toLowerCase().contains("pdf")){
                                isDownload=false;
                            }
                        }

                        response.setContentType(mimeType);
                        if(isDownload){

                            response.setHeader("Content-Disposition", "attachment;filename=" + appFile.getName());
                        }
                        if(bytes!=null){
                            response.getOutputStream().write(bytes);
                        }

                    }else{
                        response.getOutputStream().println("COULD NOT FIND FILE:" + request.getPathInfo());
                    }
                }
            } else {
                response.getOutputStream().println("UNKNOWN");
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            response.getOutputStream().println("ERROR: " + ex.getMessage());
        }

    }
}
