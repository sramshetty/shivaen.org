;(function(exports){

    "use strict";

    var PARTICLE = {
        GRAVITY: 0.4,
        DAMPING: .999,
        constructor: function(x, y, width, height, color){
            this.savedX = this.oldX = this.x = x;
            this.oldY = this.y = y;
            this.width = width;
            this.height = height;
            this.weight = width*height;
            this.color = color || UTILS.randomRGB();
            this.initialize();
        },
        initialize: function(){},
        reset: function(){
            var v = this.getVelocity();
            if(v.x < 0.1 && v.y < 0.1){
                this.oldX = this.x = this.savedX;
                this.oldY = this.y = 0;
            }
        },
        attract: function(x, y) {
            // calulates the distance b/w a Particle and the Square
            // then lightly pulls the Particle towards the Square
            var center = this.center();
            var dx = x - center.x;
            var dy = y - center.y;
            var distance = Math.sqrt(dx * dx + dy * dy);// * this.weight * .0075;
            this.x += dx / distance;
            this.y += dy / distance;
        },
        center: function(){
            return { x: this.x, y: this.y }
        },
        getVelocity: function(){
            return {
                x: this.x - this.oldX,
                y: this.y - this.oldY
            }
        },
        integrate: function(){
            var velocity = this.getVelocity();
            this.oldX = this.x;
            this.oldY = this.y;
            this.x += velocity.x * this.DAMPING;
            this.y += velocity.y * this.DAMPING;
        },
        bounce: function(view){
            this.bounceTop(view);
            this.bounceBottom(view);
            this.bounceLeft(view);
            this.bounceRight(view);
        },
        bounceBottom: function(view){
            if (this.y + this.height > view.y) {
                var velocity = this.getVelocity();
                this.oldY = view.y - this.height;
                this.y = this.oldY - velocity.y * this.GRAVITY;
            }
        },
        bounceTop: function(view){
            if (this.y < 0) {
                var velocity = this.getVelocity();
                this.oldY = 0;
                this.y = this.oldY - velocity.y * this.GRAVITY;
            }
        },
        bounceLeft: function(view){
            if (this.x < 0) {
                var velocity = this.getVelocity();
                this.oldX = 0;
                this.x = this.oldX - velocity.x;
            }
        },
        bounceRight: function(view){
            if (this.x + this.width > view.x) {
                var velocity = this.getVelocity();
                this.oldX = view.x - this.width;
                this.x = this.oldX - velocity.x;
            }
        },
        move: function(x, y) {
            this.x += x;
            this.y += y;
        },
        update: function(view, mouse) {
            this.attract(mouse.x, mouse.y)
            // this.move(0, GRAVITY*this.weight*.00015);
            this.integrate();
            this.bounce(view);
        },
        draw: function(ctx) { // basic rectangle drawing
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height)
        },
        extend: function(){
            var args = [].slice.call(arguments),
                obj = {};

            args[0] && (args[0].prototype = obj);
            args.shift();
            args.unshift(this);
            args.forEach(function(proto){
                Object.keys(proto).forEach(function(name){
                    obj[name] = clone(proto[name]);
                })
            })
        }
    }

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    Math.clamp = function(v, low, high){
        return Math.min(Math.max(v, low), high);
    }

    var UTILS = {
        degreesToRadians: function(x){
            return x * Math.PI*2.0/360.0;
        },
        randomRGBRange: function(r1, r2, g1, g2, b1, b2){
            var hex = this.randomRGB().slice(-6);
            var caps = [r1, r2, g1, g2, b1, b2],
                rgb = [
                    ('0' + Math.clamp(parseInt(hex.slice(0,2), 16), r1, r2).toString(16)).slice(-2),
                    ('0' + Math.clamp(parseInt(hex.slice(2,4), 16), g1, g2).toString(16)).slice(-2),
                    ('0' + Math.clamp(parseInt(hex.slice(4,6), 16), b1, b2).toString(16)).slice(-2)
                ]
            return '#'+rgb.join('');
        },
        randomRGB: function() { // #AABBCC
            var hex = Math.floor(Math.random() * 16777215).toString(16);
            return '#'+('000000' + hex).slice(-6)
        },
        ntimes: function(fn, n, delay){
            var i = 0,
                l = setInterval(function(){
                    fn();
                    i++;
                    if(i >= n) clearInterval(l);
                }, delay)
        }
    }

    exports.utils = UTILS;
    exports.particle_mixin = PARTICLE;

})(typeof module === "object" ? module.exports : window)

;
(function() {

    "use strict";

    var ctx,
        size,
        mouse = {x: 0, y: 0},
        GRAVITY = .5,
        DAMPING = .999;

    function Sim() {
        var canvas = document.getElementById("c"),
            self = this;

        ctx = canvas.getContext('2d');

        function setSize() {
            size = {
                x: canvas.offsetWidth,
                y: canvas.offsetHeight
            };
            canvas.width = size.x;
            canvas.height = size.y;
            mouse.x = size.x/2;
            mouse.y = size.y/2;
        }
        window.addEventListener('resize', setSize);
        window.addEventListener('orientationChange', setSize);
        setSize();

        function setMouse(e){
            mouse.x = e.layerX;
            mouse.y = e.layerY;
        }
        window.addEventListener('mousemove', setMouse);
        window.addEventListener('touchmove', setMouse);

        this.items = [];

        this.items = this.items.concat(new Array(1000).join(',').split(',').map(function(){
            return new Star(Math.random()*size.x, Math.random()*size.y)
        }))

        function addShootingStar(){
            var alignedTop = Math.random() < .5;
            if(alignedTop) this.items.push(new ShootingStar(Math.random()*size.x*.5 + size.x*.5, 0));
            else this.items.push(new ShootingStar(size.x, size.y*.5 - Math.random()*size.y*.5));
        }

        utils.ntimes(addShootingStar.bind(this), 30, 100)

        this.items.unshift(new Nebula());


        function tick(){
            // rest of stuff goes here
            self.update();
            self.draw();
            requestAnimationFrame(tick);
        }

        tick();
    }

    Sim.prototype = {
        update: function() {
            this.items.forEach(function(i){
                i.update(size, mouse);
            })
        },
        draw: function() {
            // clear the canvas
            ctx.fillStyle = "#000";
            ctx.globalAlpha = .25;
            ctx.fillRect(0, 0, size.x, size.y)
            ctx.globalAlpha = 1;

            this.items.forEach(function(i){
                i.draw(ctx);
            })
        }
    }

    function ShootingStar(x, y){
        var dim = Math.random() * 2;
        this.constructor(x, y, dim, dim, this.genColor());
    }

    particle_mixin.extend(ShootingStar, {
        genColor: function(view, mouse){
            return utils.randomRGBRange(0xcc, 0xcc, 0xcc, 0xcc, 0xee, 0xff)
        },
        update: function(view, mouse){
            this.oldX = this.x;
            if(this.x > 0 - this.width){
                this.x -= 15*this.width;
            }
            this.oldY = this.y;
            if(this.y < view.y + this.height) {
                this.y += 5*this.height;
            }
            this.move(0, Math.sin(this.weight)*this.GRAVITY*5);
        },
        reset: function(view){
            if(Math.random() < .5){
                var alignedTop = Math.random() < .5;
                if(alignedTop){
                    this.x = Math.random()*view.x*.5 + view.x*.5
                    this.y = 0;
                } else {
                    this.x = view.x;
                    this.y = view.y*.5 - Math.random()*view.y*.5;
                }
            }
        },
        draw: function(ctx) { // basic line drawing
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.oldX, this.oldY);
            ctx.stroke();
            ctx.closePath()

            var dx = this.x - mouse.x,
                dy = this.y - mouse.y,
                distance = Math.sqrt(dx*dx + dy*dy);

            if(distance < 400){
                ctx.beginPath();
                ctx.strokeStyle = '#efefef';
                ctx.shadowColor = "yellow";
                ctx.shadowBlur = 30;
                ctx.lineWidth = .5;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
                ctx.closePath()
                ctx.shadowBlur = 0;
            }
        },
        initialize: function(){
            setInterval( (function(){this.reset(size)}).bind(this), 2000)
            // setInterval((function(){ this.color = this.genColor() }).bind(this), 100)
        }
    });

    function Star(x, y){
        var dim = Math.random() * 3;
        this.constructor(x, y, dim, dim, this.genColor());
    }

    particle_mixin.extend(Star, {
        genColor: function(view, mouse){
            return utils.randomRGBRange(0x25, 0xaa, 0x55, 0x55, 0xaa, 0xff)
        },
        update: function(view, mouse){
            this.oldX = this.x;
            this.x -= 2; //this.weight*.5;
            this.oldY = this.y;
            this.y += Math.acos(this.x/view.x);
            if(this.y >= view.y - this.height) this.y = 0;
            if(this.x <= this.width) this.x = view.x;
        },
        initialize: function(){
            // setInterval((function(){ this.color = this.genColor() }).bind(this), 100)
        }
    });

    function Nebula(width, height){
        this.constructor(size.x, 0, size.x*2, size.y*2); //width, height);
    }

    particle_mixin.extend(Nebula, {
        noise: function(x, y){
            var c = document.createElement("canvas");
            c.width = x;
            c.height = y;
            return this.perlinNoise(c)
        },
        randomNoise: function(canvas, alpha) {
            var x = 0,
                y = 0,
                width = canvas.width,
                height = canvas.height,
                alpha = alpha || 100,
                g = canvas.getContext("2d");

            var imageData = g.getImageData(x, y, width, height),
                random = Math.random,
                pixels = imageData.data,
                n = pixels.length,
                i = 0;

            while (i < n) {
                pixels[i++] = (random() * 0x88) | 0
                pixels[i++] = (random() * 0x88) | 0
                pixels[i++] = (random() * 0xee) | 0
                pixels[i++] = (random() < .9) ? 0 : ((random() * alpha) | 0);
            }

            g.putImageData(imageData, x, y);

            return canvas;
        },
        perlinNoise: function(canvas) {
            var noise = this.randomNoise(canvas, 120);
            var g = canvas.getContext("2d");
            g.drawImage(noise, 0, 0);
            return g.getImageData(0,0,canvas.width,canvas.height);
        },
        update: function(view, mouse){
            this.oldX = this.x;
            this.x -= 1; //this.weight*.5;
            this.oldY = this.y;
            this.y += .5;
            var center = this.center();
            if(center.y >= view.y) this.y = 0;
            if(center.x < 0) this.x = view.x;
        },
        draw: function(ctx){
            ctx.putImageData(this._noise, this.x - this.width/2, this.y - this.height/2)
        },
        initialize: function(){
            // setInterval((function(){ this.color = this.genColor() }).bind(this), 100)
            this._noise = this.noise( this.width, this.height )
        }
    });

    window.onload = function() {
        new Sim;
    };

})();