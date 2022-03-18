package com.raon.approval.data;

public class FixVariable {

    private static String driver = "";
    private static String url = "";
    private static String id = "";
    private static String pw = "";
    private static String ssoKey = "";
    private static String ssoIp = "";
    private static int ssoPort = 7000;

    public static String getDriver() {
        return driver;
    }

    public static void setDriver(String driver) {
        FixVariable.driver = driver;
    }

    public static String getUrl() {
        return url;
    }

    public static void setUrl(String url) {
        FixVariable.url = url;
    }

    public static String getId() {
        return id;
    }

    public static void setId(String id) {
        FixVariable.id = id;
    }

    public static String getPw() {
        return pw;
    }

    public static void setPw(String pw) {
        FixVariable.pw = pw;
    }

    public static String getSsoKey() {
        return ssoKey;
    }

    public static void setSsoKey(String ssoKey) {
        FixVariable.ssoKey = ssoKey;
    }

    public static String getSsoIp() {
        return ssoIp;
    }

    public static void setSsoIp(String ssoIp) {
        FixVariable.ssoIp = ssoIp;
    }

    public static int getSsoPort() {
        return ssoPort;
    }

    public static void setSsoPort(int ssoPort) {
        FixVariable.ssoPort = ssoPort;
    }
}
