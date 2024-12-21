import { Terminal } from 'xterm'; // Assuming you're using xterm.js
import { FitAddon } from 'xterm-addon-fit'; // Assuming you're using xterm's FitAddon


export class TerminalManager {
    constructor(containerId, comlink, emception) {
      this.containerId = containerId;
      this.terminal = null;
      this.terminalFitAddon = null;
      this.comlink = comlink;
      this.emception = emception;

    }
  
    async init() {
      const terminalContainer = document.getElementById(this.containerId);
      this.terminal = new Terminal({
        convertEol: true,
        theme: {
          background: "#1e1e1e",
          foreground: "#d4d4d4",
        },
      });
      this.terminal.open(terminalContainer);
  
      this.terminalFitAddon = new FitAddon();
      this.terminal.loadAddon(this.terminalFitAddon);
  
      window.addEventListener("resize", () => {
        this.terminalFitAddon.fit();
      });

      this.emception.onstdout = this.comlink.proxy((str) => this.terminal.write(str + "\n"));
      this.emception.onstderr = this.comlink.proxy((str) => this.terminal.write(str + "\n"));
    }
  

    reset() {
      this.terminal.reset();
    }
  
    write(message) {
      this.terminal.write(message);
    }
  
    fit() {
      this.terminalFitAddon.fit();
    }
  }
  
export default TerminalManager;
