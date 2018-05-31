class keyboard{
    keys = new [];
    constructor(){
        for (i = 0; i < 229; i++) { 
            keys[i] = this.setupKey(i);
        }

    }
    setupKey(keyCode){
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
        "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
        "keyup", key.upHandler.bind(key), false
        );
        return key;
    }
    getKey(keyCode){
        return keys[keyCode].isDown;
    }
}
