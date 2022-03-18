package com.raon.approval.config;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.raon.approval.db.DBConnect;
import com.raon.approval.scheduleder.BatchBranch;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;


import java.util.HashMap;

@Component
public class SetConfig {

    private static final Logger logger = LogManager.getLogger(SetConfig.class.getName());

    DBConnect dbConnect = new DBConnect();
    BatchBranch batchBranch = new BatchBranch();

    public void batchSetting() {
        JsonArray batchList = dbConnect.getData("SELECT * FROM WAM_BATCH_INFO WHERE USAGE = 0");
        batchBranch.schedulerMap = new HashMap<String, ThreadPoolTaskScheduler>();
        batchBranch.cronMap = new HashMap<>();

        for (int i = 0; i < batchList.size(); i++) {
            JsonObject obj = batchList.get(i).getAsJsonObject();
            String batchUuid = obj.get("UUID").getAsString();
            String exeType = obj.get("EXE_TYPE").getAsString();

            batchBranch.schedulerMap.put(batchUuid, new ThreadPoolTaskScheduler());
            batchBranch.cronMap.put(batchUuid, exeType.equals("every") ? obj.get("EVERY").getAsString() : obj.get("SPECIFIC").getAsString());

            batchBranch.startScheduler(batchUuid);
        }
    }
}
