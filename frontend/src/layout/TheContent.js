import React, {Suspense} from 'react'
import {
    Redirect,
    Route,
    Switch
} from 'react-router-dom'
import {CContainer, CFade} from '@coreui/react'
import userRoute from '../routes/user'
import devRoute from '../routes/developer'
import adminRoute from '../routes/admin'

const loading = (
    <div className="pt-3 text-center">
        <div className="sk-spinner sk-spinner-pulse"></div>
    </div>
)

const TheContent = (props) => {

    let routes;
    if (props.type === 'user') {
        routes = userRoute;
    } else if (props.type === 'developer') {
        routes = devRoute;
    } else if (props.type === 'admin') {
        routes = adminRoute;
    }

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
                        <Redirect from="/WAM" to="/WAM/authority/status"/>
                    </Switch>
                </Suspense>
            </CContainer>
        </main>
    )
}

export default React.memo(TheContent)
