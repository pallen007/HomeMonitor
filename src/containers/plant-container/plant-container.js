import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { lightTheme } from "../../components/theme/theme";
import Plant from "../../components/plant/plant";
import plantList from "../../testData/plantsList.json";
import CardGroup from 'react-bootstrap/CardGroup';

const PlantContainer = (props) => {
  const themeContext = useContext(ThemeContext);
  const themeSwitch = themeContext === lightTheme ? "light" : "dark";

  return (
    <div>
      <CardGroup>
        {plantList.Plants.map((plantItem, index) => {
          return <Plant theme={themeSwitch} details={plantItem} index={index} />
        })}
      </CardGroup>
    </div>
  );
};
export default PlantContainer;