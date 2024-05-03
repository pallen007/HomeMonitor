import React from 'react';
import {BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import HomePage from './components/homepage/homepage';
import PlantContainer from './containers/plant-container/plant-container';
import './App.css';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './components/theme/global'
import { lightTheme, darkTheme } from './components/theme/theme';
import { useDarkMode } from './components/theme/useDarkMode';
import NavigationBar from './components/navigation/navbar';

function App() {
	const [theme, toggleTheme, componentMounted] = useDarkMode();
  const themeMode = theme === 'light' ? lightTheme : darkTheme;

  if (!componentMounted) {
    return(
      <div></div>
    )
  };

	return (
    <ThemeProvider theme = {themeMode}>
      <GlobalStyles />
      {/* <BrowserRouter> */}
        {/* <Loader /> */}
        <NavigationBar theme={theme} changeTheme={toggleTheme}/>
        {/* <Switch>
          <Redirect exact from='/' to='plants'/>
          <Route path="/plants" component={PlantsHome}/>
          <Route path="/home" component={HomePage}/>
        </Switch> */}
        <PlantContainer />
      {/* </BrowserRouter> */}
      
    </ThemeProvider>
	);
}

export default App;
