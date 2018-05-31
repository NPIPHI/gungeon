
class Keyboard {

    map: { [keyCode: number]: boolean } = {};

    constructor() {
        window.addEventListener('keydown', evt => {
            this.map[evt.keyCode] = true;
        })
        window.addEventListener('keyup', evt => {
            this.map[evt.keyCode] = false;
        })
    }

    getKey(code: number): boolean {
        return !!this.map[code];
    }


}
let kbrd = new Keyboard;
export default kbrd;