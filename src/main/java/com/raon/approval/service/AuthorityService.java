package com.raon.approval.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.raon.approval.db.DBConnect;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class AuthorityService {

    final
    CommonService commonService;

    DBConnect dbConnect = new DBConnect();

    public AuthorityService(CommonService commonService) {
        this.commonService = commonService;
    }

    public String authorityReturn(Map map) {

        Date date = new Date();
        String nowDate = String.valueOf(date.getTime());
        String uuid = map.get("uuid").toString();

        String sql = "UPDATE WAM_USER_AUTH SET STATUS = " + map.get("nextStatus") + ", LAST_MODIFY_DATE = " + nowDate + " WHERE UUID = '" + uuid + "'";
        dbConnect.inputData(sql);

        sql = "DELETE FROM WA3_ROLE_MEMBER WHERE TARGET_ID = '" + map.get("userId") + "' AND ROLE_ID = '" + map.get("id") + "'";
        dbConnect.inputData(sql);

        String compareSql = "SELECT * FROM WAM_USER_AUTH WHERE UUID = '" + uuid + "'";
        JsonArray beforeData = dbConnect.getData(compareSql);

        return beforeData.toString();
    }

    public String getRoleInService(String roleIds) {

        String[] roleIdArr = roleIds.split(",");
        String sql = "SELECT * FROM WA3_UACL WHERE TARGET_ID IN (${roleIds})";
        String sqlCondition = "";
        String conditionRoleIds = "";

        for (int i = 0; i < roleIdArr.length; i++) {
            conditionRoleIds += (i == 0 ? "" : ",") + "'" + roleIdArr[i] + "'";
        }
        sql = sql.replace("${roleIds}", conditionRoleIds);

        JsonArray jsonArray = dbConnect.getData(sql);

        for (int i = 0; i < jsonArray.size(); i++) {
            JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();
            String serviceId = jsonObject.get("SERVICE_ID").getAsString();

            sqlCondition += (i == 0 ? "" : ", ") + "'" + serviceId + "'";
        }

        if (!sqlCondition.equals("")) {
            sql = "WITH TREE_QUERY(ID ,PARENT_ID, NAME,TYPE, PATH_ID) AS " +
                    "(SELECT ID, PARENT_ID, NAME, TYPE, PATH_ID " +
                    "FROM WA3_SERVICE " +
                    "WHERE ID IN (" + sqlCondition + ") " +
                    "UNION ALL " +
                    "SELECT B.ID, B.PARENT_ID, B.NAME, B.TYPE, B.PATH_ID " +
                    "FROM WA3_SERVICE B, TREE_QUERY C " +
                    "WHERE B.ID = C.PARENT_ID) " +
                    "SELECT ID, PARENT_ID, NAME, TYPE ,PATH_ID " +
                    "FROM TREE_QUERY " +
                    "GROUP BY ID, PARENT_ID, NAME, TYPE, PATH_ID " +
                    "ORDER BY PATH_ID ASC";

            return commonService.stringJsonData(sql);
        } else {
            return null;
        }
    }

    public String getRequestOne(String sql) {

        JsonArray jsonArray = dbConnect.getData(sql);

        for (int i = 0; i < jsonArray.size(); i++) {
            JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();
            int type = jsonObject.get("TYPE").getAsInt();

            if (type == 1) {
                String stringJson = jsonObject.get("REQUEST_INFO").getAsString();

                ObjectMapper om = new ObjectMapper();
                List<List<String>> list = null;
                try {
                    list = om.readValue(stringJson, om.getTypeFactory().constructCollectionType(List.class, List.class));
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }

                String getRoleNameTarget = "";
                String getServiceNameTarget = "";
                for (int j = 0; j < list.get(0).size(); j++) {
                    getRoleNameTarget += (j == 0 ? "" : ",") + "'" + list.get(0).get(j) + "'";
                }

                for (int j = 0; j < list.get(1).size(); j++) {
                    getServiceNameTarget += (j == 0 ? "" : ",") + "'" + list.get(1).get(j) + "'";
                }

                String getRoleNameSql = "SELECT * FROM WA3_ROLE WHERE ID IN (" + getRoleNameTarget + ")";
                String getServiceNameSql = "SELECT * FROM WA3_SERVICE WHERE ID IN (" + getServiceNameTarget + ")";

                JsonArray roleArray = dbConnect.getData(getRoleNameSql);
                JsonArray serviceArray = dbConnect.getData(getServiceNameSql);

                JsonObject object = new JsonObject();
                String roleNames = "";
                String serviceNames = "";

                for (int j = 0; j < roleArray.size(); j++) {
                    JsonObject roleObject = roleArray.get(j).getAsJsonObject();
                    roleNames += (j == 0 ? "" : ",") + roleObject.get("NAME").getAsString();
                }

                for (int j = 0; j < serviceArray.size(); j++) {
                    JsonObject serviceObject = serviceArray.get(j).getAsJsonObject();
                    serviceNames += (j == 0 ? "" : ",") + serviceObject.get("NAME").getAsString();
                }

                object.addProperty("ROLES", roleNames);
                object.addProperty("SERVICES", serviceNames);

                jsonObject.addProperty("REQUEST_INFO_NAME", object.toString());
            } else {
                break;
            }
        }

        return jsonArray.toString();
    }
}
