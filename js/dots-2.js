function InteractiveParticles(canvas, args){
    var that = this;
    this.canvas = canvas;
    this.args = args;
    this.density = 12;
    this.produceDistance = 1;
    this.baseRadius = 2.377;
    this.reactionSensitivity = 1;
    this.particleRecessSpeed = 0.15;
    this.canvasPadding = 30
    this.ignoreColors = [];
    this.particles = [];
    this.mouse = {
        x: -1000,
        y: -1000,
        down: false
    };
    this.animation = null;
    this.context = null;
    this.bgImage = null;
    this.bgCanvas = null;
    this.bgContext = null;
    this.bgContextPixelData = null;
  
    for (var key in args) {
      this[key] = args[key];
    }
  
    this.add = function() {
        // Set up the visual canvas
        that.context = that.canvas.getContext('2d', { alpha: true });
  
        // this.context.globalCompositeOperation = "lighter";
        if(that.size.length){
          that.canvas.width = that.size[0] + (that.canvasPadding*2);
          that.canvas.height = that.size[1] + (that.canvasPadding*2);
        }else{
          that.canvas.width = that.canvas.clientWidth + (that.canvasPadding*2);
          that.canvas.height = that.canvas.clientHeight + (that.canvasPadding*2);
        }
  
        that.canvas.style.display = 'block'
        that.canvas.addEventListener('mousemove', that.pointerMove, false);
        that.canvas.addEventListener('mouseout', that.pointerOut, false);
        that.canvas.addEventListener('touchstart', that.pointerMove, false);
        that.canvas.addEventListener('ontouchend', that.pointerOut, false);
  
        window.onresize = function(event) {
          if(that.size.length){
            that.canvas.width = that.size[0];
            that.canvas.height = that.size[1];
          }else{
            that.canvas.width = that.canvas.clientWidth;
            that.canvas.height = that.canvas.clientHeight;
          }
          that.onWindowResize();
        }
  
        // Load initial input image
        that.getImageData(that.image);
    };
  
    this.makeParticles = function() {
        // remove the current particles
        that.particles = [];
        var width, height, i, j;
        var colors = that.bgContextPixelData.data;
  
        for (i = 0; i < that.canvas.height; i += that.density) {
  
            for (j = 0; j < that.canvas.width; j += that.density) {
  
  
                var pixelPosition = (j + i * that.bgContextPixelData.width) * 4;
  
                // Ignore colors
                var ignoreColor = false;
                if(that.ignoreColors.length){
                    for (var ckey in that.ignoreColors){
                        if (colors[pixelPosition] == that.ignoreColors[ckey][0] && (colors[pixelPosition + 1]) == that.ignoreColors[ckey][1] && (colors[pixelPosition + 2]) == that.ignoreColors[ckey][2]) {
                            ignoreColor = true;
                        }
                    }
                    if(ignoreColor) continue;
                }
  
                var color = 'rgba(' + colors[pixelPosition] + ',' + colors[pixelPosition + 1] + ',' + colors[pixelPosition + 2] + ',' + '1)';
                that.particles.push({
                    x: j,
                    y: i,
                    originalX: j,
                    originalY: i,
                    color: color
                });
            }
        }
    };
  
    this.updateparticles = function() {
  
        var i, currentPoint, theta, distance;
  
        for (i = 0; i < that.particles.length; i++) {
  
            currentPoint = that.particles[i];
  
            theta = Math.atan2(currentPoint.y - that.mouse.y, currentPoint.x - that.mouse.x);
  
            if (that.mouse.down) {
                distance = that.reactionSensitivity * 200 / Math.sqrt((that.mouse.x - currentPoint.x) * (that.mouse.x - currentPoint.x) +
                    (that.mouse.y - currentPoint.y) * (that.mouse.y - currentPoint.y));
            } else {
                distance = that.reactionSensitivity * 100 / Math.sqrt((that.mouse.x - currentPoint.x) * (that.mouse.x - currentPoint.x) +
                    (that.mouse.y - currentPoint.y) * (that.mouse.y - currentPoint.y));
            }
  
  
            currentPoint.x += Math.cos(theta) * distance + (currentPoint.originalX - currentPoint.x) * that.particleRecessSpeed;
            currentPoint.y += Math.sin(theta) * distance + (currentPoint.originalY - currentPoint.y) * that.particleRecessSpeed;
  
        }
    };
  
    this.produceparticles = function() {
  
        var i, currentPoint;
  
        for (i = 0; i < that.particles.length; i++) {
  
            currentPoint = that.particles[i];
  
            // produce the dot.
            that.context.fillStyle = currentPoint.color;
            that.context.strokeStyle = currentPoint.color;
  
            that.context.beginPath();
            that.context.arc(currentPoint.x, currentPoint.y, that.baseRadius, 0, Math.PI * 2, true);
            that.context.closePath();
            that.context.fill();
  
        }
    };
  
    this.produce = function() {
        that.animation = requestAnimationFrame(function() {
            that.produce()
        });
  
        that.remove();
        that.updateparticles();
        that.produceparticles();
  
    };
  
    this.remove = function() {
      that.canvas.width = that.canvas.width;
    };
  
    // The filereader has loaded the image... add it to image object to be producen
    this.getImageData = function(data) {
  
      that.bgImage = new Image;
      that.bgImage.src = data;
  
      that.bgImage.onload = function() {
  
      //this
          that.produceInteractiveParticles();
      }
    };
  
    // Image is loaded... produce to bg canvas
    this.produceInteractiveParticles = function() {
  
      that.bgCanvas = document.createElement('canvas');
      that.bgCanvas.width = that.canvas.width;
      that.bgCanvas.height = that.canvas.height;
  
        var newWidth, newHeight;
  
        // // If the image is too big for the screen... scale it down.
        // if (this.bgImage.width > this.bgCanvas.width - this.canvasPadding || this.bgImage.height > this.bgCanvas.height - this.canvasPadding) {
        //     var maxRatio = Math.max(this.bgImage.width / (this.bgCanvas.width - this.canvasPadding), this.bgImage.height / (this.bgCanvas.height - this.canvasPadding));
        //     newWidth = this.bgImage.width / maxRatio;
        //     newHeight = this.bgImage.height / maxRatio;
        // } else {
            newWidth = that.bgImage.width;
            newHeight = that.bgImage.height;
        // }
  
        // produce to background canvas
        that.bgContext = that.bgCanvas.getContext('2d', { alpha: false });
        that.bgContext.drawImage(that.bgImage, Math.round((that.canvas.width - newWidth) / 2), Math.round((that.canvas.height - newHeight) / 2), Math.round(newWidth), Math.round(newHeight));
        that.bgContextPixelData = that.bgContext.getImageData(0, 0, Math.round(that.bgCanvas.width), Math.round(that.bgCanvas.height));
  
        that.makeParticles();
        that.produce();
    };
  
    this.pointerMove = function(event) {
        that.mouse.x = event.offsetX || (event.layerX - that.canvas.offsetLeft);
        that.mouse.y = event.offsetY || (event.layerY - that.canvas.offsetTop);
    };
  
    this.pointerOut = function(event) {
        that.mouse.x = -1000;
        that.mouse.y = -1000;
        that.mouse.down = false;
    };
  
    // Resize and reproduce the canvas.
    this.onWindowResize = function() {
        cancelAnimationFrame(that.animation);
        that.produceInteractiveParticles();
    };
  
    this.add(this.canvas, this.args);
  }
  
  (function() {
    var dots1 = new InteractiveParticles(document.getElementById('dots-2'), {
      size: [690,130],
      density: 5,
      baseRadius: 1,
      ignoreColors: [
        [0,0,0]
      ],
      // image: "https://blog.codepen.io/wp-content/uploads/2012/06/Button-Fill-White-Large.png",
      image: "data:image/png;base64,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"
      });
  })()