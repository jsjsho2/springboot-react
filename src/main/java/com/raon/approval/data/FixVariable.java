package com.raon.approval.data;

import java.util.HashMap;
import java.util.Map;

public class FixVariable {

    private static String driver = "";
    private static String url = "";
    private static String id = "";
    private static String pw = "";
    private static String ssoKey = "";
    private static String ssoIp = "";
    private static int ssoPort = 7000;

    private static String profileId = "";

    private static Map<String, String> menu = new HashMap<String, String>() {
        {
            put("a0", "[권한] 상태");
            put("a01", "[권한] 상태 - 역할&서비스 구조");
            put("a02", "[권한] 상태 - 반환");
            put("a1", "[권한] 신청");
            put("a11", "[권한] 신청 - 역할&서비스 구조");
            put("a2", "[권한] 이력");
            put("a21", "[권한] 이력 - 상세");
            put("a22", "[권한] 이력 - 상신취소");
            put("a3", "[권한] 회수");
            put("a31", "[권한] 회수 - 역할&서비스 구조");
            put("a32", "[권한] 회수 - 회수");
            put("b0", "[결재] 목록");
            put("b01", "[결재] 목록 - 상세");
            put("c0", "[매핑] 조직&역할 (결재)");
            put("c01", "[매핑] 조직&역할 (결재) - 상세");
            put("c2", "[매핑] 조직&역할 (기본)");
            put("c21", "[매핑] 조직&역할 (기본) - 상세");
            put("c1", "[매핑] 역할&서비스");
            put("c11", "[매핑] 역할&서비스 - 역할&서비스 구조");
            put("d0", "[배치] 목록");
            put("d01", "[배치] 목록 - 상세");
            put("d1", "[배치] 로그");
            put("d11", "[배치] 로그 - 상세");
            put("e0", "[증적] 조회");
            put("e01", "[증적] 조회 - 상세");
            put("f0", "[설정] 콘솔");
        }
    };
    private static Map<String, String> action = new HashMap<String, String>() {
        {
            put("0", "조회");
            put("1", "등록");
            put("2", "수정");
            put("3", "삭제");
            put("4", "실행");
            put("5", "결재요청");
            put("6", "결재");
            put("7", "권한반환");
            put("8", "권한회수");
            put("9", "상신취소");
            put("10", "다운로드");
        }
    };
    private static Map<String, String> status = new HashMap<String, String>() {
        {
            put("0", "결재진행중");
            put("1", "승인/완료");
            put("2", "반려");
            put("3", "회수");
            put("4", "반환");
            put("5", "전결");
            put("6", "만료");
            put("7", "상신취소");
            put("8", "Default");
            put("9", "삭제예정");
        }
    };

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

    public static Map<String, String> getMenu() {
        return menu;
    }

    public static Map<String, String> getAction() {
        return action;
    }

    public static Map<String, String> getStatus() {
        return status;
    }

    public static String getProfileId() {
        return profileId;
    }

    public static void setProfileId(String profileId) {
        FixVariable.profileId = profileId;
    }
}
