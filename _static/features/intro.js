function renderInstructionsPage() {
    const jsxCode = `
        function Stam(){
            return <div></div>
        }
        function InstructionsPage(props){
           return (
                <section>
                    <h4>Instructions</h4>
                    <p>
                       Each box has a value by which the number of objects in the box is multiplied (the box’ <b>multiplication rate</b>). One player (the “Hider”) chooses how to distribute the objects across the boxes before a second player (the “Opener”) chooses half of the boxes to open. Openers get the objects from the boxes they chose to open (multiplied by each box’s multiplication rate), and Hiders get the objects from each remaining box (multiplied by the box’s multiplication rate).
                    </p>
                    <p>
                        You will be assigned either the role of Hider or Opener and play the game three times with different sets of boxes.  
                    </p>
                    <p>
                    Prior to the game you will be shown a simple test of 3 questions to ensure you understood the game. You will get two chances to answer each question correctly. However, if you answer any question twice incorrectly, your participation will be terminated. <br/>
                    Click "Proceed" when you are ready to start the test.
                    </p>
                    <div class="button-container">
                        <button class="btn btn-primary">Proceed</button>
                    </div>
                </section>
           )
        }
    `
    renderReactComponent(jsxCode, "react-root", "InstructionsPage", JSON.stringify(js_vars));
}

window.addEventListener("load", () => {
    renderInstructionsPage()
})