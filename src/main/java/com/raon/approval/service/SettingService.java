package com.raon.approval.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.raon.approval.db.DBConnect;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;

@Service
public class SettingService {

    DBConnect dbConnect = new DBConnect();

    public String updateConsoleConfig(Map<String, ArrayList> map) {
        ArrayList sqls = new ArrayList();

        for (String key : map.keySet()) {
            ArrayList values = map.get(key);

            String sql = "MERGE INTO WAM_CONFIG USING DUAL ON (MAIN_CATEGORY = '" + values.get(0) + "' " +
                    "AND SUB_CATEGORY = '" + values.get(1) + "' AND KEY = '" + key + "') " +
                    "WHEN MATCHED THEN UPDATE SET " +
                    "VALUE = '" + values.get(2) + "' " +
                    "WHEN NOT MATCHED THEN " +
                    "INSERT(MAIN_CATEGORY, SUB_CATEGORY, KEY, VALUE) " +
                    "VALUES('" + values.get(0) + "', '" + values.get(1) + "','" + key + "' ,'" + values.get(2) + "')";

            sqls.add(sql);
        }

        String compareSql = "SELECT * FROM WAM_CONFIG";

        JsonArray beforeData = dbConnect.getData(compareSql);
        JsonObject object = new JsonObject();
        object.addProperty("COMPARE_SQL", compareSql);
        beforeData.add(object);
        dbConnect.inputMultiData(sqls);

        return beforeData.toString();
    }
}
