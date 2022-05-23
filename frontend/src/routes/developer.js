import React from 'react';

// authority
const AuthorityList = React.lazy(() => import('../views/authority/List'));
const AuthorityRequest = React.lazy(() => import('../views/authority/Request'));
const AuthorityHist = React.lazy(() => import('../views/authority/Hist'));

// approval
const DraftList = React.lazy(() => import('../views/approval/Draft'));
const ApprovalList = React.lazy(() => import('../views/approval/Approval'));

// mapping
const MappingRoleServices = React.lazy(() => import('../views/mapping/RoleServices'));

const routes = [
  {path: `/`, exact: true, name: 'Home'},
  {path: `/authority`, name: '권한', component: AuthorityList, exact: true},
  {path: `/authority/list`, name: '목록', component: AuthorityList},
  {path: `/authority/request`, name: '신청', component: AuthorityRequest},
  {path: `/authority/hist`, name: '이력', component: AuthorityHist},

  {path: `/approval`, name: '결재', component: DraftList, exact: true},
  {path: `/approval/draft-list`, name: '기안 목록', component: DraftList},
  {path: `/approval/approval-list`, name: '결재 목록', component: ApprovalList},

  {path: `/mapping`, name: '매핑', component: MappingRoleServices, exact: true},
  {path: `/mapping/role-services`, name: '역할&서비스', component: MappingRoleServices},
];

export default routes
