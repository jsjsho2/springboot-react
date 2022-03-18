package com.raon.approval.controller;

import com.raon.approval.common.CommonFunction;
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
    public String tokenCheck(@RequestBody Map map, HttpServletRequest request) {

        return tokenCheck(map.get("ssoToken").toString(), request).toString();
    }


    @PostMapping(value = "/getOrgUserTreeData", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getOrgUserTreeData(HttpSession session) {

        String loginId = session.getAttribute("loginId").toString();
        String sql = "SELECT A.ID, A.NAME, A.PARENT_ID, A.SEPARATOR, A.TARGET, B.PARENT FROM ( " +
                "SELECT ROWNUM ORDERING, ID, NAME, PARENT_ID, SEPARATOR, TARGET FROM ( " +
                "SELECT ID, NAME, PARENT_ID, '0' SEPARATOR, 0 TARGET FROM WA3_ORG " +
                "UNION ALL " +
                "SELECT A.USER_ID, B.NAME NAME, A.ORG_ID PARENT_ID, '1' SEPARATOR, " +
                "CASE WHEN A.USER_ID = '" + loginId + "' THEN 1 " +
                "ELSE 0 " +
                "END AS TARGET " +
                "FROM WA3_ORG_USER A " +
                "JOIN WA3_USER B ON A.USER_ID = B.ID) " +
                "START WITH PARENT_ID = '-1' " +
                "CONNECT BY NOCYCLE PRIOR ID = PARENT_ID " +
                "ORDER BY LEVEL) A " +
                "LEFT JOIN (WITH TREE_QUERY(USER_ID ,ORG_ID) AS " +
                "(SELECT USER_ID, ORG_ID " +
                "FROM WA3_ORG_USER " +
                "WHERE USER_ID = '" + loginId + "' " +
                "UNION ALL " +
                "SELECT B.ID, B.PARENT_ID " +
                "FROM WA3_ORG B, TREE_QUERY C " +
                "WHERE B.ID = C.ORG_ID) " +
                "SELECT USER_ID, ORG_ID, 1 AS PARENT " +
                "FROM TREE_QUERY " +
                "GROUP BY USER_ID, ORG_ID) B ON B.ORG_ID = A.ID " +
                "ORDER BY A.ORDERING";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/getRoleTreeData", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getRoleTreeData() {

        String sql = "SELECT ID, NAME, PARENT_ID " +
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
