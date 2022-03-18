package com.raon.approval.db;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.raon.approval.data.FixVariable;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class DBConnect {

    private static final Logger logger = LogManager.getLogger(DBConnect.class.getName());

    public JsonArray getData(String sql) {
        String[] dbInfo = getDBInfo();
        JsonArray jsonArray = new JsonArray();

        try {
            Class.forName(dbInfo[0]);
        } catch (ClassNotFoundException cnfe) {
            cnfe.printStackTrace();
        }

        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            con = DriverManager.getConnection(dbInfo[1], dbInfo[2], dbInfo[3]);
            pstmt = con.prepareStatement(sql);
            rs = pstmt.executeQuery();

            ResultSetMetaData rsmd = rs.getMetaData();
            int columnCnt = rsmd.getColumnCount();

            while (rs.next()) {
                JsonObject jsonObject = new JsonObject();

                for (int i = 0; i < columnCnt; i++) {
                    String columnName = rsmd.getColumnName(i + 1);
                    String data = rs.getString(columnName);

                    jsonObject.addProperty(columnName, data == null ? null : data);
                }

                jsonArray.add(jsonObject);
            }

        } catch (SQLException e) {
            logger.error(e);
        } finally {
            try {
                rs.close();
                pstmt.close();
                con.close();
            } catch (SQLException e) {
                logger.error(e);
            }
        }

        return jsonArray;
    }

    public JsonObject getDataOne(String sql) {
        String[] dbInfo = getDBInfo();
        JsonObject jsonObject = new JsonObject();

        try {
            Class.forName(dbInfo[0]);
        } catch (ClassNotFoundException cnfe) {
            cnfe.printStackTrace();
        }

        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            con = DriverManager.getConnection(dbInfo[1], dbInfo[2], dbInfo[3]);
            pstmt = con.prepareStatement(sql);
            rs = pstmt.executeQuery();

            ResultSetMetaData rsmd = rs.getMetaData();
            int columnCnt = rsmd.getColumnCount();

            while (rs.next()) {
                for (int i = 0; i < columnCnt; i++) {
                    String columnName = rsmd.getColumnName(i + 1);
                    String data = rs.getString(columnName);

                    jsonObject.addProperty(columnName, data == null ? null : data);
                }
            }

        } catch (SQLException e) {
            logger.error(e);
        } finally {
            try {
                rs.close();
                pstmt.close();
                con.close();
            } catch (SQLException e) {
                logger.error(e);
            }
        }

        return jsonObject;
    }

    public JsonObject getCount(String sql) {
        String[] dbInfo = getDBInfo();
        JsonObject obj = new JsonObject();

        try {
            Class.forName(dbInfo[0]);
        } catch (ClassNotFoundException cnfe) {
            cnfe.printStackTrace();
        }

        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            con = DriverManager.getConnection(dbInfo[1], dbInfo[2], dbInfo[3]);
            pstmt = con.prepareStatement(sql);
            rs = pstmt.executeQuery();
            rs.next();

            obj.addProperty("count", rs.getInt(1));
        } catch (SQLException e) {
            logger.error(e);
        } finally {
            try {
                rs.close();
                pstmt.close();
                con.close();
            } catch (SQLException e) {
                logger.error(e);
            }
        }

        return obj;
    }

    public void executeSqlBatch(String[] sql) {
        String detailLog = "";
        String[] dbInfo = getDBInfo();
        String copyInsertSql = sql[1];
        String result = "2";

        sql[1] = copyInsertSql.replace("${status}", result)
                .replace("${endTime}", "0");

        inputData(sql[1]);

        try {
            Class.forName(dbInfo[0]);
        } catch (ClassNotFoundException cnfe) {
            cnfe.printStackTrace();
        }

        Connection con = null;
        PreparedStatement pstmt = null;

        try {
            con = DriverManager.getConnection(dbInfo[1], dbInfo[2], dbInfo[3]);
            pstmt = con.prepareStatement(sql[0]);
            pstmt.executeUpdate(sql[0]);
            result = "0";
        } catch (SQLException e) {
            result = "1";
            logger.error(e);
            detailLog += e + "\n";
        } finally {
            try {
                pstmt.close();
                con.close();
            } catch (SQLException e) {
                result = "1";
                logger.error(e);
                detailLog += e + "\n";
            }

            Date date = new Date();
            long dateTime = date.getTime();

            sql[1] = copyInsertSql.replace("${status}", result)
                    .replace("${endTime}", String.valueOf(dateTime))
                    .replace("${detailLog}", detailLog);

            inputData(sql[1]);

            if(sql.length == 3){
                inputData(sql[2]);
            }
        }
    }

    public void executeFileBatch(String[] sql) {

        String copyInsertSql = sql[1];
        String result = "2";
        sql[1] = copyInsertSql.replace("${status}", result)
                .replace("${endTime}", "0");
        inputData(sql[1]);
        StringBuilder output = new StringBuilder();

        try {
            Process process = Runtime.getRuntime().exec("java -jar " + sql[0]);
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));
            result = "0";

            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line + "\n");
                result = "1";
            }
        } catch (Exception e) {
            result = "1";
            logger.error(e);
            output.append(e + "\n");
        } finally {
            Date date = new Date();
            long dateTime = date.getTime();
            String detailLog = output.toString();

            sql[1] = copyInsertSql.replace("${status}", result)
                    .replace("${endTime}", String.valueOf(dateTime))
                    .replace("${detailLog}", detailLog);
            inputData(sql[1]);

            if(sql.length == 3){
                inputData(sql[2]);
            }
        }
    }

    public void inputData(String sql) {
        String[] dbInfo = getDBInfo();

        try {
            Class.forName(dbInfo[0]);
        } catch (ClassNotFoundException cnfe) {
            cnfe.printStackTrace();
        }

        Connection con = null;
        PreparedStatement pstmt = null;

        try {
            con = DriverManager.getConnection(dbInfo[1], dbInfo[2], dbInfo[3]);
            con.setAutoCommit(false);
            pstmt = con.prepareStatement(sql);
            pstmt.executeUpdate();

            con.commit();
        } catch (Exception e) {
            logger.error(e);
            try {
                con.rollback();
            } catch (SQLException throwables) {
                throwables.printStackTrace();
            }
        } finally {
            try {
                pstmt.close();
                con.close();
            } catch (SQLException e) {
                logger.error(e);
            }
        }
    }

    public void inputMultiData(ArrayList sqls) {
        String[] dbInfo = getDBInfo();

        try {
            Class.forName(dbInfo[0]);
        } catch (ClassNotFoundException cnfe) {
            cnfe.printStackTrace();
        }

        Connection con = null;
        PreparedStatement pstmt = null;

        try {
            con = DriverManager.getConnection(dbInfo[1], dbInfo[2], dbInfo[3]);
            con.setAutoCommit(false);

            for (int i = 0; i < sqls.size(); i++) {
                pstmt = con.prepareStatement(sqls.get(i).toString());
                pstmt.executeUpdate();
            }

            con.commit();
        } catch (Exception e) {
            logger.error(e);
            try {
                con.rollback();
            } catch (SQLException throwables) {
                throwables.printStackTrace();
            }
        } finally {
            try {
                pstmt.close();
                con.close();
            } catch (SQLException e) {
                logger.error(e);
            }
        }
    }

    public Map selectValue(String sql, String[] columns) {
        String[] dbInfo = getDBInfo();

        Connection con = null;
        Statement stmt = null;
        ResultSet rs = null;
        Map returnMap = new HashMap();

        try {
            Class.forName(dbInfo[0]);
        } catch (ClassNotFoundException cnfe) {
            cnfe.printStackTrace();
        }

        try {
            con = DriverManager.getConnection(dbInfo[1], dbInfo[2], dbInfo[3]);
            stmt = con.createStatement();
            rs = stmt.executeQuery(sql);

            while (rs.next()) {
                for (int i = 0; i < columns.length; i++) {
                    returnMap.put(columns[i], rs.getObject(columns[i]));
                }
            }
        } catch (SQLException e) {
            logger.error(e);
        } finally {
            try {
                rs.close();
                stmt.close();
                con.close();
            } catch (SQLException e) {
                logger.error(e);
            }
        }

        return returnMap;
    }

    public String[] getDBInfo() {
        String[] dbInfo = new String[4];
        dbInfo[0] = FixVariable.getDriver();
        dbInfo[1] = FixVariable.getUrl();
        dbInfo[2] = FixVariable.getId();
        dbInfo[3] = FixVariable.getPw();

        return dbInfo;
    }
}
