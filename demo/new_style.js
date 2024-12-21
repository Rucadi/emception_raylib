export const emscripten_css_replacement = `
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