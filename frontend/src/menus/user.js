import React from 'react'

const _nav = [
    {
        _tag: 'CSidebarNavTitle',
        _children: ['authority'],
    },
    {
        _tag: 'CSidebarNavDropdown',
        name: '권한',
        route: `/authority`,
        icon: 'cil-lock-locked',
        _children: [
            {
                _tag: 'CSidebarNavItem',
                name: '상태',
                to: `/authority/status`,
            },
            {
                _tag: 'CSidebarNavItem',
                name: '신청',
                to: `/authority/request`,
            },
            {
                _tag: 'CSidebarNavItem',
                name: '이력',
                to: `/authority/hist`,
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
        route: `/approval`,
        icon: 'cil-notes',
        _children: [
            {
                _tag: 'CSidebarNavItem',
                name: '목록',
                to: `/approval/list`,
            },
        ],
    },
];

export default _nav
