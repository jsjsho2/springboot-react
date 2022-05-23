package com.raon.approval.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.raon.approval.db.DBConnect;
import org.apache.tomcat.util.buf.StringUtils;
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

            String deleteSql = "DELETE FROM WAM_ORG_ROLE_MAPPING " +
                    "WHERE ORG_ID IN (" + orgsIds + ") " +
                    "AND FLAG = '" + flag + "'";

            if (!roleIds.isEmpty() && !roleIds.equals("")) {
                deleteSql += "AND ROLE_ID NOT IN (" + roleIds + ") ";
            }

            sqls.add(deleteSql);
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

            for (int i = 0; i < orgs.size(); i++) {
                String orgId = orgs.get(i).toString();

                for (int j = 0; j < roles.size(); j++) {
                    String roleId = roles.get(j).toString();

                    String sql = "MERGE INTO WA3_ROLE_MEMBER USING DUAL ON (TARGET_ID = '${orgId}' AND ROLE_ID = '${roleId}') " +
                            "WHEN NOT MATCHED THEN " +
                            "INSERT(ROLE_ID, TARGET_TYPE, TARGET_ID, ASSIGNOR, VALID_FROM, VALID_TO) " +
                            "VALUES('${roleId}', 1, '${orgId}', 'WAM MASTER', " + dateTime + ", " + toDate + ")";

                    authorizationSqls.add(sql.replace("${orgId}", orgId).replace("${orgId}", orgId).replace("${roleId}", roleId));
                }

                if (executeType.equals("delete")) {
                    String deleteSql = "DELETE FROM WA3_ROLE_MEMBER " +
                            "            WHERE TARGET_ID IN (" + orgsIds + ") " +
                            "              AND TARGET_TYPE = 1 ";

                    if (!roleIds.isEmpty() && !roleIds.equals("")) {
                        deleteSql += "AND ROLE_ID NOT IN (" + roleIds + ") ";
                    }

                    authorizationSqls.add(deleteSql);
                }
            }

            dbConnect.inputMultiData(authorizationSqls);
        }

        return beforeData.toString();
    }

    public String orgRoleMappingImpossibleCheck(Map map) {
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
                "      WHERE A.FLAG = '" + (map.get("flag").equals("d") ? "a" : "d") + "' " +
                "        AND A.ORG_ID IN (" + orgsIds + ") ";

        if (!roleIds.isEmpty() && !roleIds.equals("")) {
            sql += "AND A.ROLE_ID IN (" + roleIds + ") ";
        } else {
            return new JsonArray().toString();
        }

        sql += "ORDER BY A.ORG_ID";

        return commonService.stringJsonData(sql);
    }

    public String getPositionList() {


        String sql = "SELECT CODE \"value\", NAME \"label\" " +
                "       FROM WAM_POSITION_LIST " +
                "      WHERE FROM_DATE <= TO_CHAR(SYSDATE, 'YYYYMMDD') " +
                "        AND TO_DATE >= TO_CHAR(SYSDATE, 'YYYYMMDD')";
        return commonService.stringJsonData(sql);
    }

    public String getPositionByApprovalConfig(Map map) {

        String sql = "SELECT * " +
                "       FROM WAM_APPROVAL_STEP_CONFIG " +
                "      WHERE TARGET = '" + map.get("target") + "'";

        return dbConnect.getDataOne(sql).toString();
    }

    public String updateApprovalStep(Map map) {

        ArrayList sqls = new ArrayList();

        int nStep = (int) map.get("nStep");
        int self = (int) map.get("self");
        ArrayList targets = (ArrayList) map.get("target");
        String targetString = "";

        for (int i = 0; i < targets.size(); i++) {
            String target = targets.get(i).toString();
            targetString += (i == 0 ? "" : ",") + "'" + target + "'";

            String sql = "MERGE INTO WAM_APPROVAL_STEP_CONFIG USING DUAL ON (TARGET = '" + target + "') " +
                    "WHEN MATCHED THEN UPDATE SET " +
                    "N_STEP = " + nStep + ", " +
                    "SELF = " + self + ", " +
                    "STEP1 = '" + (nStep >= 1 ? StringUtils.join((ArrayList) map.get("step1"), ',') : "") + "', " +
                    "STEP2 = '" + (nStep >= 2 ? StringUtils.join((ArrayList) map.get("step2"), ',') : "") + "', " +
                    "STEP3 = '" + (nStep >= 3 ? StringUtils.join((ArrayList) map.get("step3"), ',') : "") + "' " +
                    "WHEN NOT MATCHED THEN " +
                    "INSERT(TARGET, N_STEP, SELF, STEP1, STEP2, STEP3) " +
                    "VALUES('" + target + "', " + nStep + ", " + self + ", " +
                    "'" + (nStep >= 1 ? StringUtils.join((ArrayList) map.get("step1"), ',') : "") + "', " +
                    "'" + (nStep >= 1 ? StringUtils.join((ArrayList) map.get("step2"), ',') : "") + "', " +
                    "'" + (nStep >= 1 ? StringUtils.join((ArrayList) map.get("step3"), ',') : "") + "')";

            sqls.add(sql);
        }

        String compareSql = "SELECT * FROM WAM_APPROVAL_STEP_CONFIG WHERE TARGET IN (" + targetString + ")";

        JsonArray beforeData = dbConnect.getData(compareSql);
        JsonObject object = new JsonObject();
        object.addProperty("COMPARE_SQL", compareSql);
        beforeData.add(object);

        dbConnect.inputMultiData(sqls);

        return beforeData.toString();
    }
}
