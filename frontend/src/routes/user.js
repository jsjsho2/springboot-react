import React from 'react';

// authority
const AuthorityStatus = React.lazy(() => import('../views/authority/Status'));
const AuthorityRequest = React.lazy(() => import('../views/authority/Request'));
const AuthorityHist = React.lazy(() => import('../views/authority/Hist'));

// approval
const ApprovalList = React.lazy(() => import('../views/approval/List'));

const contextPath = '/WAM';

const routes = [
  {path: `${contextPath}/`, exact: true, name: 'Home'},
  {path: `${contextPath}/authority`, name: '권한', component: AuthorityStatus, exact: true},
  {path: `${contextPath}/authority/status`, name: '상태', component: AuthorityStatus},
  {path: `${contextPath}/authority/request`, name: '신청', component: AuthorityRequest},
  {path: `${contextPath}/authority/hist`, name: '이력', component: AuthorityHist},
  {path: `${contextPath}/approval`, name: '결재', component: ApprovalList, exact: true},
  {path: `${contextPath}/approval/list`, name: '목록', component: ApprovalList},
];

export default routes