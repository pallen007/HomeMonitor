import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { lightTheme } from '../theme/theme';
import { Form, Navbar } from 'react-bootstrap';

interface NavigationBarProps {
    changeTheme: () => void; // Function to toggle the theme
}

const NavigationBar: React.FC<NavigationBarProps> = ({ changeTheme }) => {
    const themeContext = useContext(ThemeContext);
    const themeSwitch = themeContext === lightTheme ? 'light' : 'dark';

    const showHideSideNav = (): void => {
        const sideBar = document.querySelector('#sidebar');
        if (sideBar) {
            if (sideBar.classList.contains('active')) {
                sideBar.classList.remove('active');
            } else {
                sideBar.classList.add('active');
            }
        }
    }

    return (
        <div>
            <Navbar bg={themeSwitch} variant={themeSwitch} expand="lg" fixed="top">
                <button type="button" onClick={showHideSideNav}>
                    <span className="navbar-toggler-icon" />
                </button>
                <Form inline>
                    <Form.Check
                        checked={themeSwitch === 'dark'}
                        type="switch"
                        id="darkmode-switch"
                        label="Dark Mode"
                        onChange={changeTheme}
                        readOnly
                    />
                </Form>
            </Navbar>
            <nav id="sidebar">
                <div>
                    Links and stuff will go in here
                </div>
            </nav>
        </div>
    )
}

export default NavigationBar
