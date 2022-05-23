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
                name: '목록',
                to: `/authority/list `,
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
                name: '기안 목록',
                to: `/approval/draft-list`,
            },
            {
                _tag: 'CSidebarNavItem',
                name: '결재 목록',
                to: `/approval/approval-list`,
            },
        ],
    },
    {
        _tag: 'CSidebarNavTitle',
        _children: ['mapping'],
    },
    {
        _tag: 'CSidebarNavDropdown',
        name: '매핑',
        route: `/mapping`,
        icon: 'cil-pencil',
        _children: [
            {
                _tag: 'CSidebarNavItem',
                name: '역할&서비스',
                to: `/mapping/role-services`,
            },
        ],
    },
];

export default _nav
