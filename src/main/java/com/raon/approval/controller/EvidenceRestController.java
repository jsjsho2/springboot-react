package com.raon.approval.controller;

import com.raon.approval.common.CommonFunction;
import com.raon.approval.service.CommonService;
import com.raon.approval.service.EvidenceService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping(value = "/REST/evidence")
@CrossOrigin(origins = "http://localhost:3000")
public class EvidenceRestController extends CommonFunction {

    final
    EvidenceService evidenceService;
    final
    CommonService commonService;

    public EvidenceRestController(EvidenceService evidenceService, CommonService commonService) {
        this.evidenceService = evidenceService;
        this.commonService = commonService;
    }

    @PostMapping(value = "/search", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String search(@RequestBody Map map) {

        return evidenceService.search(map);
    }

    @PostMapping(value = "/searchOne", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String searchOne(@RequestBody Map map) {
        String sql = "SELECT A.*, B.NAME FROM WAM_EVIDENCE A LEFT JOIN WA3_USER B ON A.USER_ID = B.ID WHERE A.UUID = '" + map.get("uuid") + "'";
        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/inputData")
    @ResponseBody
    public void inputData(@RequestBody Map map, HttpSession session, HttpServletRequest request) {

        String action = map.get("action").toString();
        map.put("userIP", request.getRemoteAddr());

        switch (action) {
            case "0":
                evidenceService.searchType(map, session);
                break;
            case "1":
                evidenceService.insertType(map, session);
                break;
            case "2":
                evidenceService.updateType(map, 2, session);
                break;
            case "3":
                evidenceService.deleteType(map, 3, session);
                break;
            case "4":
                evidenceService.exeType(map, session);
                break;
            case "5":
                evidenceService.requestType(map, session);
                break;
            case "6":
                evidenceService.updateType(map, 6, session);
                break;
            case "7":
                evidenceService.deleteType(map, 7, session);
                break;
            case "8":
                evidenceService.deleteType(map, 8, session);
                break;
            case "9":
                evidenceService.deleteType(map, 9, session);
                break;
        }
    }
}
