import React, {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CSidebarMinimizer,
  CSidebarNavDropdown,
  CSidebarNavItem,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'

// import navigation from './_nav'
import userNavigation from '../menus/user'
import devNavigation from '../menus/developer'
import adminNavigation from '../menus/admin'

const TheSidebar = (props) => {
  const [menu, setMenu] = useState([]);
  const dispatch = useDispatch()
  const show = useSelector(state => state.sidebarShow)

  useEffect(() => {
    if (props.type === 'user') {
      setMenu(userNavigation)
    } else if (props.type === 'developer') {
      setMenu(devNavigation)
    } else if (props.type === 'admin') {
      setMenu(adminNavigation)
    }
  }, []);

  return (
    <CSidebar
      show={show}
      onShowChange={(val) => dispatch({type: 'set', sidebarShow: val })}
    >
      <CSidebarBrand className="d-md-down-none" to="/WAM/authority/status">
        APPROVAL MANAGER
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
