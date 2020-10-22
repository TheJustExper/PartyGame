import React from "react";

export default ({ close }) => {
    return (
        <div class="inner">
            <h1>Account</h1>
            <p>This menu tells you everything that you need to know about the game</p>
            <span id="close" onClick={close}>X</span>
        </div> 
    )
}