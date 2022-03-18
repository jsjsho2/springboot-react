import React from 'react'

const contextPath = '/WAM';

const _nav = [
    {
        _tag: 'CSidebarNavTitle',
        _children: ['authority'],
    },
    {
        _tag: 'CSidebarNavDropdown',
        name: '권한',
        route: `${contextPath}/authority`,
        icon: 'cil-lock-locked',
        _children: [
            {
                _tag: 'CSidebarNavItem',
                name: '상태',
                to: `${contextPath}/authority/status`,
            },
            {
                _tag: 'CSidebarNavItem',
                name: '신청',
                to: `${contextPath}/authority/request`,
            },
            {
                _tag: 'CSidebarNavItem',
                name: '이력',
                to: `${contextPath}/authority/hist`,
            },
        ],
    },
    {
        _tag: 'CSidebarNavTitle',
        _children: ['approval'],
    },
    {
        _tag: 'CSidebarNavDropdown',
        name: '결재',
        route: `${contextPath}/approval`,
        icon: 'cil-notes',
        _children: [
            {
                _tag: 'CSidebarNavItem',
                name: '목록',
                to: `${contextPath}/approval/list`,
            },
        ],
    },
];

export default _nav
