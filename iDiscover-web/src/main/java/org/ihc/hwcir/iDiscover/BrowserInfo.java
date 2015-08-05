package org.ihc.hwcir.iDiscover;

/**
 * @author mhebert
 */
public class BrowserInfo {
    private String userAgent,browserName,browserVer;

    private boolean isTablet=false;
    private boolean isPhone=false;

    public BrowserInfo(String userAgent){
        this.userAgent=userAgent;
        process();
    }
    private void process(){
        browserName="unknown";
        browserVer="unknown";
        if(userAgent.contains("Chrome")){ //checking if Chrome
            browserName="Chrome";
        }
        else if(userAgent.contains("Firefox")){  //Checking if Firefox
            browserName="Firefox";
        }
        else if(userAgent.contains("MSIE")){ //Checking if Internet Explorer
            browserName="MSIE";
        } else if(userAgent.contains("Safari")){ //Checking if Safari
            browserName="Safari";
        }
        if(userAgent.contains("iPhone")){
            isPhone=true;
        }
        if(userAgent.contains("iPad") || userAgent.contains("iPod")){
            isTablet=true;
        }
        if(userAgent.contains("Android")){
            if(userAgent.contains("Mobile")){
                isPhone=true;
            }else{
                isTablet=true;
            }
        }
    }

    public boolean isTablet() {
        return isTablet;
    }

    public boolean isPhone() {
        return isPhone;
    }

    public boolean isSupported(){
        boolean isValid=false;
        if("Chrome".equalsIgnoreCase(browserName) || "Safari".equalsIgnoreCase(browserName)){
            isValid=true;
        }
        return isValid;
    }
    public String getName(){
        return browserName; //returning browser name
    }
    public String getVersion(){
        return browserVer;  //returning browser version
    }
}