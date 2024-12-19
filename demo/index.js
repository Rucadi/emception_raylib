import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { Terminal } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import Split from "split-grid";
import { spinner, previewTemplate, miniBrowserTemplate } from "./preview-template.mjs";
import { html, render } from "lit";
import * as Comlink from "comlink";
import EmceptionWorker from "./emception.worker.js";

import "./style.css";
import "xterm/css/xterm.css";

const emception = Comlink.wrap(new EmceptionWorker());
window.emception = emception;
window.Comlink = Comlink;

const editorContainer = document.createElement("div");
const editor = monaco.editor.create(editorContainer, {
    value: "",
    language: "cpp",
    theme: "vs-dark",
});

const terminalContainer = document.createElement("div");
const terminal = new Terminal({
    convertEol: true,
    theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
    },
});
terminal.open(terminalContainer);

const terminalFitAddon = new FitAddon();
terminal.loadAddon(terminalFitAddon);

window.editor = editor;
window.terminal = terminal;

// Initialize with main.cpp
editor.setValue(`#include <iostream>

int main(void) {
    std::cout << "hello world!\\n";
    return 0;
}
`);

emception.onstdout = Comlink.proxy((str) => terminal.write(str + "\n"));
emception.onstderr = Comlink.proxy((str) => terminal.write(str + "\n"));

window.addEventListener("resize", () => {
    editor.layout();
    terminalFitAddon.fit();
});

async function main() {
    render(html`
        <div id="layout">
            <div id="header">
                <div id="title">Code Editor</div>
                <input id="flags" type="text"></input>
                <button disabled id="compile">Loading</button>

            </div>
            <div id="editor">
                ${editorContainer}
            </div>
            <div id="vgutter"></div>
            <div id="preview">
                <iframe id="preview-frame"></iframe>
            </div>
            <div id="hgutter"></div>
            <div id="output">
                <div id="terminal">
                    ${terminalContainer}
                </div>
                <div id="status"></div>
                <div id="file_view">
                        <div id="tabs" style="display: flex"></div>
                        <button id="new-file-button" @click=${createNewFile}>[+]</button>
                </div>
            </div>
        </div>
    `, document.body);

    const flags = document.getElementById("flags");
    flags.value = "-O2 -fexceptions  -sEXIT_RUNTIME=1 -sUSE_GLFW=3 -I/raylib/include -L/raylib/lib -lraylib -DPLATFORM_WEB -sASYNCIFY -std=c++20";
    
    window.split = Split({
        onDrag: () => {
            editor.layout();
            terminalFitAddon.fit();
        },
        columnGutters: [{
            track: 1,
            element: document.getElementById("vgutter"),
        }],
        rowGutters: [{
            track: 2,
            element: document.getElementById("hgutter"),
        }],
    });

    const frame = document.getElementById("preview-frame");
    let url = "";
    function preview(html_content) {
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(new Blob([html_content], { type: 'text/html' }));
        frame.src = url;
    }

    let miniUrl = "";
    function previewMiniBrowser(html_content) {
        if (miniUrl) URL.revokeObjectURL(miniUrl);
        miniUrl = URL.createObjectURL(new Blob([html_content], { type: 'text/html' }));
        preview(miniBrowserTemplate("main.html", miniUrl));
    }

    preview(previewTemplate(spinner(80), "Loading", ""));

    const status = document.getElementById("status");
    const statusElements = [];
    const onprocessstart = (argv) => {
        const lastEl = statusElements[statusElements.length - 1] || status;
        const newEl = document.createElement("div");
        newEl.className = "process-status";
        render(html`
            <div class="process-argv" title=${argv.join(" ")}>${argv.join(" ")}</div>
        `, newEl);
        statusElements.push(newEl);
        lastEl.appendChild(newEl);

        terminalFitAddon.fit();
        requestAnimationFrame(() => {
            terminalFitAddon.fit();
        });
    };
    const onprocessend = () => {
        const lastEl = statusElements.pop();
        if (lastEl) lastEl.remove();

        terminalFitAddon.fit();
        requestAnimationFrame(() => {
            terminalFitAddon.fit();
        });
    };
    emception.onprocessstart = Comlink.proxy(onprocessstart);
    emception.onprocessend = Comlink.proxy(onprocessend);

    // File management
    const files = {
        'main.cpp': editor.getValue(),
    };
    let activeFile = 'main.cpp';

    function updateTabs() {
        const tabsContainer = document.getElementById('tabs');
        tabsContainer.innerHTML = '';
    
        // Render each file tab
        Object.keys(files).forEach(file => {
            const tabContainer = document.createElement('div');
            tabContainer.className = 'tab-container';
    
            // Create the tab button
            const tabButton = document.createElement('button');
            tabButton.className = `tab ${file === activeFile ? 'active' : ''}`;
            tabButton.textContent = file;
            tabButton.addEventListener('click', () => switchFile(file));
            tabContainer.appendChild(tabButton);
    
            // Add a remove button for non-default files
            if (file !== 'main.cpp') {
                const removeButton = document.createElement('button');
                removeButton.className = 'remove-icon';
                removeButton.textContent = '-';
                removeButton.addEventListener('click', () => removeFile(file));
                tabContainer.appendChild(removeButton);
            }
    
            tabsContainer.appendChild(tabContainer);
        });
    
    }
    
    
    function saveActiveFile()
    {
        files[activeFile] = editor.getValue(); // Save current file content
    }
    // Function to switch between files
    function switchFile(file) {
        saveActiveFile();
        activeFile = file;
        editor.setValue(files[file]); // Load content of the selected file
        updateTabs(); // Update the tab UI
    }
    
 
    function createNewFile() {
        const newFileName = prompt("Enter new file name:");
        if (newFileName && !files[newFileName]) {
            files[newFileName] = '';
            switchFile(newFileName);
        }
    }

    
    // Function to remove a file from the list
    function removeFile(file) {
        switchFile("main.cpp")
        delete files[file];
        updateTabs();
    }
    
    // Call updateTabs to render the initial tabs
    updateTabs();

    const compile = document.getElementById("compile");
    compile.addEventListener("click", async () => {
        saveActiveFile();
        compile.disabled = true;
        compile.textContent = "Compiling";
        status.textContent = "Running:";
        preview(previewTemplate(spinner(80), "Compiling", ""));
        
        try {
            terminal.reset();
            // Write all files to Emception file system
            for (const [fileName, content] of Object.entries(files)) {
                await emception.fileSystem.writeFile(`/working/${fileName}`, content);
            }
            
            const filteredFiles = Object.keys(files)
            .filter(file => !file.endsWith('.hpp') && !file.endsWith('.h'))
            .join(' ');

            const cmd = `em++ ${flags.value} -sSINGLE_FILE=1 -sMINIFY_HTML=0 -sUSE_CLOSURE_COMPILER=0 ${filteredFiles} -o main.html`;
            
            onprocessstart(`/emscripten/${cmd}`.split(/\s+/g));
            terminal.write(`$ ${cmd}\n\n`);
            const result = await emception.run(cmd);
            terminal.write("\n");
            if (result.returncode == 0) {
                terminal.write("Emception compilation finished");
                const content = await emception.fileSystem.readFile("/working/main.html", { encoding: "utf8" });
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, "text/html");
                
                // Locate the "output" element and hide it
                const output = doc.getElementById("output");
                if (output) {
                    output.style.display = "none"; // Hides the element
                    output.style.width = "0";
                    output.style.height = "0";
                }
                
                // Create a script to override document.write and document.writeln
                const script = doc.createElement("script");
                script.textContent = `
                (function() {
                    const originalTextarea = document.getElementById("output");
                    const originalValueDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
                    Object.defineProperty(originalTextarea, 'value', {
                        set: function(value) {
                            window.parent.parent.terminal.write(value)
                        },
                        get: function() {
                            return originalValueDescriptor.get.call(this);
                        },
                        configurable: true
                    });

                })();
                `;

                const link = doc.querySelector('a[href="http://emscripten.org"]');
                if (link) {
                    link.remove();
                }

                const omnibar = doc.querySelector('#omnibar');
                if (omnibar) {
                    omnibar.remove();
                }
                // Ensure the script runs immediately
                doc.body.appendChild(script);
                
                // Pass the modified HTML to the mini-browser
                previewMiniBrowser(doc.documentElement.outerHTML);
            } else {
                terminal.write(`Emception compilation failed`);
                preview(previewTemplate("", "", "The compilation failed, check the output below"));
            }
            terminal.write("\n");
        } catch (err) {
            preview(previewTemplate("", "", "Something went wrong, please file a bug report"));
            console.error(err);
        } finally {
            status.textContent = "Idle";
            statusElements.splice(0, statusElements.length);
            compile.textContent = "Compile!";
            compile.disabled = false;
        }
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            editor.layout();
            terminalFitAddon.fit();
        });
    });
    terminal.write("Loading Emception...\n");
    status.textContent = "Loading...";

    await emception.init();

    terminal.reset();
    terminal.write("Emception is ready\n");
    status.textContent = "Idle";
    compile.disabled = false;
    compile.textContent = "Compile!";
    preview(previewTemplate("", "", "<div>Your compiled code will run here.</div><div>Click <div style=\"display: inline-block;border: 1px solid #858585;background: #454545;color: #cfcfcf;font-size: 15px;padding: 5px 10px;border-radius: 3px;\">Compile!</div> above to start.</div>"));
}

main();