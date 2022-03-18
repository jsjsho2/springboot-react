import React from 'react'
import {useLocation} from 'react-router-dom'

import userRoute from '../routes/user'
import devRoute from '../routes/developer'
import adminRoute from '../routes/admin'
import 'antd/dist/antd.css';
import {Breadcrumb} from 'antd';

const AppBreadcrumb = (props) => {
  const currentLocation = useLocation().pathname;

  const getRouteName = (pathname, routes) => {
    try {
      const currentRoute = routes.find((route) => route.path === pathname);
      return currentRoute.name;
    } catch {

    }
  };

  const getBreadcrumbs = (location) => {
    let routes;
    if (props.type === 'user') {
      routes = userRoute;
    } else if (props.type === 'developer') {
      routes = devRoute;
    } else if (props.type === 'admin') {
      routes = adminRoute;
    }

    const breadcrumbs = [];
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`;
      breadcrumbs.push({
        pathname: currentPathname,
        name: getRouteName(currentPathname, routes),
        active: index + 1 === array.length ? true : false,
      });
      return currentPathname;
    });
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(currentLocation);

  return (
    <Breadcrumb separator=">">
      {breadcrumbs.map((breadcrumb, index) => {
        return (
          <Breadcrumb.Item key={index}>{breadcrumb.name}</Breadcrumb.Item>
        )
      })}
    </Breadcrumb>
  )
};

export default React.memo(AppBreadcrumb);