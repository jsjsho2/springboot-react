package com.raon.approval.scheduleder;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;

import java.time.LocalDateTime;
import java.util.Map;

public class BatchBranch {

    private static final Logger logger = LogManager.getLogger(BatchBranch.class.getName());

    public static Map<String, ThreadPoolTaskScheduler> schedulerMap;

    public static Map<String, String> cronMap;

    public void startScheduler(String uuid) {
        ThreadPoolTaskScheduler scheduler = schedulerMap.get(uuid);

        scheduler = new ThreadPoolTaskScheduler();
        scheduler.initialize();
        scheduler.schedule(getRunnable(uuid), getTrigger(uuid));
    }

    public void changeCronSet(String uuid, String cron) {
        this.cronMap.replace(uuid, cron);
    }

    public void stopScheduler(String uuid) {
        schedulerMap.get(uuid).shutdown();
    }

    private Runnable getRunnable(String uuid) {
        return () -> {
            logger.info("[" + LocalDateTime.now() + "] BATCH UUID: " + uuid + " 실행");
            RunBatch runBatch = new RunBatch();
            runBatch.exe(uuid);
        };
    }

    private Trigger getTrigger(String uuid) {
        return new CronTrigger(cronMap.get(uuid));
    }
}
