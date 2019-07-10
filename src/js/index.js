import '@/css/style.css';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faPaintBrush, faEraser, faCircle, faUndo, faLayerGroup, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import config from '../config/paintify.config';

library.add( faPaintBrush, faEraser, faCircle, faUndo, faLayerGroup, faEye, faTrash);
dom.i2svg();

/*
* Attention follow these rules:
* 1. Use strict mode: "use strict"
* 2. Use single quotes -> eslint set
* 3. Use function expression -> eslint set
* 4. Name variables in camelCase -> eslint set
* 5. Clean commenting ->
* 6. Clear structure (new lines / group code) -> eslint set
* 7. Cleanup before production
*/

// create a canvas Element
const createCanvas = function (pStage){
  let elem = document.createElement('canvas');

  elem.setAttribute('class', 'layer');
  elem.setAttribute('id', 'canvas');
  elem.setAttribute('width', pStage.clientWidth );
  elem.setAttribute('height', pStage.clientHeight );

  return elem;
};

// ********* POSITIONING ********* //
// const to be used to keep updated position
const position = {x: 0, y: 0};

const setPosition = (event) => {
  position.x = event.clientX - 65;
  position.y = event.clientY;
};

// ******** COLORING ************ //
// variable to change color state values
let activeColor = 1;
const colorSet = config.colorSet;

const colorPalette = document.getElementById('colorPalette');

const setConfiguredColors = (pColors, pPalette) => {
  let i = 0;

  pColors.forEach((color) => {
    let elem = document.createElement('div');

    elem.setAttribute('class', 'colorElement');
    elem.setAttribute('data-value', color.hexValue);
    elem.setAttribute('id', color.name);
    elem.setAttribute('data-key', i);
    elem.setAttribute('style', `background-color: #${color.hexValue}`);

    elem.addEventListener('click', (event) => {
      const paletteKey = document.getElementById(event.target.id).getAttribute('data-key');

      activeColor = paletteKey;
    });

    pPalette.appendChild(elem);
    i++;
  });
};

// ********* BRUSH SIZING ******** //
let brushSize = 3;
const changeBrushSize = (event) => {
  if(event.deltaY < 0 && brushSize < 200){
    brushSize++;
  }
  if(event.deltaY > 0 && brushSize > 1){
    brushSize--;
  }
};

// ********* TOOLING ******** //
let currentTool = 'draw';

// ********* CLEAR LAYER ********* //
let activeLayer = null;
const clearLayer = (pLayer, pContext) => {
  pContext.clearRect(0,0, pLayer.width, pLayer.height);
};

const init = function (){

  // ******** STAGE ********* //
  // get the stage for all layers
  const stage = document.getElementById('stage');

  // ******** CANVAS ********* //
  // create a new canvas element and add it to the stage
  const canvas = createCanvas(stage);
  // get canvas context
  const ctx = canvas.getContext('2d');

  // append canvas layer to stage
  stage.appendChild(canvas);

  activeLayer = canvas;

  // ******* DRAWING *********** //
  const draw = (event) => {
    if(event.buttons === 1){
      let color = `#${colorSet[activeColor].hexValue}`;

      ctx.beginPath();
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;

      if(currentTool === 'eraser'){
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(position.x, position.y);
      setPosition(event);
      console.log(position);
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
    }
  };

  // add eventlisteners for drawing
  window.addEventListener( 'mousemove', draw);
  window.addEventListener( 'mousedown', setPosition );
  window.addEventListener( 'mouseenter', setPosition );
  window.addEventListener( 'wheel', changeBrushSize);

  const toolEraser = document.getElementById('toolEraser');

  toolEraser.addEventListener('click', () => {currentTool = 'eraser';});

  const toolReset = document.getElementById('toolReset');

  toolReset.addEventListener('click', () => {clearLayer(activeLayer, ctx);});

  const toolBrush = document.getElementById('toolBrush');

  toolBrush.addEventListener('click', () => (currentTool = 'brush'));

  setConfiguredColors(colorSet, colorPalette);
};

window.addEventListener('load', init);
