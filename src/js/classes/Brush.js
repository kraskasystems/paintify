class Brush {
  constructor(pElement){
    this.element = pElement;
    this.size = 3;
  }

  changeBrushSize(event) {

    if(event.deltaY < 0 && this.size < 200){
      this.size++;
    }

    if(event.deltaY > 0 && this.size > 1){
      this.size--;
    }
  }
}

export { Brush };
