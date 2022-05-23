package com.raon.approval.common;

import WiseAccess.SSO;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.raon.approval.data.FixVariable;
import com.raon.approval.db.DBConnect;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

public class CommonFunction {

    DBConnect dbConnect = new DBConnect();

    public String stringDateToNumber(String stringDate) {

        if (stringDate.indexOf("-") != -1) {
            stringDate = stringDate.replaceAll("-", "/");
        }

        Date date = new Date(stringDate);

        return String.valueOf(date.getTime());
    }

    public String numberDateToString(String timestampStr) {
        long timestamp = Long.parseLong(timestampStr);
        Date date = new java.util.Date(timestamp);
        SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        String formattedDate = sdf.format(date);
        return formattedDate;
    }

    public JsonObject tokenCheck(String token, HttpServletRequest request, HttpSession session) {
        String adminUser = "wamMaster";
        String devUser = "wamDev";

        JsonObject obj = new JsonObject();
        JsonObject userInfo = new JsonObject();
        boolean result = false;

        String sApiKey = FixVariable.getSsoKey();
        String engineIP = FixVariable.getSsoIp();
        int enginePort = FixVariable.getSsoPort();
        String sIP = request.getRemoteAddr();
        int nResult = -1;
        String id = "";

        SSO sso = new SSO(sApiKey);
        sso.setHostName(engineIP);
        sso.setPortNumber(enginePort);

//        nResult = sso.verifyToken(token);

        id = "a1";
//        id = "aaaaaaa";
//        if (nResult >= 0) {
//            id = sso.getValueUserID();
//            result = true;
        userInfo = dbConnect.getDataOne(
                "SELECT A.ID, A.NAME || ' ' || E.NAME NAME, B.NAME ORG_NAME , NVL2(C.GROUP_ID, C.GROUP_ID, 0) GROUP_ID " +
                        "FROM WA3_USER A " +
                        "LEFT JOIN WA3_ORG B ON A.ORG_ID = B.ID " +
                        "LEFT JOIN WA3_MACL_GROUP_USER C ON A.ID = C.USER_ID " +
                        "LEFT JOIN WA3_USER_PROFILE D ON D.USER_ID = '" + id + "' " +
                        "LEFT JOIN WAM_POSITION_LIST E ON E.CODE = D.PROFILE_VALUE " +
                        "WHERE A.ID = '" + id + "'");
//
//            String groupId = userInfo.get("GROUP_ID").getAsString();
//            if (!groupId.equals("0")) {
//                if (groupId.equals(adminUser)) {
//                    obj.addProperty("userAuth", "admin");
//                } else if (groupId.equals(devUser)) {
//                    obj.addProperty("userAuth", "developer");
//                } else {
//                    obj.addProperty("userAuth", "user");
//                }
//            } else {
//                obj.addProperty("userAuth", "user");
//            }
//        }

        nResult = 0;
        result = true;
//        obj.addProperty("userAuth", "user");
        obj.addProperty("userAuth", "admin");

        obj.addProperty("userInfo", userInfo.toString());
        obj.addProperty("nResult", nResult);
        obj.addProperty("requestIp", sIP);
        obj.addProperty("result", result);
        return obj;
    }

    public String nullCheck(JsonElement str) {
        return str.isJsonNull()
                ? ""
                : (str.getAsString().isEmpty() || str.getAsString().equals("null") ? "" : str.getAsString());
    }
}
