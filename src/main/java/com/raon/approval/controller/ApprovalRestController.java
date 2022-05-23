package com.raon.approval.controller;

import com.raon.approval.data.FixVariable;
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
    public String getApprovalList(@RequestBody Map map, HttpSession session) {

        return approvalService.getApprovalList(map, session);
    }

    @PostMapping(value = "/getApprovalHistList", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getApprovalHistList(@RequestBody Map map, HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();

        String sql = "SELECT A.*, B.NAME " +
                "FROM WAM_USER_AUTH A " +
                "LEFT JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "WHERE A.STATUS <> 8 " +
                "AND TARGET_UUID IS NOT NULL " +
                "AND A.USER_ID = '" + loginId + "' ";

        if (!map.get("roleName").toString().isEmpty()) {
            sql += "AND A.ROLE_NAME LIKE '%" + map.get("roleName") + "%' ";
        }

        sql += "ORDER BY A.LAST_MODIFY_DATE DESC";

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
        String sql = "SELECT USER_ID, NAME, LISTAGG(LINE, ',') WITHIN GROUP (ORDER BY LV) APPROVAL_LINE, LISTAGG(TARGET_ID, ',') WITHIN GROUP (ORDER BY lv) APPROVAL_LINE_ID " +
                "       FROM (SELECT A.USER_ID, A.NAME, B.NAME || ' ' || D.NAME AS LINE, A.LV, C.PROFILE_VALUE, A.TARGET_ID " +
                "               FROM (SELECT DISTINCT NAME, USER_ID, REGEXP_SUBSTR(A.TARGET_ID, '[^,]+', 1, LEVEL) TARGET_ID, LEVEL LV " +
                "                       FROM (SELECT USER_ID, NAME, APPROVAL_LINE TARGET_ID " +
                "                               FROM WAM_APPROVAL_LINE_PRESET " +
                "                              WHERE USER_ID ='" + loginId + "') A " +
                "                    CONNECT BY LEVEL <= LENGTH(REGEXP_REPLACE(A.TARGET_ID, '[^,]+', '')) + 1 " +
                "                      ORDER BY LEVEL) A " +
                "               LEFT JOIN WA3_USER B ON A.TARGET_ID = B.ID " +
                "               LEFT JOIN WA3_USER_PROFILE C ON C.USER_ID = B.ID " +
                "               LEFT JOIN WAM_POSITION_LIST D ON D.CODE = C.PROFILE_VALUE " +
                "              ORDER BY A.NAME, A.LV) A " +
                "       LEFT JOIN (SELECT N_STEP, SELF, SUBSTR(STEP, 5) STEP, POSITION " +
                "                    FROM (SELECT N_STEP, SELF, STEP, TRIM(REGEXP_SUBSTR(POSITION, '[^,]+', 1, LEVEL)) AS POSITION " +
                "                            FROM (WITH APPROVAL_STEP AS (SELECT N_STEP, SELF, STEP1, STEP2, STEP3 " +
                "                                                           FROM WAM_APPROVAL_STEP_CONFIG " +
                "                                                          WHERE TARGET = (SELECT PROFILE_VALUE " +
                "                                                                            FROM WA3_USER_PROFILE " +
                "                                                                           WHERE USER_ID = '" + loginId + "' " +
                "                                                                             AND PROFILE_ID = '" + FixVariable.getProfileId() + "')) " +
                "                                SELECT N_STEP, SELF, STEP, POSITION " +
                "                                  FROM APPROVAL_STEP " +
                "                               UNPIVOT (POSITION FOR STEP IN (STEP1, STEP2, STEP3))) " +
                "                         CONNECT BY INSTR(POSITION, ',', 1, LEVEL - 1) > 0) " +
                "                   GROUP BY N_STEP, SELF, STEP, POSITION) B ON A.PROFILE_VALUE = B.POSITION " +
                "      WHERE LV = TO_NUMBER(STEP) " +
                "      GROUP BY USER_ID, NAME";

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
