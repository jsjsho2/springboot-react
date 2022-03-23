package com.raon.approval.controller;

import com.raon.approval.service.CommonService;
import com.raon.approval.service.MappingService;
import com.raon.approval.service.SettingService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/REST/setting")
@CrossOrigin(origins = "http://localhost:3000")
public class SettingRestController {

    final
    CommonService commonService;
    SettingService settingService;

    public SettingRestController(CommonService commonService, SettingService settingService) {
        this.commonService = commonService;
        this.settingService = settingService;
    }

    @PostMapping(value = "/getConsoleConfig", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getConsoleConfig(@RequestBody Map map) {

        String sql = "SELECT * FROM WAM_CONFIG ";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/updateConsoleConfig")
    @ResponseBody
    public String updateConsoleConfig(@RequestBody Map map) {

        return settingService.updateConsoleConfig(map);
    }
}
