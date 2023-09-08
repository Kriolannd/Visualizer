import logo from './logo.svg';
import './App.css';

import { useEffect, useState } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import Switch from "react-switch";

import { properties } from './properties.js';

import 'chartjs-adapter-date-fns';

function Temperature({ value }) {
    const color = "hsl(" + 60 * (1 - (value - 300) / (1000 - 300)) + " 100% 50%)"
//    console.log(color)

    return (
        <div className="temp-field" style={{background: color}}>
            {value}
        </div>
    )
}

function Controls({text, switchOn, temperature}) {
    return (
        <div className="controls">
            <div>{text}</div>
            <Switch
                checked={switchOn}
                onChange={() => fetch(properties.baseUrl + properties.switchPath, {method: 'POST'})}
                handleDiameter={28}
                height={40}
                width={100}
                uncheckedIcon={false}
                checkedIcon={false}
                className="react-switch"
            />
            <Temperature value={temperature}/>
        </div>
    )
}

function App() {
    let [points, setPoints] = useState([]);

    const data = {
        datasets: [
            {
                label: 'True temperature',
                data: points.map(row => ({x: row.time, y: row.temp})),
                showLine: true,
            },
            {
                label: 'Apparent temperature',
                data: points.map(row => ({x: row.time, y: row.temp_apparent})),
                showLine: true,
            }
        ]
    }

    function lastOrdefault(objArr, param, defaultVal) {
        return objArr.length === 0 ? defaultVal : objArr[objArr.length - 1][param];
    }

    const switchOn = !!lastOrdefault(points, "state", false);
    const apparentSwitchOn = !!lastOrdefault(points, "state_apparent", false);

    const temperature = lastOrdefault(points, "temp", 300);
    const apparentTemperature = lastOrdefault(points, "temp_apparent", 300);

    const minX = lastOrdefault(points, "time", 0) - 30e3;

//     const switchOn = points.length === 0 ? false : !!points[points.length - 1].state;
//     const temperature = points.length === 0 ? 300 : points[points.length - 1].temp;
// //    const minX = points.length === 0 ? Date.now() : points[points.length - 1].time - 60e3;
//     const minX = points.length === 0 ? 0 : points[points.length - 1].time - 60;

    useEffect(() => {
        const source = new EventSource(properties.baseUrl + properties.eventsPath);

        let startTime;
        source.onmessage = (e) => {
            startTime = startTime || Date.now();

            let newPoint = JSON.parse(e.data);
            newPoint.time = startTime + newPoint.time * 1e3;

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
                <Scatter data={data} options={{
                                            animation: {
                                                    duration: 0
                                                },
                                            scales: {
                                              x: {
                                                // ticks: {
                                                //     format: { maximumFractionDigits: 1, minimumFractionDigits: 1 },
                                                    // callback: (x, i, t) => {
                                                    //     console.log(x, i, t);
                                                    //     return x//Math.floor(x); // format to your liking
                                                    //   },
                                                //   },
                                                  type: 'time',
                                                  time: {
                                                      unit: 'second'
                                                  },
                                                  min: minX,
                                              }
                                            }
                                            }}/>
            </div>
            <div>
                <Controls text="True parameters" switchOn={switchOn} temperature={temperature}/>
                <Controls text="Apparent parameters" switchOn={apparentSwitchOn} temperature={apparentTemperature}/>
            </div>
        </div>
    );
}

export default App;
