import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CHeader, CHeaderNav, CToggler,} from '@coreui/react'
import {AppBreadcrumb} from './index'
import {UserOutlined} from "@ant-design/icons";
import Timer from "../components/Timer";

const TheHeader = (props) => {
    const dispatch = useDispatch();
    const sidebarShow = useSelector(state => state.sidebarShow);
    const [timeReset, setTimeReset] = useState(false);

    useEffect(() => {
        const root = document.querySelector('#root');

        root.addEventListener('click', () => {
            setTimeReset(true);
        })
    }, []);

    useEffect(() => {
        const root = document.querySelector('#root');

        root.addEventListener('click', () => {
            setTimeReset(true);
        })
    }, []);

    const toggleSidebar = () => {
        const val = [true, 'responsive'].includes(sidebarShow) ? false : 'responsive'
        dispatch({type: 'set', sidebarShow: val})
    }

    const toggleSidebarMobile = () => {
        const val = [false, 'responsive'].includes(sidebarShow) ? true : 'responsive'
        dispatch({type: 'set', sidebarShow: val})
    }

    return (
        <CHeader withSubheader>
            <CToggler
                inHeader
                className="ml-md-3 d-lg-none"
                onClick={toggleSidebarMobile}
            />
            <CToggler
                inHeader
                className="ml-3 d-md-down-none"
                onClick={toggleSidebar}
            />

            <CHeaderNav className="d-md-down-none mr-auto">
                <AppBreadcrumb type={props.type}/>
            </CHeaderNav>

            <CHeaderNav className="header-session-timer">
                <Timer signal={timeReset} setSignal={setTimeReset}/>
            </CHeaderNav>

            <CHeaderNav className="ms-3">
                <CDropdown
                    inNav
                    className="c-header-nav-items mx-2"
                    direction="down"
                >
                    <CDropdownToggle className="c-header-nav-link" caret={false}>
                        <div className="c-avatar">
                            <UserOutlined/>
                        </div>
                    </CDropdownToggle>

                    <CDropdownMenu className="pt-0" placement="bottom-end">
                        <CDropdownItem>
                            ID: {localStorage.getItem('loginId')}
                        </CDropdownItem>
                        <CDropdownItem href="#">
                            이름: {localStorage.getItem('loginName')}
                        </CDropdownItem>
                        <CDropdownItem href="#">
                            부서: {localStorage.getItem('loginOrg')}
                        </CDropdownItem>
                        <CDropdownItem href="#">
                            IP: {localStorage.getItem('requestIp')}
                        </CDropdownItem>
                    </CDropdownMenu>
                </CDropdown>
            </CHeaderNav>
        </CHeader>
    )
}

export default TheHeader
