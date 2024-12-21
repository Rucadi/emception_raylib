export const miniBrowserTemplate = (url, src) => `
    <html>
        <head>
            <title>Emception output preview</title>
            <style>
                html,
                body {
                    display: grid;
                    grid-template-rows: 1fr 0;
                    grid-template-columns: 1fr 0;
                    align-items: center;
                    justify-items: center;
                    margin: 0;
                    width: 100%;
                    height: 100%;
                }

                #mini-browser {
                    display: grid;
                    grid-template-rows: 40px 1fr;
                    grid-template-columns: 1fr;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                }

                #preview-frame {
                    width: 100%;
                    height: 100%;
                    border: none;
                }

                #mini-browser-toolbar {
                    background: #f6f5f3;
                    display: grid;
                    grid-template-columns: 40px 40px 40px 40px 40px 40px 40px 1fr;
                    align-items: center;
                    z-index: 999;
                    border-bottom: 1px solid #c5c4c2;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                }

                #preview-frame {
                    width: 100%;
                    height: 100%;
                    border: none;
                }

                #refresh {
                    margin: auto;
                    width: 30px;
                    height: 30px;
                    border: 1px solid #c5c4c2;
                    border-radius: 5px;
                    font-size: 20px;
                    display: grid;
                    align-items: center;
                    justify-items: center;
                    color: #333;
                    background-color: #f6f5f3;
                    box-sizing: border-box;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='%23666666'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3E%3C/svg%3E");
                    background-position: center center;
                    background-repeat: no-repeat;

                }

                #refresh:hover {
                    background-color: #c5c4c2
                }

                #fullscreen {
                    margin: auto;
                    width: 30px;
                    height: 30px;
                    border: 1px solid #c5c4c2;
                    border-radius: 5px;
                    font-size: 20px;
                    display: grid;
                    align-items: center;
                    justify-items: center;
                    color: #333;
                    background-color: #f6f5f3;
                    box-sizing: border-box;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-display' viewBox='0 0 16 16'%3E%3Cpath d='M0 4s0-2 2-2h12s2 0 2 2v6s0 2-2 2h-4q0 1 .25 1.5H11a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h.75Q6 13 6 12H2s-2 0-2-2zm1.398-.855a.76.76 0 0 0-.254.302A1.5 1.5 0 0 0 1 4.01V10c0 .325.078.502.145.602q.105.156.302.254a1.5 1.5 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.76.76 0 0 0 .254-.302 1.5 1.5 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.76.76 0 0 0-.302-.254A1.5 1.5 0 0 0 13.99 3H2c-.325 0-.502.078-.602.145'/%3E%3C/svg%3E");
                    background-position: center center;
                    background-repeat: no-repeat;
                }

                #fullscreen:hover {
                    background-color: #c5c4c2;
                }

                #share {
                    margin: auto;
                    width: 30px;
                    height: 30px;
                    border: 1px solid #c5c4c2;
                    border-radius: 5px;
                    font-size: 20px;
                    display: grid;
                    align-items: center;
                    justify-items: center;
                    color: #333;
                    background-color: #f6f5f3;
                    box-sizing: border-box;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-share' viewBox='0 0 16 16'%3E%3Cpath d='M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3'/%3E%3C/svg%3E");
                    background-position: center center;
                    background-repeat: no-repeat;

                }

                #share:hover {
                    background-color: #c5c4c2;
                }


                #publish {
                    margin: auto;
                    width: 30px;
                    height: 30px;
                    border: 1px solid #c5c4c2;
                    border-radius: 5px;
                    font-size: 20px;
                    display: grid;
                    align-items: center;
                    justify-items: center;
                    color: #333;
                    background-color: #f6f5f3;
                    box-sizing: border-box;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-arrow-up-square' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5 9.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z'/%3E%3C/svg%3E");
                    background-position: center center;
                    background-repeat: no-repeat;

                }

                #publish:hover {
                    background-color: #c5c4c2;
                }

                #download {
                    margin: auto;
                    width: 30px;
                    height: 30px;
                    border: 1px solid #c5c4c2;
                    border-radius: 5px;
                    font-size: 20px;
                    display: grid;
                    align-items: center;
                    justify-items: center;
                    color: #333;
                    background-color: #f6f5f3;
                    box-sizing: border-box;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-box-arrow-in-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1z'/%3E%3Cpath fill-rule='evenodd' d='M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z'/%3E%3C/svg%3E");
                    background-position: center center;
                    background-repeat: no-repeat;

                }

                #download:hover {
                    background-color: #c5c4c2;
                }


                #download-zip {
                    margin: auto;
                    width: 30px;
                    height: 30px;
                    border: 1px solid #c5c4c2;
                    border-radius: 5px;
                    font-size: 20px;
                    display: grid;
                    align-items: center;
                    justify-items: center;
                    color: #333;
                    background-color: #f6f5f3;
                    box-sizing: border-box;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-file-earmark-zip' viewBox='0 0 16 16'%3E%3Cpath d='M5 7.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v.938l.4 1.599a1 1 0 0 1-.416 1.074l-.93.62a1 1 0 0 1-1.11 0l-.929-.62a1 1 0 0 1-.415-1.074L5 8.438zm2 0H6v.938a1 1 0 0 1-.03.243l-.4 1.598.93.62.929-.62-.4-1.598A1 1 0 0 1 7 8.438z'/%3E%3Cpath d='M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1h-2v1h-1v1h1v1h-1v1h1v1H6V5H5V4h1V3H5V2h1V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z'/%3E%3C/svg%3E");
                    background-position: center center;
                    background-repeat: no-repeat;

                }

                #download-zip:hover {
                    background-color: #c5c4c2;
                }

                #compile {
                    margin: auto;
                    width: 30px;
                    height: 30px;
                    border: 1px solid #c5c4c2;
                    border-radius: 5px;
                    font-size: 20px;
                    display: grid;
                    align-items: center;
                    justify-items: center;
                    color: #333;
                    background-color: #f6f5f3;
                    box-sizing: border-box;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-file-play' viewBox='0 0 16 16'%3E%3Cpath d='M6 10.117V5.883a.5.5 0 0 1 .757-.429l3.528 2.117a.5.5 0 0 1 0 .858l-3.528 2.117a.5.5 0 0 1-.757-.43z'/%3E%3Cpath d='M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1'/%3E%3C/svg%3E");
                    background-position: center center;
                    background-repeat: no-repeat;

                }

                #compile:hover {
                    background-color: #c5c4c2;
                }



                #omnibar {
                    border: 1px solid #c5c4c2;
                    border-radius: 5px;
                    margin: 0 5px 0 0;
                    font-family: sans-serif;
                    font-size: 0.9em;
                    background: white;
                    height: 30px;
                    display: grid;
                    align-items: center;
                    padding: 0 5px;
                    color: #444;
                    box-sizing: border-box;
                }

                #powered-by {
                    justify-self: end;
                    /* This will push the powered-by text to the right */
                    font-size: 1em;
                    color: #333;
                    display: flex;
                    align-items: center;
                    margin-right: 5px;
                }

                #powered-by a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: bold;
                    margin-left: 3px;
                    margin-right: 3px;
                }

                #powered-by a:hover {
                    text-decoration: underline;
                }

            .toolbar-button {
                position: relative;
                display: inline-block;
            }

            .toolbar-button::before {
                content: attr(data-tooltip);
                position: absolute;
                visibility: hidden;
                opacity: 0;
                background-color: black;
                color: white;
                text-align: center;
                padding: 5px;
                border-radius: 6px;
                z-index: 1000;
                transition: opacity 0.3s;
                bottom: -35px;
                /* Adjust horizontal positioning to prevent going off-screen to the left */
                left: 0; /* Align to the left edge of the button */
                transform: none; /* Remove the center alignment */
                white-space: nowrap;
            }

            .toolbar-button:hover::before {
                visibility: visible;
                opacity: 1;
            }

            /* For the leftmost button specifically */
            .toolbar-button:first-child::before {
                /* Ensure tooltip doesn't go off-screen to the left for the first button */
                left: 0;
                right: auto;
            }



            </style>
        </head>
        <body>
            <div id="mini-browser">
                <div id="mini-browser-toolbar">
                    <button id="compile" class="toolbar-button" data-tooltip="Compile the code"></button>
                    <button id="refresh" class="toolbar-button" data-tooltip="Refresh the page"></button>
                    <button id="fullscreen" class="toolbar-button" data-tooltip="Toggle fullscreen"></button>
                    <button id="share" class="toolbar-button" data-tooltip="Share the code via link"></button>
                    <button id="download" class="toolbar-button" data-tooltip="Download the game"></button>
                    <button id="download-zip" class="toolbar-button" data-tooltip="Download the code"></button>
                    <button id="publish" class="toolbar-button" data-tooltip="Publish the content"></button>
                    </button>
                    <div id="powered-by">Powered by <a  target="_blank" rel="noopener noreferrer" href="https://emscripten.org/">Emscripten</a>  and <a  target="_blank" rel="noopener noreferrer" href="https://github.com/jprendes/emception">Emception</a></div>
                </div>
                <iframe id="preview-frame" src="${src}"></iframe>
                <script>
                    document.getElementById("refresh").addEventListener("click", () => {
                        document.getElementById("preview-frame").src = "";
                        document.getElementById("preview-frame").src = "${src}";
                    });

        document.getElementById("download-zip").addEventListener("click", () => {
                                    window.parent.getEditorStateAsZip();

                    });

                        // Download Button functionality
    document.getElementById("download").addEventListener("click", () => {
        const iframe = document.getElementById("preview-frame");
        const src = iframe.src;

        // Creating a blob with the HTML content of the iframe
        fetch(src)
            .then(response => response.text())
            .then(html => {
                const blob = new Blob([html], { type: 'text/html' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'game.html'; // Name the downloaded file
                link.click(); // Trigger the download
            })
            .catch(error => console.error("Download error:", error));
    });

        document.getElementById("compile").addEventListener("click", () => {
            window.parent.triggerCompilation();
    });

    document.getElementById("share").addEventListener("click", () => {
        if (window.parent && typeof window.parent.createShareableLink === 'function') {
            const link = window.parent.createShareableLink();  // Directly get the link since it's synchronous
            // Copy the link to clipboard
            navigator.clipboard.writeText(link).then(() => {
                // Notify the user that the link has been copied
                alert("The shareable link has been copied to your clipboard!");
            }).catch(err => {
                console.error('Could not copy text: ', err);
                alert("Failed to copy the link to clipboard.");
            });
        } else {
            console.error("Function 'createShareableLink' not found in parent window.");
            alert("Sharing functionality not available.");
        }
    });
    
    document.getElementById("publish").addEventListener("click", () => {
    alert("This feature is not available yet.");
});
    // Full-Screen Button functionality
 document.getElementById("fullscreen").addEventListener("click", () => {
        const iframe = document.getElementById("preview-frame");

        // Access the iframe's contentWindow
        const iframeWindow = iframe.contentWindow;

        // Make sure the iframe is within the correct context for fullscreen
        const pointerLockChecked = document.getElementById('pointerLock')?.checked || false;
        const resizeChecked = document.getElementById('resize')?.checked || false;

        // Call Module.requestFullscreen within the iframe context
        if (iframeWindow.Module && iframeWindow.Module.requestFullscreen) {
            iframeWindow.Module.requestFullscreen(pointerLockChecked, resizeChecked);
        } else {
            console.error("Module.requestFullscreen is not available in iframe context.");
        }
    })
                </script>
            </div>
        </body>
    <html>
`;

export const previewTemplate = (icon, title, message) => `
    <html>
        <head>
            <title>Emception output preview</title>
            <style>
                html, body {
                    display: grid;
                    grid-template-rows: 1fr 0;
                    grid-template-columns: 1fr 0;
                    align-items: center;
                    justify-items: center;
                }
                #title,
                #message {
                    font-family: Roboto, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                #icon,
                #title,
                #message {
                    display: grid;
                    align-items: center;
                    justify-items: center;
                }
            </style>
        </head>
        <body>
            <div id="container">
                <h1 id="title">${title}</h1>
                <div id="icon">${icon}</div>
                <div id="message">${message}</div>
            </div>
        </body>
    </html>
`;

export const spinner = (size) => `
    <div style="font-size: calc(${size}px / 13)">
        <div style="width: 13em;height: 13em;overflow: hidden;align-items: center;justify-items: center;display: grid;padding: 2em;">
            <style>
                .loader,
                .loader:after {
                    border-radius: 50%;
                    width: 10em;
                    height: 10em;
                }
                .loader {
                    margin: 0;
                    position: relative;
                    text-indent: -9999em;
                    border-top: 1.1em solid rgba(51, 102, 153, 0.2);
                    border-right: 1.1em solid rgba(51, 102, 153, 0.2);
                    border-bottom: 1.1em solid rgba(51, 102, 153, 0.2);
                    border-left: 1.1em solid #336699;
                    -webkit-transform: translateZ(0);
                    -ms-transform: translateZ(0);
                    transform: translateZ(0);
                    -webkit-animation: load8 1.1s infinite linear;
                    animation: load8 1.1s infinite linear;
                }
                @-webkit-keyframes load8 {
                    0% {
                        -webkit-transform: rotate(0deg);
                        transform: rotate(0deg);
                    }
                    100% {
                        -webkit-transform: rotate(360deg);
                        transform: rotate(360deg);
                    }
                }
                @keyframes load8 {
                    0% {
                        -webkit-transform: rotate(0deg);
                        transform: rotate(0deg);
                    }
                    100% {
                        -webkit-transform: rotate(360deg);
                        transform: rotate(360deg);
                    }
                }
            </style>
            <div class="loader"></div>
        </div>
    </div>
`;