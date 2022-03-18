package com.raon.approval.service;

import com.raon.approval.db.DBConnect;
import org.springframework.stereotype.Service;

@Service
public class CommonService {

    DBConnect dbConnect = new DBConnect();

    public String getCount(String sql) {
        return dbConnect.getCount(sql).toString();
    }

    public String stringJsonData(String sql) {
        return dbConnect.getData(sql).toString();
    }

    public void inputData(String sql) {
        dbConnect.inputData(sql);
    }
}
