import React, { createContext, useContext, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { FaHome, FaLeaf, FaSearch } from "react-icons/fa";
import "./App.css";
import { ThemeContext, ThemeProvider } from "styled-components";
import { GlobalStyles } from "./Components/theme/global";
import { useDarkMode } from "./Components/theme/useDarkMode";
import PlantContainer from "./components/plants/PlantContainer/PlantContainer";
import { darkTheme, lightTheme } from "./components/theme/theme";
import { Form } from "react-bootstrap";
import PlantLookup from "./components/plants/PlantLookup/PlantLookup";
import Summary from "./Components/Summary/Summary";

export const PlantContext = createContext({});

const App: React.FC = () => {
	const [theme, toggleTheme, componentMounted] = useDarkMode();
	const themeContext = useContext(ThemeContext);
	const themeMode = theme === "light" ? lightTheme : darkTheme;
	const [plantContext, setPlantContext] = useState({
		plantCollection: [],
	});

	if (!componentMounted) {
		return <div>Something went wrong...</div>;
	}
	const themeSwitch = themeContext === lightTheme ? "light" : "dark";

	return (
		<ThemeProvider theme={themeMode}>
			<PlantContext.Provider value={{ plantContext, setPlantContext }}>
				<GlobalStyles />
				<Router>
					<Routes>
						<Route path="/" element={<Summary />} />
						<Route path="/plants" element={<PlantContainer />} />
						<Route path="/lookup" element={<PlantLookup />} />
						{/* <Route path="/guides" element={<Guides />} /> */}
					</Routes>
				</Router>
				<footer>
					<div>
						<Link to="/">
							<FaHome size={24} />
							<p>Home</p>
						</Link>
					</div>
					<div>
						<Link to="/plants">
							<FaLeaf size={24} />
							<p>My Plants</p>
						</Link>
					</div>
					<div>
						<Link to="/lookup">
							<FaSearch size={24} />
							<p>Lookup</p>
						</Link>
					</div>
					{/* <div>
                    <Link to="/guides">
                    <FaBook size={24} />
                        <p>Guides</p>
                    </Link>
                </div> */}
					<Form>
						<Form.Check
							checked={themeSwitch === "dark"}
							type="switch"
							id="darkmode-switch"
							label="Dark Mode"
							onChange={toggleTheme}
							readOnly
						/>
					</Form>
				</footer>
			</PlantContext.Provider>
		</ThemeProvider>
	);
};

export default App;
