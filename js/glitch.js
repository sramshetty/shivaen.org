setInterval(function(){ 
    $('.glitch').toggleClass('glitch--v1');  
    setTimeout(function(){
        $('.glitch').toggleClass('glitch--v2');  
    },100);
},5000);