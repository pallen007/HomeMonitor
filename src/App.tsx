import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/homepage/Homepage'
import PlantContainer from './containers/plant-container/plant-container'
import './App.css';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './components/theme/global'
import { lightTheme, darkTheme } from './components/theme/theme';
import { useDarkMode } from './components/theme/useDarkMode';
import NavigationBar from './components/navigation/navbar';

const App: React.FC = () => {
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
      <NavigationBar theme={theme} changeTheme={toggleTheme}/>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/plants" element={<PlantContainer />} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/guides" element={<Guides />} />
        </Routes>
      </Router>
      <PlantContainer />
    </ThemeProvider>
	);
}

export default App;
