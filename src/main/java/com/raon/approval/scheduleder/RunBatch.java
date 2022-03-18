package com.raon.approval.scheduleder;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.raon.approval.db.DBConnect;

import java.util.Date;
import java.util.UUID;

public class RunBatch {

    DBConnect dbConnect = new DBConnect();

    public void exe(String uuid) {
        JsonArray jsonArray = getBatchInfo(uuid);

        DBConnect dbConnect = new DBConnect();
        String[] exeSql = null;
        String upsertLog = "MERGE INTO WAM_BATCH_LOG USING DUAL ON (UUID = '${uuid}') " +
                "WHEN MATCHED THEN UPDATE SET " +
                "TARGET_UUID = '${targetUuid}', " +
                "BATCH_NAME = '${batchName}', " +
                "STATUS = '${status}', " +
                "START_DATE = ${startTime}, " +
                "END_DATE = ${endTime}, " +
                "DETAIL_LOG = '${detailLog}' " +
                "WHEN NOT MATCHED THEN " +
                "INSERT(UUID, TARGET_UUID, BATCH_NAME, STATUS, START_DATE, END_DATE) " +
                "VALUES('${uuid}', '${targetUuid}', '${batchName}', ${status}, ${startTime}, ${endTime})";

        for (int i = 0; i < jsonArray.size(); i++) {
            JsonObject obj = jsonArray.get(i).getAsJsonObject();
            String batchLogUuid = UUID.randomUUID().toString();
            Date date = new Date();
            long dateTime = date.getTime();

            if (obj.get("EXE_TYPE").getAsString().equals("specific")) {
                exeSql = new String[3];
                exeSql[2] = "UPDATE WAM_BATCH_INFO SET USAGE = 1 WHERE UUID = '" + uuid + "'";
            } else {
                exeSql = new String[2];
            }

            upsertLog = upsertLog.replace("${uuid}", batchLogUuid)
                    .replace("${targetUuid}", obj.get("UUID").getAsString())
                    .replace("${batchName}", obj.get("NAME").getAsString())
                    .replace("${startTime}", String.valueOf(dateTime));

            if (obj.get("BATCH_TYPE").getAsString().equals("sql")) {
                exeSql[0] = obj.get("SQL").getAsString();
                exeSql[1] = upsertLog;

                dbConnect.executeSqlBatch(exeSql);
            } else {
                String filePath = obj.get("FILE_PATH").getAsString();
                exeSql[0] = filePath + "SsoBatch.jar" + " " + filePath + obj.get("FILE_NAME").getAsString();
                exeSql[1] = upsertLog;

                dbConnect.executeFileBatch(exeSql);
            }
        }
    }

    public JsonArray getBatchInfo(String uuid) {
        String sql = "SELECT * FROM WAM_BATCH_INFO WHERE UUID = '" + uuid + "'";
        JsonArray batchList = dbConnect.getData(sql);

        return batchList;
    }
}
