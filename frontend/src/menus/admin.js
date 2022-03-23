const _nav = [
    {
        _tag: 'CSidebarNavTitle',
        _children: ['authority']
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
            {
                _tag: 'CSidebarNavItem',
                name: '회수',
                to: `/authority/manage`,
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
                name: '조직&역할 (결재)',
                to: `/mapping/org-roles-approval`,
            },
            {
                _tag: 'CSidebarNavItem',
                name: '조직&역할 (기본)',
                to: `/mapping/org-roles-default`,
            },
            {
                _tag: 'CSidebarNavItem',
                name: '역할&서비스',
                to: `/mapping/role-services`,
            },
        ],
    },
    {
        _tag: 'CSidebarNavTitle',
        _children: ['batch'],
    },
    {
        _tag: 'CSidebarNavDropdown',
        name: '배치',
        route: `/batch`,
        icon: 'cil-code',
        _children: [
            {
                _tag: 'CSidebarNavItem',
                name: '목록',
                to: `/batch/list`,
            },
            {
                _tag: 'CSidebarNavItem',
                name: '로그',
                to: `/batch/log`,
            },
        ],
    },
    {
        _tag: 'CSidebarNavTitle',
        _children: ['evidence'],
    },
    {
        _tag: 'CSidebarNavDropdown',
        name: '증적',
        route: `/evidence`,
        icon: 'cil-av-timer',
        _children: [
            {
                _tag: 'CSidebarNavItem',
                name: '조회',
                to: `/evidence/search`,
            },
        ],
    },
    {
        _tag: 'CSidebarNavTitle',
        _children: ['setting'],
    },
    {
        _tag: 'CSidebarNavDropdown',
        name: '설정',
        route: `/setting`,
        icon: 'cil-cog',
        _children: [
            {
                _tag: 'CSidebarNavItem',
                name: '콘솔',
                to: `/setting/console`,
            },
        ],
    },
];

export default _nav;
