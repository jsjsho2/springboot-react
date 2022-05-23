package com.raon.approval.scheduleder;

import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class BatchBranch {

    private static final java.util.logging.Logger logger = Logger.getLogger(BatchBranch.class.getName());

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
            logger.log(Level.INFO, "[" + LocalDateTime.now() + "] BATCH UUID: " + uuid + " 실행");
            RunBatch runBatch = new RunBatch();
            runBatch.exe(uuid);
        };
    }

    private Trigger getTrigger(String uuid) {
        return new CronTrigger(cronMap.get(uuid));
    }
}
