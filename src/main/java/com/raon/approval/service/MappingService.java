package com.raon.approval.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.raon.approval.db.DBConnect;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MappingService {

    final
    CommonService commonService;
    DBConnect dbConnect = new DBConnect();

    public MappingService(CommonService commonService) {
        this.commonService = commonService;
    }

    public String getOrgRoleMappingData(Map map) {
        String orgId = map.get("orgId").toString();
        String flag = map.get("flag").toString();
        String sql = "SELECT * FROM WAM_ORG_ROLE_MAPPING WHERE ORG_ID = '" + orgId + "' AND FLAG = '" + flag + "'";

        JsonArray jsonArray = dbConnect.getData(sql);
        String roleIds = "";

        for (int i = 0; i < jsonArray.size(); i++) {
            JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();
            String serviceId = jsonObject.get("ROLE_ID").getAsString();

            roleIds += (i == 0 ? "" : ", ") + "'" + serviceId + "'";
        }

        sql = "SELECT A.ID, A.PARENT_ID, A.NAME, B.PARENT, NVL2(C.ORG_ID, 1, 0) TARGET, C.FLAG FROM ( " +
                "SELECT ROWNUM ORDERING, ID, PARENT_ID, NAME " +
                "FROM WA3_ROLE " +
                "START WITH PARENT_ID IS NULL " +
                "CONNECT BY PRIOR ID = PARENT_ID) A " +
                "LEFT JOIN ( " +
                "WITH TREE_QUERY(ID, NAME, PARENT_ID) AS  " +
                "(SELECT ID, NAME, PARENT_ID " +
                "FROM WA3_ROLE ";

        if (!roleIds.isEmpty()) {
            sql += "WHERE ID IN (" + roleIds + ") ";
        }

        sql += "UNION ALL " +
                "SELECT B.ID, B.NAME, B.PARENT_ID " +
                "FROM WA3_ROLE B, TREE_QUERY C  " +
                "WHERE B.ID = C.PARENT_ID)  " +
                "SELECT ID, NAME, PARENT_ID, 1 AS PARENT " +
                "FROM TREE_QUERY " +
                "GROUP BY ID, NAME, PARENT_ID) B ON A.ID = B.ID " +
                "LEFT JOIN WAM_ORG_ROLE_MAPPING C ON C.ROLE_ID = A.ID AND ORG_ID = '" + orgId + "' " +
                "ORDER BY A.ORDERING";

        return commonService.stringJsonData(sql);
    }

    public String updateOrgRoleMapping(Map map) {
        ArrayList orgs = (ArrayList) map.get("orgs");
        ArrayList roles = (ArrayList) map.get("roles");
        ArrayList sqls = new ArrayList();

        String flag = map.get("flag").toString();
        String orgsIds = "";
        String roleIds = "";

        for (int i = 0; i < orgs.size(); i++) {
            String sql = "MERGE INTO WAM_ORG_ROLE_MAPPING USING DUAL ON (ORG_ID = '${orgId}' AND ROLE_ID = '${roleId}' AND FLAG = '" + flag + "') " +
                    "WHEN NOT MATCHED THEN " +
                    "INSERT(UUID, ORG_ID, ROLE_ID, FLAG) " +
                    "VALUES('${uuid}', '${orgId}', '${roleId}', '" + flag + "')";

            String orgsId = orgs.get(i).toString();
            orgsIds += (i == 0 ? "" : ", ") + "'" + orgsId + "'";
            sql = sql.replace("${orgId}", orgs.get(i).toString());

            for (int j = 0; j < roles.size(); j++) {
                String uuid = UUID.randomUUID().toString();
                String roleId = roles.get(j).toString();
                roleIds += (j == 0 ? "" : ", ") + "'" + roleId + "'";
                sqls.add(sql.replace("${roleId}", roleId).replace("${uuid}", uuid));
            }
        }

        String executeType = map.get("action").toString();
        if (executeType.equals("delete")) {
            sqls.add("DELETE FROM WAM_ORG_ROLE_MAPPING WHERE ROLE_ID NOT IN (" + roleIds + ") AND ORG_ID IN (" + orgsIds + ") AND FLAG = '" + flag + "'");
        }

        String compareSql = "SELECT LISTAGG(ORG_ID, ',') WITHIN GROUP (ORDER BY ORG_ID) 조직, 역할 " +
                "FROM (SELECT ORG_ID, LISTAGG(ROLE_ID, ',') WITHIN GROUP (ORDER BY ORG_ID) 역할 " +
                "FROM WAM_ORG_ROLE_MAPPING " +
                "WHERE ORG_ID IN (" + orgsIds + ") " +
                "AND FLAG = '" + flag + "' " +
                "GROUP BY ORG_ID) " +
                "GROUP BY 역할";

        JsonArray beforeData = dbConnect.getData(compareSql);
        JsonObject object = new JsonObject();
        object.addProperty("COMPARE_SQL", compareSql);
        beforeData.add(object);
        dbConnect.inputMultiData(sqls);

        if (flag.equals("d")) {
            ArrayList authorizationSqls = new ArrayList();
            Date date = new Date();
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.YEAR, 16);
            cal.add(Calendar.MONTH, 5);

            long dateTime = date.getTime();
            long toDate = cal.getTimeInMillis();
            Calendar cal2 = Calendar.getInstance();
            cal2.add(Calendar.DATE, 15);
            String stringCal2 = String.valueOf(cal2.getTimeInMillis());

            String userIds = "";

            for (int i = 0; i < orgs.size(); i++) {
                String orgsId = orgs.get(i).toString();

                String setUserDefaultAuthoritySql = "MERGE INTO WAM_USER_AUTH USING DUAL ON (USER_ID = '${userId}' AND ROLE_ID = '${roleId}' AND STATUS = 8) " +
                        "WHEN NOT MATCHED THEN " +
                        "INSERT (UUID, TARGET_UUID, USER_ID, ROLE_ID, ROLE_NAME, FROM_DATE, TO_DATE, LAST_MODIFY_DATE, STATUS) " +
                        "VALUES('${uuid}', 'null', '${userId}', '${roleId}', '${roleName}', " + dateTime + ", " + toDate + ", " + dateTime + ", 8)";

                String authorizationSql = "MERGE INTO WA3_ROLE_MEMBER USING DUAL ON (TARGET_ID = '${userId}' AND ROLE_ID = '${roleId}') " +
                        "WHEN NOT MATCHED THEN " +
                        "INSERT(ROLE_ID, TARGET_TYPE, TARGET_ID, ASSIGNOR, VALID_FROM, VALID_TO) " +
                        "VALUES('${roleId}', 0, '${userId}', 'master', " + dateTime + ", " + toDate + ")";

                String orgInUserIdSql = "SELECT LISTAGG(USER_ID, ',') WITHIN GROUP (ORDER BY USER_ID) AS IDS " +
                        "FROM (SELECT USER_ID " +
                        "FROM WA3_ORG_USER " +
                        "WHERE ORG_ID = '${orgId}')";

                orgInUserIdSql = orgInUserIdSql.replace("${orgId}", orgsId);

                JsonArray roleInfoObj = dbConnect.getData("SELECT * FROM WA3_ROLE WHERE ID IN (" + roleIds + ")");
                JsonObject userIdObj = dbConnect.getDataOne(orgInUserIdSql);

                if(!userIdObj.get("IDS").isJsonNull()){
                    String[] orgInUserIdArr = userIdObj.get("IDS").getAsString().split(",");

                    for (int j = 0; j < orgInUserIdArr.length; j++) {
                        String userId = orgInUserIdArr[j];
                        userIds += (j == 0 ? "" : ", ") + "'" + userId + "'";

                        String authorizationSqlCopy = authorizationSql.replace("${userId}", userId);

                        for (int k = 0; k < roleInfoObj.size(); k++) {
                            String uuid = UUID.randomUUID().toString();
                            JsonObject obj = roleInfoObj.get(k).getAsJsonObject();
                            authorizationSqls.add(
                                    setUserDefaultAuthoritySql.replace("${uuid}", uuid)
                                            .replace("${userId}", userId)
                                            .replace("${roleId}", obj.get("ID").getAsString())
                                            .replace("${roleName}", obj.get("NAME").getAsString())
                            );
                        }

                        authorizationSqls.add("INSERT INTO WAM_USER_AUTH_DEL_SCHEDULE " +
                                "SELECT USER_ID, ROLE_ID, " + stringCal2 + " " +
                                "FROM WAM_USER_AUTH " +
                                "WHERE USER_ID = '" + userId + "' " +
                                "AND ROLE_ID NOT IN (" + roleIds + ") " +
                                "GROUP BY USER_ID, ROLE_ID");

                        for (int k = 0; k < roles.size(); k++) {
                            String roleId = roles.get(k).toString();
                            authorizationSqls.add(authorizationSqlCopy.replace("${roleId}", roleId));
                        }
                    }
                }
            }

            String setTargetRolesExpireSql = "UPDATE WAM_USER_AUTH SET " +
                    "STATUS = 3 " +
                    "WHERE (USER_ID, ROLE_ID, STATUS) IN (SELECT USER_ID, ROLE_ID, STATUS " +
                    "FROM WAM_USER_AUTH " +
                    "WHERE USER_ID IN (" + userIds + ") " +
                    "AND ROLE_ID IN (" + roleIds + ") " +
                    "AND (STATUS = 0 OR STATUS = 1 OR STATUS = 5))";

            String setTargetRolesWaitExpireSql = "UPDATE WAM_USER_AUTH SET " +
                    "STATUS = 9, " +
                    "TO_DATE = " + stringCal2 + " " +
                    "WHERE (USER_ID, ROLE_ID, STATUS) IN (SELECT USER_ID, ROLE_ID, STATUS " +
                    "FROM WAM_USER_AUTH " +
                    "WHERE USER_ID IN (" + userIds + ") " +
                    "AND ROLE_ID NOT IN (" + roleIds + ") " +
                    "AND STATUS = 8)";

            authorizationSqls.add(setTargetRolesExpireSql);
            authorizationSqls.add(setTargetRolesWaitExpireSql);
            dbConnect.inputMultiData(authorizationSqls);
        }

        return beforeData.toString();
    }

    public String OrgRoleMappingImpossibleCheck(Map map) {
        ArrayList orgs = (ArrayList) map.get("orgs");
        ArrayList roles = (ArrayList) map.get("roles");

        String orgsIds = "";
        String roleIds = "";

        for (int i = 0; i < orgs.size(); i++) {
            String orgsId = orgs.get(i).toString();
            orgsIds += (i == 0 ? "" : ", ") + "'" + orgsId + "'";
        }

        for (int i = 0; i < roles.size(); i++) {
            String roleId = roles.get(i).toString();
            roleIds += (i == 0 ? "" : ", ") + "'" + roleId + "'";
        }

        String sql = "SELECT A.ORG_ID, A.ROLE_ID, B.NAME ROLE_NAME, C.NAME ORG_NAME" +
                "       FROM WAM_ORG_ROLE_MAPPING A " +
                "       LEFT JOIN WA3_ROLE B ON A.ROLE_ID = B.ID " +
                "       LEFT JOIN WA3_ORG C ON A.ORG_ID = C.ID " +
                "      WHERE ORG_ID IN (" + orgsIds + ") " +
                "        AND ROLE_ID IN (" + roleIds + ") " +
                "        AND FLAG = '" + (map.get("flag").equals("d") ? "a" : "d") + "' " +
                "      ORDER BY A.ORG_ID";

        return commonService.stringJsonData(sql);
    }
}
