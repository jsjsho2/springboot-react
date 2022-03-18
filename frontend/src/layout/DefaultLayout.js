import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {AppContent, AppSidebar, AppFooter, AppHeader} from '../components/index'
import GetData from "../ajax/GetData";
import SSOCheck from "../views/SSOCheck";
import * as common from "../components/CommonFunction"

const DefaultLayout = () => {
    const [ssoCheck, setSsoCheck] = useState(false);
    const [tokenNull, setTokenNull] = useState(false);
    const [userAuth, setUserAuth] = useState('');
    const [tokenFalseMessage, setTokenFalseMessage] = useState('');
    const [firstAccess, setFirstAccess] = useState(false);
    let history = useHistory();

    useEffect(() => {

        const urlPath = window.location.pathname;
        const token = common.getParam('token');
        const localToken = localStorage.getItem("ssoToken");

        if (token == null) {
            if (localToken === null) {
                setTokenFalseMessage(`토큰검증 실패: not exist token`);
                setTokenNull(true)
            } else {
                if (!firstAccess) {
                    GetData("/REST/common/tokenCheck", {ssoToken: localToken}, '', 'auto')
                        .then((rs) => {
                            if (rs.result) {
                                const userInfo = JSON.parse(rs.userInfo);
                                localStorage.setItem("loginId", userInfo.ID);
                                localStorage.setItem("loginName", userInfo.NAME);
                                localStorage.setItem("loginOrg", userInfo.ORG_NAME);
                                localStorage.setItem("requestIp", rs.requestIp);
                                setUserAuth(rs.userAuth);
                                setSsoCheck(true);
                                history.push(urlPath);
                            } else {
                                setTokenFalseMessage(`토큰검증 실패: ${rs.nResult}`);
                                setTokenNull(true);
                            }
                        });
                } else {
                    setUserAuth(localStorage.getItem('userAuth'));
                    setSsoCheck(true);
                    history.push(urlPath);
                }
            }
        } else {
            GetData("/REST/common/tokenCheck", {ssoToken: token}, '', 'auto')
                .then((rs) => {
                    if (rs.result) {
                        const userInfo = JSON.parse(rs.userInfo);
                        localStorage.setItem("loginId", userInfo.ID);
                        localStorage.setItem("loginName", userInfo.NAME);
                        localStorage.setItem("loginOrg", userInfo.ORG_NAME);
                        localStorage.setItem("requestIp", rs.requestIp);
                        localStorage.setItem("userAuth", rs.userAuth);
                        localStorage.setItem("ssoToken", token);
                        window.location.replace("/WAM");
                        setSsoCheck(true);
                    } else {
                        setTokenFalseMessage(`토큰검증 실패: ${rs.nResult}`);
                        setTokenNull(true);
                    }

                    setFirstAccess(true);
                });
        }
    }, []);

    return (
        <div className="c-app c-default-layout">
                {ssoCheck ? (
                    <>
                        <AppSidebar type={userAuth}/>
                        <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                            <AppHeader type={userAuth}/>
                            <div className="c-body">
                                <AppContent type={userAuth}/>
                            </div>
                            <AppFooter/>
                        </div>
                    </>
                ) : (
                    <SSOCheck/>
                )}
                {tokenNull && <div style={{textAlign: 'center'}}>{tokenFalseMessage}</div>}
        </div>
    )
}

export default DefaultLayout
