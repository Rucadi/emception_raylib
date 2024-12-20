export const miniBrowserTemplate = (url, src) => `
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
                    grid-template-columns: 40px 40px 40px;
                    align-items: center;
                    z-index: 999;
                    border-bottom: 1px solid #c5c4c2;
                    box-shadow: 0 0 5px rgba(0,0,0,0.5);
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
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='%23666666'%3E%3Cpath d='M6 16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v8z'/%3E%3C/svg%3E");
                    background-position: center center;
                }

                #fullscreen:hover {
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
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='%23666666'%3E%3Cpath d='M19 9l-7 7-7-7h4V3h6v6h4z'/%3E%3C/svg%3E");
                    background-position: center center;
                }

                #download:hover {
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
            </style>
        </head>
        <body>
            <div id="mini-browser">
                <div id="mini-browser-toolbar">
                <button id="refresh">
                <button id="download">
                <button id="fullscreen">
                </button></div>
                <iframe id="preview-frame" src="${src}"></iframe>
                <script>
                    document.getElementById("refresh").addEventListener("click", () => {
                        document.getElementById("preview-frame").src = "";
                        document.getElementById("preview-frame").src = "${src}";
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