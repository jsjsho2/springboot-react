import React from 'react';

// authority
const AuthorityStatus = React.lazy(() => import('../views/authority/Status'));
const AuthorityRequest = React.lazy(() => import('../views/authority/Request'));
const AuthorityHist = React.lazy(() => import('../views/authority/Hist'));
const AuthorityManage = React.lazy(() => import('../views/authority/Manage'));

// approval
const ApprovalList = React.lazy(() => import('../views/approval/List'));

// mapping
const MappingOrgRolesApproval = React.lazy(() => import('../views/mapping/OrgRolesApproval'));
const MappingOrgRolesDefault = React.lazy(() => import('../views/mapping/OrgRolesDefault'));
const MappingRoleServices = React.lazy(() => import('../views/mapping/RoleServices'));

// batch
const BatchList = React.lazy(() => import('../views/batch/List'));
const BatchLog = React.lazy(() => import('../views/batch/Log'));

// evidence
const EvidenceSearch = React.lazy(() => import('../views/evidence/Search'));

// setting
const SettingConsole = React.lazy(() => import('../views/setting/Console'));

const contextPath = '/WAM';

const routes = [
  {path: `${contextPath}/`, exact: true, name: 'Home'},
  {path: `${contextPath}/authority`, name: '권한', component: AuthorityStatus, exact: true},
  {path: `${contextPath}/authority/status`, name: '상태', component: AuthorityStatus},
  {path: `${contextPath}/authority/request`, name: '신청', component: AuthorityRequest},
  {path: `${contextPath}/authority/hist`, name: '이력', component: AuthorityHist},
  {path: `${contextPath}/authority/manage`, name: '관리', component: AuthorityManage},
  {path: `${contextPath}/approval`, name: '결재', component: ApprovalList, exact: true},
  {path: `${contextPath}/approval/list`, name: '목록', component: ApprovalList},
  {path: `${contextPath}/mapping`, name: '매핑', component: MappingOrgRolesApproval, exact: true},
  {path: `${contextPath}/mapping/org-roles-approval`, name: '조직&역할 (결재)', component: MappingOrgRolesApproval},
  {path: `${contextPath}/mapping/org-roles-default`, name: '조직&역할 (기본)', component: MappingOrgRolesDefault},
  {path: `${contextPath}/mapping/role-services`, name: '역할&서비스', component: MappingRoleServices},
  {path: `${contextPath}/batch`, name: '배치', component: BatchList, exact: true},
  {path: `${contextPath}/batch/list`, name: '목록', component: BatchList},
  {path: `${contextPath}/batch/log`, name: '로그', component: BatchLog},
  {path: `${contextPath}/evidence`, name: '증적', component: EvidenceSearch, exact: true},
  {path: `${contextPath}/evidence/search`, name: '조회', component: EvidenceSearch},
  {path: `${contextPath}/setting`, name: '설정', component: SettingConsole, exact: true},
  {path: `${contextPath}/setting/console`, name: '콘솔', component: SettingConsole},
];

export default routes
