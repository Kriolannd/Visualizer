import './App.css';

import { useEffect, useRef, useState } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import Switch from "react-switch";

import 'chartjs-adapter-date-fns';

import {ReactComponent as ColorTable} from './Incandescence_Color.svg';

const searchParams = new URLSearchParams(global.location.search);
const properties = JSON.parse(searchParams.get("props"));

function colorFromTemp(value) {
    switch (true) {
        case value <= 550:
            return "#630000"
        case value <= 630:
            return "#770000"
        case value <= 680:
            return "#960000"
        case value <= 740:
            return "#a90000"
        case value <= 770:
            return "#cc0000"
        case value <= 800:
            return "#dd0000"
        case value <= 850:
            return "#ee0000"
        case value <= 900:
            return "#fa0103"
        case value <= 950:
            return "#ff9933"
        case value <= 1000:
            return "#fdcc00"
        case value <= 1100:
            return "#fdfe33"
        case value <= 1200:
            return "#f2f88e"
        case value > 1200:
            return "#ffffff"
    }
};

function ColorScale({ temperature }) {
    const color = colorFromTemp(temperature);
//    console.log(color);

    return <div style={{background: color, width: "70px", height:"400px"}}/>;
}

function Temperature({ value }) {
//    const color = "hsl(" + 60 * (1 - (value - 300) / (1000 - 300)) + " 100% 50%)"
    const color = colorFromTemp(value);

    return (
        <div className="temp-field" style={{background: color}}>
            <font style={{color: "white", WebkitTextStroke: "1px black"}}>{value}</font>
        </div>
    )
}

function ControlParams({text, switchOn, temperature}) {
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

function ControlButton({isDead}) {
    const firstRender = useRef(true);

    let className = "controls btn ";
    if (firstRender.current) {
        className += "play-btn";
        firstRender.current = false;
    }
    else {
        className += (!isDead ? "pause-btn" : "retry-btn");
    };

    const handleClick = (e) => {
        e.target.classList.toggle("play-btn");
        e.target.classList.toggle("pause-btn");
        fetch(properties.baseUrl + properties.togglePath, {method: 'POST'});
    };

    return <button className={className} onClick={handleClick}></button>;
}

function App() {
    const [points, setPoints] = useState([]);
    const [isDead, setIsDead] = useState(false);
    const isDeadRef = useRef(isDead);
    
    useEffect(() => {
        isDeadRef.current = isDead;
    }, [isDead]);

    useEffect(() => {
        const source = new EventSource(properties.baseUrl + properties.eventsPath);

        let startTime;
        source.onmessage = (e) => {
            if (isDeadRef.current) {
                startTime = undefined;
                setPoints([]);
                setIsDead(false);
            }

            let newPoint = JSON.parse(e.data);
            console.log(newPoint);
            
            if (newPoint.dead) {
                setIsDead(true);
            }
            else {
                startTime = startTime || Date.now();
                newPoint.time = startTime + newPoint.time * 1e3;
                setPoints(points => [...points, newPoint]);
            }
        };

        return () => {
          source.close();
        };
    }, []);

    const data = {
        datasets: [
            {
                label: "True temperature",
                data: points.map(row => ({x: row.time, y: row.temp})),
                showLine: true,
            },
            {
                label: "Apparent temperature",
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
                                                    type: "time",
                                                    time: {
                                                        unit: "second"
                                                    },
                                                    min: minX,
                                              }
                                            }
                                            }}/>
            </div>
            <div>
                <ControlButton isDead={isDead}/>
                <ControlParams text="True parameters" switchOn={switchOn} temperature={temperature}/>
                <ControlParams text="Apparent parameters" switchOn={apparentSwitchOn} temperature={apparentTemperature}/>
            </div>
            <div style={{display: "flex"}}>
                <ColorTable className="color-table"/>
                <ColorScale temperature={temperature}/>
             </div>
        </div>
    );
}

export default App;
