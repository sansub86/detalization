import React from "react";
import { Redirect, Route } from "react-router-dom";

const RestrictedRoute = ({component:Component, isAuth, ...rest}:any) => (
    <Route
        {...rest}
        render={() => isAuth ? <Component/>: <Redirect to={{
            pathname: '/login',
        }}/>}
    />
);
export default RestrictedRoute;