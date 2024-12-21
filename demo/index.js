import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { Terminal } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import Split from "split.js";
import { spinner, previewTemplate, miniBrowserTemplate } from "./preview-template.mjs";
import { html, render } from "lit";
import * as Comlink from "comlink";
import EmceptionWorker from "./emception.worker.js";
import { emscripten_css_replacement} from "./new_style.js"
import "./style.css";
import "xterm/css/xterm.css";
import {deserialiseState, serialiseState } from "./ts/url.js" 
import * as JSZip from 'jszip';

import buildPyContent from './resources/build.py';
import mainCpp from './resources/main.cpp';

import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'




const emception = Comlink.wrap(new EmceptionWorker());
window.emception = emception;
window.Comlink = Comlink;


async function loadterminal()
{

    const terminalContainer = document.getElementById("console-container");
    const terminal = new Terminal({
        convertEol: true,
        theme: {
            background: "#1e1e1e",
            foreground: "#d4d4d4",
        },
    });
    terminal.open(terminalContainer);
    
    window.terminalFitAddon = new FitAddon();
    terminal.loadAddon(window.terminalFitAddon);
    window.terminal = terminal;
    
    emception.onstdout = Comlink.proxy((str) => terminal.write(str + "\n"));
    emception.onstderr = Comlink.proxy((str) => terminal.write(str + "\n"));
    
    window.addEventListener("resize", () => {
        window.terminalFitAddon.fit();
    });    
}

function decodeStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const compressedCode = params.get('code');
    console.log(compressedCode)
    if (compressedCode) {
        try {
            return JSON.parse(deserialiseState(compressedCode))
        } catch (error) {
            console.error("Failed to decode code:", error);
            return null;
        }
    }

    return null; // No code in the URL
}

async function loadcode(){

    
        // Create the highlighter, it can be reused
        const highlighter = await createHighlighter({
            themes: [
              'github-dark'
              ],
            langs: [
              'javascript',
              'typescript',
              'vue',
              'python',
              'cpp'
            ],
          })
          
        monaco.languages.register({ id: 'python' })
        shikiToMonaco(highlighter, monaco)


    const tabs = document.getElementById('tabs');
    const editorContainer = document.getElementById('editor-container');

    let tabData = [
        { id: 'main.cpp', content: mainCpp },
        { id: 'build.py', content: buildPyContent}
    ];

     // Populate editor with code from URL if available
     const code_state = decodeStateFromUrl()
     if (code_state) {
        tabData = code_state;
     }

    let editors = {};
    let activeTab = null;

    function removeAllTabs() {
        // Collect all tab IDs
        const tabIds = tabData.map(tab => tab.id);
    
        // Remove each tab without confirmation
        tabIds.forEach(tabId => removeTab(tabId, false));
    }

    window.removeAllTabs = removeAllTabs;

    function createTab(tab) {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.dataset.id = tab.id;

        const tabTitle = document.createElement('span');
        tabTitle.textContent = tab.id;
        tabElement.appendChild(tabTitle);

        const closeButton = document.createElement('span');
        closeButton.className = 'close-btn';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            removeTab(tab.id);
        });
        tabElement.appendChild(closeButton);

        tabElement.addEventListener('click', () => {
            switchTab(tab.id);
        });

        tabs.insertBefore(tabElement, document.querySelector('.tab.add'));
    }
    window.createTab = createTab;

    function createAddButton() {
        const addButton = document.createElement('div');
        addButton.className = 'tab add';
        addButton.textContent = '+';
        addButton.addEventListener('click', () => {
            const name = prompt('Enter tab name:');
            if (name) {
                addTab(name);
            }
        });
        tabs.appendChild(addButton);
    }

    function createEditor(tab) {
        const editorDiv = document.createElement('div');
        editorDiv.id = tab.id;
        editorDiv.className = 'editor';
        editorContainer.appendChild(editorDiv);

        const codeConfig = {
            value: tab.content,
            language: tab.id.endsWith('.py') ? 'python' : 'cpp', 
            theme: 'github-dark', 
            automaticLayout: true
        };

        editors[tab.id] = monaco.editor.create(editorDiv, codeConfig);
    }

    window.createEditor = createEditor;

    function switchTab(tabId) {
        if (activeTab) {
            document.querySelector(`.tab[data-id="${activeTab}"]`).classList.remove('active');
            document.getElementById(activeTab).classList.remove('active');
        }

        activeTab = tabId;

        document.querySelector(`.tab[data-id="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        editors[tabId].layout();
    }
    
    function addTab(name) {
        // Check if the tab already exists
        if (tabData.some(tab => tab.id === name)) {
            alert(`A tab with the name "${name}" already exists.`);
            return;
        }
    
        const id = name;
        const newTab = { id, content: '// New tab content' };
        tabData.push(newTab);
    
        createTab(newTab);
        createEditor(newTab);
        switchTab(id);
    }

    function removeTab(tabId, confirmation = true) {
        // Show confirmation dialog
        if(confirmation)
        {
            const confirmed = confirm(`Are you sure you want to delete the tab "${tabId}"?`);
            if (!confirmed) {
                return;
            }
        }

        
        if (activeTab === tabId) {
            const index = tabData.findIndex(tab => tab.id === tabId);
            const nextTab = tabData[index + 1] || tabData[index - 1];
            if (nextTab) {
                switchTab(nextTab.id);
            } else {
                activeTab = null;
            }
        }

        document.querySelector(`.tab[data-id="${tabId}"]`).remove();
        document.getElementById(tabId).remove();

        editors[tabId].dispose();
        delete editors[tabId];
        tabData = tabData.filter(tab => tab.id !== tabId);
    }

    // Initialize tabs and editors
    tabData.forEach(tab => {
        createTab(tab);
        createEditor(tab);
    });

    createAddButton();

    // Set initial active tab
    switchTab(tabData[0].id);

    window.editors = editors

    window.getEditorState =  () => {
        const state = [];
        tabData.forEach(tab => {
            state.push({
                id: tab.id,
                content: editors[tab.id].getValue()
            });
        });
        return state;
    };
        // Assuming JSZip is included in your project
    // You can include it via a script tag or npm install jszip

    window.getEditorStateAsZip = () => {
        const zip = new JSZip(); // Initialize JSZip instance

        // Iterate through the tabData array
        tabData.forEach(tab => {
            const content = editors[tab.id].getValue(); // Get content for each tab
            zip.file(`${tab.id}`, content); // Create a text file in the zip with tab.id as the filename
        });

        // Generate the zip asynchronously and return a Promise
        return zip.generateAsync({ type: "blob" }).then(content => {
            // Create a download link for the generated zip file
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = "game_src.zip";
            link.click();

            // Optionally clean up the object URL (for memory efficiency)
            URL.revokeObjectURL(link.href);
        });
    };


    window.createShareableLink =  () => {
        let sourceCode = JSON.stringify(window.getEditorState())
        let compressed = serialiseState(sourceCode);
        
        // Construct the URL with the compressed code as a query parameter
        const baseUrl = window.location.origin + window.location.pathname; // Replace with your app's base URL
        const shareableUrl = `${baseUrl}?code=${compressed}`;
        return shareableUrl;
    }


}

async function compile(preview, previewMiniBrowser)
{

    const onprocessstart = (argv) => {
        
    };
    const onprocessend = () => {
 
    };
    emception.onprocessstart = Comlink.proxy(onprocessstart);
    emception.onprocessend = Comlink.proxy(onprocessend);

    const terminal = window.terminal;

    const compileFn = async () => {
        preview(previewTemplate(spinner(80), "Compiling", ""));
        
        try {
            terminal.reset();
            // Write all files to Emception file system
           
            await emception.runpyscript("import shutil; shutil.rmtree('/working')")

            for (const [fileName, editor] of Object.entries(window.editors)) {
                const content = editor.getValue(); // Get the content from the editor
                await emception.fileSystem.writeFile(`/working/${fileName}`, content);
            }
        
            const cmd = `build`;
            terminal.write(`$ ${cmd}\n\n`);
            const result = await emception.runpy(cmd);
            terminal.write("\n");
            if (result.returncode == 0) {
                terminal.write("Emception compilation finished");
                const content = await emception.fileSystem.readFile("/working/main.html", { encoding: "utf8" });
                if(!content)
                {
                    content = "<html></html>"
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(content, "text/html");
                
                const styleElement = doc.querySelector("style");

                if (styleElement) {
                    styleElement.textContent = emscripten_css_replacement;
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
                preview(miniBrowserTemplate("", "The compilation failed, check the output below"));
            }
            terminal.write("\n");
        } catch (err) {
            preview(previewMiniBrowser("", "", "Something went wrong, please file a bug report"));
            console.error(err);
        } finally {
            //status.textContent = "Idle";
            //statusElements.splice(0, statusElements.length);
        }
    };

    window.triggerCompilation = compileFn;


}

async function extractAndParseZip(file, customParser) {
    const zip = new JSZip();
    const zipContent = await file.arrayBuffer();

    // Load the zip content
    const zipData = await zip.loadAsync(zipContent);
    const parsedFiles = [];

    // Process only first-level files in the zip
    for (const fileName of Object.keys(zipData.files)) {
        const fileEntry = zipData.files[fileName];
        
        if (!fileEntry.dir && !fileName.includes("/")) { // Skip directories and nested files
            const fileContent = await fileEntry.async("string");
            parsedFiles.push({
                id: fileName,
                content: fileContent
            });
        }
    }

    // Remove all existing tabs
    window.removeAllTabs();

    // Create new tabs and editors for each parsed file
    parsedFiles.forEach(tab => {
        window.createTab(tab);
        window.createEditor(tab);
    });

    switchTab(parsedFiles[0].id);
}


async function dragableSetup()
{
        // Custom parser function
        function customParser(fileName, fileContent) {
            console.log(`Parsing file: ${fileName}`);
            return fileContent; // For simplicity, just return the raw content
        }

        // Set up drag-and-drop functionality
        const body = document.body;

        // Highlight the drop area when dragging
        body.addEventListener("dragover", (event) => {
            event.preventDefault();
            body.classList.add("dragover");
        });

        body.addEventListener("dragleave", () => {
            body.classList.remove("dragover");
        });

        // Handle the drop event
        body.addEventListener("drop", (event) => {
            event.preventDefault();
            body.classList.remove("dragover");

            const file = event.dataTransfer.files[0];
            if (file && (file.type === "application/zip" || file.type === "application/x-zip-compressed") ) {
                extractAndParseZip(file, )
            } else {
                alert("Please drop a valid ZIP file.");
            }
        });
}
async function main(element) {

    const compFailedBlob = URL.createObjectURL(new Blob(["<div>Your compiled code will run here.</div><div>Click <div style=\"display: inline-block;border: 1px solid #858585;background: #454545;color: #cfcfcf;font-size: 15px;padding: 5px 10px;border-radius: 3px;\">Compile!</div> above to start.</div>"], { type: 'text/html' }));
    render(html`
    <div id="tabs"></div>
    
    <div id="main-container" class="split-horizontal">
        <div id="editor-iframe-container" class="split-vertical">
            <div id="editor-container"></div>
            <div id="iframe-container">
                <iframe id="gameIframe"></iframe>
            </div>
        </div>
        <div id="console-container"></div>
    </div>
    `, element);

    const frame = document.getElementById("gameIframe");
    let url = "";
    function preview(html_content) {
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(new Blob([html_content], { type: 'text/html' }));
        frame.src = url;
    }
    preview(previewTemplate(spinner(80), "Loading", ""));

    let miniUrl = "";
    function previewMiniBrowser(html_content) {
        if (miniUrl) URL.revokeObjectURL(miniUrl);
        miniUrl = URL.createObjectURL(new Blob([html_content], { type: 'text/html' }));
        preview(miniBrowserTemplate("main.html", miniUrl));
    }


    await loadcode();
    await loadterminal();
    await compile(preview, previewMiniBrowser);
    await dragableSetup();
    Split(['#editor-container', '#iframe-container'], {
        sizes: [50, 50],
        minSize: 100,
        gutterSize: 8,
        cursor: 'col-resize',
        ondrag: () => {
            window.terminalFitAddon.fit();
        },
        onDragEnd: () => {
            window.terminalFitAddon.fit();   
        }
    });

    Split(['#editor-iframe-container', '#console-container'], {
        sizes: [70, 30],
        direction: 'vertical',
        minSize: 100,
        gutterSize: 8,
        cursor: 'row-resize',
        ondrag: () => {
            window.terminalFitAddon.fit();
        },
        onDragEnd: () => {
            window.terminalFitAddon.fit();   
        }
    });


    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.terminalFitAddon.fit();
        });
    });
    await emception.init();
    preview(miniBrowserTemplate("loss.html", compFailedBlob));

    terminal.reset();
    terminal.write("Emception is ready\n");
}

window.start_emception = main

window.deserialiseState = deserialiseState
window.serialiseState = serialiseState


