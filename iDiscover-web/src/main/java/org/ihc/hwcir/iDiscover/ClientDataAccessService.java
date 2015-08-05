package org.ihc.hwcir.iDiscover;

import au.com.bytecode.opencsv.CSVWriter;
import com.google.gson.Gson;
import org.apache.log4j.Logger;
import org.ihc.hwcir.iDiscover.common.UnauthorizedException;
import org.ihc.hwcir.iDiscover.common.Utilz;
import org.ihc.hwcir.iDiscover.entities.Value;
import org.ihc.hwcir.iDiscover.entities.ValueFile;
import org.ihc.hwcir.iDiscover.entities.ValueSignature;
import org.ihc.hwcir.iDiscover.jobs.DailyEmailJob;
import org.ihc.hwcir.iDiscover.models.*;
import org.ihc.hwcir.iDiscover.requests.AbstractRequest;
import org.ihc.hwcir.iDiscover.requests.DefaultResponse;

import javax.ejb.EJBException;
import javax.naming.InitialContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.*;
import java.net.URI;
import java.util.Enumeration;
import java.util.HashMap;

/**
 * @author mhebert
 */

@Path("/clientData")
public class ClientDataAccessService {

    transient private static Logger logger = Logger.getLogger(ClientDataAccessService.class);

    private ClientDataAccess dataAccess=null;

    private ClientDataAccess getDataService(){
        try{
            final javax.naming.Context context = new InitialContext();
            if(dataAccess==null){
                dataAccess=(ClientDataAccess)context.lookup(Constants.CLIENT_DATA_ACCESS);
            }


        }catch (Exception ex) {
            ex.printStackTrace();
        }
        return dataAccess;
    }


    public ClientDataAccessService(){

    }

    private Gson gson=Utilz.getGson();


    @POST
    @Path("data/{class}/{method}")
    @Consumes({MediaType.APPLICATION_JSON,MediaType.APPLICATION_XML})
    public Response processDataRequest(@Context HttpServletResponse response,@Context HttpServletRequest request,String xml,@PathParam("class") String className,@PathParam("method") String methodName) throws Exception{
        ClientDataAccess dataService = getDataService();
        Class clazz=Class.forName("org.ihc.hwcir.iDiscover.models." + className + "Summary");
        Object result =null;

        try{
        	AbstractRequest requestObject = buildRequest(request, xml, clazz);
            if(methodName.equalsIgnoreCase("view")){
                result=dataService.view(requestObject);
            }else if(methodName.equalsIgnoreCase("update")){
                result=dataService.update(requestObject);
            }else if(methodName.equalsIgnoreCase("query")){
                result=dataService.query(requestObject);
                DefaultResponse<?> item = (DefaultResponse<?>) result;
                dataService.update((AbstractRequest)item.getItem());
            }else if(methodName.equalsIgnoreCase("testQuery")){
                result=dataService.testQuery(requestObject);
            }else if(methodName.equalsIgnoreCase("search")){
                result=dataService.search(requestObject);
            }else if(methodName.equalsIgnoreCase("externalSearch")){
                    result=dataService.externalSearch(requestObject);
            }else if(methodName.equalsIgnoreCase("delete")){
                result=dataService.delete(requestObject);
            }else if(methodName.equalsIgnoreCase("email")){
                result=dataService.email(requestObject);
            }
            WebUtilities.initializeSession(request,getDataService());
            Cookie cookie=new Cookie("currentUser",WebUtilities.getUsername(request));
            cookie.setMaxAge(1000000);
            response.addCookie(cookie);
            return buildResponse(result);
        }catch(EJBException ex){
            ex.printStackTrace();
            if(ex.getCausedByException() instanceof UnauthorizedException){
                return Response.status(Response.Status.UNAUTHORIZED).build();
            }else{
                return Response.status(Response.Status.BAD_REQUEST).build();
            }
        } catch (Exception ex) {
        	logger.error(ex);
        	if (ex.getCause() instanceof NumberFormatException) {
        		return Response.status(Response.Status.NOT_ACCEPTABLE).entity("Error " + ex.getCause().getMessage() + ". Please enter a number in the \"#Value\" Field.").build();
			} else {
				return Response.status(Response.Status.BAD_REQUEST).entity(ex.getCause().getMessage()).build();
			}
		}
    }

    @GET
    @Path("currentUser")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCurrentUser(@Context HttpServletRequest request) throws  Exception{

        HashMap<String,String> userObject = new HashMap<>();
        String userId=WebUtilities.getUsername(request);
        WebUtilities.initializeSession(request,getDataService());
        userObject.put("id",userId);
        userObject.put("username",userId);
        return Response.ok(gson.toJson(userObject)).build();
    }

    @GET
    @Path("token")
    public Response getToken(@Context HttpServletRequest request) throws  Exception{
        String samlToken=WebUtilities.getSamlToken(request);
        return Response.ok(samlToken).build();
    }

    @POST
    @Path("heartbeat")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getHeartbeat(@Context HttpServletRequest request) throws  Exception{

        HashMap<String,String> userObject = new HashMap<>();
        userObject.put("id",WebUtilities.getUsername(request));
        return Response.ok(gson.toJson(userObject)).build();
    }

    @GET
    @Path("searchADT")
    @Produces(MediaType.APPLICATION_JSON)
    public Response searchADT(@Context HttpServletRequest request) throws  Exception{
        ClientDataAccess dataService = getDataService();
        ParticipantSearchSummary summary = new ParticipantSearchSummary();
        summary.setLastName("Test");
        return buildResponse(dataService.search(summary));
    }

    @GET
    @Path("image/ValueSignature/{id}")
    public Response getSignatureImage(@PathParam("id") int id) throws  Exception{
        ClientDataAccess dataService = getDataService();
        ValueSignature sig=(ValueSignature)dataService.viewById(ValueSignature.class,id);
        if(sig!=null && sig.getBytes()!=null){
            return Response.ok(sig.getBytes().getBytes(1,(int)sig.getBytes().length()),sig.getMimeType()).build();
        }else{
            return Response.ok(Utilz.getResourceFile("transparent.png"),"image/png").build();
        }
    }

    @GET
    @Path("image/ValueInitials/{id}")
    public Response getInitialsImage(@PathParam("id") int id) throws  Exception{
        ClientDataAccess dataService = getDataService();
        Value value=(Value)dataService.viewById(Value.class,id);
        if(value!=null && value.getInitials()!=null){
            return Response.ok(Utilz.convertToBytes(value.getInitials()),"image/png").build();
        }else{
            return Response.ok(Utilz.getResourceFile("transparent.png"),"image/png").build();
        }
    }

    @GET
    @Path("file/SignedDocument/{formElementId}")
    public Response getSignedDocument(@Context HttpServletRequest request,@PathParam("formElementId") int formElementId) throws  Exception{

        ClientDataAccess dataService = getDataService();
        ConsentSummary summary= dataService.getConsent(formElementId);
        String mimeType = summary.getMimeType();
        byte[] bytes = summary.getBytes();
        return Response.ok(bytes,mimeType).build();
    }

    @GET
    @Path("file/ValueFile/{id}")
    public Response getFile(@Context HttpServletRequest request,@PathParam("id") int id) throws  Exception{
        ClientDataAccess dataService = getDataService();
        ValueFile file=(ValueFile)dataService.viewById(ValueFile.class,id);
        String mimeType = file.getMimeType();

        if(file.getHasBytes()!=null && file.getHasBytes()==1){
            byte[] bytes = Utilz.getFileBytes(file);
            return Response.ok(bytes,mimeType).build();
        }else{
            return Response.temporaryRedirect(new URI(file.getFilePath())).build();
        }
    }

    @GET
    @Path("file/ValueFileDownload/{id}")
    public Response getFileDownload(@Context HttpServletRequest request,@PathParam("id") int id) throws  Exception{
        ClientDataAccess dataService = getDataService();
        ValueFile file=(ValueFile)dataService.viewById(ValueFile.class,id);
        String mimeType = file.getMimeType();

        if(file.getHasBytes()!=null && file.getHasBytes()==1){
            byte[] bytes = Utilz.getFileBytes(file);
            return Response.ok(bytes,mimeType).header("Content-Disposition","attachment;filename="+file.getName()).build();

        }else{
            return Response.temporaryRedirect(new URI(file.getFilePath())).build();
        }

    }

    @GET
    @Path("dataDictionary/{id}")
    public Response getDataDictionary(@Context HttpServletRequest request,@PathParam("id") int id) throws  Exception{
        ClientDataAccess dataService = getDataService();
        DataExportSummary result =dataService.getDataDictionary(id);
        byte[] zipFile=Utilz.createZip(result.getFiles());
        return Response.ok(zipFile,"multipart/x-zip").header("Content-Disposition","attachment;filename="+"dataDictionary.zip").build();
    }

    @GET
    @Path("dataExport/{id}")
    public Response getDataExport(@Context HttpServletRequest request,@PathParam("id") int id) throws  Exception{
        ClientDataAccess dataService = getDataService();
        String userId=WebUtilities.getUsername(request);
        WebUtilities.initializeSession(request,getDataService());
        DataExportSummary result =dataService.getDataExport(id,userId);
        byte[] zipFile=Utilz.createZip(result.getFiles());
        return Response.ok(zipFile,"multipart/x-zip").header("Content-Disposition","attachment;filename="+"dataExport.zip").build();
    }

    @POST
    @Path("csv")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response toCSV(@Context HttpServletRequest request,String body) throws  Exception{
        CSVSummary summary=gson.fromJson(body,CSVSummary.class);
        StringWriter stringWriter=new StringWriter();
        CSVWriter writer = new CSVWriter(stringWriter);
        if(summary.getColumns()!=null){
            String[] columns=summary.getColumns().toArray(new String[summary.getColumns().size()]);
            writer.writeNext(columns);
        }
        writer.writeAll(summary.getRows());
        writer.flush();
        String filename=summary.getFileName();
        if(filename==null){
            filename="dataexport.csv";
        }
        byte[] bytes=stringWriter.toString().getBytes();

        return Response.ok(bytes,"text/csv").header("Content-Disposition","attachment;filename="+filename).build();
    }

    @POST
    @Path("tocsv")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response toCSVFile(@Context HttpServletRequest request,String body) throws  Exception{
        String filename="dataexport.csv";
        byte[] bytes=body.getBytes();
        return Response.ok(bytes,"text/csv").header("Content-Disposition","attachment;filename="+filename).build();
    }

    @GET
    @Path("deIdentifiedDataExport/{id}")
    public Response getDeIdentifiedDataExport(@Context HttpServletRequest request,@PathParam("id") int id) throws Exception{
        ClientDataAccess dataService = getDataService();
        String userId=WebUtilities.getUsername(request);
        WebUtilities.initializeSession(request,getDataService());
        DataExportSummary result =dataService.getDeIdentifiedDataExport(id,userId);
        byte[] zipFile=Utilz.createZip(result.getFiles());
        return Response.ok(zipFile,"multipart/x-zip").header("Content-Disposition","attachment;filename="+"dataDictionaryDeIdentified.zip").build();

    }

    private <T extends AbstractRequest> T buildRequest(HttpServletRequest request,String xml,Class<T> type) throws Exception{
        if(xml==null || xml.trim().length()==0){
            xml="{}";
        }
        T r = type.cast(gson.fromJson(xml, type));
        WebUtilities.initializeSession(request,getDataService());
        r.setUserId(WebUtilities.getUsername(request));
        r.setSamlToken(WebUtilities.getSamlToken(request));
        r.setUserInfo(WebUtilities.getUserInfo(request));
        return r;
    }

    private Response buildResponse(Object response) throws Exception{
        String json = gson.toJson(response);
        return Response.ok(json,MediaType.APPLICATION_JSON).build();

    }


    @GET
    @Path("dailyEmailJob")
    public Response scheduleBeanTest(){
        DailyEmailJob.execute(getDataService());
        return Response.ok().build();
    }

}