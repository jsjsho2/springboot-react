package com.raon.approval.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.raon.approval.db.DBConnect;
import com.raon.approval.scheduleder.BatchBranch;
import com.raon.approval.scheduleder.RunBatch;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class BatchService {

    BatchBranch ps = new BatchBranch();
    RunBatch runBatch = new RunBatch();
    DBConnect dbConnect = new DBConnect();

    public String insertBatch(Map map) {
        String uuid = map.get("uuid").toString();
        String name = map.get("name").toString();
        String batchType = map.get("batchType").toString();
        String sql = map.get("sql").toString();
        String filePath = map.get("filePath").toString();
        String fileName = map.get("fileName").toString();
        String exeType = map.get("exeType").toString();
        String every = map.get("every").toString();
        String specific = map.get("specific").toString();
        int usage = Integer.parseInt(map.get("usage").toString());

        String insertSql = "INSERT INTO WAM_BATCH_INFO " +
                "(UUID, NAME, BATCH_TYPE, SQL, FILE_PATH, FILE_NAME, EXE_TYPE, EVERY, SPECIFIC, USAGE) VALUES " +
                "('" + uuid + "', '" + name + "', '" + batchType + "', '" + sql + "', '" + filePath + "', '" + fileName + "', '" + exeType + "', '" + every + "', '" + specific + "', " + usage + ")";

        dbConnect.inputData(insertSql);

        ps.schedulerMap.put(uuid, new ThreadPoolTaskScheduler());
        ps.cronMap.put(uuid, exeType.equals("every") ? every : specific);
        ps.startScheduler(uuid);

        return uuid;
    }

    public String updateBatch(Map map) {
        String uuid = map.get("uuid").toString();
        String name = map.get("name").toString();
        String batchType = map.get("batchType").toString();
        String sql = map.get("sql").toString();
        String filePath = map.get("filePath").toString();
        String fileName = map.get("fileName").toString();
        String exeType = map.get("exeType").toString();
        String every = map.get("every").toString();
        String specific = map.get("specific").toString();
        int usage = Integer.parseInt(map.get("usage").toString());
        int beforeUsage = Integer.parseInt(map.get("beforeUsage").toString());

        if (beforeUsage == 0) {
            ps.stopScheduler(uuid);
        }

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        if (usage == 0) {
            if (beforeUsage == 0) {
                ps.changeCronSet(uuid, exeType.equals("every") ? every : specific);
            } else {
                ps.schedulerMap.put(uuid, new ThreadPoolTaskScheduler());
                ps.cronMap.put(uuid, exeType.equals("every") ? every : specific);
            }

            ps.startScheduler(uuid);
        }

        String updateSql = "UPDATE WAM_BATCH_INFO SET " +
                "NAME = '" + name + "', " +
                "BATCH_TYPE = '" + batchType + "', " +
                "SQL = '" + sql + "', " +
                "FILE_PATH = '" + filePath + "', " +
                "FILE_NAME = '" + fileName + "', " +
                "EXE_TYPE = '" + exeType + "', " +
                "EVERY = '" + every + "', " +
                "SPECIFIC = '" + specific + "', " +
                "USAGE = '" + usage + "' " +
                "WHERE UUID = '" + uuid + "'";

        String compareSql = "SELECT * FROM WAM_BATCH_INFO WHERE UUID = '" + uuid + "'";
        JsonArray beforeData = dbConnect.getData(compareSql);
        JsonObject object = new JsonObject();
        object.addProperty("COMPARE_SQL", compareSql);
        beforeData.add(object);
        dbConnect.inputData(updateSql);

        return beforeData.toString();
    }

    public void manualBatchRun(String uuid) {
        runBatch.exe(uuid);
    }
}
