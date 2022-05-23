import React from 'react';

// authority
const AuthorityList = React.lazy(() => import('../views/authority/List'));
const AuthorityRequest = React.lazy(() => import('../views/authority/Request'));
const AuthorityHist = React.lazy(() => import('../views/authority/Hist'));
const AuthorityManage = React.lazy(() => import('../views/authority/Manage'));

// approval
const DraftList = React.lazy(() => import('../views/approval/Draft'));
const ApprovalList = React.lazy(() => import('../views/approval/Approval'));

// mapping
const MappingOrgRolesApproval = React.lazy(() => import('../views/mapping/OrgRolesApproval'));
const MappingOrgRolesDefault = React.lazy(() => import('../views/mapping/OrgRolesDefault'));
const MappingRoleServices = React.lazy(() => import('../views/mapping/RoleServices'));
const MappingApprovalLine = React.lazy(() => import('../views/mapping/ApprovalLine'));

// batch
const BatchList = React.lazy(() => import('../views/batch/List'));
const BatchLog = React.lazy(() => import('../views/batch/Log'));

// evidence
const EvidenceSearch = React.lazy(() => import('../views/evidence/Search'));

// setting
const SettingConsole = React.lazy(() => import('../views/setting/Console'));

const routes = [
  {path: `/`, exact: true, name: 'Home'},
  {path: `/authority`, name: '권한', component: AuthorityList, exact: true},
  {path: `/authority/list`, name: '목록', component: AuthorityList},
  {path: `/authority/request`, name: '신청', component: AuthorityRequest},
  {path: `/authority/hist`, name: '이력', component: AuthorityHist},
  {path: `/authority/manage`, name: '관리', component: AuthorityManage},

  {path: `/approval`, name: '결재', component: DraftList, exact: true},
  {path: `/approval/draft-list`, name: '기안 목록', component: DraftList},
  {path: `/approval/approval-list`, name: '결재 목록', component: ApprovalList},

  {path: `/mapping`, name: '매핑', component: MappingOrgRolesApproval, exact: true},
  {path: `/mapping/org-roles-approval`, name: '조직&역할 (결재)', component: MappingOrgRolesApproval},
  {path: `/mapping/org-roles-default`, name: '조직&역할 (기본)', component: MappingOrgRolesDefault},
  {path: `/mapping/role-services`, name: '역할&서비스', component: MappingRoleServices},
  {path: `/mapping/approval-line`, name: '직위&결재선', component: MappingApprovalLine},

  {path: `/batch`, name: '배치', component: BatchList, exact: true},
  {path: `/batch/list`, name: '목록', component: BatchList},
  {path: `/batch/log`, name: '로그', component: BatchLog},

  {path: `/evidence`, name: '증적', component: EvidenceSearch, exact: true},
  {path: `/evidence/search`, name: '조회', component: EvidenceSearch},

  {path: `/setting`, name: '설정', component: SettingConsole, exact: true},
  {path: `/setting/console`, name: '콘솔', component: SettingConsole},
];

export default routes
