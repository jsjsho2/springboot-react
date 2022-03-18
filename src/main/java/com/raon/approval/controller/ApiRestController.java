package com.raon.approval.controller;

import com.raon.approval.service.CommonService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

@RestController
@RequestMapping(value = "/api")
public class ApiRestController {

    final
    CommonService commonService;

    public ApiRestController(CommonService commonService) {
        this.commonService = commonService;
    }

    @PostMapping(value = "/getApprovalCount")
    @ResponseBody
    public int appliedAuthority(HttpSession session, HttpServletRequest request) {
        String requestId = (String) request.getAttribute("requestId");
        String userAuth = session.getAttribute("userAuth").toString();

        String sql = "SELECT COUNT(B.NAME) " +
                "FROM WAM_APPROVAL_INFO A " +
                "LEFT JOIN WA3_USER B ON A.USER_ID = B.ID " +
                "WHERE STATUS = 0";

        sql += (userAuth.equals("admin") ? "" : " AND A.TARGET_ID = '" + requestId + "'");

        return Integer.parseInt(commonService.getCount(sql));
    }
}
