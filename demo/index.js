import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { Terminal } from "xterm";
import { FitAddon } from 'xterm-addon-fit';
import Split from "split.js";
import { spinner, previewTemplate, miniBrowserTemplate } from "./preview-template.mjs";
import { html, render } from "lit";
import * as Comlink from "comlink";
import EmceptionWorker from "./emception.worker.js";
import { emscripten_css_replacement} from "./new_style.js"
import { examplecpp} from "./example_code.js"
import "./style.css";
import "xterm/css/xterm.css";

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

async function loadcode(){
    const tabs = document.getElementById('tabs');
    const editorContainer = document.getElementById('editor-container');

    let tabData = [
        { id: 'main.cpp', content: examplecpp },
    ];

    let editors = {};
    let activeTab = null;

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

        editors[tab.id] = monaco.editor.create(editorDiv, {
            value: tab.content,
            language: 'cpp',
            theme: 'vs-dark',
            automaticLayout: true
        });
    }

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

    function removeTab(tabId) {
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to delete the tab "${tabId}"?`);
        if (!confirmed) {
            return;
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
}

async function compile(preview, previewMiniBrowser)
{

    const onprocessstart = (argv) => {
        
    };
    const onprocessend = () => {
 
    };
    emception.onprocessstart = Comlink.proxy(onprocessstart);
    emception.onprocessend = Comlink.proxy(onprocessend);







    const compile = document.getElementById("compileButton");
    const terminal = window.terminal;

    compile.addEventListener("click", async () => {
        compile.disabled = true;
        compile.textContent = "Compiling";
        //status.textContent = "Running:";
        preview(previewTemplate(spinner(80), "Compiling", ""));
        
        try {
            terminal.reset();
            // Write all files to Emception file system
            for (const [fileName, editor] of Object.entries(window.editors)) {
                const content = editor.getValue(); // Get the content from the editor
                await emception.fileSystem.writeFile(`/working/${fileName}`, content);
            }
        
            // Filter to include only C/C++ source file extensions
            const validExtensions = ['.c', '.cpp', '.cxx', '.cc', '.c++', '.cp']; // Add other valid C/C++ extensions as needed
            const filteredFiles = Object.keys(window.editors)
                .filter(file => validExtensions.some(ext => file.endsWith(ext)))
                .map(file => `/working/${file}`) // Prepend working directory to filenames
                .join(' ');
            // Construct the em++ compilation command
            const cmd = `em++ -O1 -fexceptions  -sEXIT_RUNTIME=1 -sUSE_GLFW=3 -I/raylib/include -L/raylib/lib -lraylib -lrlImGui -DPLATFORM_WEB -sASYNCIFY -std=c++20 -s SINGLE_FILE=1 -s MINIFY_HTML=0 -s FETCH -s USE_CLOSURE_COMPILER=0 ${filteredFiles} -o /working/main.html`;
        
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
                

                // Locate the <style> element
                const styleElement = doc.querySelector("style");

                if (styleElement) {
                    styleElement.textContent = emscripten_css_replacement;
                }

            // Add a "Download HTML" button to the controls dynamically
            const controls = doc.getElementById("controls");
            if (controls) {
                const span = doc.createElement("span");
                const button = doc.createElement("input");
                button.type = "button";
                button.value = "Download";

                // Assign a unique ID to the button
                const buttonId = "download-html-button";
                button.id = buttonId;

                // Append the button to the span, and then to the controls
                span.appendChild(button);
                controls.appendChild(span);

                // Create a script to handle the button's functionality
                const script = doc.createElement("script");
                script.textContent = `
                (function() {
                    const button = document.getElementById("${buttonId}");
                    if (button) {
                        button.addEventListener("click", function() {
                            // Get the current HTML content of the live DOM
                            const html = document.documentElement.outerHTML;

                            // Create a Blob with the HTML content
                            const blob = new Blob([html], { type: "text/html" });

                            // Create a temporary link to trigger the download
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = "current-page.html"; // Set the file name

                            // Trigger the download
                            link.click();

                            // Clean up
                            URL.revokeObjectURL(link.href);
                        });
                    }
                })();
                `;

                // Append the script to the body to ensure it executes
                doc.body.appendChild(script);
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
            //status.textContent = "Idle";
            //statusElements.splice(0, statusElements.length);
            compile.textContent = "Compile!";
            compile.disabled = false;
        }
    });


}
async function main() {
    render(html`
    <div id="header">
        <div id="site-name">ToyWithRaylib</div>
        <button id="compileButton">Compile</button>
    </div>
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
    `, document.body);

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
    preview(previewTemplate("", "", "<div>Your compiled code will run here.</div><div>Click <div style=\"display: inline-block;border: 1px solid #858585;background: #454545;color: #cfcfcf;font-size: 15px;padding: 5px 10px;border-radius: 3px;\">Compile!</div> above to start.</div>"));

    terminal.reset();
    terminal.write("Emception is ready\n");
}

main();