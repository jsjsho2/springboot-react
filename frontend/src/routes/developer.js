import React from 'react';

// authority
const AuthorityStatus = React.lazy(() => import('../views/authority/Status'));
const AuthorityRequest = React.lazy(() => import('../views/authority/Request'));
const AuthorityHist = React.lazy(() => import('../views/authority/Hist'));

// approval
const ApprovalList = React.lazy(() => import('../views/approval/List'));

// mapping
const MappingRoleServices = React.lazy(() => import('../views/mapping/RoleServices'));

const routes = [
  {path: `/`, exact: true, name: 'Home'},
  {path: `/authority`, name: '권한', component: AuthorityStatus, exact: true},
  {path: `/authority/status`, name: '상태', component: AuthorityStatus},
  {path: `/authority/request`, name: '신청', component: AuthorityRequest},
  {path: `/authority/hist`, name: '이력', component: AuthorityHist},
  {path: `/approval`, name: '결재', component: ApprovalList, exact: true},
  {path: `/approval/list`, name: '목록', component: ApprovalList},
  {path: `/mapping`, name: '매핑', component: MappingRoleServices, exact: true},
  {path: `/mapping/role-services`, name: '역할&서비스', component: MappingRoleServices},
];

export default routes
