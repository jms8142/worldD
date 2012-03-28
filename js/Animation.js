
// shim layer with setTimeout fallback
// borrowed from Paul Irish (http://paulirish.com/)
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
    _options : { 
                            pixelSpeed : 100,
                            IncrementDistance : 250,
                            NewSectionSlice : 0
                        },
    canvasStruct : {},
    animateOn : true,
    sourceImage : null,
    _gameTile : null,
    eventTrigger : null,
		initialize : function (opts) {
      this._options.NewSectionSlice = 2;


      var _canvas = document.getElementById('canvas');

     
      Object.extend(this._options,opts);

      if(this.canvasStruct._canvasContext === undefined){
          
          if (_canvas && _canvas.getContext) {
           console.info('assigning canvas objects');
           this.canvasStruct._canvasContext = _canvas.getContext('2d');
           //console.info(this.canvasStruct._canvasContext);
           this.canvasStruct._canvasBuffer = document.createElement('canvas');
           this.canvasStruct._canvasBuffer.width = _canvas.width;
           this.canvasStruct._canvasBuffer.height = _canvas.height;
           this.canvasStruct._canvasBufferContext = this.canvasStruct._canvasBuffer.getContext('2d');
          }
      }


    },
    /**   
    * @param object gameTile object
    * @return void
    **/
    animateBlock : function(block){
     
      //console.info(this.canvasStruct._canvasContext);
       this._gameTile = block;

       if(this.sourceImage === null && block !== null){
         this.sourceImage = _canvasBufferContext.getImageData(block.getCanvasLocation().x-1,
                                                                      block.getCanvasLocation().y-1,
                                                                      block.getWidth()+2,
                                                                      block.getHeight()+2
                                                                      );
       }
     
     
      WDAnimation.animate(new Date().getTime(),block.getPosition(),this);

    },
    clearArea : function(rect){
        //console.info(rect);
        this.canvasStruct._canvasBufferContext.fillStyle = 'rgb(255,255,255)';
        this.canvasStruct._canvasBufferContext.fillRect(rect.x-1,rect.y-1,rect.width+3,rect.height+3);
    }

});

WDAnimation.DIRECTION = { UP : 0, DOWN : 1, LEFT : 2, RIGHT : 4};
WDAnimation.TYPE = { SLIDE : 0, MOVE : 1};

WDAnimation.animate = function(lastTime,_rect,animateObj){
    if(animateObj.animateOn){
      console.info(animateObj._options.animationType);
       // console.info('[NewSectionSlice]: ' + animateObj._options.NewSectionSlice + ' - [height]: ' + animateObj.sourceImage.height);
        if(animateObj._options.NewSectionSlice > animateObj.sourceImage.height){
            animateObj.animateOn = false;
            //fire animation done event
            document.fire(animateObj._options.endEvent);
        } else {
          var date = new Date();
          var time = date.getTime();
          var timeDiff = time - lastTime;
          var speed = animateObj._options.pixelSpeed;
          var frameDistance = speed * timeDiff / animateObj._options.IncrementDistance;





          if(animateObj._options.direction === undefined)
              return;
   
          var NewCaptureArea = {};

          if(animateObj._options.direction === WDAnimation.DIRECTION.UP || animateObj._options.direction === WDAnimation.DIRECTION.DOWN){
              NewCaptureArea.xPlacement = animateObj._gameTile.getCanvasLocation().x - 1;
              NewCaptureArea.width = animateObj.sourceImage.width;
              NewCaptureArea.x = 0;       
          } else { //right or left
              NewCaptureArea.yPlacement = animateObj._gameTile.getCanvasLocation().y - 1;
              NewCaptureArea.height = animateObj.sourceImage.height;
              NewCaptureArea.y = 0;   
          }

          animateObj._options.NewSectionSlice += Math.round(frameDistance);
          //var NewSectionSlice = frameDistance;
          //console.info(animateObj._options.NewSectionSlice);

          lastTime = time;


         animateObj.clearArea(_rect);
        
         // console.info(animateObj._options.direction);
          switch (animateObj._options.direction){
              case WDAnimation.DIRECTION.UP :    
                  NewCaptureArea.yPlacement = animateObj._gameTile.getCanvasLocation().y  - animateObj._options.NewSectionSlice;         
                  NewCaptureArea.height = animateObj.sourceImage.height - animateObj._options.NewSectionSlice;
                  NewCaptureArea.y = animateObj._options.NewSectionSlice;
                  break;
              case WDAnimation.DIRECTION.DOWN :
                  NewCaptureArea.yPlacement = animateObj._gameTile.getCanvasLocation().y + animateObj._options.NewSectionSlice;
                  NewCaptureArea.height = animateObj.sourceImage.height - animateObj._options.NewSectionSlice;
                  NewCaptureArea.y = 0;       
                  break;
              case WDAnimation.DIRECTION.LEFT :      
                  NewCaptureArea.xPlacement = animateObj._gameTile.getCanvasLocation().x - animateObj._options.NewSectionSlice;
                  NewCaptureArea.width = animateObj.sourceImage.width - animateObj._options.NewSectionSlice;
                  NewCaptureArea.x = animateObj._options.NewSectionSlice;
                  break;
              case WDAnimation.DIRECTION.RIGHT :     
                  NewCaptureArea.xPlacement = animateObj._gameTile.getCanvasLocation().x + animateObj._options.NewSectionSlice;
                  NewCaptureArea.width = animateObj.sourceImage.width - animateObj._options.NewSectionSlice;
                  NewCaptureArea.x = 0;   
                  break;
          }

        
          try {
             
             animateObj.canvasStruct._canvasBufferContext.putImageData(animateObj.sourceImage,
                                              NewCaptureArea.xPlacement,
                                              NewCaptureArea.yPlacement,
                                              NewCaptureArea.x,
                                              NewCaptureArea.y,
                                              NewCaptureArea.width,
                                              NewCaptureArea.height
                                              );

             animateObj.canvasStruct._canvasContext.drawImage(animateObj.canvasStruct._canvasBuffer,0,0);
              
          } 
          catch(err){
              console.info(err.message);
              console.info(NewCaptureArea);
              animateObj.animateOn = false;
          }
     
           requestAnimFrame(function(){
                WDAnimation.animate(lastTime,_rect,animateObj);
            });
      
          }

    } 
  }
