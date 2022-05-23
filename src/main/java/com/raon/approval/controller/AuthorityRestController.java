package com.raon.approval.controller;

import com.raon.approval.common.CommonFunction;
import com.raon.approval.service.ApprovalService;
import com.raon.approval.service.AuthorityService;
import com.raon.approval.service.CommonService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping(value = "/REST/authority")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthorityRestController extends CommonFunction {

    final
    CommonService commonService;
    final
    ApprovalService approvalService;
    final
    AuthorityService authorityService;

    public AuthorityRestController(CommonService commonService, ApprovalService approvalService, AuthorityService authorityService) {
        this.commonService = commonService;
        this.approvalService = approvalService;
        this.authorityService = authorityService;
    }

    @PostMapping(value = "/appliedAuthority", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String appliedAuthority(@RequestBody Map map, HttpSession session) {
        String loginId = session.getAttribute("loginId").toString();

        String sql = "SELECT A.*, B.NAME FROM WAM_USER_AUTH A " +
                "LEFT JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "WHERE (A.STATUS = 5 OR A.STATUS = 1 OR A.STATUS = 9) ";
        String[] targetCondition = {"", ""};

        if (map.get("type").toString().equals("0")) {
            targetCondition[0] = "AND A.USER_ID = '" + loginId + "' ";
            targetCondition[1] = "AND B.ID = '" + loginId + "' ";
        } else {
            if (map.containsKey("targetInfo") && !map.get("targetInfo").toString().isEmpty()) {
                String searchType = map.get("searchType").toString();
                targetCondition[0] = "AND " + (searchType.equals("name") ? "B.NAME " : "A.USER_ID ") + " LIKE '%" + map.get("targetInfo") + "%' ";
                targetCondition[1] = "AND " + (searchType.equals("name") ? "B.NAME " : "B.ID ") + " LIKE '%" + map.get("targetInfo") + "%' ";
            }

            if (!map.get("datePoint").toString().isEmpty()) {
                String datePoint = stringDateToNumber(map.get("datePoint").toString());
                sql += "AND FROM_DATE <= " + datePoint + " AND TO_DATE >= " + datePoint + " ";
            }
        }

        sql += targetCondition[0];

        sql = "SELECT A.* FROM ( " +
                sql +
                "UNION ALL " +
                "SELECT A.UUID, '' TARGET_ID, B.ID USER_ID, A.ROLE_ID, C.NAME ROLE_NAME, 0 FROM_DATE, 0 TO_DATE, 0 LAST_MODIFY_DATE, 99 STATUS, B.NAME NAME " +
                "  FROM WAM_ORG_ROLE_MAPPING A " +
                "  LEFT JOIN WA3_USER B ON A.ORG_ID = B.ORG_ID " +
                "  LEFT JOIN WA3_ROLE C ON C.ID = A.ROLE_ID " +
                " WHERE 1=1 " +
                "   AND A.FLAG = 'd' " +
                targetCondition[1] +
                ") A ";

        if (!map.get("roleName").toString().isEmpty()) {
            sql += "WHERE A.ROLE_NAME LIKE '%" + map.get("roleName") + "%' ";
        }

        sql += "ORDER BY A.LAST_MODIFY_DATE ASC";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/authorityReturn")
    @ResponseBody
    public String authorityReturn(@RequestBody Map map) {

        return authorityService.authorityReturn(map);
    }

    @PostMapping(value = "/getRole", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getRole(HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();
        String sql = " SELECT B.*, C.STATUS " +
                "        FROM WAM_ORG_ROLE_MAPPING A " +
                "        LEFT JOIN WA3_ROLE B ON B.ID = A.ROLE_ID " +
                "        LEFT JOIN WAM_USER_AUTH C ON A.ROLE_ID = C.ROLE_ID AND C.USER_ID = '" + loginId + "' " +
                "       WHERE A.ORG_ID = (SELECT ORG_ID FROM WA3_USER WHERE ID = '" + loginId + "') " +
                "         AND A.FLAG = 'a' " +
                "         AND B.ID NOT IN (SELECT A.ROLE_ID " +
                "                            FROM WAM_USER_AUTH A " +
                "                            LEFT JOIN WA3_ROLE B ON A.ROLE_ID = B.ID " +
                "                           WHERE A.STATUS NOT IN (2,3,4,6,7) " +
                "                             AND A.USER_ID = '" + loginId + "') " +
                "       GROUP BY ID, NAME, CREATOR, MODIFIER, INFO, PARENT_ID, PATH_ID, CREATE_TIME, MODIFY_TIME, STATUS";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/getOnRequest", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getOnRequest(HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();
        String sql = "SELECT * FROM WAM_USER_AUTH WHERE (STATUS = 0 OR STATUS = 1 OR STATUS = 5 OR STATUS = 8 OR STATUS = 9) AND USER_ID = '" + loginId + "'";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/getUserAuthorityHist", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getUserAuthorityHist(@RequestBody Map map, HttpSession session) {

        return authorityService.getUserAuthorityHist(map, session);
    }

    @PostMapping(value = "/getRequestOne", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getApprovalOne(@RequestBody Map map, HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();
        String userAuth = session.getAttribute("userAuth").toString();

        String sql = "SELECT B.NAME, A.* FROM WAM_APPROVAL_INFO A LEFT JOIN WA3_USER B ON A.USER_ID = B.ID WHERE A.UUID = '" + map.get("uuid") + "'";

        if (!map.get("type").toString().toLowerCase().equals("hist")) {
            sql += userAuth.equals("admin") ? "" : " AND A.TARGET_ID = '" + loginId + "'";
        }

        return authorityService.getRequestOne(sql);
    }

    @PostMapping(value = "/getRoleInService", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getRoleInService(@RequestBody Map map) {

        return authorityService.getRoleInService(map.get("roleId").toString());
    }
}
