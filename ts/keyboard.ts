//import {controller} from "./gameEngine";


class Keyboard {
    mouseX: number=0;
    mouseY: number=0;
    leftDown: boolean;
    leftToggle: boolean;
    rightDown: boolean;
    rightToggle: boolean;
    middleDown: boolean;
    middleToggle: boolean;
    APressed: boolean = false;
    BPressed: boolean = false;
    XPressed: boolean = false;
    YPressed: boolean = false;
    map: { [keyCode: number]: boolean } = {};
    toggleMap: { [keyCode: number]: boolean } = {};

    constructor() {
        window.addEventListener('keydown', evt => {
            if(!this.map[evt.keyCode]){
                this.toggleMap[evt.keyCode] = true;
            } else{
                this.toggleMap[evt.keyCode] = false;
            }
            if(evt.keyCode == 9){
                evt.preventDefault();
            }
            //console.log(evt.keyCode);
            this.map[evt.keyCode] = true;
        })
        window.addEventListener('keyup', evt => {
            this.map[evt.keyCode] = false;
            this.toggleMap[evt.keyCode] = false;
        })
        window.addEventListener('mousemove', evt => {
            this.mouseX = evt.x;
            this.mouseY = evt.y;
        });
        window.addEventListener('mousedown', evt =>{
            switch(evt.which){
                case 1:
                    this.leftToggle = true;
                    this.leftDown = true;
                    break;
                case 2:
                    this.middleToggle = true;
                    this.middleDown = true;
                    break;
                case 3:
                    this.rightToggle = true;                   
                    this.rightDown = true;
                    break;

            }
        });
        window.addEventListener("mouseup", evt =>{
            switch(evt.which){
                case 1:
                    this.leftDown = false;
                    this.leftToggle = false;
                    break;
                case 2:
                    this.middleDown = false;
                    this.middleToggle = false;
                    break;
                case 3:
                    this.rightDown = false;
                    this.rightToggle = false;
                    break;

            }
        });
    }

    getKey(code: number): boolean {
        return !!this.map[code];
    }
    getToggle(code: number): boolean {
        return !!this.toggleMap[code];
    }
    getMouse(clickType: number): boolean{//1 is left, 2 is middle, 3 is right
        switch(clickType){
            case 1: 
                return this.leftDown;
            case 2: 
                return this.middleDown;
            case 3: 
                return this.rightDown;
        }
    }
    getMouseToggle(clickType: number): boolean{
        switch(clickType){
            case 1: 
                return this.leftToggle;
            case 2: 
                return this.middleToggle;
            case 3: 
                return this.rightToggle;
        }
    }
    resetToggle(){
        this.leftToggle = false;
        this.middleToggle = false;
        this.rightToggle = false;
        for(let i = 0; i < 250; i++){
            this.toggleMap[i]=false;
        }
    }
    /*contollerCheck(){
        controller1 = controller[0];
        let i=0;
        controller1.buttons.forEach(but=>{
            if(but.pressed){
                console.log(i);
            }
            i++;
        });
    }*/
}
//let controller1: Gamepad;
let kbrd = new Keyboard;
export default kbrd;