package com.raon.approval.controller;

import com.raon.approval.common.CommonFunction;
import com.raon.approval.service.ApprovalService;
import com.raon.approval.service.AuthorityService;
import com.raon.approval.service.CommonService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
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
                "WHERE (A.STATUS = 5 OR A.STATUS = 1) ";

        if (!map.get("roleName").toString().isEmpty()) {
            sql += "AND ROLE_NAME LIKE '%" + map.get("roleName") + "%' ";
        }

        if (map.get("type").toString().equals("0")) {
            sql += "AND A.USER_ID = '" + loginId + "' ";
        }else{
            if (map.containsKey("targetInfo") && !map.get("targetInfo").toString().isEmpty()) {
                String searchType = map.get("searchType").toString();
                sql += "AND " + (searchType.equals("name") ? "B.NAME " : "A.USER_ID ") + " LIKE '%" + map.get("targetInfo") + "%' ";
            }

            if (!map.get("datePoint").toString().isEmpty()) {
                String datePoint = stringDateToNumber(map.get("datePoint").toString());
                sql += "AND FROM_DATE <= " + datePoint + " AND TO_DATE >= " + datePoint + " ";
            }
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
        String sql = "SELECT * FROM ( " +
                "SELECT B.* " +
                "FROM WAM_ORG_ROLE_MAPPING A " +
                "LEFT JOIN WA3_ROLE B ON B.ID = A.ROLE_ID " +
                "WHERE A.ORG_ID = (SELECT ORG_ID FROM WA3_USER WHERE ID = '" + loginId + "') " +
                "UNION ALL " +
                "SELECT B.* " +
                "FROM WAM_USER_AUTH A " +
                "LEFT JOIN WA3_ROLE B ON A.ROLE_ID = B.ID " +
                "WHERE A.STATUS = 9 AND A.USER_ID = '" + loginId + "' " +
                ") " +
                "GROUP BY ID, NAME, CREATOR, MODIFIER, INFO, PARENT_ID, PATH_ID, CREATE_TIME, MODIFY_TIME";

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

        String loginId = session.getAttribute("loginId").toString();
        String sql = "SELECT * FROM WAM_USER_AUTH WHERE USER_ID = '" + loginId + "' AND ROLE_NAME LIKE '%" + map.get("roleName") + "%' ORDER BY LAST_MODIFY_DATE DESC";

        return commonService.stringJsonData(sql);
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
