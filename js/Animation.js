
window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();


WDAnimation = Class.create({
		initialize : function () {}
});

WDAnimation.Direction = { UP : 0, DOWN : 1, LEFT : 2, RIGHT : 4};
WDAnimation._options = { 
                            pixelSpeed : 200,
                            IncrementDistance : 1000,
                            NewSectionSlice : 2
                        }

WDAnimation.canvasStruct = {};
WDAnimation.animateOn = true;
WDAnimation.sourceImage = null;
WDAnimation._gameTile = null;
WDAnimation.eventTrigger = null;


WDAnimation.animateBlock = function(block,opts){
    var _canvas = document.getElementById('canvas');
    console.info('animateBlock: ' + block.toString());
    //console.info(opts);
    WDAnimation._gameTile = block;
    Object.extend(WDAnimation._options,opts);

    if(WDAnimation.canvasStruct._canvasContext === undefined){
        if (_canvas && _canvas.getContext) {
         //console.info('assigning canvas objects');
         WDAnimation.canvasStruct._canvasContext = _canvas.getContext('2d');
         //console.info(WDAnimation.canvasStruct._canvasContext);
         WDAnimation.canvasStruct._canvasBuffer = document.createElement('canvas');
         WDAnimation.canvasStruct._canvasBuffer.width = _canvas.width;
         WDAnimation.canvasStruct._canvasBuffer.height = _canvas.height;
         WDAnimation.canvasStruct._canvasBufferContext = WDAnimation.canvasStruct._canvasBuffer.getContext('2d');
         //console.info(WDAnimation.canvasStruct._canvasBufferContext);


          //console.info('done assigning');
      }
    }

    if(WDAnimation.sourceImage === null && block !== null){
      //console.info('assining source image');
      console.info(JSON.stringify(block.getPosition()));
        WDAnimation.sourceImage = _canvasBufferContext.getImageData(block.getCanvasLocation().x-1,
                                                                    block.getCanvasLocation().y-1,
                                                                    block.getWidth()+2,
                                                                    block.getHeight()+2
                                                                    );
    }
	
   
    WDAnimation.animate(new Date().getTime(),block.getPosition());

};

WDAnimation.animate = function(lastTime,_rect){
    if(WDAnimation.animateOn){
        console.info(WDAnimation._options.NewSectionSlice);

        if(WDAnimation._options.NewSectionSlice > WDAnimation.sourceImage.height){
            WDAnimation.animateOn = false;
            //fire animation done event
            console.info('fire event');
            document.fire('WD::tileFinished');
        }



        var date = new Date();
        var time = date.getTime();
        var timeDiff = time - lastTime;
        var speed = WDAnimation._options.pixelSpeed;
       // console.info('speed' + speed);
        var frameDistance = speed * timeDiff / WDAnimation._options.IncrementDistance;

        //console.info(WDAnimation._options.direction);

        if(WDAnimation._options.direction === undefined)
            return;

 
        var NewCaptureArea = {};

        if(WDAnimation._options.direction === WDAnimation.Direction.UP || WDAnimation._options.direction === WDAnimation.Direction.DOWN){
            NewCaptureArea.xPlacement = WDAnimation._gameTile.getCanvasLocation().x - 1;
            NewCaptureArea.width = WDAnimation.sourceImage.width;
            NewCaptureArea.x = 0;       
        } else { //right or left
            NewCaptureArea.yPlacement = WDAnimation._gameTile.getCanvasLocation().y - 1;
            NewCaptureArea.height = WDAnimation.sourceImage.height;
            NewCaptureArea.y = 0;   
        }

        WDAnimation._options.NewSectionSlice += Math.round(frameDistance);
        //var NewSectionSlice = frameDistance;
        //console.info(WDAnimation._options.NewSectionSlice);

        lastTime = time;


        WDAnimation.clearArea(_rect);
        
       // console.info(WDAnimation._options.direction);
        switch (WDAnimation._options.direction){
            case WDAnimation.Direction.UP :    
                NewCaptureArea.yPlacement = WDAnimation._gameTile.getCanvasLocation().y  - WDAnimation._options.NewSectionSlice;         
                NewCaptureArea.height = WDAnimation.sourceImage.height - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.y = WDAnimation._options.NewSectionSlice;
                break;
            case WDAnimation.Direction.DOWN :
                NewCaptureArea.yPlacement = WDAnimation._gameTile.getCanvasLocation().y + WDAnimation._options.NewSectionSlice;
                NewCaptureArea.height = WDAnimation.sourceImage.height - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.y = 0;       
                break;
            case WDAnimation.Direction.LEFT :      
                NewCaptureArea.xPlacement = WDAnimation._gameTile.getCanvasLocation().x - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.width = WDAnimation.sourceImage.width - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.x = WDAnimation._options.NewSectionSlice;
                break;
            case WDAnimation.Direction.RIGHT :     
                NewCaptureArea.xPlacement = WDAnimation._gameTile.getCanvasLocation().x + WDAnimation._options.NewSectionSlice;
                NewCaptureArea.width = WDAnimation.sourceImage.width - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.x = 0;   
                break;
        }

       // console.info(NewCaptureArea);
        try {
           // console.info(WDAnimation.sourceImage);
           // WDAnimation.canvasStruct._canvasBufferContext.clearRect(0,0,300,300);
           
           WDAnimation.canvasStruct._canvasBufferContext.putImageData(WDAnimation.sourceImage,
                                            NewCaptureArea.xPlacement,
                                            NewCaptureArea.yPlacement,
                                            NewCaptureArea.x,
                                            NewCaptureArea.y,
                                            NewCaptureArea.width,
                                            NewCaptureArea.height
                                            );

           // WDAnimation.canvasStruct._canvasBufferContext.putImageData(WDAnimation.sourceImage,0,0);
           // console.info(JSON.stringify(NewCaptureArea));
           
           //console.info(WDAnimation.canvasStruct._canvasBuffer);
           //console.info(WDAnimation.canvasStruct._canvasContext);
           WDAnimation.canvasStruct._canvasContext.drawImage(WDAnimation.canvasStruct._canvasBuffer,0,0);
            
        } 
        catch(err){
            console.info(err.message);
            console.info(NewCaptureArea);
            WDAnimation.animateOn = false;
        }
    
       requestAnimFrame(function(){
            WDAnimation.animate(lastTime,_rect);
        });

    


    } else {
         WDAnimation.clearArea(_rect);
    }
}

WDAnimation.clearArea = function(rect){
   // console.info(JSON.stringify(rect));
    WDAnimation.canvasStruct._canvasBufferContext.fillStyle = 'rgb(255,255,255)';
    WDAnimation.canvasStruct._canvasBufferContext.fillRect(rect.x-1,rect.y-1,rect.width+3,rect.height+3);
}
