import logo from './logo.svg';
import './App.css';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import Switch from "react-switch";

import { properties } from './properties.js';

function Temperature({ value }) {
    const color = "hsl(" + 60 * (1 - (value - 300) / (1000 - 300)) + " 100% 50%)"
    console.log(color)

    return (
        <div className="temp-field" style={{background: color}}>
            {value}
        </div>
    )
}

function App() {
    let [points, setPoints] = useState([]);

    const data = {
        labels: points.map(row => row.time),
        datasets: [
            {
                label: 'True temperature',
                data: points.map(row => row.temp)
            },
            {
                label: 'Apparent temperature',
                data: points.map(row => row.temp_apparent)
            }
        ]
    }

    const switchOn = points.length === 0 ? false : !!points[points.length - 1].state;
    const temperature = points.length === 0 ? 300 : points[points.length - 1].temp;

    useEffect(() => {
        const source = new EventSource(properties.baseUrl + properties.eventsPath);

        source.onmessage = (e) => {
            const newPoint = JSON.parse(e.data);
            console.log(newPoint);
            setPoints(points => [...points, newPoint]);
        };

        return () => {
          source.close();
        };
    }, []);

    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <div style={{width: "800px"}}>
                <Line data={data}/>
            </div>
            <div>
                <Switch
                    checked={switchOn}
                    onChange={() => fetch(properties.baseUrl + properties.switchPath)}
                    handleDiameter={28}
                    height={40}
                    width={100}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    className="react-switch"
                  />
                <Temperature value={temperature}/>
            </div>
        </div>
    );
}

export default App;
