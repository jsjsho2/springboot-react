import axios from "axios";

const contextPath = '/WAM';

const SetData = async (url, condition = {}, menu = 'undefined', action, type = 'manual') => {
    let data = false;
    let pkValue = null;

    url = `${contextPath}${url}`

    await axios.post(url, condition, {
        headers: {
            'Content-Type': 'application/json',
            'loginId': encodeURIComponent(localStorage.getItem("loginId")),
            'loginName': encodeURIComponent(localStorage.getItem("loginName")),
            'userAuth': encodeURIComponent(localStorage.getItem("userAuth")),
        }
    })
        .then(rs => {
            data = true;
            pkValue = JSON.stringify(rs.data);
        })
        .catch(error => {
            console.log('axios error')
        });

    if (type === 'manual') {
        const evidenceCondition = {
            action: action,
            menu: menu,
            target: Object.keys(condition).length === 0 ? 'null' : JSON.stringify(condition),
            pkValue: pkValue
        };

        await axios.post(`${contextPath}/REST/evidence/inputData`, evidenceCondition, {
            headers: {
                'Content-Type': 'application/json',
                'loginId': encodeURIComponent(localStorage.getItem("loginId")),
                'loginName': encodeURIComponent(localStorage.getItem("loginName")),
                'userAuth': encodeURIComponent(localStorage.getItem("userAuth")),
            }
        })
    }

    return data;
};

export default SetData;
