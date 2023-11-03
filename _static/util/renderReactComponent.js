function renderReactComponent(jsxCode, renderAt, componentName, props) {
    const renderString = jsxCode.concat(`
        ReactDOM.render(<${componentName} {...${props}} />, document.getElementById('${renderAt}'));
        `)
    /* transpile jsx code to js code */
    const transPiledCode = Babel.transform(renderString, {
        presets: ['react'],
    }).code;
    /* evaluate the transpiled code */
    eval(transPiledCode);
}