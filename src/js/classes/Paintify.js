import { Brush } from './Brush';
import { LayerStack } from './LayerStack';
import { save, load } from '../util/fakeServer';
import { calculateDistance } from '../util/calculateDistance';
import { getRandomInt } from '../util/randomInt';

class Paintify {
  constructor({ config: pConfig }){
    this.config = pConfig;
    this.drawPosition = {x: 0, y: 0};
    this.distanceFrom = {x: 0, y: 0};
    this.activeTool = '';
    this.activeColor = '';
    this.activeLayer = '';
    this.actionsModal = false;
    this.domElements = {};
    this.domControls = {};

    this.activateLayer = this.activateLayer.bind(this);
    this.initApp();
  }

  initApp(){
    const config = this.config;
    const domElements = this.domElements;

    // set configured dom elements
    Object.keys(config.dom).forEach((key) => {
      domElements[key] = document.getElementById(config.dom[key]);
    });

    // initialize brush
    this.initBrush(domElements);

    // initialize eraser
    this.initEraser(domElements);

    // initialize circle tool
    this.initCircleTool(domElements);

    // initialize rectangle tool
    this.initRectTool(domElements);

    // initialize color bomb
    this.initColorBomb(domElements);

    // initialize color palette
    this.initColorPalette(config, domElements);

    // initialize layer stack
    this.initLayerStack(domElements.stage, domElements.layerSystemWrapper);

    // init windowListeners
    this.initWindowListeners();

    // initialize further buttons
    domElements.reset.addEventListener('click', () => { this.layerStack.reset(); this.layerStack.createCanvas(); });
    domElements.addLayer.addEventListener('click', () => { this.addLayer(); });
    domElements.menuToggle.addEventListener('click', () => { this.toggleMenu(); });
    domElements.menuClose.addEventListener('click', () => { this.toggleMenu(); });
    domElements.saveProject.addEventListener('click', () => { this.saveProject(); });
    domElements.loadProject.addEventListener('click', () => { this.loadProject(); });
    domElements.downloadImage.addEventListener('click', () => { this.downloadMergedImage();});
    domElements.downloadActiveLayer.addEventListener('click', () => {this.downloadLayerImage();});
  }

  initBrush(dom){
    // initialize paintify brush instance
    this.brush = new Brush(dom.brush);
    this.brush.element.addEventListener('click', () => {
      this.activeTool = 'brush';
      this.setActiveToolClass('brush');
    });
    this.domControls['brush'] = this.brush.element;
    this.activeTool = 'brush';
  }

  initEraser(dom){
    // initialize paintify eraser instance
    this.eraser = new Brush(dom.eraser);
    this.domControls['eraser'] = this.eraser.element;
    this.eraser.element.addEventListener('click', () => {
      this.activeTool = 'eraser';
      this.setActiveToolClass('eraser');
    });
  }

  initCircleTool(dom){
    dom.circle.addEventListener('click', () => {
      this.activeTool = 'circle';
      this.setActiveToolClass('circle');
    });

    this.domControls['circle'] = dom.circle;
  }

  initRectTool(dom){
    dom.rectangle.addEventListener('click', () => {
      this.activeTool = 'rectangle';
      this.setActiveToolClass('rectangle');
    });

    this.domControls['rectangle'] = dom.rectangle;
  }

  initColorBomb(dom){
    dom.colorBomb.addEventListener('click', () => {
      this.activeTool = 'bomb';
      this.setActiveToolClass('bomb');
    });

    this.domControls['bomb'] = dom.colorBomb;
  }

  initColorPalette(config, controls){
    let i = 0;

    config.colorSet.forEach((color) => {
      let elem = document.createElement('div');

      elem.setAttribute('class', 'colorElement');
      elem.setAttribute('data-value', color.hexValue);
      elem.setAttribute('id', color.name);
      elem.setAttribute('data-key', i);
      elem.setAttribute('style', `background-color: #${color.hexValue}`);

      elem.addEventListener('click', (event) => {
        this.activeColor = document.getElementById(event.target.id).getAttribute('data-value');
      });

      controls.colorPalette.appendChild(elem);
      i++;
    });

    this.activeColor = config.colorSet[0].hexValue;
  }

  initLayerStack(stage, layerWrapper){
    this.layerStack = new LayerStack(stage, layerWrapper, this.activateLayer);
    this.activeLayer = this.layerStack.layers[0];
  }

  initWindowListeners(){
    this.domElements.stage.addEventListener('mousemove', (e) => {
      this.draw(e);
      this.drawStrokeThickness(e);
    });
    this.domElements.stage.addEventListener('mousedown', (e) => {
      this.setDrawPosition(e);
      this.setMeasurePosition(e);
    });
    this.domElements.stage.addEventListener('mouseenter', (e) => {
      this.setDrawPosition(e);
    });
    this.domElements.stage.addEventListener('wheel', (e) => {
      this.setBrushSize(e);
      this.drawStrokeThickness(e);
    });
  }

  addLayer(){
    this.layerStack.createCanvas();
  }

  activateLayer(pLayer){
    this.activeLayer = pLayer;
  }

  setActiveToolClass(pTool){
    const tools = this.domControls;

    Object.keys(tools).forEach((key) => {
      if(pTool === key){
        tools[key].classList.add('active');
      } else {
        tools[key].classList.remove('active');
      }
    });
  }

  setDrawPosition(event){
    this.drawPosition.x = event.clientX - 70;
    this.drawPosition.y = event.clientY;
  }

  setMeasurePosition(event){
    this.distanceFrom.x = event.clientX - 70;
    this.distanceFrom.y = event.clientY;
  }

  draw(event){
    if(!this.actionsModal){
      // get active layer context
      const ctx = this.activeLayer.getContext('2d');

      // set active color as css hex value
      let color = `#${this.activeColor}`;

      if(event.buttons === 1){
        switch(this.activeTool){
        case 'eraser':
          this.erase( event, ctx);
          break;
        case 'brush':
          this.drawBrushStroke( event, ctx, color);
          break;
        case 'circle':
          this.setDrawPosition(event);
          this.drawCircle(ctx, color);
          break;
        case 'rectangle':
          this.setDrawPosition(event);
          this.drawRectangle(ctx, color);
          break;
        case 'bomb':
          this.setDrawPosition(event);
          this.drawBomb(ctx);
          break;
        }

      }
    }
  }

  drawBrushStroke(event, ctx, color){
    ctx.beginPath();
    ctx.lineWidth = this.brush.size;
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.moveTo(this.drawPosition.x, this.drawPosition.y);
    this.setDrawPosition(event);
    ctx.lineTo(this.drawPosition.x, this.drawPosition.y);
    ctx.stroke();
    ctx.closePath();
  }

  erase(event, ctx){
    ctx.beginPath();
    ctx.lineWidth = this.eraser.size;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.moveTo(this.drawPosition.x, this.drawPosition.y);
    this.setDrawPosition(event);
    ctx.lineTo(this.drawPosition.x, this.drawPosition.y);
    ctx.stroke();
    ctx.closePath();
  }

  drawCircle(ctx, color) {
    let dist = calculateDistance(this.drawPosition, this.distanceFrom);

    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
    ctx.arc(this.distanceFrom.x , this.distanceFrom.y , dist ,0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }

  drawRectangle(ctx, color) {
    let xLen = Math.abs(this.distanceFrom.x - this.drawPosition.x);
    let yLen = Math.abs(this.distanceFrom.y - this.drawPosition.y);

    ctx.beginPath();
    ctx.fillRect(this.distanceFrom.x , this.distanceFrom.y, xLen, yLen);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }

  drawBomb(ctx){
    let colorSet = this.config.colorSet;
    let color = 0;
    let rad = 0;
    let distX = 0;
    let distY = 0;

    for(let i = 0; i < 50; i++){
      color = colorSet[getRandomInt(0, colorSet.length)].hexValue;
      rad = getRandomInt(5, 25);
      distX = getRandomInt(-250, 250);
      distY = getRandomInt(-250,250);

      ctx.beginPath();
      ctx.globalCompositeOperation = 'source-over';
      ctx.arc(this.drawPosition.x + distX, this.drawPosition.y + distY, rad ,0, Math.PI * 2);
      ctx.fillStyle = `#${color}`;
      ctx.fill();
      ctx.closePath();
    }
  }

  setBrushSize(event){
    const activeTool = this.activeTool;
    let tool = this.brush;

    if(activeTool === 'eraser'){
      tool = this.eraser;
    }

    tool.changeBrushSize(event);
  }

  drawStrokeThickness(event){

    const thicknessElem = document.getElementById('strokeHelper');

    if(!this.actionsModal && (this.activeTool === 'brush' || this.activeTool === 'eraser')){


      const activeTool = this.activeTool;
      let tool = this.brush;

      if(activeTool === 'eraser'){
        tool = this.eraser;
      }
      let width = tool.size;
      let height = tool.size;
      let top = event.clientY - tool.size / 2;
      let left = event.clientX - 70 - tool.size / 2;

      thicknessElem.setAttribute('style', `width: ${width}px; height: ${height}px; top: ${top}px; left: ${left}px`);
    } else {
      thicknessElem.setAttribute('style', 'width: 0px; height: 0px; top: -100px; left: -100px');
    }
  }

  saveProject(){
    const layers = this.layerStack.layers;
    const project = {};

    layers.forEach( layer => {
      project[layer.id] = layer.toDataURL('image/png');
    });

    save(project, () => { alert('Project Saved');});
  }

  loadProject(){
    const project = (err, data) => {this.layerStack.restore(data);};

    load(project);
  }

  downloadMergedImage(){
    // create new canvas element to merge all layers
    const merged = this.layerStack.createCanvas();
    const layers = this.layerStack.layers;
    const ctx = merged.getContext('2d');

    layers.forEach((layer) => {
      ctx.drawImage(layer, 0,0);
    });

    this.downloadLayerImage();

    this.layerStack.deleteLayer(merged.id);
  }

  downloadLayerImage(){
    const image = this.activeLayer.toDataURL('image/png');
    const tmpLink = document.createElement('a');

    tmpLink.download = 'paintify.png';
    tmpLink.href = image;

    document.body.appendChild(tmpLink);
    tmpLink.click();
    document.body.removeChild(tmpLink);
  }

  toggleMenu() {
    if(this.actionsModal){
      this.actionsModal = false;
      document.getElementById('actionsModal').classList.add('closed');
    } else {
      this.actionsModal = true;
      document.getElementById('actionsModal').classList.remove('closed');
    }
  }
}

export { Paintify };
