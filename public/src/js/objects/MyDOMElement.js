export default class MyDOMElement extends Phaser.GameObjects.DOMElement {
    constructor(scene, x, y, element, style, innerText) {
        super(scene, x, y, element, style, innerText);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.element = element;
        this.style = style;
        this.innerText = innerText;
        scene.add.existing(this);
    }
    // ...
    setInnerText(innerText){
        this.setText(innerText);
    }

    getInnerText(){
        return this.innerText;
    }

    setStyle(style){
        this.style = style;
    }

    getStyle(){
        return this.style;
    }

    setPositionX(x){
        this.x = x;
    }

    setPositionY(y){   
        this.y = y;
    }
    setPosition(x, y){  
        this.x = x; 
        this.y = y;
    }


    getPositionX(){
        return this.x;
    }
    getPositionY(){
        return this.y;
    }

    setWidth(width){
        this.width = width;
    }
    setHeight(height){
        this.height = height;
    }

    // preUpdate(time, delta) {
    //     super.preUpdate(time, delta);
    // }
}