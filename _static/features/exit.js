function renderExitPage(){
    const jsxCode = `
        function Stam(){
            return <div></div>
        }
        function ExitPage(props){
           if (!props.userAcceptedTerms){
                return (
                    <p>
                         Thank you for your interest in this study. Unfortunately, you did not accept the terms and conditions of the study, hence you are asked to leave.<br/>
                         Please return your hit.<br/>
                         <a target="_blank" href="https://app.prolific.com/submissions/complete?cc=C86U3VOH">Use this link in order to return to Prolific</a>
                    </p>
                )
            }
            if (props.endedSuccessfully){
                return (
                    <p>
                        You have successfully completed the study. Thank you for your participation.<br/>
                    <a target="_blank" href="https://app.prolific.com/submissions/complete?cc=C1FIGVFZ">Use this link in order to return to Prolific</a>                        
                    </p>
                )
            } else {
                return (
                    <p>
                        Thank you for your participation in this study. Unfortunately, you did not complete the study successfully.<br/>
                        Please return your hit.<br/>
                    <a target="_blank" href="https://app.prolific.com/submissions/complete?cc=C1HELG6N">Use this link in order to return to Prolific</a>
                    </p>
                )
            }
        }
    `
    renderReactComponent(jsxCode, "react-root", "ExitPage", JSON.stringify(js_vars));
}

window.addEventListener("load", ()=>{
    renderExitPage()
})