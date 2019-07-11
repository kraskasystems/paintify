import { Brush } from './Brush';
import { LayerStack } from './LayerStack';

class Paintify {
  constructor({config: pConfig, domElements: pDomElements}){
    this.config = pConfig;
    this.drawPosition = {x: 0, y: 0};
    this.activeTool = '';
    this.activeColor = '';
    this.activeLayer = '';
    this.domControls = {};

    this.activateLayer = this.activateLayer.bind(this);

    this.initTools(pDomElements, pConfig);
  }

  initTools(dom, config){
    // initialize brush
    this.initBrush(dom);

    // initialize eraser
    this.initEraser(dom);

    // initialize color palette
    this.initColorPalette(config, dom);

    // initialize layer stack
    this.initLayerStack(dom.stage, dom.layerSystemWrapper);
  }

  initBrush(dom){
    // initialize paintify brush instance
    this.brush = new Brush(dom.brush);
    this.brush.element.addEventListener('click', () => {
      this.activeTool = 'brush';
      this.setActiveClass('brush');
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
      this.setActiveClass('eraser');
    });
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
        console.log(this.activeColor);
      });

      controls.colorPalette.appendChild(elem);
      i++;
    });
  }

  initLayerStack(stage, layerWrapper){
    this.layerStack = new LayerStack(stage, layerWrapper, this.activateLayer);
    this.activeLayer = this.layerStack.layers[0];
  }

  addLayer(){
    this.layerStack.createCanvas();
  }

  clearLayer(){
    const layer = this.activeLayer;
    const context = layer.getContext('2d');

    context.clearRect(0,0, layer.width, layer.height);
  }

  activateLayer(pLayer){
    this.activeLayer = pLayer;
  }

  setActiveClass(pTool){
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
    this.drawPosition.x = event.clientX - 65;
    this.drawPosition.y = event.clientY;
  }

  draw(event){
    const ctx = this.activeLayer.getContext('2d');

    if(event.buttons === 1){
      let color = `#${this.activeColor}`;

      ctx.beginPath();

      switch(this.activeTool){
      case 'eraser':
        ctx.lineWidth = this.eraser.size;
        ctx.globalCompositeOperation = 'destination-out';
        break;
      case 'brush':
        ctx.lineWidth = this.brush.size;
        ctx.globalCompositeOperation = 'source-over';
        break;
      }

      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.moveTo(this.drawPosition.x, this.drawPosition.y);
      this.setDrawPosition(event);
      ctx.lineTo(this.drawPosition.x, this.drawPosition.y);
      ctx.stroke();
    }
  }

  setBrushSize(event){
    const activeTool = this.activeTool;
    let tool = this.brush;

    if(activeTool === 'eraser'){
      tool = this.eraser;
    }

    console.log(tool.size);
    tool.changeBrushSize(event);
  }

  drawStrokeThickness(event){
    const thicknessElem = document.getElementById('strokeHelper');
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
  }
}

export { Paintify };
