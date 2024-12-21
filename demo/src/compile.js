// compile.js
import { spinner, previewTemplate, miniBrowserTemplate } from "../preview-template.mjs";

const emscripten_css_replacement = `
body {
  font-family: arial;
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.emscripten {
  margin: auto;
  display: none;
  justify-content: center;
  align-items: center;
  flex: 1;
}

div.emscripten { 
  width: 100%;
  height: 100%;
}     
div.emscripten_border {
  border: 0;
  flex: 1;
  display: flex;
  overflow: hidden;
}
/* the canvas *must not* have any border or padding, or mouse coords will be wrong */
canvas.emscripten {
  border: 0px none;
  background-color: black;
  flex: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: flex;
}

#emscripten_logo {
  display: none;
  margin: 0;
}

.spinner {
  height: 30px;
  width: 30px;
  margin: 0;
  margin-top: 20px;
  margin-left: 20px;
  display: none;
  vertical-align: top;

  -webkit-animation: rotation .8s linear infinite;
  -moz-animation: rotation .8s linear infinite;
  -o-animation: rotation .8s linear infinite;
  animation: rotation 0.8s linear infinite;

  border-left: 5px solid rgb(235, 235, 235);
  border-right: 5px solid rgb(235, 235, 235);
  border-bottom: 5px solid rgb(235, 235, 235);
  border-top: 5px solid rgb(120, 120, 120);
  
  border-radius: 100%;
  background-color: rgb(189, 215, 46);
}

@-webkit-keyframes rotation {
  from {-webkit-transform: rotate(0deg);}
  to {-webkit-transform: rotate(360deg);}
}
@-moz-keyframes rotation {
  from {-moz-transform: rotate(0deg);}
  to {-moz-transform: rotate(360deg);}
}
@-o-keyframes rotation {
  from {-o-transform: rotate(0deg);}
  to {-o-transform: rotate(360deg);}
}
@keyframes rotation {
  from {transform: rotate(0deg);}
  to {transform: rotate(360deg);}
}

#status {
  display: none;
  vertical-align: top;
  margin-top: 30px;
  margin-left: 20px;
  font-weight: bold;
  color: rgb(120, 120, 120);
}

#progress {
  height: 20px;
  width: 300px;
}

#controls {
  display: none;
  float: right;
  vertical-align: top;
  margin-top: 30px;
  margin-right: 20px;
}

#output {
  width: 0;
  height: 0;
  margin: 0 auto;
  margin-top: 10px;
  border-left: 0px;
  border-right: 0px;
  padding-left: 0px;
  padding-right: 0px;
  display: none;
  background-color: black;
  color: white;
  font-family: 'Lucida Console', Monaco, monospace;
  outline: none;
}
`;

export async function compile(preview, previewMiniBrowser, terminalManager, codeEditorManager, emception) {
    try {
        await initializeCompile(terminalManager, preview);
        await clearWorkingDirectory(emception);
        await writeFilesToEmception(emception, codeEditorManager);
        const result = await runCompileCommand(emception, terminalManager);
        
        if (result.returncode === 0) {
            await handleSuccessfulCompilation(emception, preview, previewMiniBrowser, terminalManager);
        } else {
            handleCompilationError(preview, terminalManager);
        }
    } catch (err) {
        handleException(preview, previewMiniBrowser, err);
    }
}

// Helper functions (would be in separate file or at least grouped within compile.js)
async function initializeCompile(terminal, preview) {
    preview(previewTemplate(spinner(80), "Compiling", ""));
    terminal.reset();
}

async function clearWorkingDirectory(emception) {
    await emception.runpyscript("import shutil; shutil.rmtree('/working')");
}

async function writeFilesToEmception(emception, codeEditorManager) {
    const editors = codeEditorManager.getEditors();
    for (const [fileName, editor] of Object.entries(editors)) {
        await emception.fileSystem.writeFile(`/working/${fileName}`, editor.getValue());
    }
}

async function runCompileCommand(emception, terminal) {
    const cmd = `build`;
    terminal.write(`$ ${cmd}\n\n`);
    const result = await emception.runpy(cmd);
    terminal.write("\n");
    return result;
}

async function handleSuccessfulCompilation(emception, preview, previewMiniBrowser, terminal) {
    const content = await emception.fileSystem.readFile("/working/main.html", { encoding: "utf8" }) || "<html></html>";
    const modifiedContent = modifyHtmlContent(content);
    previewMiniBrowser(modifiedContent);
    terminal.write("Emception compilation finished");
}

function handleCompilationError(preview, terminal) {
    terminal.write("Emception compilation failed");
    preview(miniBrowserTemplate("", "The compilation failed, check the output below"));
}

function handleException(preview, previewMiniBrowser, err) {
    preview(previewMiniBrowser("", "", "Something went wrong, please file a bug report"));
    console.error(err);
}

// HTML modification helpers
function modifyHtmlContent(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    updateCss(doc);
    removeUnnecessaryElements(doc);
    injectCustomScript(doc);
    return doc.documentElement.outerHTML;
}

function updateCss(doc) {
    const styleElement = doc.querySelector("style");
    if (styleElement) {
        styleElement.textContent = emscripten_css_replacement;
    }
}

function removeUnnecessaryElements(doc) {
    doc.querySelector('a[href="http://emscripten.org"]')?.remove();
    doc.querySelector('#omnibar')?.remove();
}

function injectCustomScript(doc) {
    const script = doc.createElement("script");
    script.textContent = `
        (function() {
            const originalTextarea = document.getElementById("output");
            const originalValueDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
            Object.defineProperty(originalTextarea, 'value', {
                set: function(value) {
                    window.parent.parent.terminal.write(value);
                },
                get: function() {
                    return originalValueDescriptor.get.call(this);
                },
                configurable: true
            });
        })();
    `;
    doc.body.appendChild(script);
}