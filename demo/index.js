// Standard libraries
import * as Comlink from "comlink";
import Split from "split.js";
import { html, render } from "lit";

// Local modules
import { spinner, previewTemplate, miniBrowserTemplate } from "./preview-template.mjs";
import EmceptionWorker from "./emception.worker.js";
import TerminalManager from './src/TerminalManager';
import CodeEditorManager from './src/CodeEditorManager.js';
import "./style.css";
import "xterm/css/xterm.css";
import { compile } from "./src/compile"; // Import the new compile function


const emception = Comlink.wrap(new EmceptionWorker());
window.emception = emception;
window.Comlink = Comlink;


async function loadTerminal() {
    const terminal = new TerminalManager("console-container", Comlink, emception);
    await terminal.init();
    window.terminal = terminal;
    return terminal;
}

async function loadCodeEditor() {
    const codeEditorManager = new CodeEditorManager();
    await codeEditorManager.initialize();
    return codeEditorManager;
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
    const preview = (htmlContent) => {
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }));
        frame.src = url;
    };
    preview(previewTemplate(spinner(80), "Loading", ""));

    let miniUrl = "";
    const previewMiniBrowser = (htmlContent) => {
        if (miniUrl) URL.revokeObjectURL(miniUrl);
        miniUrl = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }));
        preview(miniBrowserTemplate("main.html", miniUrl));
    };

    const codeEditorManager = await loadCodeEditor();
    const terminal = await loadTerminal();

    Split(['#editor-container', '#iframe-container'], {
        sizes: [50, 50],
        minSize: 100,
        gutterSize: 8,
        cursor: 'col-resize',
        ondrag: () => {
            terminal.fit();
        },
        onDragEnd: () => {
            terminal.fit();
        }
    });

    Split(['#editor-iframe-container', '#console-container'], {
        sizes: [70, 30],
        direction: 'vertical',
        minSize: 100,
        gutterSize: 8,
        cursor: 'row-resize',
        ondrag: () => {
            terminal.fit();
        },
        onDragEnd: () => {
            terminal.fit();
        }
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            terminal.fit();
        });
    });

    await emception.init();
    preview(miniBrowserTemplate("loss.html", compFailedBlob));
    terminal.reset();
    terminal.write("Emception is ready\n");

    const triggerCompilation = () => compile(preview, previewMiniBrowser, terminal, codeEditorManager, emception);
    triggerCompilation();
    window.triggerCompilation = triggerCompilation
}

window.start_emception = main; // Retain global start_emception
