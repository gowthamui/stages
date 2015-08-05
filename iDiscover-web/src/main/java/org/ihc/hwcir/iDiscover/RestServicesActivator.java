package org.ihc.hwcir.iDiscover;


import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import java.util.HashSet;
import java.util.Set;

/**
 * @author mhebert
 */
@ApplicationPath("/auth/ws")
public class RestServicesActivator extends Application
{

    public Set<Class<?>> getClasses() {
        Set<Class<?>> s = new HashSet<Class<?>>();
        s.add(ClientDataAccessService.class);
        return s;
    }


}