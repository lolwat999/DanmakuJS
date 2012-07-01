define(function(require) {

var Input = {
    events: {},
    
    keyState: [],
    
    mousePosition: [ 0, 0 ],
    
    mouseDelta: [ 0, 0 ],
    
    mouseDown: -1,

    onMouseDown: function (event) {
        this.mouseDown = event.which;
        this.mousePosition = [event.pageX - event.target.offsetLeft, event.pageY - event.target.offsetTop];
        if (this.events.mouseDown) {
            this.events.mouseDown(this, this.mousePosition, this.keyState);
        }
    },

    onMouseUp: function (event) {
        this.mouseDown = -1;
        this.mousePosition = [event.pageX - event.target.offsetLeft, event.pageY - event.target.offsetTop];
        this.isDragging = false;
        if (this.events.mouseUp) {
            this.events.mouseUp(this, this.mousePosition, this.keyState);
        }
    },

    onMouseMove: function (event) {
        var mouseDelta = [];

        var npos = [event.pageX - event.target.offsetLeft, event.pageY - event.target.offsetTop];
        
        if (this.mouseDown !== -1) {
            this.isDragging = true;
        }

        mouseDelta[0] = npos[0] - this.mousePosition[0];
        mouseDelta[1] = npos[1] - this.mousePosition[1];

        this.mousePosition = npos;
        this.mouseDelta = mouseDelta;

        if (this.events.mouseMove) {
            this.events.mouseMove(this, this.mousePosition, mouseDelta, this.keyState);
        }
    },

    onMouseWheel: function (event) {
        var delta = event.wheelDelta ? event.wheelDelta : (-event.detail * 100.0);

        if (this.events.mouseWheel) {
            this.events.mouseWheel(this, this.mousePosition, delta, this.keyState);
        }
    },

    onKeyDown: function (event) {
        var keyCode = event.keyCode;              
        var kpResult = null;
    
        if (this.events.keyPress) {
            kpResult = this.events.keyPress(this, this.mousePosition, keyCode, this.keyState);

            if (kpResult !== undefined) {
                this.keyState[keyCode] = !!kpResult;
            } else {
                this.keyState[keyCode] = true;
            }
        } else {
            this.keyState[keyCode] = true;
        }

        if (!this.keyState[keyCode]) {
            return;
        }

        if (this.events.keyDown) {
            kpResult = this.events.keyDown(this, this.mousePosition, keyCode, this.keyState);

            if (kpResult !== undefined) {
                this.keyState[keyCode] = !!kpResult;
            } else {
                this.keyState[keyCode] = true;
            }
        }
    }, 

    onKeyUp: function (event) {
        var keyCode = event.keyCode;
    
        if (this.events.keyUp) {
            this.events.keyUp(this, this.mousePosition, keyCode, this.keyState);
        }
         
        this.keyState[keyCode] = false;
    },
    
    isMousePressed: function() {
        return this.mouseDown !== -1;
    },
    
    isKeyPressed: function(keyCode) {
        return this.keyState[keyCode];          
    },

    setEvents: function (callback_obj) {
        this.events = {};
        for (var i in callback_obj) {
            this.bindevent(i, callback_obj[i]);
        }
    },
    
    bindEvent: function (event_id, event_func) {
        if (event_func === undefined) {
            this.events[event_id] = this.eventDefaults[event_id];
        } else {
            this.events[event_id] = event_func;
        }
    },

    unbindevent: function (event_id) {
        this.bindEvent(event_id, null);
    },

    bind: function (element) {
        this.element = element;
        this.onMouseMove = _.bind(this.onMouseMove, this);
        this.onMouseDown = _.bind(this.onMouseDown, this);
        this.onMouseUp = _.bind(this.onMouseUp, this);
        this.onMouseWheel = _.bind(this.onMouseWheel, this);
        this.onKeyDown = _.bind(this.onKeyDown, this);
        this.onKeyUp = _.bind(this.onKeyUp, this);
        this.element.addEventListener('mousemove', this.onMouseMove, false);
        this.element.addEventListener('mousedown', this.onMouseDown, false);
        this.element.addEventListener('mouseup', this.onMouseUp, false);
        this.element.addEventListener('mousewheel', this.onMouseWheel, false);
        this.element.addEventListener('DOMMouseScroll', this.onMouseWheel, false);
        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('keyup', this.onKeyUp, false);
    },

    unbind: function () {
        this.element.removeEventListener('mousemove', this.onMouseMove, false);
        this.element.removeEventListener('mousedown', this.onMouseDown, false);
        this.element.removeEventListener('mouseup', this.onMouseUp, false);
        this.element.removeEventListener('mousewheel', this.onMouseWheel, false);
        this.element.removeEventListener('DOMMouseScroll', this.onMouseWheel, false);
        window.removeEventListener('keydown', this.onKeyDown, false);
        window.removeEventListener('keyup', this.onKeyUp, false);
    },

    mouseInsideelement: function(event) {
        var $element = WebDCC.get$element();
        var x = event.elementX, y = event.elementY; 
        return (!( x < 0 || y < 0 ||  
            x > $element.width() || y > $element.height() ));
    },
    
    keys: {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAUSE: 19,
        CAPS_LOCK: 20,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40,
        INSERT: 45,
        DELETE: 46,
        KEY_0: 48,
        KEY_1: 49,
        KEY_2: 50,
        KEY_3: 51,
        KEY_4: 52,
        KEY_5: 53,
        KEY_6: 54,
        KEY_7: 55,
        KEY_8: 56,
        KEY_9: 57,
        KEY_A: 65,
        KEY_B: 66,
        KEY_C: 67,
        KEY_D: 68,
        KEY_E: 69,
        KEY_F: 70,
        KEY_G: 71,
        KEY_H: 72,
        KEY_I: 73,
        KEY_J: 74,
        KEY_K: 75,
        KEY_L: 76,
        KEY_M: 77,
        KEY_N: 78,
        KEY_O: 79,
        KEY_P: 80,
        KEY_Q: 81,
        KEY_R: 82,
        KEY_S: 83,
        KEY_T: 84,
        KEY_U: 85,
        KEY_V: 86,
        KEY_W: 87,
        KEY_X: 88,
        KEY_Y: 89,
        KEY_Z: 90,
        LEFT_META: 91,
        RIGHT_META: 92,
        SELECT: 93,
        NUMPAD_0: 96,
        NUMPAD_1: 97,
        NUMPAD_2: 98,
        NUMPAD_3: 99,
        NUMPAD_4: 100,
        NUMPAD_5: 101,
        NUMPAD_6: 102,
        NUMPAD_7: 103,
        NUMPAD_8: 104,
        NUMPAD_9: 105,
        MULTIPLY: 106,
        ADD: 107,
        SUBTRACT: 109,
        DECIMAL: 110,
        DIVIDE: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        NUM_LOCK: 144,
        SCROLL_LOCK: 145,
        SEMICOLON: 186,
        EQUALS: 187,
        COMMA: 188,
        DASH: 189,
        PERIOD: 190,
        FORWARD_SLASH: 191,
        GRAVE_ACCENT: 192,
        OPEN_BRACKET: 219,
        BACK_SLASH: 220,
        CLOSE_BRACKET: 221,
        SINGLE_QUOTE: 222
    }
};

window.addEventListener('blur', function() {
    Input.keyState = [];
}, false);

return Input;
    
});