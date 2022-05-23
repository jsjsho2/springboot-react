package com.raon.approval.controller;

import com.raon.approval.service.CommonService;
import com.raon.approval.service.MappingService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/REST/mapping")
@CrossOrigin(origins = "http://localhost:3000")
public class MappingRestController {

    final
    CommonService commonService;
    final
    MappingService mappingService;

    public MappingRestController(CommonService commonService, MappingService mappingService) {
        this.commonService = commonService;
        this.mappingService = mappingService;
    }

    @PostMapping(value = "/getOrgRoleMappingData", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getOrgRoleMappingData(@RequestBody Map map) {

        return mappingService.getOrgRoleMappingData(map);
    }

    @PostMapping(value = "/updateOrgRoleMapping", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String updateOrgRoleMapping(@RequestBody Map map) {

        return mappingService.updateOrgRoleMapping(map);
    }

    @PostMapping(value = "/orgRoleMappingImpossibleCheck", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String orgRoleMappingImpossibleCheck(@RequestBody Map map) {

        return mappingService.orgRoleMappingImpossibleCheck(map);
    }

    @PostMapping(value = "/getPositionList", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getPositionList() {

        return mappingService.getPositionList();
    }

    @PostMapping(value = "/getPositionByApprovalConfig", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getPositionByApprovalConfig(@RequestBody Map map) {

        return mappingService.getPositionByApprovalConfig(map);
    }

    @PostMapping(value = "/updateApprovalStep", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String updateApprovalStep(@RequestBody Map map) {

        return mappingService.updateApprovalStep(map);
    }
}
