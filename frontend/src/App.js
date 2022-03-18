import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './scss/style.scss';
import './css/style.css'

const loading = (
    <div className="pt-3 text-center">
        <div className="sk-spinner sk-spinner-pulse"></div>
    </div>
)

const TheLayout = React.lazy(() => import('./layout/TheLayout'));

class App extends Component {

    render() {
        return (
            <Router>
                <React.Suspense fallback={loading}>
                    <Switch>
                        <Route path="/" name="Home" render={props => <TheLayout {...props}/>}/>
                    </Switch>
                </React.Suspense>
            </Router>
        );
    }
}

export default App;

