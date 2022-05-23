import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
    CCreateElement,
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CSidebarNavDivider,
    CSidebarNavDropdown,
    CSidebarNavItem,
    CSidebarNavTitle,
} from '@coreui/react'

import userNavigation from '../menus/user'
import devNavigation from '../menus/developer'
import adminNavigation from '../menus/admin'

import useStore from '../store/store'

const TheSidebar = (props) => {
    const [menu, setMenu] = useState([]);
    const dispatch = useDispatch()
    const show = useSelector(state => state.sidebarShow);

    const {contextPath, headerNameAndTitle} = useStore();

    useEffect(() => {
        let nav = [];
        if (props.type === 'user') {
            nav = userNavigation;
        } else if (props.type === 'developer') {
            nav = devNavigation;
        } else if (props.type === 'admin') {
            nav = adminNavigation;
        }

        Object.entries(nav).forEach(([key, value]) => {
            if (value.hasOwnProperty('route')) {
                value.route = `${contextPath}${value.route}`;
                Object.entries(value._children).forEach(([key, value]) => {
                    value.to = `${contextPath}${value.to}`;
                });
            }
        });

        setMenu(nav);
    }, []);

    return (
        <CSidebar
            show={show}
            onShowChange={(val) => dispatch({type: 'set', sidebarShow: val})}
        >
            <CSidebarBrand className='d-md-down-none' to={`${contextPath}/authority/list`}>
                {headerNameAndTitle}
            </CSidebarBrand>
            <CSidebarNav>
                <CCreateElement
                    items={menu}
                    components={{
                        CSidebarNavDivider,
                        CSidebarNavDropdown,
                        CSidebarNavItem,
                        CSidebarNavTitle
                    }}
                />
            </CSidebarNav>
        </CSidebar>
    )
}

export default React.memo(TheSidebar)
