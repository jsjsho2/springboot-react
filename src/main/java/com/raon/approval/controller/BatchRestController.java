package com.raon.approval.controller;

import com.raon.approval.common.CommonFunction;
import com.raon.approval.service.BatchService;
import com.raon.approval.service.CommonService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/REST/batch")
@CrossOrigin(origins = "http://localhost:3000")
public class BatchRestController extends CommonFunction {

    final
    CommonService commonService;
    final
    BatchService batchService;

    public BatchRestController(CommonService commonService, BatchService batchService) {
        this.commonService = commonService;
        this.batchService = batchService;
    }

    @PostMapping(value = "/getBatchList", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getBatchList() {

        String sql = "SELECT UUID, NAME, BATCH_TYPE, SQL, FILE_PATH, FILE_NAME, EXE_TYPE, EVERY, SPECIFIC, USAGE, STATUS, MAX(START_DATE) START_DATE, MAX(END_DATE) END_DATE " +
                "FROM ( " +
                "SELECT A.*, NVL2(B.STATUS, B.STATUS, 3) AS STATUS, B.START_DATE, B.END_DATE " +
                "FROM WAM_BATCH_INFO A " +
                "LEFT JOIN (SELECT TARGET_UUID, BATCH_NAME, STATUS, START_DATE, MAX(END_DATE) END_DATE " +
                "FROM WAM_BATCH_LOG " +
                "WHERE (BATCH_NAME, START_DATE) IN (SELECT BATCH_NAME, MAX(START_DATE) START_DATE " +
                "FROM WAM_BATCH_LOG " +
                "GROUP BY BATCH_NAME) " +
                "GROUP BY TARGET_UUID, BATCH_NAME, STATUS, START_DATE) B " +
                "ON A.UUID = B.TARGET_UUID " +
                "ORDER BY A.NAME) " +
                "GROUP BY UUID, NAME, BATCH_TYPE, SQL, FILE_PATH, FILE_NAME, EXE_TYPE, EVERY, SPECIFIC, USAGE, STATUS";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/getBatchInfo", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String getBatchInfo(@RequestBody Map map) {

        String sql = "SELECT * FROM WAM_BATCH_INFO WHERE UUID = '" + map.get("uuid") + "'";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/manualBatchRun", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String manualBatchRun(@RequestBody Map map) {

        String uuid = map.get("uuid").toString();

        batchService.manualBatchRun(uuid);

        return uuid;
    }

    @PostMapping(value = "/batchLog", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String batchLog(@RequestBody Map map) {
        String sql = "SELECT * FROM WAM_BATCH_LOG " +
                "WHERE START_DATE >= " + stringDateToNumber(map.get("from").toString()) + " " +
                "AND START_DATE <= " + stringDateToNumber(map.get("to").toString()) + " " +
                "ORDER BY START_DATE DESC, END_DATE DESC";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/batchLogOne", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String batchLogOne(@RequestBody Map map) {
        String sql = "SELECT * FROM WAM_BATCH_LOG WHERE UUID = '" + map.get("uuid") + "'";

        return commonService.stringJsonData(sql);
    }

    @PostMapping(value = "/insertBatch", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String insertBatch(@RequestBody Map map) {
        return batchService.insertBatch(map);
    }

    @PostMapping(value = "/updateBatch", produces = "application/text; charset=UTF-8")
    @ResponseBody
    public String updateBatch(@RequestBody Map map) {
        return batchService.updateBatch(map);
    }
}
