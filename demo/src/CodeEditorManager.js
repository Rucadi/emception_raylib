import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'

import JSZip from 'jszip';
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import buildPyContent from '../resources/build.py';
import mainCpp from '../resources/main.cpp';

import {deserialiseState, serialiseState } from "../ts/url.js" 

export class CodeEditorManager {
    constructor() {
        this.monaco = monaco;
        this.JSZip = JSZip;
        this.tabData = [
            { id: 'main.cpp', content: mainCpp },
            { id: 'build.py', content: buildPyContent }
        ];
        this.editors = {};
        this.activeTab = null;
        this.highlighter = null;
        this.tabs = document.getElementById('tabs');
        this.editorContainer = document.getElementById('editor-container');
    }

    async initialize() {
        await this.initializeHighlighter();
        this.loadStateFromUrl();
        this.createInitialTabsAndEditors();
        this.createAddButton();
        this.switchTab(this.tabData[0].id);
        window.removeAllTabs = this.removeAllTabs.bind(this);
        window.getEditorState = this.getEditorState.bind(this);
        window.getEditorStateAsZip = this.getEditorStateAsZip.bind(this);
        window.createShareableLink = this.createShareableLink.bind(this);
    }

    async initializeHighlighter() {
        this.highlighter = await createHighlighter({
            themes: ['github-dark'],
            langs: ['javascript', 'typescript', 'vue', 'python', 'cpp']
        });
        this.monaco.languages.register({ id: 'python' });
        shikiToMonaco(this.highlighter, this.monaco);
    }

    decodeStateFromUrl() {
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

    
    loadStateFromUrl() {
        const codeState = this.decodeStateFromUrl();
        if (codeState) {
            this.tabData = codeState;
        }
    }

    createInitialTabsAndEditors() {
        this.tabData.forEach(tab => {
            this.createTab(tab);
            this.createEditor(tab);
        });
    }

    createTab(tab) {
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
            this.removeTab(tab.id);
        });
        tabElement.appendChild(closeButton);

        tabElement.addEventListener('click', () => {
            this.switchTab(tab.id);
        });

        this.tabs.insertBefore(tabElement, document.querySelector('.tab.add'));
    }

    createAddButton() {
        const addButton = document.createElement('div');
        addButton.className = 'tab add';
        addButton.textContent = '+';
        addButton.addEventListener('click', () => {
            const name = prompt('Enter tab name:');
            if (name) {
                this.addTab(name);
            }
        });
        this.tabs.appendChild(addButton);
    }

    createEditor(tab) {
        const editorDiv = document.createElement('div');
        editorDiv.id = tab.id;
        editorDiv.className = 'editor';
        this.editorContainer.appendChild(editorDiv);

        const codeConfig = {
            value: tab.content,
            language: tab.id.endsWith('.py') ? 'python' : 'cpp',
            theme: 'github-dark',
            automaticLayout: true
        };

        this.editors[tab.id] = this.monaco.editor.create(editorDiv, codeConfig);
    }

    switchTab(tabId) {
        if (this.activeTab) {
            document.querySelector(`.tab[data-id="${this.activeTab}"]`).classList.remove('active');
            document.getElementById(this.activeTab).classList.remove('active');
        }

        this.activeTab = tabId;

        document.querySelector(`.tab[data-id="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        this.editors[tabId].layout();
    }

    addTab(name) {
        if (this.tabData.some(tab => tab.id === name)) {
            alert(`A tab with the name "${name}" already exists.`);
            return;
        }

        const id = name;
        const newTab = { id, content: '// New tab content' };
        this.tabData.push(newTab);

        this.createTab(newTab);
        this.createEditor(newTab);
        this.switchTab(id);
    }

    removeTab(tabId, confirmation = true) {
        if (confirmation && !confirm(`Are you sure you want to delete the tab "${tabId}"?`)) {
            return;
        }

        if (this.activeTab === tabId) {
            const index = this.tabData.findIndex(tab => tab.id === tabId);
            const nextTab = this.tabData[index + 1] || this.tabData[index - 1];
            this.activeTab = nextTab ? nextTab.id : null;
        }

        document.querySelector(`.tab[data-id="${tabId}"]`).remove();
        document.getElementById(tabId).remove();

        this.editors[tabId].dispose();
        delete this.editors[tabId];
        this.tabData = this.tabData.filter(tab => tab.id !== tabId);
    }

    removeAllTabs() {
        const tabIds = this.tabData.map(tab => tab.id);
        tabIds.forEach(tabId => this.removeTab(tabId, false));
    }

    getEditorState() {
        return this.tabData.map(tab => ({
            id: tab.id,
            content: this.editors[tab.id].getValue()
        }));
    }

    async getEditorStateAsZip() {
        const zip = new this.JSZip();
        this.tabData.forEach(tab => {
            zip.file(tab.id, this.editors[tab.id].getValue());
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'game_src.zip';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    createShareableLink() {
        const sourceCode = JSON.stringify(this.getEditorState());
        const compressed = serialiseState(sourceCode);
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?code=${compressed}`;
    }

    getEditors()
    {
        return this.editors
    }
}


export default CodeEditorManager;
