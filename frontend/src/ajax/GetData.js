import axios from "axios";
import {message} from "antd";
import SetData from "./SetData";

const contextPath = '/WAM';

const GetData = async (url, condition = {}, menu = 'undefined', type = 'manual') => {

    let data = [];

    url = `${contextPath}${url}`

    await axios.post(url, condition, {
        headers: {
            'Content-Type': 'application/json',
            'loginId': encodeURIComponent(localStorage.getItem("loginId")),
            'loginName': encodeURIComponent(localStorage.getItem("loginName")),
            'userAuth': encodeURIComponent(localStorage.getItem("userAuth")),
            "Access-Control-Allow-Origin": "*",
        }
    })
        .then(function (rs) {
            data = rs.data;
        })
        .catch(function (error) {
            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
            data = false;
        });

    if (type === 'manual') {
        await SetData("/REST/evidence/inputData", {
            action: 0,
            menu: menu,
            target: Object.keys(condition).length === 0 ? 'null' : JSON.stringify(condition),
        }, '', 0, 'auto');
    }

    return data;
};

export default GetData;
