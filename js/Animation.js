
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
                            pixelSpeed : 100,
                            IncrementDistance : 1000
                        }


WDAnimation.animateBlock = function(context,block,opts){


	
    Object.extend(WDAnimation._options,opts);
    WDAnimation._context = context;
    WDAnimation.animate(new Date().getTime(),block);


	/* http://www.8bitrocket.com/2009/05/03/tutorial-clearing-a-blit-canvas-by-erasing-only-the-portions-that-have-changed-using-damage-maps-or-a-dirty-rect/ */
};

WDAnimation.animate = function(lastTime,_rect){

    console.info(_rect);

    var date = new Date();
    var time = date.getTime();
    var timeDiff = time - lastTime;
    var speed = WDAnimation._options.pixelSpeed;
    var frameDistance = speed * timeDiff / WDAnimation._options.IncrementDistance;

    console.info(WDAnimation._options.direction);

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

    lastTime = time;
    WDAnimation.clearArea(_rect._x,_rect._y,_rect._width,_rect._height)


    try {
       /* _canvasBufferContext.putImageData(imgd,
                                        NewCaptureArea.xPlacement,
                                        NewCaptureArea.yPlacement,
                                        NewCaptureArea.x,
                                        NewCaptureArea.y,
                                        NewCaptureArea.width,
                                        NewCaptureArea.height
                                        );
        */
        _canvasContext.drawImage(_canvasBuffer,0,0);
    } 
    catch(err){
        console.info(err.message);
        console.info(NewCaptureArea);
        window.clearInterval(_timer);
    }
}

WDAnimation.clearArea = function(x,y,width,height){
    //console.info(context);
    WDAnimation._context.clearRect(x,y,width,height);
}