export default ({ close }) => {
    
    function completion (amount) {
        return (
            <div className="completionOuter">
                <p>Completion: </p> {amount != 0 ? <div className="completionBar"><div className="completion" style={{ width: completion }}><div className="slide"></div></div></div> : <b>Not started</b> }
            </div>
        )
    }

    return (
        <div className="inner" style={{ width: "600px" }}>
          <h1>Servers</h1>
          <p>A list of open servers on the network</p>
          <div id="checklist">
            <div className="check">
              <h1>Testing</h1>
              <p>Thing</p>
            </div>
          </div>
          <span id="close" onClick={close}>X</span>
        </div>
    )
}