package com.raon.approval.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.raon.approval.common.CommonFunction;
import com.raon.approval.db.DBConnect;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import java.util.*;

@Service
public class ApprovalService {

    DBConnect dbConnect = new DBConnect();

    public String insertApprovalData(Map map, HttpSession session) {
        String loginId = session.getAttribute("loginId").toString();
        String loginName = session.getAttribute("loginName").toString();
        String userAuth = session.getAttribute("userAuth").toString();

        CommonFunction commonFunction = new CommonFunction();
        Gson gson = new Gson();
        Date date = new Date();
        String nowDate = String.valueOf(date.getTime());
        String uuid = UUID.randomUUID().toString();

        JsonArray requestInfoJsonArray = (JsonArray) gson.toJsonTree(map.get("requestInfo"));
        JsonArray flowJsonArray = (JsonArray) gson.toJsonTree(map.get("flow"));

        String sql = "INSERT INTO WAM_APPROVAL_INFO VALUES('${UUID}', '${SUMMARY}', '${REQUEST_INFO}', '${USER_ID}', " +
                "'${FLOW}', '${LAST_MODIFIER}', '${RSN}', '${TARGET_ID}', ${STATUS}, ${REQUEST_TIME}, ${TYPE})";

        if (map.get("type").toString().equals("0")) {
            for (int i = 0; i < requestInfoJsonArray.size(); i++) {
                JsonObject jsonObj = requestInfoJsonArray.get(i).getAsJsonObject();
                jsonObj.addProperty("from", commonFunction.stringDateToNumber(jsonObj.get("from").getAsString()));
                jsonObj.addProperty("to", commonFunction.stringDateToNumber(jsonObj.get("to").getAsString()));
            }
            sql = sql.replace("${LAST_MODIFIER}", "null")
                    .replace("${TARGET_ID}", map.get("targetId").toString())
                    .replace("${STATUS}", "0");
        } else {
            if (userAuth.equals("admin")) {
                JsonObject flowObj = flowJsonArray.get(0).getAsJsonObject();
                flowObj.addProperty("id", loginId);
                flowObj.addProperty("name", loginName);
                flowObj.addProperty("status", 5);
                flowObj.addProperty("date", nowDate);

                flowJsonArray.remove(0);
                flowJsonArray.add(flowObj);
                sql = sql.replace("${LAST_MODIFIER}", loginId)
                        .replace("${TARGET_ID}", "null")
                        .replace("${STATUS}", "5");


                JsonObject uaclObject = new JsonObject();
                uaclObject.addProperty("REQUEST_INFO", requestInfoJsonArray.toString());
                insertWa3Uacl(uaclObject, loginName);
            } else {
                sql = sql.replace("${LAST_MODIFIER}", "null")
                        .replace("${TARGET_ID}", map.get("targetId").toString())
                        .replace("${STATUS}", "0");
            }
        }

        sql = sql.replace("${UUID}", uuid)
                .replace("${SUMMARY}", map.get("summary").toString())
                .replace("${REQUEST_INFO}", requestInfoJsonArray.toString())
                .replace("${USER_ID}", loginId)
                .replace("${FLOW}", flowJsonArray.toString())
                .replace("${RSN}", map.get("rsn").toString())
                .replace("${REQUEST_TIME}", nowDate)
                .replace("${TYPE}", map.get("type").toString());

        dbConnect.inputData(sql);

        if (map.get("type").toString().equals("0")) {
            insertUserAuthority(uuid, loginId, nowDate, requestInfoJsonArray);
        }

        return uuid;
    }

    public String updateApprovalInfo(Map map, HttpSession session) {
        String loginId = session.getAttribute("loginId").toString();
        String loginName = session.getAttribute("loginName").toString();
        String userAuth = session.getAttribute("userAuth").toString();
        String selectApprovalInfo = "SELECT * FROM WAM_APPROVAL_INFO WHERE UUID = '" + map.get("uuid") + "'";

        int status = Integer.parseInt(map.get("status").toString());
        String uuid = map.get("uuid").toString();
        String nextTarget = null;
        int nextStatus = 0;
        Date date = new Date();
        String nowDate = String.valueOf(date.getTime());
        String targetId = "";

        JsonObject jsonObject = dbConnect.getDataOne(selectApprovalInfo);
        JsonArray flowArr = new JsonParser().parse(jsonObject.get("FLOW").getAsString()).getAsJsonArray();
        int type = jsonObject.get("TYPE").getAsInt();

        if (status == 4 || status == 7) {
            nextStatus = status;
        } else {
            targetId = jsonObject.get("TARGET_ID").getAsString();
            int flowIdx = Integer.parseInt(map.get("flowIdx").toString());

            for (int i = flowIdx; i < flowArr.size(); i++) {
                JsonObject flow = flowArr.get(i).getAsJsonObject();

                if (userAuth.equals("admin")) {
                    flow.addProperty("id", loginId);
                    flow.addProperty("name", loginName);
                    flow.addProperty("status", status == 1 ? 5 : status);
                    flow.addProperty("date", nowDate);
                    flow.addProperty("rsn", map.get("rsn").toString());
                    nextStatus = status == 1 ? 5 : status;
                    status = status == 1 ? 5 : status;

                    if (status == 1 || status == 5) {
                        if (type == 0) {
                            insertWa3RoleMember(jsonObject, loginName);
                        } else {
                            insertWa3Uacl(jsonObject, loginName);
                        }
                    }

                    break;
                } else if (flow.get("id").equals(targetId)) {
                    flow.addProperty("id", loginId);
                    flow.addProperty("name", loginName);
                    flow.addProperty("status", status);
                    flow.addProperty("date", nowDate);
                    flow.addProperty("rsn", map.get("rsn").toString());

                    if (i + 1 != flowArr.size()) {
                        JsonObject obj = flowArr.get(i + 1).getAsJsonObject();
                        nextTarget = obj.get("id").getAsString();
                        nextStatus = 0;
                    } else if (i + 1 == flowArr.size()) {
                        nextStatus = status;

                        if (status == 1) {
                            if (type == 0) {
                                insertWa3RoleMember(jsonObject, loginName);
                            } else {
                                insertWa3Uacl(jsonObject, loginName);
                            }
                        }
                    }
                    break;
                }
            }
        }

        String updateApprovalInfo = "UPDATE WAM_APPROVAL_INFO SET " +
                "FLOW = '${FLOW}', LAST_MODIFIER = '${LAST_MODIFIER}', TARGET_ID = ${TARGET_ID}, STATUS = ${STATUS} " +
                "WHERE UUID = '${UUID}'";

        updateApprovalInfo = updateApprovalInfo.replace("${UUID}", uuid)
                .replace("${FLOW}", flowArr.toString())
                .replace("${LAST_MODIFIER}", loginId)
                .replace("${TARGET_ID}", nextTarget == null ? "null" : "'" + nextTarget + "'")
                .replace("${STATUS}", String.valueOf(nextStatus));

        String compareSql = "SELECT * FROM WAM_APPROVAL_INFO WHERE UUID = '" + uuid + "'";
        JsonArray beforeData = dbConnect.getData(compareSql);
        JsonObject object = new JsonObject();
        object.addProperty("COMPARE_SQL", compareSql);
        beforeData.add(object);
        dbConnect.inputData(updateApprovalInfo);

        if (type == 0) {
            updateUserAuthority("TARGET_UUID", uuid, nowDate, status);
        }

        return beforeData.toString();
    }

    public void insertWa3RoleMember(JsonObject jsonObject, String loginName) {
        String sql = "";
        JsonArray requestArr = new JsonParser().parse(jsonObject.get("REQUEST_INFO").getAsString()).getAsJsonArray();

        for (int i = 0; i < requestArr.size(); i++) {
            JsonObject requestObj = requestArr.get(i).getAsJsonObject();
            sql += "INTO WA3_ROLE_MEMBER (ROLE_ID, TARGET_TYPE, TARGET_ID, ASSIGNOR, VALID_FROM, VALID_TO) " +
                    "VALUES ('" + requestObj.get("id").getAsString() + "', 0, '" + jsonObject.get("USER_ID").getAsString() + "', '" + loginName + "', '" + requestObj.get("from").getAsString() + "', '" + requestObj.get("to").getAsString() + "')";
        }

        sql = "INSERT ALL " + sql + " SELECT * FROM DUAL";

        dbConnect.inputData(sql);
    }

    public void insertWa3Uacl(JsonObject jsonObject, String loginName) {
        Date date = new Date();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.YEAR, 16);
        cal.add(Calendar.MONTH, 5);

        ArrayList sqls = new ArrayList();
        String uaclNextval = "SELECT WA3_SEQ_UACL.NEXTVAL FROM DUAL";
        String incrementSeq = "ALTER SEQUENCE WA3_SEQ_UACL INCREMENT BY ${size}";
        String sql = "MERGE INTO WA3_UACL USING DUAL ON (SERVICE_ID = '${serviceId}' AND TARGET_TYPE = 5 AND TARGET_ID = '${targetId}') " +
                "WHEN MATCHED THEN UPDATE SET  " +
                "MODIFY_TIME=${fromDate} " +
                "WHEN NOT MATCHED THEN " +
                "INSERT(SEQ_UACL, SERVICE_ID, ASSIGNOR, TARGET_TYPE, TARGET_ID, IS_USE, PERMISSION, PARENT_DN, VALID_FROM, VALID_TO, CREATE_TIME, MODIFY_TIME) " +
                "VALUES(${seqUacl}, '${serviceId}', '" + loginName + "', 5, '${targetId}', 1, 'temp', 0, ${fromDate}, ${toDate}, ${fromDate}, ${fromDate})";
        String[] columns = {"NEXTVAL"};

        String stringJson = jsonObject.get("REQUEST_INFO").getAsString();

        ObjectMapper om = new ObjectMapper();
        List<List<String>> list = null;
        try {
            list = om.readValue(stringJson, om.getTypeFactory().constructCollectionType(List.class, List.class));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        long dateTime = date.getTime();
        long toDate = cal.getTimeInMillis();

        Map values = dbConnect.selectValue(uaclNextval, columns);
        int sequence = Integer.parseInt(values.get("NEXTVAL").toString()) - 1;

        sql = sql.replace("${fromDate}", String.valueOf(dateTime))
                .replace("${toDate}", String.valueOf(toDate));

        List<String> roles = list.get(0);
        List<String> services = list.get(1);

        for (int i = 0; i < roles.size(); i++) {
            String copySql = sql.replace("${targetId}", roles.get(i));

            for (int j = 0; j < services.size(); j++) {
                String copySql2 = copySql.replace("${serviceId}", services.get(j))
                        .replace("${seqUacl}", String.valueOf(sequence++));
                sqls.add(copySql2);
            }
        }

        incrementSeq = incrementSeq.replace("${size}", String.valueOf(sqls.size()));

        dbConnect.inputMultiData(sqls);
        dbConnect.inputData(incrementSeq);
    }

    public void insertUserAuthority(String targetId, String loginId, String now, JsonArray requestInfo) {
        String sql = "INTO WAM_USER_AUTH (UUID, TARGET_UUID, USER_ID, ROLE_ID, ROLE_NAME, FROM_DATE, TO_DATE, LAST_MODIFY_DATE, STATUS) " +
                "VALUES('${uuid}', '${targetUuid}', '${userId}', '${roleId}', '${roleName}', ${fromDate}, ${toDate}, ${lastModifyDate}, ${status})";
        String exeSql = "";

        for (int i = 0; i < requestInfo.size(); i++) {
            JsonObject requestObj = requestInfo.get(i).getAsJsonObject();

            exeSql += sql.replace("${uuid}", UUID.randomUUID().toString())
                    .replace("${targetUuid}", targetId)
                    .replace("${userId}", loginId)
                    .replace("${roleId}", requestObj.get("id").getAsString())
                    .replace("${roleName}", requestObj.get("name").getAsString())
                    .replace("${fromDate}", requestObj.get("from").getAsString())
                    .replace("${toDate}", requestObj.get("to").getAsString())
                    .replace("${lastModifyDate}", now)
                    .replace("${status}", "0");
        }

        exeSql = "INSERT ALL " + exeSql + " SELECT * FROM DUAL";
        dbConnect.inputData(exeSql);
    }

    public void updateUserAuthority(String conditionColumn, String conditionValue, String now, int status) {
        String sql = "UPDATE WAM_USER_AUTH SET " +
                "LAST_MODIFY_DATE = ${lastModifyDate}, " +
                "STATUS = ${status} " +
                "WHERE " + conditionColumn + " = '" + conditionValue + "'";

        sql = sql.replace("${lastModifyDate}", now)
                .replace("${status}", String.valueOf(status));

        dbConnect.inputData(sql);
    }
}
