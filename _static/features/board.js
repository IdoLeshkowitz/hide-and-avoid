function renderHiderBoardPage() {
    const jsxCode = `
        function Stam(){
            return <div></div>
        }
        function reducer(state, action){
            if (action.type === "setDistribution"){
                const distribution = action.distribution
                return {...state, distribution}
            }
            if (action.type === "setModal"){
                return {...state, modal: action.modal}
            }
            if (action.type === "closeModal"){
                return {...state, modal: null}
            }
            if (action.type === "finishRounds"){
                return {...state, currentStep: "feedback"}
            }
            return state
        }
        const initialState = {
            multipliers: js_vars.multipliers,
            totalNumberOfObjects: js_vars.totalNumberOfObjects,
            distribution : [0,0,0,0],
            modal : null,
        }
        const DispatchContext = React.createContext(null)
        const StateContext = React.createContext(null)
        const JsVarsContext = React.createContext(null)
        function HiderBoardPage(props){
            const [state, dispatch] = React.useReducer(reducer, initialState)
            return (
                    <DispatchContext.Provider value={dispatch}>
                        <StateContext.Provider value={state}>
                            <section>
                                <Rounds {...props}/>
                            </section>
                        </StateContext.Provider>
                    </DispatchContext.Provider>
            )
        }
        function Rounds(props){
            const [progress, setProgress] = React.useState("distribution")// distribution, results
            const [selectedBoxIndex, setSelectedBoxIndex] = React.useState(null)
            const [temporaryNumber, setTemporaryNumber] = React.useState(null)
            const state = React.useContext(StateContext)
            const dispatch = React.useContext(DispatchContext)
            const currentDistribution = React.useMemo(()=>state.distribution, [state.distribution])
            const numberOfObjectsInStorage = React.useMemo(()=> {
                const totalNumberOfObjects = state.totalNumberOfObjects
                const numberOfHiddenObjects = currentDistribution.reduce((a,b)=>a+b,0)
                return totalNumberOfObjects - numberOfHiddenObjects
            }, [state.numberOfObjectsByRound, currentDistribution])
            function onDistributionChange(numberOfObjects, boxIndex){
                const newDistribution = [...currentDistribution]
                newDistribution[boxIndex] = numberOfObjects
                const numberOfHiddenObjects = newDistribution.reduce((a,b)=>a+b,0)
                if (numberOfHiddenObjects > state.totalNumberOfObjects){
                    return
                }
                dispatch({type:"setDistribution", distribution: newDistribution})
                for (let i=0; i<newDistribution.length; i++){
                    liveSend({
                        action: "set_number_of_objects",
                        box_index : i,
                        number_of_objects : newDistribution[i],
                    })
                }
            }
            function onBoxBlur(boxIndex){
                if (isNaN(parseInt(temporaryNumber)) || parseInt(temporaryNumber) < 0){
                    setTemporaryNumber(null)
                }
                else {
                    onDistributionChange(parseInt(temporaryNumber), boxIndex)
                }
                setSelectedBoxIndex(null)   
                setTemporaryNumber(null)
            }
            function onBoxChange(newValue){
                setTemporaryNumber(newValue)
            }
            function onReset(){
                dispatch({type:"setDistribution", distribution: [0,0,0,0]})
                setProgress("distribution")
            }
            function onDone(){
                liveSend({
                    'action': 'finish_round',
                })
            }
            const storageClassName = () =>{
                let className = "storage"
                if (numberOfObjectsInStorage === 0){
                    className += " green"
                }
                return className
            }
            return (
                <section>
                    <h4>Round {props.roundNumber}</h4>
                    <div className="hider-board">
                        <div className="board-row background-yellow">
                            <div className="info">
                                <p>
                                    <u>Your Task:</u><br/>
                                    You need to hide {numberOfObjectsInStorage} objects in some or all the boxes.
                                </p>
                            </div>
                            <div className={storageClassName()}>
                                <h4>
                                    {numberOfObjectsInStorage}
                                </h4>
                                <span style={{alignSelf:"center"}}>
                                    Objects left to hide
                                </span>
                            </div>
                            {/* boxes */}
                            <div className="boxes-area">
                                { progress === "distribution" &&
                                    <>
                                        <div className="boxes">
                                            {
                                                currentDistribution.map((numberOfObjects, boxIndex)=>{
                                                    return (
                                                        <div className="box-container">
                                                            <div className="box box-open hider">
                                                                <input 
                                                                    type="number"  
                                                                    value={selectedBoxIndex === boxIndex ? temporaryNumber : numberOfObjects.toString()}
                                                                    onFocus={()=>{
                                                                        if (progress !== "distribution") return
                                                                        setSelectedBoxIndex(boxIndex)
                                                                    }}
                                                                    onBlur={()=>onBoxBlur(boxIndex)} 
                                                                    onChange={(e)=>onBoxChange(e.target.value)}
                                                                    onKeyDown={(e)=>{
                                                                        if (e.key === "Enter"){
                                                                            onBoxBlur(boxIndex)
                                                                            e.target.blur()
                                                                        }
                                                                    }}
                                                                    />
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                        <div className="board-row background-dark-grey">
                            <div className="info background-light-grey">
                                The objects will multiply in the boxes
                            </div>
                            <div className="boxes">
                                { 
                                    currentDistribution.map((_,boxIndex)=>{
                                        return (
                                            <div className="box-container">
                                                <h6 className="arrow-down">
                                                    ×{state.multipliers[boxIndex]}
                                                </h6>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className="board-row background-dark-grey">
                            <div className="info background-light-grey">
                                Another player will choose 2 boxes to “steal”. They will only know the boxes’ multiplier rates.
                            </div>
                            <div className="boxes">
                                {
                                    currentDistribution.map((numberOfObjects, boxIndex)=>{
                                        const value = numberOfObjects * state.multipliers[boxIndex]
                                        return (
                                            <div className="box-container">
                                                <div className="box-closed box" style={{userSelect:'none'}}><span>{value}</span></div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                            <div className="footer">
                                {
                                    progress === "results" &&
                                        <p>
                                            Above you can see the value of each box. The value is calculated by multiplying the number of objects in the box by the box’s multiplication rate.<br/>
                                            You can now proceed to the next round, or click back and hide again.
                                        </p>
                                }
                                {
                                    numberOfObjectsInStorage === 0 &&
                                        <div className="buttons">
                                            { progress === "results" &&
                                                <button className="btn btn-primary" type="button" onClick={onReset}>Back</button>
                                            }
                                            <button className="btn btn-primary" type="button" onClick={onDone}>Done</button>
                                        </div>
                                }
                        </div>
                    </div>
                </section>
            )
        }
    `
    renderReactComponent(jsxCode, "react-root", "HiderBoardPage", JSON.stringify(js_vars));
}

function renderSeekerBoardPage() {
    const jsxCode = `
        function Stam(){
            return <div></div>
        }
        function reducer(state, action){
            if (action.type === "setSelection"){
                const index = action.index
                const isSelected = action.isSelected
                const newSelection = [...state.selection]
                newSelection[index] = isSelected
                return {...state, selection: newSelection}
            }
            if (action.type === "setModal"){
                return {...state, modal: action.modal}
            }
            if (action.type === "closeModal"){
                return {...state, modal: null}
            }
            if (action.type === "finishRounds"){
                return {...state, currentStep: "feedback"}
            }
            return state
        }
        const initialState = {
            multipliers: js_vars.multipliers,
            totalNumberOfObjects: js_vars.totalNumberOfObjects,
            selection : [false, false, false, false],
            modal : null,
        }
        const DispatchContext = React.createContext(null)
        const StateContext = React.createContext(null)
        function HiderBoardPage(props){
            const [state, dispatch] = React.useReducer(reducer, initialState)
            return (
                <DispatchContext.Provider value={dispatch}>
                    <StateContext.Provider value={state}>
                        <section>
                            <Rounds {...props}/>
                        </section>
                    </StateContext.Provider>
                </DispatchContext.Provider>
            )
        }
        function Rounds(props){
            const state = React.useContext(StateContext)
            const dispatch = React.useContext(DispatchContext)
            function onReset(){
                dispatch({type:"setSelection", selection: [false, false, false, false]})
            }
            function finishRound(){
                liveSend({
                    'action': 'finish_round',
                })
            }
            function onBoxClick(boxIndex){
                const isAlreadySelected = state.selection[boxIndex] === true
                let isSelected = true
                if (isAlreadySelected){
                    isSelected = false
                }
                liveSend({
                    'action': 'set_selection',
                    'selection': state.selection.map((selection, index)=>{
                        if (index === boxIndex){
                            return isSelected
                        }
                        else {
                            return selection
                        }
                    })
                })
                dispatch({type:"setSelection", index: boxIndex, isSelected})
            }
            const storageClassName = () =>{
                let className = "storage"
                return className
            }
            const boxesClassName = (boxIndex) =>{
                let className = "box question-mark seeker"
                const isSelected = state.selection[boxIndex] === true
                if (isSelected){
                    className += " selected"
                }
                return className
            }
            const isReadyToProceed = React.useMemo(()=>{
                const numberOfSelectedBoxes = state.selection.filter((isSelected)=>isSelected).length
                return numberOfSelectedBoxes === 2
            }, [state.selection])
            return (
                <section>
                    <h4>Round {props.roundNumber}</h4>
                    <div className="hider-board">
                        <div className="board-row background-dark-grey">
                            <div className="info background-light-grey">
                                <p>
                                    Another player distributed {state.totalNumberOfObjects} objects into some or all the boxes.
                                </p>
                            </div>
                            {/* storage */}
                            <div className={storageClassName()}>
                                <h4>
                                    {state.totalNumberOfObjects}
                                </h4>
                                <span style={{alignSelf:"center"}}>
                                    Objects distributed by Hider
                                </span>
                            </div>
                            <div className="boxes-area">
                                <div className="boxes">
                                    {
                                        state.selection.map((_,boxIndex)=>{
                                            return (
                                                <div className="box-container">
                                                    <div className="box box-open hider">
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="board-row background-dark-grey">
                            <div className="info background-light-grey">
                                The objects have multiplied in the boxes
                            </div>
                            <div className="boxes">
                                {
                                    state.selection.map((_, boxIndex)=>{
                                        return (
                                            <div className="box-container">
                                                <h6 className="arrow-down">
                                                    ×{state.multipliers[boxIndex]}
                                                </h6>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className="board-row background-yellow">
                            <div className="info">
                                <p>
                                    <u>Your Task:</u><br/>
                                    Choose 2 boxes to take.
                                </p>
                            </div>
                            <div className="boxes">
                            {
                                state.selection.map((isSelected, boxIndex)=>{
                                    return (
                                        <div className="box-container" >
                                            <div className="box-closed box" >
                                                <span className="text-white">?</span>
                                            </div>
                                                <input
                                                    type="checkbox" 
                                                    value ={isSelected}
                                                    onChange={()=>{onBoxClick(boxIndex)}}
                                                    />
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                        <div className="footer">
                        {
                            isReadyToProceed &&
                                <div className="buttons">
                                    <button class="btn btn-primary" type="button" onClick={finishRound}>Done</button>
                                </div>
                        }
                        </div>
                    </div>
                </section>
            )
        }
    `
    renderReactComponent(jsxCode, "react-root", "HiderBoardPage", JSON.stringify(js_vars));
}

window.addEventListener("load", () => {
    console.log(js_vars)
    const role = js_vars.role
    if (role === "seeker") {
        renderSeekerBoardPage()
        return
    }
    renderHiderBoardPage()
})

function liveRecv(data) {
    if (data.action === "finish_round") {
        const finishElement = document.createElement("input")
        finishElement.type = "hidden"
        finishElement.name = "finished"
        finishElement.value = "true"
        document.querySelector("form").appendChild(finishElement)
        document.querySelector("form").submit()
    }
}