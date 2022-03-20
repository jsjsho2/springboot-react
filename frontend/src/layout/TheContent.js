import React, {Suspense, useEffect, useState} from 'react'
import {
    Redirect,
    Route,
    Switch
} from 'react-router-dom'
import {CContainer, CFade} from '@coreui/react'
import userRoute from '../routes/user'
import devRoute from '../routes/developer'
import adminRoute from '../routes/admin'
import useStore from "../store/store";

const loading = (
    <div className="pt-3 text-center">
        <div className="sk-spinner sk-spinner-pulse"></div>
    </div>
);

const TheContent = (props) => {
    const [routes, setRoutes] = useState([]);

    const {contextPath} = useStore();

    useEffect(() => {
        let route = [];
        if (props.type === 'user') {
            route = userRoute;
        } else if (props.type === 'developer') {
            route = devRoute;
        } else if (props.type === 'admin') {
            route = adminRoute;
        }

        Object.entries(route).forEach(([key, value]) => {
            value.path = `${contextPath}${value.path}`;
        });

        setRoutes(route);
    }, []);

    return (
        <main className="c-main">
            <CContainer fluid>
                <Suspense fallback={loading}>
                    <Switch>
                        {routes.map((route, idx) => {
                            return route.component && (
                                <Route
                                    key={idx}
                                    path={route.path}
                                    exact={route.exact}
                                    name={route.name}
                                    render={props => (
                                        <CFade>
                                            <route.component {...props} />
                                        </CFade>
                                    )}/>
                            )
                        })}
                        <Redirect from={`${contextPath}`} to={`${contextPath}/authority/status`}/>
                    </Switch>
                </Suspense>
            </CContainer>
        </main>
    )
}

export default React.memo(TheContent)
