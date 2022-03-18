package com.raon.approval.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.raon.approval.common.CommonFunction;
import com.raon.approval.db.DBConnect;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
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

    public String search(Map map) {
        String sqlCondition = "";
        String sql = "SELECT A.*, B.NAME " +
                "       FROM WAM_EVIDENCE A " +
                "       LEFT JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "      WHERE 1=1 " +
                "      ${condition} " +
                "      ORDER BY ACTION_DATE DESC ";

        if (!map.get("name").toString().isEmpty()) {
            String[] columns = {"NAME"};
            Map values = dbConnect.selectValue("SELECT NAME FROM WA3_USER WHERE ID = '" + map.get("name") + "'", columns);
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

        return commonService.stringJsonData(sql);
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

        JsonArray beforeArray = new JsonParser().parse(before).getAsJsonArray();
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
}
