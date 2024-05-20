import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Events() {

    const divStyle = {
        textAlign: 'center',
    };

    const flex1gap = {
        display: 'flex',
        gap: '1em',
        justifyContent: 'center',
    };

    return (
        <div>
            <h1 style={divStyle}>Selfie</h1>
            <div className="form-group" style={flex1gap}>
                <label style={divStyle}>Start:</label>
                <input type="date" id="start" name="dateStandard" />
                <input className="form-control" id="timeStandard" type="time" style={{ width: '20%' }} />
            </div>
            <div className="form-group" style={flex1gap}>
                <label style={divStyle}>End:</label>
                <input type="date" id="end" name="dateStandard" />
                <input className="form-control" id="timeStandard" type="time" style={{ width: '20%' }} />
            </div>
            <br />
            <div className="form-group" style={flex1gap}>
                <label style={divStyle}>Time zone:</label>
            </div>
            <div className="form-group" style={flex1gap}>
                <label style={divStyle}>Location:</label>
            </div>
            <br />
            <div className="form-group" style={flex1gap}>
                <label style={divStyle}>Repeat:</label>
                <label style={divStyle}>every</label>
                <select className="form-select" aria-label="" style={{ width: '10em' }}>
                    <option selected disabled>select</option>
                    <option value="1">day</option>
                    <option value="2">week</option>
                    <option value="3">month</option>
                </select>
                <label style={divStyle}>for</label>
                <input type="number" name="" style={{ width: '5em' }} />
                <label style={divStyle}>occurrences</label>
            </div>
            <div className="form-group" style={flex1gap}>
                <label style={divStyle}>Notify me:</label>
                <input type="number" name="" style={{ width: '5em' }} />
                <select className="form-select" aria-label="" style={{ width: '10em' }}>
                    <option selected disabled>min/hour/days</option>
                    <option value="1">minutes</option>
                    <option value="2">hours</option>
                    <option value="3">days</option>
                </select>
                <label style={divStyle}>before the event, on</label>
                <select className="form-select" aria-label="" style={{ width: '10em' }}>
                    <option selected disabled>platform</option>
                    <option value="1">my phone</option>
                    <option value="2">google</option>
                </select>
            </div>
        </div>
    );
};

export default Events;
