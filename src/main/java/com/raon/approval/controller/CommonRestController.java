package com.raon.approval.controller;

import com.raon.approval.common.CommonFunction;
import com.raon.approval.data.FixVariable;
import com.raon.approval.service.CommonService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping(value = "/REST/common")
@CrossOrigin(origins = "http://localhost:3000")
public class CommonRestController extends CommonFunction {

    final
    CommonService commonService;

    public CommonRestController(CommonService commonService) {
        this.commonService = commonService;
    }

    @PostMapping(value = "/tokenCheck", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String tokenCheck(@RequestBody Map map, HttpServletRequest request, HttpSession session) {

        return tokenCheck(map.get("ssoToken").toString(), request, session).toString();
    }

    @PostMapping(value = "/getOrgUserTreeData", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getOrgUserTreeData(HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();

        String sql = "SELECT A.* " +
                "       FROM (SELECT A.ID, A.NAME, A.PARENT_ID, A.SEPARATOR, A.TARGET, B.PARENT, A.POSITION " +
                "               FROM (SELECT ROWNUM ORDERING, ID, NAME, PARENT_ID, SEPARATOR, TARGET, POSITION " +
                "                       FROM (SELECT ID, NAME, PARENT_ID, '0' SEPARATOR, 0 TARGET, null POSITION " +
                "                               FROM WA3_ORG " +
                "                              UNION ALL " +
                "                             SELECT A.USER_ID, B.NAME NAME, A.ORG_ID PARENT_ID, '1' SEPARATOR, " +
                "                                    CASE WHEN A.USER_ID = '" + loginId + "' THEN 1 " +
                "                                    ELSE 0 END AS TARGET, D.NAME POSITION " +
                "                               FROM WA3_ORG_USER A " +
                "                               JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "                               LEFT JOIN WA3_USER_PROFILE C ON C.USER_ID = B.ID AND C.PROFILE_ID = '" + FixVariable.getProfileId() + "' " +
                "                               LEFT JOIN WAM_POSITION_LIST D ON D.CODE = C.PROFILE_VALUE) " +
                "                      START WITH PARENT_ID = '-1' " +
                "                    CONNECT BY NOCYCLE PRIOR ID = PARENT_ID " +
                "                      ORDER BY LEVEL) A " +
                "               LEFT JOIN (WITH TREE_QUERY(USER_ID ,ORG_ID) AS (SELECT USER_ID, ORG_ID " +
                "                                                                 FROM WA3_ORG_USER " +
                "                                                                WHERE USER_ID = '" + loginId + "' " +
                "                                                                UNION ALL " +
                "                                                               SELECT B.ID, B.PARENT_ID " +
                "                                                                 FROM WA3_ORG B, TREE_QUERY C " +
                "                                                                WHERE B.ID = C.ORG_ID) " +
                "                        SELECT USER_ID, ORG_ID, 1 AS PARENT " +
                "                          FROM TREE_QUERY " +
                "                         GROUP BY USER_ID, ORG_ID) B ON B.ORG_ID = A.ID " +
                "              ORDER BY A.ORDERING) A";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/getOrgUserTreeDataOnMapping", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getOrgUserTreeDataOnMapping(HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();

        String sql = "SELECT A.*, SUBSTR(B.STEP, 5) STEP, C.N_STEP, C.SELF " +
                "       FROM (SELECT A.ID, A.NAME, A.PARENT_ID, A.SEPARATOR, A.TARGET, B.PARENT, A.POSITION, A.PROFILE_VALUE " +
                "               FROM (SELECT ROWNUM ORDERING, ID, NAME, PARENT_ID, SEPARATOR, TARGET, POSITION, PROFILE_VALUE " +
                "                       FROM (SELECT ID, NAME, PARENT_ID, '0' SEPARATOR, 0 TARGET, null POSITION, null PROFILE_VALUE " +
                "                               FROM WA3_ORG " +
                "                              UNION ALL " +
                "                             SELECT A.USER_ID, B.NAME NAME, A.ORG_ID PARENT_ID, '1' SEPARATOR, " +
                "                                    CASE WHEN A.USER_ID = '" + loginId + "' THEN 1 " +
                "                                    ELSE 0 END AS TARGET, D.NAME POSITION, C.PROFILE_VALUE " +
                "                               FROM WA3_ORG_USER A " +
                "                               LEFT JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "                               LEFT JOIN WA3_USER_PROFILE C ON C.USER_ID = B.ID AND C.PROFILE_ID = '" + FixVariable.getProfileId() + "'  " +
                "                               LEFT JOIN WAM_POSITION_LIST D ON D.CODE = C.PROFILE_VALUE) " +
                "                      START WITH PARENT_ID = '-1' " +
                "                    CONNECT BY NOCYCLE PRIOR ID = PARENT_ID " +
                "                      ORDER BY LEVEL) A " +
                "               LEFT JOIN (WITH TREE_QUERY(USER_ID ,ORG_ID) AS (SELECT USER_ID, ORG_ID " +
                "                                                                 FROM WA3_ORG_USER " +
                "                                                                WHERE USER_ID = '" + loginId + "' " +
                "                                                                UNION ALL " +
                "                                                               SELECT B.ID, B.PARENT_ID " +
                "                                                                 FROM WA3_ORG B, TREE_QUERY C " +
                "                                                                WHERE B.ID = C.ORG_ID) " +
                "                        SELECT USER_ID, ORG_ID, 1 AS PARENT " +
                "                          FROM TREE_QUERY " +
                "                         GROUP BY USER_ID, ORG_ID) B ON B.ORG_ID = A.ID " +
                "              ORDER BY A.ORDERING) A " +
                "       LEFT JOIN (SELECT * " +
                "                    FROM (SELECT STEP, TRIM(REGEXP_SUBSTR(POSITION, '[^,]+', 1, LEVEL)) AS POSITION " +
                "                            FROM (WITH APPROVAL_STEP AS (SELECT STEP1, STEP2, STEP3  " +
                "                                                           FROM WAM_APPROVAL_STEP_CONFIG " +
                "                                                          WHERE TARGET = (SELECT PROFILE_VALUE " +
                "                                                                            FROM WA3_USER_PROFILE " +
                "                                                                           WHERE USER_ID = '" + loginId + "' " +
                "                                                                             AND PROFILE_ID = '" + FixVariable.getProfileId() + "')) " +
                "                                SELECT STEP, POSITION " +
                "                                  FROM APPROVAL_STEP " +
                "                               UNPIVOT (POSITION FOR STEP IN (STEP1, STEP2, STEP3))) " +
                "                         CONNECT BY INSTR(POSITION, ',', 1, LEVEL - 1) > 0) " +
                "                           GROUP BY STEP, POSITION) B ON A.PROFILE_VALUE = B.POSITION " +
                "       LEFT JOIN (SELECT TARGET, SELF, N_STEP " +
                "                    FROM WAM_APPROVAL_STEP_CONFIG " +
                "                   WHERE TARGET = (SELECT PROFILE_VALUE " +
                "                                     FROM WA3_USER_PROFILE " +
                "                                    WHERE USER_ID = '" + loginId + "' " +
                "                                      AND PROFILE_ID = '" + FixVariable.getProfileId() + "')) C ON C.TARGET = A.PROFILE_VALUE";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/getRoleTreeData", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getRoleTreeData() {

        String sql = "SELECT ID, NAME, PARENT_ID, CONNECT_BY_ISLEAF AS LEAF " +
                "FROM WA3_ROLE " +
                "START WITH PARENT_ID is null " +
                "CONNECT BY PRIOR ID = PARENT_ID";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/getServiceTreeData", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getServiceTreeData() {

        String sql = "SELECT ID, NAME, PARENT_ID, TYPE " +
                "FROM WA3_SERVICE " +
                "START WITH PARENT_ID is null " +
                "CONNECT BY PRIOR ID = PARENT_ID";

        return commonService.stringJsonData(sql);
    }
}
