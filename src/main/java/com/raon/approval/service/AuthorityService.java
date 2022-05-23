package com.raon.approval.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.raon.approval.common.CommonFunction;
import com.raon.approval.data.FixVariable;
import com.raon.approval.db.DBConnect;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class AuthorityService extends CommonFunction {

    final
    CommonService commonService;

    DBConnect dbConnect = new DBConnect();

    public AuthorityService(CommonService commonService) {
        this.commonService = commonService;
    }

    public String makeSearchSql(Map map, HttpSession session) {
        String sql = "SELECT A.*, B.NAME " +
                "FROM WAM_USER_AUTH A " +
                "LEFT JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "WHERE (A.STATUS <> 0 AND A.STATUS <> 7)";

        if (map.get("userAuth").toString().equals("admin")) {
            if (!map.get("targetInfo").toString().isEmpty()) {
                String searchType = map.get("searchType").toString();
                sql += "AND " + (searchType.equals("name") ? "B.NAME " : "A.USER_ID ") + " LIKE '%" + map.get("targetInfo") + "%' ";
            }
        } else {
            String loginId = session.getAttribute("loginId").toString();
            sql += "AND A.USER_ID = '" + loginId + "' ";
        }

        if (!map.get("roleName").toString().isEmpty()) {
            sql += "AND A.ROLE_NAME LIKE '%" + map.get("roleName") + "%' ";
        }

        sql += "ORDER BY A.LAST_MODIFY_DATE DESC";

        return sql;
    }

    public String getUserAuthorityHist(Map map, HttpSession session) {
        String sql = makeSearchSql(map, session);
        return commonService.stringJsonData(sql);
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

    public void excelDown(Map map, HttpServletResponse response, HttpSession session) throws IOException {

        JsonArray jarr = dbConnect.getData(makeSearchSql(map, session));

        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("권한 적용 이력");
        Row row = null;
        Cell cell = null;
        int rowNum = 0;

        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("대상");
        cell = row.createCell(1);
        cell.setCellValue("최종 수정 일시");
        cell = row.createCell(2);
        cell.setCellValue("역할");
        cell = row.createCell(3);
        cell.setCellValue("적용 일시");
        cell = row.createCell(4);
        cell.setCellValue("만료 일시");
        cell = row.createCell(5);
        cell.setCellValue("상태");

        for (int i = 0; i < jarr.size(); i++) {
            JsonObject jobj = jarr.get(i).getAsJsonObject();

            row = sheet.createRow(rowNum++);
            cell = row.createCell(0);
            cell.setCellValue(nullCheck(jobj.get("NAME")) + "(" + nullCheck(jobj.get("USER_ID")) + ")");
            cell = row.createCell(1);
            cell.setCellValue(numberDateToString(jobj.get("LAST_MODIFY_DATE").getAsString()));
            cell = row.createCell(2);
            cell.setCellValue(nullCheck(jobj.get("ROLE_NAME")));
            cell = row.createCell(3);
            cell.setCellValue(numberDateToString(jobj.get("FROM_DATE").getAsString()));
            cell = row.createCell(4);
            cell.setCellValue(numberDateToString(jobj.get("TO_DATE").getAsString()));
            cell = row.createCell(5);
            cell.setCellValue(FixVariable.getStatus().get(jobj.get("STATUS").getAsString()));
        }

        response.setContentType("ms-vnd/excel");
        response.setHeader("Content-Disposition", "attachment;filename=example.xlsx");

        wb.write(response.getOutputStream());
        wb.close();
    }
}
