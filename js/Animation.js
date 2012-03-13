
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


WDAnimation.animateBlock = function(_canvas,block,opts){

    Object.extend(WDAnimation._options,opts);

    if(WDAnimation.canvasStruct._canvasContext === undefined){
         //console.info('null, so creating a new one');
         //WDAnimation._context = canvas.getContext('2d');
         WDAnimation.canvasStruct._canvasContext = _canvas.getContext('2d');
         WDAnimation.canvasStruct._canvasBuffer = document.createElement('canvas');
         WDAnimation.canvasStruct._canvasBuffer.width = _canvas.width;
         WDAnimation.canvasStruct._canvasBuffer.height = _canvas.height;
         WDAnimation.canvasStruct._canvasBufferContext = WDAnimation.canvasStruct._canvasBuffer.getContext('2d');
    }
	
   
    WDAnimation.animate(new Date().getTime(),block.getPosition());


	/* http://www.8bitrocket.com/2009/05/03/tutorial-clearing-a-blit-canvas-by-erasing-only-the-portions-that-have-changed-using-damage-maps-or-a-dirty-rect/ */
};

WDAnimation.animate = function(lastTime,_rect){
    if(WDAnimation.animateOn){
        //console.info(_rect);

        if(WDAnimation._options.NewSectionSlice > imgd.height){
            WDAnimation.animateOn = false;
        }



        var date = new Date();
        var time = date.getTime();
        var timeDiff = time - lastTime;
        var speed = WDAnimation._options.pixelSpeed;
        var frameDistance = speed * timeDiff / WDAnimation._options.IncrementDistance;

        //console.info(WDAnimation._options.direction);

        if(WDAnimation._options.direction === undefined)
            return;

 
        var NewCaptureArea = {};

        if(WDAnimation._options.direction === WDAnimation.Direction.UP || WDAnimation._options.direction === WDAnimation.Direction.DOWN){
            NewCaptureArea.xPlacement = _gameTile.getCanvasLocation().x - 1;
            NewCaptureArea.width = imgd.width;
            NewCaptureArea.x = 0;       
        } else { //right or left
            NewCaptureArea.yPlacement = _gameTile.getCanvasLocation().y - 1;
            NewCaptureArea.height = imgd.height;
            NewCaptureArea.y = 0;   
        }

        WDAnimation._options.NewSectionSlice += frameDistance;
        //var NewSectionSlice = frameDistance;
       // console.info(WDAnimation._options.NewSectionSlice);

        lastTime = time;


        WDAnimation.clearArea(_rect);
        
       // console.info(WDAnimation._options.direction);
        switch (WDAnimation._options.direction){
            case WDAnimation.Direction.UP :    
                NewCaptureArea.yPlacement = _gameTile.getCanvasLocation().y  - WDAnimation._options.NewSectionSlice;         
                NewCaptureArea.height = imgd.height - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.y = WDAnimation._options.NewSectionSlice;
                break;
            case WDAnimation.Direction.DOWN :
                NewCaptureArea.yPlacement = _gameTile.getCanvasLocation().y + WDAnimation._options.NewSectionSlice;
                NewCaptureArea.height = imgd.height - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.y = 0;       
                break;
            case WDAnimation.Direction.LEFT :      
                NewCaptureArea.xPlacement = _gameTile.getCanvasLocation().x - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.width = imgd.width - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.x = WDAnimation._options.NewSectionSlice;
                break;
            case WDAnimation.Direction.RIGHT :     
                NewCaptureArea.xPlacement = _gameTile.getCanvasLocation().x + WDAnimation._options.NewSectionSlice;
                NewCaptureArea.width = imgd.width - WDAnimation._options.NewSectionSlice;
                NewCaptureArea.x = 0;   
                break;
        }

        //console.info(NewCaptureArea);
        try {
            //console.info(imgd);
           // WDAnimation.canvasStruct._canvasBufferContext.clearRect(0,0,300,300);
           WDAnimation.canvasStruct._canvasBufferContext.putImageData(imgd,
                                            NewCaptureArea.xPlacement,
                                            NewCaptureArea.yPlacement,
                                            NewCaptureArea.x,
                                            NewCaptureArea.y,
                                            NewCaptureArea.width,
                                            NewCaptureArea.height
                                            );
           // console.info(JSON.stringify(NewCaptureArea));
            WDAnimation.canvasStruct._canvasContext.drawImage(WDAnimation.canvasStruct._canvasBuffer,0,0);
            
        } 
        catch(err){
            console.info(err.message);
            console.info(NewCaptureArea);
            window.clearInterval(_timer);
        }
    
       requestAnimFrame(function(){
            WDAnimation.animate(lastTime,_rect);
        });

    


    } else {
         WDAnimation.clearArea(_rect);
    }
}

WDAnimation.clearArea = function(rect){
    WDAnimation.canvasStruct._canvasBufferContext.fillStyle = 'rgb(255,255,255)';
    WDAnimation.canvasStruct._canvasBufferContext.fillRect(rect.x-1,rect.y-1,rect.width+3,rect.height+3);
}
