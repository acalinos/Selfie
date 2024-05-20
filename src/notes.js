import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Notes() {

    const divStyle = {
        textAlign: 'center',
    };

    const flex1gap = {
        display: 'flex',
        gap: '1em',
        justifyContent: 'center',
    };

    const flexrow1gap = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
        justifyContent: 'center',
        alignItems: 'center',
    };

    return (
        <div>
            <h1 style={divStyle}>Selfie</h1>
            <br />
            <div style={flexrow1gap}>
                <input type="text" id="title" name="title" style={{ fontSize: '1.5em', width: '20em', border: 'none', textAlign: 'center' }} placeholder="Title" />
                <input type="textarea" id="description" name="description" style={{ width: '90%', height: '75vh', justifyContent: 'left'}} />
            </div>
            <input type="submit" value="Save" style={{position: 'relative', left: '92vw', top: '1em'}} />
        </div>
    );
};

export default Notes;
