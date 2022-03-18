package com.raon.approval.controller;

import com.raon.approval.service.ApprovalService;
import com.raon.approval.service.CommonService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping(value = "/REST/approval")
@CrossOrigin(origins = "http://localhost:3000")
public class ApprovalRestController {

    final
    CommonService commonService;
    final
    ApprovalService approvalService;

    public ApprovalRestController(CommonService commonService, ApprovalService approvalService) {
        this.commonService = commonService;
        this.approvalService = approvalService;
    }

    @PostMapping(value = "/addApproval", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String addApproval(@RequestBody Map map, HttpSession session) {

        return approvalService.insertApprovalData(map, session);
    }

    @PostMapping(value = "/getAllApprovalList", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getAllApprovalList(HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();
        String sql = "SELECT * " +
                "FROM WAM_APPROVAL_INFO " +
                "WHERE USER_ID = '" + loginId + "' " +
                "ORDER BY REQUEST_TIME DESC";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/getApprovalListCount", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getApprovalListCount(HttpSession session) {
        String loginId = session.getAttribute("loginId").toString();
        String userAuth = session.getAttribute("userAuth").toString();

        String sql = "SELECT COUNT(B.NAME) " +
                "FROM WAM_APPROVAL_INFO A " +
                "LEFT JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "WHERE STATUS = 0";

        sql += (userAuth.equals("admin") ? "" : " AND A.TARGET_ID = '" + loginId + "'");

        return commonService.getCount(sql);
    }


    @PostMapping(value = "/getApprovalList", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getApprovalList(HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();
        String userAuth = session.getAttribute("userAuth").toString();

        String sql = "SELECT A.*, B.NAME FROM " +
                "(SELECT UUID,SUMMARY,REQUEST_INFO,USER_ID,FLOW,LAST_MODIFIER,RSN,TARGET_ID,STATUS,REQUEST_TIME, 0 TYPE " +
                "FROM WAM_APPROVAL_INFO " +
                "WHERE TYPE = 0 " +
                "AND STATUS = 0 ";

        sql += userAuth.equals("admin") ? "" : "AND TARGET_ID = '" + loginId + "' ";

        sql += "UNION ALL " +
                "SELECT UUID, LISTAGG(NAME, ',') WITHIN GROUP (ORDER BY RN) SUMMARY, REQUEST_INFO,USER_ID,FLOW,LAST_MODIFIER,RSN,TARGET_ID,STATUS,REQUEST_TIME, 1 TYPE FROM ( " +
                "SELECT A.*, B.NAME, ROWNUM RN FROM " +
                "(SELECT DISTINCT UUID, REGEXP_SUBSTR(A.SUMMARY, '[^,]+', 1, LEVEL) CUSTOM, REQUEST_INFO,USER_ID,FLOW,LAST_MODIFIER,RSN,TARGET_ID,STATUS,REQUEST_TIME " +
                "FROM (SELECT * FROM WAM_APPROVAL_INFO WHERE STATUS = 0 AND TYPE = 1 ";

        sql += (userAuth.equals("admin") ? "" : "AND TARGET_ID = '" + loginId + "'") + ") A ";

        sql += "CONNECT BY LEVEL <= LENGTH(REGEXP_REPLACE(A.SUMMARY, '[^,]+',''))+1) A " +
                "LEFT JOIN WA3_SERVICE B ON A.CUSTOM = B.ID) " +
                "GROUP BY UUID,REQUEST_INFO,USER_ID,FLOW,LAST_MODIFIER,RSN,TARGET_ID,STATUS,REQUEST_TIME " +
                ") A " +
                "LEFT JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "ORDER BY REQUEST_TIME DESC";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/updateApprovalInfo", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String updateApprovalInfo(@RequestBody Map map, HttpSession session) {

        return approvalService.updateApprovalInfo(map, session);
    }

    @PostMapping(value = "/loadPreset", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String loadPreset(HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();
        String sql = "SELECT USER_ID, NAME, LISTAGG(LINE, ',') WITHIN GROUP (ORDER BY RN) APPROVAL_LINE, LISTAGG(LINE_WITH_NAME, ',') WITHIN GROUP (ORDER BY RN) APPROVAL_LINE_WITH_NAME FROM ( " +
                "SELECT A.USER_ID, A.NAME, B.NAME AS LINE, B.NAME ||'('|| A.TARGET_ID ||')' AS LINE_WITH_NAME, ROWNUM RN  FROM  " +
                "(SELECT DISTINCT NAME, USER_ID, REGEXP_SUBSTR(A.TARGET_ID, '[^,]+', 1, LEVEL) TARGET_ID " +
                "FROM (SELECT USER_ID, NAME,  APPROVAL_LINE TARGET_ID FROM WAM_APPROVAL_LINE_PRESET WHERE USER_ID ='" + loginId + "') A " +
                "CONNECT BY LEVEL <= LENGTH(REGEXP_REPLACE(A.TARGET_ID, '[^,]+',''))+1) A " +
                "LEFT JOIN WA3_USER B ON A.TARGET_ID = B.ID) " +
                "GROUP BY USER_ID, NAME";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/addPreset")
    @ResponseBody
    public boolean addPreset(@RequestBody Map map, HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();
        String sql = "SELECT * FROM WAM_APPROVAL_LINE_PRESET WHERE USER_ID = '" + loginId + "' AND NAME = '" + map.get("presetName") + "'";
        String dataCheck = commonService.stringJsonData(sql);
        if (!dataCheck.equals("[]")) {
            return false;
        }

        sql = "INSERT INTO WAM_APPROVAL_LINE_PRESET VALUES('" + loginId + "' ,'" + map.get("presetName") + "', '" + map.get("preset") + "')";

        commonService.inputData(sql);

        return true;
    }

    @PostMapping(value = "/deletePreset")
    @ResponseBody
    public void deletePreset(@RequestBody Map map, HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();
        String sql = "DELETE FROM WAM_APPROVAL_LINE_PRESET WHERE USER_ID = '" + loginId + "' AND NAME = '" + map.get("presetName") + "'";
        commonService.inputData(sql);
    }
}
