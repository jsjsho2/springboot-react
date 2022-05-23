package com.raon.approval.controller;

import com.raon.approval.service.AuthorityService;
import com.raon.approval.service.EvidenceService;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Map;

@Controller
public class WebController implements ErrorController {

    final
    EvidenceService evidenceService;
    AuthorityService authorityService;

    public WebController(EvidenceService evidenceService, AuthorityService authorityService) {
        this.evidenceService = evidenceService;
        this.authorityService = authorityService;
    }

    @GetMapping({"/", "/error"})
    public String index() {
        return "index.html";
    }

    @Override
    public String getErrorPath() {
        return "/error";
    }

    @PostMapping({"/excelDown"})
    public void excelDown(@RequestBody Map map, HttpServletResponse response, HttpSession session) throws IOException {
        String page = map.get("page").toString();

        switch (page) {
            case "evidence":
                evidenceService.excelDown(map, response);
                break;
            case "hist":
                authorityService.excelDown(map, response, session);
                break;
        }
    }
}
