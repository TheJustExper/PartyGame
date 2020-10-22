import Core from "./game/core";
import "./index.css";

window.onload = () => {
  window.core = new Core();

  const play = document.getElementById("play");
  const username = document.getElementById("username");

  play.onclick = () => {
    window.core.playButtonClicked();
    window.core.socket.sendUsername(username.value);
  }
}