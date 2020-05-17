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
    var dots = new InteractiveParticles(document.getElementById('dots-1'), {
      size: [690,130],
      density: 5,
      baseRadius: 1,
      ignoreColors: [
        [0,0,0]
      ],
      // image: "https://blog.codepen.io/wp-content/uploads/2012/06/Button-Fill-White-Large.png",
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmAAAACDCAYAAAAqJKfVAAAwTklEQVR42u2d+beVxZnvCzwiItCKBhEZjgzKJPPgFCWOMaOaobvTt9Oru29W/zP353vvup1OdyfpXp0bo4maaByxFQUOw2EQRAGZBCQyiIgICPf58D47vcMVTtUe6937+12r1rs57Hr3W8Nb9a1n7Dl37lwQBEEQBEEQWocedYEgCIIgCIIImCAIgiAIggiYIAiCIAiCIAImCIIgCIIgAiYIgiAIgiCIgAmCIAiCIIiACYIgCIIgCCJggiAIgiAIImCCIAiCIAgiYIIgCIIgCIIImCAIgiAIggiYIAiCIAiCIAImCIIgCIIgAiYIgiAIgiCUm4CdO3fuCrsMs8J1iJXLrVx2QZvOWTlt5YyVs1Y+83Ji0KBBpzT8giAIgiCIgF2cbA21yzVWrrMy2sqNVq73v11tZbiVK60MdTI2yKt+buVTJ10Qro+tHKHYPf9g131WPrRy2MohI2UnSkZChzgBjcHnZWvfAG0f5oQ7Bp81k3DbszDfrqqad5f8upVP7HnOtej3Om7sa+gv+mpw7NfrHZ82z68KTlsbTnbQGKasdd2Akza+pzPo545ZW9qxp/Rk3Bmj7DLByiQrU6xMtjLRyg1OvCqk6wrriEGR90QKdtLLcSsfWYGI7bLyrv3/23bdbmWv3fJw5pOl1y73WxkfWeUjq9Nn7XqtA16UL9tlkZU/i6yyx+q8aG3f2aTDwcNWZoZCCjvgxmjlLav3bC0bpNXjnb3XylzflGNwwur12/Ul+80zXUa8HrQyww9mMfjESr/VfTmHvrLnYK37qpWpCZsDOGZ111gblnXAOKaudd2AHdYvz9n4ftDmfv7U6m2y68tlJmLt2lN6MuuEoU64WDAXWpln5SYr11lDr6n3/nYPTsHDvIy64LeP2uUgE9vKRvv3OjZKCJnV+yTDOTPLyg+9j2JwANLKy2LtOVLiF4V58BUrf21lTGS1dd7+nU14pLFWvm3lG5EnR6Sxz1hZ73MtFVc42fuhH0hC5G/+noOFz+luAe/G31thcY2VgL0XCqn566EwXWg3brPyI98cUsAB8xl7X9639/3dko9j6lrXDXjDyjYrH7S5nzlQrgqF5Pi32lNKSMCsA672wb/DFxw2mIm2cLRM5Gy/xTNQbrbnQcKwx8oWKyvs3yzG6+07RzOaNyO9j4ZH9jHEdnSCJCBXDPF2THJCHdP2id5fzQCHhrH2LNdGfh8SPNbr1TJPP7H6+0Mh+R2e8Ju8V3O7hYD5Ye52ivXTyIR6rIn7cjjN+8YAeVxizzMssTpjfrddX7RSdgKWtNZ1yfxGOzQ8h362Z0HKvN+uO6zuFu0pJSFgTrzmW1nqC81s64BR7R4NewYGBJXnZHvGO+36gJVl9vklmK/9/3EtAUIbsdGJ1JSEOizYC20Ov2Dz92AX9FGvlcU1rCcbvH9zAIemBTWQrwrQHtxmY/5Kl4y50J79cpCTsE123aP9sQQEzAbq1lCobb7GyTzX042rPu+x50Use5eV5+3z8/b3fk0foU3YaWWlzcN7XHIbM4977PtzfVPuhs0YKfqsxDUJh5yVoTmq6low28q0Otauy61NqC5v6ZIxF9q3T461ufaIfdxs5Vn1SKYEzAYJooW+9XtWHrSBu74kEwxx4332/Czqi+z6JGTM/v6hppHQ4rmIGnJNKBxGFiRURWI22+quysnLrwlrDOrgxU42U4ATzuocQtS4mhrV44Q6bzXN1yvG/DO9PUITgZnDozbXsJt+R92RGQGzgRnHAFn5CxugO0q6+UEYv2ttwStpol0f7wAjV6F8gCz0pxAwm6fjXCLCCXVvB/cNRHNRig2p9QvGxKutbM2kDUit5jZgvbrW2na7j/kWvTZCE/dGpOx47G6x6z6pIjMiYDYgLIp4GfzABmZKB0y2OX7Svt6uP7d/r9Z0EloInERQQz4EsUqoh1prcqcSMOsPjGixK01V3eH9uCIHWykPMj0/pNn4DTTms0XAhBbsi+Nt/j7mB0SpInMgYDYgLPh/BwFL3Cxyn2xIFP7WPo606/+2f6/SlBJaNPfOeWwvJDYp7xTv4jyr+0YzAjlmAFR2qO5uSKy3wUsOwMNqUYJn7UCQMb7QSlRUkdukHWozAbNBIK7GD6z8t1aQL3alUMQk8X1q0KBm/h62YfaT37WPp+xKdOINmlZCi0AcoD48dW3eDY2cr9fZ9xc6UdnegX2C5GtO4ppxyC5vhtrisjUDOBDc2sA1Ssb4QisPh6giHwpFwOl/7OYsHG0lYB6L55tW/hLRZIPuiSEpgUTRLxOXi8WTFEP8/aRf/0jAPLXC+Yj5VkZY4VR5PoVRo06Ydp8RTsKOuyRsm6aW0IKFjpRaq5w4zEioiiPJ1E4jYO7gA9GYnFgVdUlfDkbqHvuLNvQ2gZjKGF9o1do0ocor8gX1SBsIWCjie0G+pte5KBGJfmco1C2INEkd9H4o0gh95KSLqNWf+/WPBCwUEbAv97ZCwkg1gFSu1w3pORVOtmecWOeEw9j1+/bxQ2f9hzS9hBaAeGAbEwkYKqkFNk9fyzTLQ60gbhaxv0YkrC2oYfusvJNRG6Jif9mzcxDFrmvaQPHOus0Y39p6yveJTjUExwv6QObPiKPdIx6gdXsQWkfAnNx8JxQBVmu9BxIuQv4vD0V8nkrqhaP1utG7ZIxFi8TeMz3gKrrrGYhQayRh452E8ZyPa3oJLQCbzCqbd/fHSnRdbY6R90Q/oXYK5iQS0Ur/rWxkTr06kRL7C/JNiilSJ90Xee9uMcYnaPZPfS3uRBzJndQQ0NzWGeJ84hX5405KDp81AXNyQ/T4B2olM3YPvArJLUUqjU2NTgPksX4OeFljv7csFC79DxDV1/5/co33xcD5W1beKmlaBqFEQJ3kMcGQ4NyeUBWiMr1TCJjbmi4J6aq7jSGTyPcepicq9pfbumJvSpq0oUi3IqRmXWGMb+07Gwq1/CsZEetuXZ963Styi5NiodkELBRGpA/VotazwToWCjH5/7WyzO5xuEUTZbdddnsS7n67/rldv1KjEf9Sl0pszyGoo9DxgHytI99jwnyFqKCGfLnMydmrgCnB/Nhcbr7WsLasCPnYwt0c4hMhkw+03wtBot/zdfdSa5yM8YV2AO3SYzb3dkoV2WQC5tKve0IRiTq1LtKoX1r5mQ1UX5sY+057jn8JRZylw/b5m6lJwV0VSUC6VV4EoZlzlkS4qOi/FiIlQHhNVqkhS03APG7WAicwKcCmtC8H1Yg7LOGdGhv7i/VpC5oBq4sUc8NABMyBenOxjPGFFq5PFVUkXpH/pHnXRALmC8jd1sljEhcgjNb/zQq64rfbPGGQWj1rz4QB5xm7fofTY+JtUIcstbqb5IYrtADrQyHm702ogySEcAdlz2sKiVyc4tXsaqo1IR97KMZtUULy8HechIGKHSAmH9cNsLZVG+Nv1msjtGhPRRX5bZ9zy9QjzSNg0yNPYhcuhth7/bTd5OuCSfOaS/TwnHw4sS7xlu62j893wAYn5I8dvgl/OSGxPTZHCzy5fJltZWqJm0V/EYw2F0+yGbHrpjsnQRz/4GvNabcDxEP8uohbzPEiAia0EneFwivyPZuzu9QdDSZg1rEjfCEcm1gVg/vHMw1i+qqVG61tE+z5ZibW5fuzRcCEFhwWPrY52ufEYnZkHQImkm+Q0AelJGAeN2uxtyEFGN5vyKQNo0Ja8nDst96+QLKObU1/pB0gfXWHG+Mf0NsjtGiNGmZz7uuh8Ir8Z9lHN14CRqLqGQkn8EqMLwK1vZHppEEFyfMRqmJiSttcwoBX5O+s3od6BYUmA6nI+lgC5iBczK02R1fUG9qlTagk3h4aWyFD43sI0fyENrx34bNb3X1OwNngJgywpg2272Izh7ZCBExo5X46xebeo6EIfvyqCFjjCVhvYh1sGV7POXCpGzn/LhQRqr+SUA8JA4scEkERMKHZwJN3pdsCjYmco2PdMw6boD1laqw9N5IevAZvSayKqq4vo7hESCGnRbaZwLHE/3r/C/57g5PwCRG3os+IjP+m4jMJLQaxQd92r8iuVkU2moCNDkVw0xRsdDacO9ZaeYWTI4EsE+pN8KIckUKzDwpnPIwK3n0pTjBIzKaUjYD5e3VbSo5Zj5+11vsoBxJJirbFCana9llZf5ED67tOwO+y/79qgLkyCnVlKGxv39LbI7RwnaqoIje7KvK0CFhj8CUrw2K/7DG/IF8HSzBpsLGpqC3mJVSFlCJ2vbybJ5rQMhD5e63NtzsSPHdRgc21OstLZpdxS0hTtwLUd6hb92XSBlTAKcnDsfHbcpE16pjnBt0e2S+3+vdEwIRW76dTPFckc2+5CFj9JzmIF9KvKxOqEebhYInCNLznG1wKAcNIeLL3jaIyC81e2A56TLBv+OYeUwePXWJQjQ8lSdBtz4uEZ1FsG6uwKWTiFJMa+8u+T55bJOmXUtuk2AHKGF+odw6jwWJezq0haDmqyG/bPXZZ1b0iYPWBYIio5oYm1GHgymR/gKRuq02YEzHJcn1zG+xqhpEiYEKLsNGJRgo5mRUKO6SyRKquJN6ONgfw8A05Gd/3hrTYX0jt1g2QRgg7wD5rK5lIRkesTTLGF2olX4SPQoJFOBMk50sSD4vDCXQeCq9Igq+fEQGrHYOdhF2WMgaJ32+3dAERP3YW2F8MS6h6beL3BaEe7AxFTDBSaV0dWYcQCPOtzqtW53gJ2ghhTE28jcMPEeA/yaQN0bG/HNvDALG73A4QCR+S+tER95QxvlAPyKLxWigClvfaHLo+cU+dRqBzfze7ThXZSAKGcSsM9mxCnfNSMxuAnhKxX9SQnEDHJ9RBXTJU76rQooPCCQ9JwCa8MLLOCJeGTAyZ2wTZc14fEhNvu/F9NpHvU2N/ufoRqebuSKKGFPSOiHGXMb5QD876ge+wH4p+UMM9SF24uRtVkY0kYIggj/s1NnciEebxYBrpA1gGIKrfYZNltie3ZWE/7eXzqs/V/8Zu41O9q0ILcT5BdywBc0z3kvtGjGp1IWFeEupgN5WT8f1kb0PswYzk2+tiMhZ4TLDV5N+L9K6UMb5QDz71HMpPWLnZPqesOdWqSEgY2XDOdkvHNZKAkWDzmF9HRHb8FdbhLKajS0TA9vtp8QiejXbFgeCkXz+t+lz9t/0hn5xzQhfA3q09eMSRFD4hxAFhHUhN9JLVyTJBt79zC0K5je8xvSD2V0r8MqQMKamD1jsJjxl7GeMLjcArHOA8a8zolIquinzM98mVImDpCz75yMhNhn3FdQlVp/mpuwyxwGjncWvnL+3jS/4nJFxnqq7nP5c0qrjQWej392p85NweanMbD9/eUNh25IhK4u3oBd7D3bCo78ikDYzHktj4Za5+XOskLBaoIdd4TLArBhh3GeMLjdgbD9s8esrnUa2qyLdcFdkV87DRccD2+8I9MaEOJ9l7SSZrnb67JBMNydYJvXJC5mATXu0JumNVXUhlUEmty7RNGK7PSayD48yqjJwLbklswy5//mgvat8M+7zuzZHPJGN8od69cUMdqsiRVarIn3eDEKPRBIz0GBipz03odOyoHrKPG9wVVS+/IDRmMTxSlaA71mMQNeRCq/f7lA2/FbBnwqMzJWl1BUiPcjG+xxt6fihswGLBs2+q4efe8no3R8wVGeMLjQKqyBnuFZmiDWMezvRckWSqWCUClgbEhpusAx8cKBXGBZ0+1er8lX08igjT/v2Z5rAgNARsphtjCZiro+Y6Qcgtbl0l8XZKtg0kQEh1ckmzVFGhXhP5/EjtKiQ6FeclZx6OJOb3ZIwvNOLgh/T1aZ9P36vhFuRbJlfk7k5XRfY0uOOJk4Wrd2wqjOq697hH4XA/fe/TVBaEurEzFPkB70s4jUJ0bnV1VE5qANR20xPrIAHKSZ1K3K9ZCd9nLe2rRX3q4UjWOnlbEFFFxvhCo7hAf5Uqck5i3aut3rdCIfn9mQhYGvC+WRXSc7TR8Uut4zGuRQz5Qhg46rMgCJd+p075JoxH3HWRdW6wOqT5eTbExZ1qOjybxJIEj07qfBwK4/ttmbSBgMyoUFNsZAlhU0/i8K1+jwUR4y5jfKGReDEUXpHjE7I9VOYiHOARK1vs82oRsPiOIx7IK+59M62G+uiOOYmRJ+pV+/yfoVCh7JZnoSDUvAmvw8aHTTayDqfWqbkQsFDYMc1LrFOJfJ+L8T1q3QUDeSVWEbYDTiDrGQMCW6701ERjI74vY3yhUVzgQ5tHv3ZCX6sqEpOmndxLBCwepBSAhE1JDJZYGTg8thYT7NSuD4bCiJZFhJPcjtyMgwUh84XwgCfo/nqIjx7PIWiu1Xu93TaZbriORG5KYlVUj7kY3w9yUntzQrXzxLmeLCEEtfR1EzI6NuL7MsYXGrn2rKtDFXmN1fu2v8P/IQIW33G7rON4gTHmvb2O+wz1RWuOe0riTo635DpfUDjd/cHDQgiCcHFs8A21N/LdYyPGjRyVX7tVeDzz4oS8lhAejO5XZhTaJjX212k/eDai77EjYyO8E6/ziO/LGF9oJF4OhVfkhFjnk6p1iL3/MStbIXMiYPFACvYb1/+Oq/dmLj4fS0wju2Kgv8cJGd4SLFIstASCPWzfPao5Lwh/AgyxiQl2D6k/IutgMD4tAwIGIZiVWIeo8Tkt2LXE/uprhA0s96iKCRYjRZQxvtAw+Px72t/hR2u4xX1WtnCo6jRVZE8TO52QEk/YxzF2/ZtU5nuJ+2LDMs7L7R7lmkH5wBeY7U7IdjpRO+Sk7FyXvwQY2N5gH+fZ9e0SNwVCcEOCLZNQjP/HrobcnkAEiLc13+ota5cdlTvlpCbe5llX+gGt7agx9hcEclMDH4N7bYkhYB1gjD/I97ahevOzAYb0T7oqcmbi2jXKvSJ5J34hAhbfce9ax/2rfbzKrn+ZcPJO+Q0SeY/0UxuEDHUkeSWRhu320zvPQYBYpGYHrc6hLn0J7rQyPJQn7+YXYVRIj4QuFGADXh/bf54kl40Yr712qaMgDPMjVWcV8M6TePtYJv0OeUyJ/cVzI7F6r4HPwL2QgC6154jJ1VtaY/xBnLZto7ePX7Prjg55d0+FwhFte0kPgOc8sgFekTemmBN4/bnuFfm2fV4vAhbfccQD+bF95FT1WKMkYZf4PU6bFCRkSHtOOeE46ITsHZcAsUiTOgnp2aFukJBZG68PhVOD0J1g/uPM8gChJiLrIAWZ0Q4CZs/J+jQ/pCWtButCWuLqZiNVhXpeXdxIqaPnsK0EdJ0T8f2yG+OTVxCJY6fYB3/EWNiY/K+yquHcGQivSLQYtagi7w1FrkhUkYc7YVB7WtTxq5wIoZZ81P49qYWDPsQuY7zMduPWisqSDYkTxVb7+7v+7w9Q12ivFjqQgJ91Bxa862IJWCU10UttWPQqUePHJJA2pNxv4AiUQ5/b8xB7DQ/O3oRqnPCbYSbAuG8K8RLk0hrju4nChE56f12LM9z3r7KCQ0CtqsjRVV6RvxIBS+s8JGEk6t5j1+/bv+9o04t5uW8+lLlOyFBJ7ncyBsNmkTpPyMinp61b6CAwr9fYHL/DDycDvS9XeGoi7MFaTcCmh3R1c27G90hh5sf0tW+yrEP1xv66GM57hroEdHTE92WMLzR6/62oIme4g97IxPoL3SvyXRJ/i4CldR7hKf7JPr5n1+/a9f4EVUgzCVlFQobK8quhMDxFRdnvYnsW9feUo1LogAXwQ5/TO0N8TCpUgKjQ1rTwtM/CvCgkGK5bnU/8hJ2FnYw9D1KYuSFNhYrkay3SyiaM/Wl7pn4n4aMjvq/I+EIz1iBUkU/5mvKNGm5xfyi8IveWXRXZ04bOx67hKes8Fsn1dn04FAl2R2YyORDxYvg7BYPVUBivIoJ/s0LGutiIX+gMkFliUwIBI4bVQs/R2qqNGOKF+vGqhDqsKSszCkNTif0VE4E+uJnG2iYTyHf9YHl7pCexIuMLzQBS3ic8WHtSxpwqVSSCkSdEwGojOqj6OIWTN/I+4hPBiBMSBrfiGYf66Q/PDdIioHtejkgeaUCnpkcQOh7n3zvmdIxTjEtC5jopahUBQ/U4I7FObsb3kJeUnLiV2F9NW1dc+rDKJQ8TI76vyPhCM+bh2SqvyHGpERKqVJEEaC3tvOxp8yCgMnjNOpETOYk7F3sSYIw/exNPv81+VhLp3mXPh1cWZOxl+/y8L5jH9UoJJVr8TtjcJS4PavZFkdWQCmMzubKe1DgxsN9AYkTeygkJdYj596aTy7bDnoe1a0Fob+yvi2GDHyZjk4Lf6oRYBExo5Dq0196T3/hB6+s13IIArRvdK/JYGfugJ5OBQGXwuqv4WHSROi10ssMpcpxLo3J41mFOFPHg4GT4O/v8jP19i14poUQglVd/LAHDE9FTEz0TCklNM8E7PzexDuSgKbZTNaI3FOrHqHhH1resgStbRCArWRHu9vVsIFQb4+/XqyM0EMz5X9ncmlyDKnJMlSryaRGw+skNRu7YKBA4dZkvYrBjwkfM8tPkDc2OJRb5rJxwl9pzsVncYtd/t+uyjDYAQbjU/MUbGY+4r9rn8ZHVeAenNJOA2fNw0ILoTU2oQ6ynVSGTyPdVfZWiQsXua41rBZo99sf8sIt968yI7w92zQTtEQETGjkXz7gqcmYtqkgXgnwHm3Kru7ls7e/JeGAQKSIqJ/n270MRNoKTGDrjGb4RoKr4UmRk52Y95w32PD8MhRfltfb5WakkhZKAeFNIbmMJGO8fqYleb6JHMOEuML4flVAHVWo2xvdVsb8mJlRDGtnKFGGM+6YYAubAYQPJ/4pWkEShq0jYXg/Qylz8amJd4loQXLziFVkqVWRPSQaIWFyUzc6WRzshY7G+2f6G6BLp2I1OyK5o8fMRyuLr9hxsGteQAzNHA317rg980y19KiKP6i/Uh/NSF5sXd8WootwgG7smzASaJW1iEU5NvI3xfU72Samxv/aGQhWzp4XPSJyxPvvt+92+daCxv7rKGL8U8ZfseQmo3Smhg474mHWqJyoS7CfdK3JKSkUXgpRSFdlTtlHyk/ceL3hyIbLkxEnqIdQW0+xvU/1UD1Eb1YwclBd5ttv9ech9+e/27w8y677lVv6xxSftRgOy/SMrj4k/1X+w8QTdO0O8umyGj0HDCZhLjtjkJyXUqQQu3ZnJpl9L7C/s8da3Mh0a66g9ayXkxbWR1WZ527InYB7vDCepvR3yukK8NndqQFxr1ynXdBGg9UeRtonVYN2oBGgtzf7W0wEDh7rvuC/Ar7sUigUFlWCvlZsw8PNT6XlS1kyDfrv3rUwg+0jQw5/mIhK1Z8E2jc1qXYbEMKUdn9IO2hMZx0i4NDb7hhpLwJA6L8BGswkpu5IkRw5UaTkZ36fG/uJAuSa0J3js+ZhgVhYnjP1t9swvWvv2ZT6vkfRjl9spnptnO92+2AO1P+kHvIcS61ZUkRtdFVkKM6CeDhxE1GuHfXF5zSVSkDJUljc7w0ZCNsH/Nsbq9DT4Gaa7XRhRx3/RDYm+hdICg/qVroq6LmJuD3c1JIebjQ0k1pDp+b74xtZBKtAX8jK+ryX216p2BHd22xvUkA/HOGL4JleJjJ8tAfPDJhvwgWaHTBEaDkLJPOlekamqyLHkmvZD2bMiYHkQsoqEbLdvNHhQViRkLJZIrFhQUHuMb5T9mN2H6NE/CIWqdLneKyHT9wPRPxIYEjXHBkGGJM1oJAHzA9GSxNRklcj3Wdg0euwvjO+nJlQ74nWRmH3e4kdG0kgu3BQpvYzxhWavR8+FwtnuH2rQVqGKfNS9It8RActvgCsG/XhOobLETmysk7F5HvGbzxMaoOIiYOvbPhmUS03IFUiQ1iWkp0FassBVUY2S3NSSeLu/wSSwXnCIW5yYVo2+/HMrS9v0zOP8MBq7fpbOGF8o3R69y70iOeQ9kFi3x/M54xW5L3dVZI8Ge9BBu1D6PbI9ruNEfsbWYQmfE21Squ+NuoYJtCKUPGeV0NHvAOlpmKNfCxEG8EiJPUgyNkF1EzC7F2FkUhNvc6DJJvK9IzX2V3Bbse+62qwdYz+4xnaWwhhfKC14t3+DuZDN0d7EOT2eNEWhcDbLWhXZo3H+k4GrSMcgYy/ZdR4M3D4/lBqltwrYg5DrkpRFe9TLQqZAkrQ5xHsgTvWDyuoG/HZFcpQSzw87j9W52Pi4JD019le9RKhdKJMxvlDOvfgzV0Vis/3faxCCVFSR26zuu7m2UwTs4hOAhWWfDeB6J2Tfh0ilTgSPIn2nkzkRMCFXkJ6GsC73RBIhVGekC3uuAelpUD3GBgStGN/nFvkeg+H5HhOw09fGUhjjC6WfZ9uJqenz7CuJdVFF4kmJV+T75L8VASvnJMBT6Keh8Fb6ANFmoo0HQHp2p0cQP6xeFTKc58c9PQ2G7XMjvs8mDHFCbVgzAbN7YHSPqj9FcgRZzMn4vpbYX2WHjPGFVgAHtidsnt1UgypygntFoop8QQSsvJsT9hmveGTlc3g3pnhLus3MXJcaiIAJuYKFan2IT4SN1Geub8K1qgLZyOdB6BLqYHu0KaN+w4MTFeqYbpkoMsYXWjTPTpLeLxSqyL+vQRWJ9ukRq7sDiZoIWLknw2obyJ+FIuXRg4nVb/INa716UsgUlVAtD8aEgyAdlH13ob8PyQm6rS6HmAVOwmLr4DCDw8DOjPoNCfecLpwvMsYXWrHvbq/yirwnse4Qq4tzEV6RP4bQdRQB89g3I/xel/kVO4jBVZ+5XumfCY63scTzAZHoUyQEt3aMS6hH7kJim1wlkb2Q6UJ31tPTIAmLjcc1ywnUrhp+ErXjbTG5CKuA8T0OLadz6DMP9AwJndSFU0bG+EIr9128IifFBA2+YF3rda9I1o6XOoaAeVDT7/jpD4JF0LQr/PMQ//dQJ14U1AzLrd7/KEOQtIsMJoHiXrOP94Uihk5svZFWr9c+0mciYEKuQEy/FseRSHE/xIP4ea/VcLqcFRISb9tvnAqF12VOawckZFENdqGdQNhljC+0aq59YnPtty7E+NsastegiiRX5HtWd0dHELBQRJSHiHwrNnmmdQCXxzNbRFNBEFc8xr6CLURCPaRgw/Q6CRkvdB96gu5vhgjVoH3/GldDTkh5pz1n6+KQJjmCHL7JM2bUZcmxvzzm14lMp8DQxM1NxvhCq9amdzxXJIT/rsS6QzxA6ya7/oQwF51AwGBTlydmLh/hRKTME+GEDSJJXgkGmULAIKwj9SoJmQMD940h3jYLAjIt8VCF9+SixNRfG0JGke9rif1ldQhF82LINyTNGHvGu2PjHsoYX2gx0D7hFTmxBlXkJKv3SChUkcs6gYDBIo8l1oGA3WgdMSzX2ByRYAHdFxKSBxuGe/sFIWe8F/5Lwjsq4vu9oUhN9Ip9/+MIEoIpwryQlngb4/s3/dlyQVLsr3OF+B/y9T9DkXszR7CpHbVHHUcmj8g6MsYXWiX8OF6nKhLJ2SOuitzV7vbUS8BO+st6OnYR8hMTagckR2UmYETM319Dfw/RayRkvsjh+o2tFar2xRHfv6oqNVHMJoy68jZPwxMLpGurMzK+ryX2115O8HhTZzz8m61tSAcIYhnr2SljfKGV61NFFYnk/c7EusOs7tdD4RX5z9h0l5mAfRqKXHBcUyJAc3Jk8S3zy1qL9G+QXh+hJIDw9McQMMc0XxA3RH43NtYYZAfSRZDYnCLfQyKXJMb+gtBuKsHYb/XnjCJgMsYX2oDXQxGNYFJMyJwL5uuUqgCtr5aWgLlnwgf2kYzjKbZNnJiwL1ld8kmAVuFcQhDJc3pvhJKcMskAsQLDVSJKRxISUhO9YN8/dIkXhrA1GO1PTngc1I5Evj+YURdNDwmxv6zdZ5yc7irB8GNeQTy4B6zPR0fWkTG+0Mr16WOba8+EIkDrDxMDOYMvQ8BQRbZzX25EIFbE6kdDIdGKBd+db41/PjOPphQg8RuWOPB4P53S6yOUBBv8lDggAXMvI+y6MC84dImv9ob0sA0bQkb2RR77a1EiiWSdXJMZibzYWJ62NiL9ROI4OrKOjPGFVs9T1OW/cvJ/e2LdiioSZ7r+MhOwfb64zEho/BC3GaHjykrAOMlfl1gHSeHHenWEkoCwD332rt4V6ek81crsUKgLL4ZbU9YK+23IHMb3OzLql0lOIocn1EGlu6lEYw/56rf+v93aOTiyjozxhVYDFSJSsN46VJHYZQ9vx8M3goChgtxqDbk/4UWtLMS3E3k7t/QAkWCwx9XQVx/pnRFKcsLEwWZVKFSAMyO+P96+jxrq2S8yxra/c2BJCtsQCglcXy5xe6qIxvQEEvmZn7J3lWjsD/jYfyNhvGSML7R6nh6z+fZ0KLwia1VFwoOGJ/KXPAiYPfQH1nDyG74fChfm2HrXWb2loYjHsaZMg27P3eMb0tiEOmd9AT6m10YoETaHIn/pzMjvc7BCQvRFG3AvEpLYhLpVxvdbM3r3iWG4OJFEYlO1ztp9uGRjjyRrS2xbZYwvtImEoYp8IhTOPUsS6w63ugSTb4t3daOScRMccVsKAXNwGl5qHfB2yQw3z5/0EgxUAYsvYv1DemWEEoFDwyqXcMfMd0jWTPv+cvbjC/4PEjcl4bd3WlmRmd0Uz78gMf7QVieyZQNq39UemDU22LaM8YV24D85/Nm8uylxXw4u+bqiHQ/dKAK23V/UO1IiW9t3r7c63w6FIdxzJRrs20K8e34FqB+3WZvP6F0RSnS6xCB7TYg3yCYsA3ZgSIoOVP5o97jBD1wpavuNIa/I96yXOBpMTahDrMN1VnaXcOxR7yCBjFJBex0Z4wvtmKtHXRWJfekPyvLcPQ1q/CFrPIayXwvxqooK8F74C6u/3+6zPvcOs+ekfbjmT02suiOUyAZEEKoA+SJB95KBJD+uhmIRHF9NwEIhOZoXa2dh90BivDLkZXyPN+hiDo4JdSBe/WwQJR17VJCbEtd1GeML7SBhG1BFWrnZPi/sGgLmgDz1pRIwFnTrMAw9SQL8KVFuMyZfGBGTS+rexHonfDGSXYRQxoUNO88VfsCKCb2Ain66rweVqPEV27BYoLbry8xBh6j3sxPr0I63Szz8EMg+V0FfG1lHxvhCu/BKKAzyJ6SqIktNwKyxO0hh4S7rUxLrXmv1EBtyev5XmGyG5IuwE6hLv58Y/Rps883kqN4PoaRAFbg5koDhnDLH3plrPSjrebVk7HvjDiuoPbdk9P4nx/6yOoSdWRtKLPnG+xRP9VCYmVwbWUfG+EK75uthm3tP+dzLXhXZ0+D7vWFleUgztK103A3WcX9jH6+x67+FImdaFkFL7XkIGonki+SfsxPrYoiMenadXg+hxKgk6L5noCCq5IW176GGQg0JAesNaZJx1I5vEAoho/bXEvsL4oX34/GSj/35mGAhze4VY/zbZIwvtIGEVVSRt9jnBV1DwKyx71qjf2+FhWpGDfWRhP1VKGwtJtvn5+xvbTVetWdgE0Hy9df2LItruAWq2efb3Q5BqPPdPu4JupGEzIuogqRomtXZ4+QrRf2ItC03KXhS7C8HErytHTD2pKVCDfkwsd4i62CMj33vb0MbI40LXYtlofDG7k1QnZebgDmITLsA4mINH1HDy06MoPusPrFnZhHUMRTqu5ZGzHeVA+yZdAWP1GB0X1FB/D4UUkFBKDu2+IEihoDd4MQLKdYc/3fMO4Px/QonelnAY3/h2TcxoQ7mBqhR93bI2DPu2OemhBqa5XNFBExo9aHhkHtFMge/1zUEDKNLz8/EiffROu5DmoB/CEVgNWzLMK7b0GyjTlc3Mmh3W3kgFF5PtaYpIGP7Mxgx65UQOgBIs0jQ/aDN6bEDvL/kWkNdD6GamRChOkfjew5f8xNjf1W8H090yNhDiNe4jW9UqCH73kSkYG6Mv0evj9BiErauyityTlcQMG/4m9boX7gUbGEd90EattgXcjwPV3q4C9yiibx/6AuCPdZCuob7Cf18EEErd4bCZX5UHfdkwcIYcJVeBaFDFrSznqQZkhSTBQLpx2WhiFAd885gfI/BdzZeg/ZMl4dCEp4qASe24bYOGvvDHhNsl6+TsSDn73Qn76161sHusT69MMHtaJyw9iq/8MXxos+D8fXs56UiYI7nrYzjRbCG99b5Qg21y0JP4P1wKIxC8cgiByULAupJUvxw2vzUCsb7pBb4nDW0chvfDIjoPNzLNb6RsEHgJo+b+aQ6JF6VRRvVI+LPZ3NxJBCEBgFSERV02XNDfsnf3xjs5JBl39+fUXsrsb9GJ7z/OB5gL9dpdp9v+eE3hYDx3SXWJ2+02BnhNr9+2OHvI3vgryVhvOgaRHirX/shIDtVZE8TG37EGv54KLwa/y41U/nFTjahUG1OsnsiEWOhO2LlqH/+QyhUHsedjJ1yEgaoy0YACx7j5UtOwq6txV7tEqd4DE//w+65U6+A0GEL2qGqBN3TIr4/NOH2bO65BWOe7oezFPDer+/AwxeHXYzx78XIPnK+jCCAbyg84/tbOE+x15vo63En47VQOKyIgF18LmSriuxpcsN3EdfLPl6Gd2OsB03kvS+vIlLVBOhU+FMJ2IXtvTIlXVINwGngJ/YbKzX1hQ5FRRIyrVE3dKP13IzvOZQtCmkenGBzTu1o4Jp7oiomWIp7f9uM8WMzL5QV7iAyNAgD4eVQeEUSoPWariBg/gIQmuLH9vFTu/7Q/j25yb+H3diQNrwIZ518/R8rL2i+Cx2MSkywextoV4GH3arMYkZVYn9dlbAOkDgc78f3O3Tssf/bkELAZIwvZHB4OOgBWvHMfjSX5+ppUeO3W+N/Yh8/cRI2u5MG19qEEeQzVv7FyouNcAwQhIwXs5MeEwxbzCUNeH/Ohcwi3ztYp1Jjf0FO8X483aHDD4FCDfnVRLOSlhvjC8IFYM160lWRM3N4oJ5W/ZAH80MdedTTDn3Z1YhlJ18sKBj5/dzaI49HoVuAJKS/EQTMScuKnPIG2nuNaQMe0RMSq6Ka3dGpg17lCYvEMoWAtcsYXxAqc5ezHtopvCJvjLVj7AgC5h2AR8LPQ+EdtNXjCU0u42Das58JRYgJyNeT1o5tmuJCFy1mxPtb4dHRJ9R5u00hv2CdhJ2Yl2JDZH1B0NlOVj9WgA3YWveEvTxyvrTFGF8QLpiHB9wrEvvVtqsie9rQAZ/Z5QWPk8VLTFiJO2pIcN1O8gXZwqgPnTI5K49pagtdCDwWURtOqONdOuYHmZyM7yEV80N67C/aQLDojva8c3uaPj9IpxygFRlfyAHM3SxUkT1tfIl3WAfsDIVedqmHlZjbSE/JBi/KSLx2+OC9ZOVV2qC5LHQxIByrPDr6VTXeA1VWX2bG97XE/sKObUPoYPXjBXjLyXc0AZMxvpDJAaKiipzhXpEj2vUsPW3uCE6K/dYJvMjLQhH1/g6IWCgCoo5o92DZ8xDI710niuR0xA17mwztBS1kg465JATScWuNt1kX8jO+ryX2F2rHtZkFkW0mzh9GbfyXJgauljG+kMPadaAqV+Q3upKAVXXGZ07EOEE+7y/oIo98j80AAVNHJeZiq4d0HfEFglNen28SbzNoGc0hYpyl5MurZAgoO3E85+2gPbFSl5Ph/48J1yhwiPgssc5nXq8TQMwrAh3OTI25ZHU42CzPSRpiz3SVk6/UwNGVROXdsoEd94C8pI1KSTc3jgO21X09IU9m6lrXTTjZwLWk2/YU5i8BWm+qQRXZkD2lJ7OXmom0k2KdQoRf1JG9TsImIy4MReogYg+RNBsJ2ZUJiX4vXGyZOCwCeOVgi3LQT3Zv+WKKrdfuTCNa4zn2vKdiigGSvH5vZ5lxzNvxlOd7i8FW769mgMwLyz3nXEyAX8jXcq/XCaBfn/L3KYW0sHghVX49s/ZAIgkK+6q1Z2TCnHzZ51k3gffwcesnpH6xwUA/8nJZE9e6bgJCi73aU2riG2esrc/Zx6sxo3A+EYuG7Ck9GXfOcT9VbrHO6XHS9Wfhv1IJjfPrKI9YPdxJGdcrvW2DL5BUnHKy9bEvski6SGF0wCfxfidhHxDrKPPJs8q9rmLF/6fK0K6IdhOD6kn7+EaID7h73OrtbtLzHPQYd7++YL5dDMzDw9TrEEnIWQ9wiPffsJTzD+9ebv1AYmNrzy/t4yuR41n9bnVVUmRX4xB4+smEvYT5/2FKX9Ww1nUTjhHiSXtKzW3e74Hinw5pAdwbsqf0lKSTzjgx+uNibZ022CfKMO+4IS6BGOoE7MovIGBIuzD2PVlVTnhnni3h5NndjSuOL94fZ/Q8fzI3u3A8CDq6s4Pa82Ho/CTOjeqrI36Q1VrXGeO5uwvb3Lb9pKfEnQZhOhbKr1ITBEEQBKHL0KMuEARBEARBEAETBEEQBEEQARMEQRAEQRBEwARBEARBEETABEEQBEEQBBEwQRAEQRAEETBBEARBEARBBEwQBEEQBEEETBAEQRAEQQRMEARBEARBEAETBEEQBEEQARMEQRAEQRBEwARBEARBEETABEEQBEEQhPP4f6wuHcqeahtEAAAAAElFTkSuQmCC"
      });
  })()