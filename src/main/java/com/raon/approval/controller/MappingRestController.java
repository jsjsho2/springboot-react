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

    @PostMapping(value = "/OrgRoleMappingImpossibleCheck", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String OrgRoleMappingImpossibleCheck(@RequestBody Map map) {

        return mappingService.OrgRoleMappingImpossibleCheck(map);
    }
}
