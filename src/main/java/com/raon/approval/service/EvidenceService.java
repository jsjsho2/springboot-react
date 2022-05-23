package com.raon.approval.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
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
import java.util.Map;
import java.util.UUID;

@Service
public class EvidenceService extends CommonFunction {

    final
    CommonService commonService;

    DBConnect dbConnect = new DBConnect();

    public EvidenceService(CommonService commonService) {
        this.commonService = commonService;
    }

    public String makeSearchSql(Map map) {
        String sqlCondition = "";
        String sql = "SELECT A.*, B.NAME " +
                "       FROM WAM_EVIDENCE A " +
                "       LEFT JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "      WHERE 1=1 " +
                "      ${condition} " +
                "      ORDER BY ACTION_DATE DESC ";

        if (!map.get("name").toString().isEmpty()) {
            String[] columns = {"NAME"};
            Map values = dbConnect.selectValue("SELECT NAME FROM WA3_USER WHERE NAME = '" + map.get("name") + "'", columns);
            sqlCondition += "AND B.NAME = '" + values.get("NAME") + "' ";
        }

        if (!map.get("menu").toString().isEmpty()) {
            sqlCondition += "AND MENU = '" + map.get("menu") + "' ";
        }

        if (!map.get("action").toString().isEmpty()) {
            sqlCondition += "AND ACTION = '" + map.get("action") + "' ";
        }

        sqlCondition += "AND ACTION_DATE BETWEEN " + stringDateToNumber(map.get("startDate").toString()) + " AND " + stringDateToNumber(map.get("endDate").toString());
        sql = sql.replace("${condition}", sqlCondition);

        return sql;
    }

    public String search(Map map) {
        return commonService.stringJsonData(makeSearchSql(map));
    }

    public void searchType(Map map, HttpSession session) {
        String menu = map.get("menu").toString();
        String target = map.get("target").toString();

        String loginId = session.getAttribute("loginId").toString();
        Date date = new Date();
        String nowDate = String.valueOf(date.getTime());

        String sql = "INSERT INTO WAM_EVIDENCE (UUID, USER_ID, MENU, TARGET, ACTION, ACTION_DATE, USER_IP) VALUES (" +
                "'" + UUID.randomUUID() + "', " +
                "'" + loginId + "', " +
                "'" + menu + "', " +
                "'" + target + "', " +
                0 + ", " +
                nowDate + ", " +
                "'" + map.get("userIP") + "'" +
                ")";

        dbConnect.inputData(sql);
    }

    public void insertType(Map map, HttpSession session) {
        String menu = map.get("menu").toString();
        String target = map.get("target").toString();

        String loginId = session.getAttribute("loginId").toString();
        Date date = new Date();
        String nowDate = String.valueOf(date.getTime());

        String sql = "INSERT INTO WAM_EVIDENCE (UUID, USER_ID, MENU, TARGET, ACTION, ACTION_DATE, USER_IP) VALUES (" +
                "'" + UUID.randomUUID() + "', " +
                "'" + loginId + "', " +
                "'" + menu + "', " +
                "'" + target + "', " +
                1 + ", " +
                nowDate + ", " +
                "'" + map.get("userIP") + "'" +
                ")";

        dbConnect.inputData(sql);
    }

    public void updateType(Map map, int type, HttpSession session) {
        String menu = map.get("menu").toString();
        String target = map.get("target").toString();
        String before = map.get("pkValue") == null ? "" : map.get("pkValue").toString();

        JsonArray beforeArray = new JsonArray();
        try {
            beforeArray = new JsonParser().parse(before).getAsJsonArray();
        } catch (Exception e) {

        }

        JsonArray afterArray = new JsonArray();
        for (int i = 0; i < beforeArray.size(); i++) {
            JsonObject beforeObject = beforeArray.get(i).getAsJsonObject();
            if (beforeObject.has("COMPARE_SQL")) {
                afterArray = dbConnect.getData(beforeObject.get("COMPARE_SQL").getAsString());
                beforeArray.remove(i);
                break;
            } else {
                continue;
            }
        }

        String loginId = session.getAttribute("loginId").toString();
        Date date = new Date();
        String nowDate = String.valueOf(date.getTime());

        String sql = "INSERT INTO WAM_EVIDENCE (UUID, USER_ID, MENU, TARGET, ACTION, BEFORE, AFTER, ACTION_DATE, USER_IP) VALUES (" +
                "'" + UUID.randomUUID() + "', " +
                "'" + loginId + "', " +
                "'" + menu + "', " +
                "'" + target + "', " +
                type + ", " +
                "'" + beforeArray.toString() + "', " +
                "'" + afterArray.toString() + "', " +
                nowDate + ", " +
                "'" + map.get("userIP") + "'" +
                ")";

        dbConnect.inputData(sql);
    }

    public void deleteType(Map map, int type, HttpSession session) {
        String menu = map.get("menu").toString();
        String target = map.get("target").toString();
        String before = map.get("pkValue").toString();

        String loginId = session.getAttribute("loginId").toString();
        Date date = new Date();
        String nowDate = String.valueOf(date.getTime());

        String sql = "INSERT INTO WAM_EVIDENCE (UUID, USER_ID, MENU, TARGET, ACTION, BEFORE, ACTION_DATE, USER_IP) VALUES (" +
                "'" + UUID.randomUUID() + "', " +
                "'" + loginId + "', " +
                "'" + menu + "', " +
                "'" + target + "', " +
                type + ", " +
                "'" + before + "', " +
                nowDate + ", " +
                "'" + map.get("userIP") + "'" +
                ")";

        dbConnect.inputData(sql);
    }

    public void exeType(Map map, HttpSession session) {
        String menu = map.get("menu").toString();
        String target = map.get("target").toString();

        String loginId = session.getAttribute("loginId").toString();
        Date date = new Date();
        String nowDate = String.valueOf(date.getTime());

        String sql = "INSERT INTO WAM_EVIDENCE (UUID, USER_ID, MENU, TARGET, ACTION, ACTION_DATE, USER_IP) VALUES (" +
                "'" + UUID.randomUUID() + "', " +
                "'" + loginId + "', " +
                "'" + menu + "', " +
                "'" + target + "', " +
                4 + ", " +
                nowDate + ", " +
                "'" + map.get("userIP") + "'" +
                ")";

        dbConnect.inputData(sql);
    }

    public void requestType(Map map, HttpSession session) {
        String menu = map.get("menu").toString();
        String target = map.get("target").toString();
        String pkValue = map.get("pkValue").toString();

        JsonArray after = dbConnect.getData("SELECT * FROM WAM_APPROVAL_INFO WHERE UUID = '" + pkValue + "'");

        String loginId = session.getAttribute("loginId").toString();
        Date date = new Date();
        String nowDate = String.valueOf(date.getTime());

        String sql = "INSERT INTO WAM_EVIDENCE (UUID, USER_ID, MENU, TARGET, ACTION, AFTER, ACTION_DATE, USER_IP) VALUES (" +
                "'" + UUID.randomUUID() + "', " +
                "'" + loginId + "', " +
                "'" + menu + "', " +
                "'" + target + "', " +
                5 + ", " +
                "'" + after.toString() + "', " +
                nowDate + ", " +
                "'" + map.get("userIP") + "'" +
                ")";

        dbConnect.inputData(sql);
    }

    public void excelDown(Map map, HttpServletResponse response) throws IOException {

        JsonArray jarr = dbConnect.getData(makeSearchSql(map));

        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("WAM 증적");
        Row row = null;
        Cell cell = null;
        int rowNum = 0;

        row = sheet.createRow(rowNum++);
        cell = row.createCell(0);
        cell.setCellValue("일시");
        cell = row.createCell(1);
        cell.setCellValue("접속IP");
        cell = row.createCell(2);
        cell.setCellValue("ID");
        cell = row.createCell(3);
        cell.setCellValue("이름");
        cell = row.createCell(4);
        cell.setCellValue("메뉴");
        cell = row.createCell(5);
        cell.setCellValue("행위");
        cell = row.createCell(6);
        cell.setCellValue("조회값 / 변경대상");
        cell = row.createCell(7);
        cell.setCellValue("BEFORE");
        cell = row.createCell(8);
        cell.setCellValue("AFTER");

        for (int i = 0; i < jarr.size(); i++) {
            JsonObject jobj = jarr.get(i).getAsJsonObject();

            row = sheet.createRow(rowNum++);
            cell = row.createCell(0);
            cell.setCellValue(numberDateToString(jobj.get("ACTION_DATE").getAsString()));
            cell = row.createCell(1);
            cell.setCellValue(nullCheck(jobj.get("USER_IP")));
            cell = row.createCell(2);
            cell.setCellValue(nullCheck(jobj.get("USER_ID")));
            cell = row.createCell(3);
            cell.setCellValue(nullCheck(jobj.get("NAME")));
            cell = row.createCell(4);
            cell.setCellValue(FixVariable.getMenu().get(jobj.get("MENU").getAsString()));
            cell = row.createCell(5);
            cell.setCellValue(FixVariable.getAction().get(jobj.get("ACTION").getAsString()));
            cell = row.createCell(6);
            cell.setCellValue(nullCheck(jobj.get("TARGET")));
            cell = row.createCell(7);
            cell.setCellValue(nullCheck(jobj.get("BEFORE")));
            cell = row.createCell(8);
            cell.setCellValue(nullCheck(jobj.get("AFTER")));
        }

        response.setContentType("ms-vnd/excel");
        response.setHeader("Content-Disposition", "attachment;filename=example.xlsx");

        wb.write(response.getOutputStream());
        wb.close();
    }
}
