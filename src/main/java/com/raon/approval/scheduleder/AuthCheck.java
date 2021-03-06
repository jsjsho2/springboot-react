package com.raon.approval.scheduleder;

import com.raon.approval.db.DBConnect;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.logging.Level;

@Component
public class AuthCheck {

    private static final java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AuthCheck.class.getName());

    DBConnect dbConnect = new DBConnect();

    @Scheduled(cron = "00 10 0 * * ?")
    public void authCheck() {
        String sql = "UPDATE WAM_USER_AUTH SET STATUS = 6 " +
                "WHERE UUID IN ( " +
                "SELECT UUID " +
                "FROM WAM_USER_AUTH " +
                "WHERE TO_CHAR((TO_DATE('1970/01/01','YY/MM/DD') + TO_DATE / 86400000), 'YY/MM/DD') < TO_CHAR(TO_DATE(SYSDATE + INTERVAL '-1' DAY,'YY/MM/DD'), 'YY/MM/DD') " +
                "AND (STATUS = 0 OR STATUS = 1 OR STATUS = 5 OR STATUS = 9) " +
                ")";

        logger.log(Level.INFO, "### Execute User Auth Checking ###");

        dbConnect.inputData(sql);
    }
}