import React from 'react';
import classes from './Navbar.module.css';
import {NavLink} from "react-router-dom";

const Navbar: React.FC = () => {
    return (
        <nav className={classes.nav}>
            <div className={`${classes.item}`}>
                <NavLink to="/profile" activeClassName={classes.active}>Profile</NavLink>
            </div>
            <div className={`${classes.item}`}>
                <NavLink to="/terminals" activeClassName={classes.active}>Terminals</NavLink>
            </div>
        </nav>
    );
};
export default Navbar;