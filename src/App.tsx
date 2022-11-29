import './App.css';
import React, {ComponentType} from "react";
import {QueryParamProvider} from 'use-query-params';
import {BrowserRouter, Redirect, Route, withRouter} from 'react-router-dom';
import {connect, Provider} from 'react-redux';
import {compose} from 'redux';
import store, {AppStateType} from './redux/redux-store'
import Preloader from "./components/common/Preloader/Preloader";
import {withSuspense} from "./hoc/withSuspense";
import {initializeApp} from "./redux/app_reducer";
import {Layout} from "antd";
import Terminals from './components/Terminals/Terminals';
import Tasks from './components/Tasks/Tasks';
import Login from "./components/Login/Login";
import RestrictedRoute from "./hoc/RestrictedRoute";
import Header from "./components/Header/Header";
import Settings from "./components/Settings/Settings";



type MapPropsType = ReturnType<typeof mapStateToProps>
type DispatchPropsType = {
    initializeApp: () => void
}
const ProfileContainer = React.lazy(() => import('./components/Profile/Profile'));
const CdrContainer = React.lazy(() => import('./components/CDR/cdr'));
const SuspendedProfile = withSuspense(ProfileContainer);
const SuspendedCdr = withSuspense(CdrContainer);
const SuspendedTasks = withSuspense(Tasks);
const SuspendedSettings = withSuspense(Settings);
const SuspendedTerminals = withSuspense(Terminals);

const {Content} = Layout;

class MyApp extends React.Component<MapPropsType & DispatchPropsType> {
    catchAllUnhandledErrors = (e: PromiseRejectionEvent) => {

    }

    componentDidMount() {
        this.props.initializeApp();
        window.addEventListener("unhandledrejection", this.catchAllUnhandledErrors)
    };

    state = {
        current: 'mail',
    };

    render() {
        if (!this.props.initialized) {
            return <Preloader/>
        }
        return (
            <Layout>
                <Header/>
                <Content>
                    <div className="app-wrapper-content">
                        <Route exact path='/' render={() => <Redirect to={"/terminals"}/>}/>
                        <Route path='/login' render={() => <Login/>}/>
                        <RestrictedRoute isAuth={this.props.isAuth} path='/profile/:userId?'
                                         component={() => <SuspendedProfile/>}/>
                        <RestrictedRoute isAuth={this.props.isAuth} path='/terminals'
                                         component={() => <SuspendedTerminals/>}/>
                        <RestrictedRoute isAuth={this.props.isAuth} path='/tasks' component={() => <SuspendedTasks/>}/>
                        <RestrictedRoute isAuth={this.props.isAuth} path='/settings' component={() => <SuspendedSettings/>}/>
                        <RestrictedRoute isAuth={this.props.isAuth} path='/cdr/:terminal?'
                                         component={() => <SuspendedCdr/>}/>
                        {/* <Route path='*' render={()=><div>404 NOT FOUND</div>}/>*/}
                    </div>
                </Content>
            </Layout>
        );
    };
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <QueryParamProvider ReactRouterRoute={Route}>
                <Provider store={store}>
                    <ContainerApp/>
                </Provider>
            </QueryParamProvider>
        </BrowserRouter>
    );
}
const mapStateToProps = (state: AppStateType) => ({
    initialized: state.app.initialized,
    isAuth: state.auth.isAuth
});
const ContainerApp = compose<ComponentType>(
    withRouter,
    connect(mapStateToProps, {initializeApp})
)(MyApp);
export default App;