import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.ihc.hwcir.iDiscover.common.DateAdapter;
import org.junit.Assert;
import org.junit.Test;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @author mhebert
 */
public class DateTests {

    @org.junit.Test
    public void dateSerializeTest() {
        Gson gson = new GsonBuilder().
                registerTypeHierarchyAdapter(Date.class, new DateAdapter()).create();
        String json = gson.toJson(new Date());
        Assert.assertTrue(json != null);
    }

    @org.junit.Test
    public void isoDate() {
        Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ssZ").create();
        System.out.println(gson.toJson(new Date()));
        Assert.assertNotNull(gson.toJson(new Date()));
    }

    //      YYYY = four-digit year
    //      MM   = two-digit month (01=January, etc.)
    //      DD   = two-digit day of month (01 through 31)
    //      hh   = two digits of hour (00 through 23) (am/pm NOT allowed)
    //      mm   = two digits of minute (00 through 59)
    //      ss   = two digits of second (00 through 59)
    //      s    = one or more digits representing a decimal fraction of a second
    //      TZD  = time zone designator (Z or +hh:mm or -hh:mm)
    public static Date parse( String input ) throws java.text.ParseException {

        //NOTE: SimpleDateFormat uses GMT[-+]hh:mm for the TZ which breaks
        //things a bit.  Before we go on we have to repair this.
        SimpleDateFormat df = new SimpleDateFormat( "yyyy-MM-dd'T'HH:mm:ssz" );

        //this is zero time so we need to add that TZ indicator for
        if ( input.endsWith( "Z" ) ) {
            input = input.substring( 0, input.length() - 1) + "GMT-00:00";
        } else {
            int inset = 6;

            String s0 = input.substring( 0, input.length() - inset );
            String s1 = input.substring( input.length() - inset, input.length() );

            input = s0 + "GMT" + s1;
        }

        return df.parse( input );

    }

    @org.junit.Test
    public void dateWithTimezoneOffset() {

        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
        DateFormat tzDateFormat =new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX");
        DateFormat netFormat=new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");

        String tzDate ="1980-05-01T06:00:00.000Z";
        String date = "2013-07-15T11:50:21-0600";
        String netDate ="1979-05-07T06:00:00Z";

        try {
            System.out.println(dateFormat.parse(date));
            System.out.println(tzDateFormat.parse(tzDate));
            System.out.println(netFormat.parse(netDate));

        } catch (Exception ex) {
            System.out.println(ex.getMessage());
            Assert.fail();
        }
    }


    @org.junit.Test
    public void dateDeserializeTest() {
        String date = "'2013-04-10T02:53:10.134-0600'";
        date = "'2013-04-17T11:12:43Z'";

        Gson gson = new GsonBuilder().
                registerTypeHierarchyAdapter(Date.class, new DateAdapter()).create();
        Date newDate = (Date) gson.fromJson(date, Date.class);
        Assert.assertTrue(newDate != null);
    }


    @Test
    public void testMilliseconds() {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        try {
            String date = "2013-04-17T11:12:43Z";
            format.parse(date);
            Assert.assertNotNull(format.parse(date));
        } catch (Exception ex) {
            ex.printStackTrace();
            Assert.fail(ex.getMessage());
        }
    }


}
