import '@/css/style.css';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faPaintBrush, faEraser, faUndo, faLayerGroup, faEye, faTrash, faTint, faBomb, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import { getRandomInt } from '../util/randomInt';

import config from '../config/paintify.config';

library.add( faPaintBrush, faEraser, faCircle, faUndo, faLayerGroup, faEye, faTrash, faTint, faBomb, faPlusCircle, faSquare, faCircle);
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
const createCanvas = function (pStage, pId){
  let elem = document.createElement('canvas');

  elem.setAttribute('class', 'layer');
  elem.setAttribute('id', pId);
  elem.setAttribute('width', pStage.clientWidth );
  elem.setAttribute('height', pStage.clientHeight );

  pStage.appendChild(elem);

  return elem;
};

const thicknessElem = document.getElementById('strokeHelper');

const drawStrokeThickness = (pElem, pEvent) => {

  let width = brushSize;
  let height = brushSize;
  let top = pEvent.clientY - brushSize / 2;
  let left = pEvent.clientX - 70 - brushSize / 2;

  pElem.setAttribute('style', `width: ${width}px; height: ${height}px; top: ${top}px; left: ${left}px`);
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
      activeColor = document.getElementById(event.target.id).getAttribute('data-key');
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

  drawStrokeThickness(thicknessElem, event);
};

// ********* TOOLING ******** //
let activeTool = 'draw';

// ********* CLEAR LAYER ********* //
let activeLayer = null;
const clearLayer = (pLayer, pContext) => {
  pContext.clearRect(0,0, pLayer.width, pLayer.height);
};

// ******** COLOR BOMB ********** //
const colorBomb = (pLayer) => {
  activeTool = 'bomb';

  const ctx = pLayer.getContext('2d');

  for(let i = 0; i < 1000; i++){
    let randomColorHex = colorSet[getRandomInt(0, colorSet.length-1)].hexValue;
    let randomX = getRandomInt(70, pLayer.clientWidth);
    let randomY = getRandomInt(0, pLayer.clientHeight);
    let randomRad = getRandomInt(0,200);

    ctx.beginPath();
    ctx.fillStyle = randomColorHex;
    ctx.arc(randomX, randomY, randomRad, 0, Math.PI * 2, true);
    ctx.stroke();
  }
};

///////////////////////////////////////////////////////
// INIT ///////////////////////////////////
//////////////////////////////////////////////////////
const init = function (){

  // ******** STAGE ********* //
  // get the stage for all layers
  const stage = document.getElementById('stage');

  // ******** CANVAS ********* //
  // create a new canvas element and add it to the stage
  const canvas = createCanvas(stage, 'canvas');
  // get canvas context
  const ctx = canvas.getContext('2d');

  activeLayer = canvas;

  // ******* DRAWING *********** //
  const draw = (event) => {
    if(event.buttons === 1){
      let color = `#${colorSet[activeColor].hexValue}`;

      ctx.beginPath();
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;

      if(activeTool === 'eraser'){
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(position.x, position.y);
      setPosition(event);
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
    }

    drawStrokeThickness(thicknessElem, event);
  };

  // add eventlisteners for drawing
  window.addEventListener( 'mousemove', draw);
  window.addEventListener( 'mousedown', setPosition );
  window.addEventListener( 'mouseenter', setPosition );
  window.addEventListener( 'wheel', changeBrushSize);

  const toolEraser = document.getElementById('toolEraser');

  toolEraser.addEventListener('click', () => {activeTool = 'eraser';});

  const toolReset = document.getElementById('toolReset');

  toolReset.addEventListener('click', () => {clearLayer(activeLayer, ctx);});

  const toolBrush = document.getElementById('toolBrush');

  toolBrush.addEventListener('click', () => {activeTool = 'brush';});

  const toolCircle = document.getElementById('toolCircle');

  toolCircle.addEventListener('click', () => {activeTool = 'circle';});

  const toolRectangle = document.getElementById('toolRectangle');

  toolRectangle.addEventListener('click', () => {activeTool = 'rectangle';});

  const toolBomb = document.getElementById('toolBomb');

  toolBomb.addEventListener('click', () => { colorBomb(canvas); });

  setConfiguredColors(colorSet, colorPalette);
};

window.addEventListener('load', init);
