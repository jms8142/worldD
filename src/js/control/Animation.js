
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

define(['lib/prototype'],function(){

window.WD || ( window.WD = {} ) //application namespace

WD.Animation = Class.create({
    _options : { 
                            pixelSpeed : 100,
                            IncrementDistance : 250,
                            NewSectionSlice : 0,
                            newY : 0,
                            newX : 0
                        },
    canvasStruct : {},
    animateOn : true,
    sourceImage : null,
    _gameTile : null,
    eventTrigger : null,
    debug_Counter : 0,
		initialize : function (opts) {
      this._options.NewSectionSlice = 2;

      var _canvas = document.getElementById('wdCanvas');

      Object.extend(this._options,opts);

      if(this.canvasStruct._canvasContext === undefined){
          
          if (_canvas && _canvas.getContext) {
           console.info('assigning canvas objects');
           this.canvasStruct._canvasContext = _canvas.getContext('2d');
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
         this.sourceImage = this.canvasStruct._canvasBufferContext.getImageData(block.getCanvasLocation().x-1,
                                                                      block.getCanvasLocation().y-1,
                                                                      block.getWidth()+2,
                                                                      block.getHeight()+2
                                                                      );
       }
     
     
      WD.Animation.animate(new Date().getTime(),block.getPosition(),this);

    },
    clearArea : function(rect){
        this.canvasStruct._canvasBufferContext.fillStyle = 'rgb(255,255,255)';
        this.canvasStruct._canvasBufferContext.fillRect(rect.x-1,rect.y-1,rect.width+3,rect.height+3);
    }

});

WD.Animation.DIRECTION = { UP : 0, DOWN : 1, LEFT : 2, RIGHT : 4};
WD.Animation.S_DIRECTION = ["up","down","left","","right"];
WD.Animation.TYPE = { SLIDE : 0, MOVE : 1};

WD.Animation.animate = function(lastTime,_rect,animateObj){
  if(animateObj.animateOn && animateObj._options.animationType !== undefined){
      //if(animateObj._options.animationType == WD.Animation.TYPE.MOVE)
         // console.info('ANIMATION PASS: ' + (++animateObj.debug_Counter));

      var date = new Date();
      var time = date.getTime();
      var timeDiff = time - lastTime;
      var speed = animateObj._options.pixelSpeed;
      var frameDistance = speed * timeDiff / animateObj._options.IncrementDistance;

      //console.info(JSON.stringify(_rect));
      animateObj.clearArea(_rect);
      if(animateObj._options.animationType == WD.Animation.TYPE.MOVE) {
          //console.info('clear: ' + JSON.stringify(_rect));
        }

      //if(animateObj._options.animationType == WD.Animation.TYPE.MOVE)
      //console.info(JSON.stringify(animateObj._options));

      switch (animateObj._options.animationType){
          case WD.Animation.TYPE.SLIDE :
          
            if(animateObj._options.NewSectionSlice > animateObj.sourceImage.height){
                animateObj.animateOn = false;
                //fire animation done event
                document.fire(animateObj._options.endEvent);
            } else {
              
                animateObj._options.NewSectionSlice += Math.round(frameDistance);
                lastTime = time;

                if(animateObj._options.direction === undefined)
                  return;
     
                var NewCaptureArea = {};
                NewCaptureArea = WD.Animation.slide(animateObj); //calculate the new dimensions of what to copy from the original image
               
            }


          break;
          case WD.Animation.TYPE.MOVE :
            
            //console.info(animateObj._options.newY);
            //console.info((_rect.y +  animateObj._options.newY));
            //console.info('NewSectionSlice: ' + animateObj._options.NewSectionSlice + ' sourceImage.height: ' + animateObj.sourceImage.height);
            animateObj._options.newY += Math.round(frameDistance);
            
            

            if((animateObj._gameTile.getCanvasLocation().y  +  animateObj._options.newY) > animateObj._options.endY) { //this is one step behind - should be compared to the new position
            console.info('move called');
            
            //if(animateObj._options.NewSectionSlice)
            
                animateObj.animateOn = false;
                //fire animation done event
                document.fire(animateObj._options.endEvent);
            } else {
                 //animateObj._options.NewSectionSlice += Math.round(frameDistance);
                
                 //console.info('frameDistance: ' + frameDistance);
                 animateObj._options.NewSectionSlice += Math.round(frameDistance);
                 //console.info('NewSectionSlice: ' + animateObj._options.NewSectionSlice);
                 lastTime = time;

                 var NewCaptureArea = {};
                 NewCaptureArea = WD.Animation.move(animateObj); //calculate the new dimensions of what to copy from the original image
               
                 //adjust clear area for next frame
                 _rect = { x : NewCaptureArea.xPlacement, y : NewCaptureArea.yPlacement, width : NewCaptureArea.width, height : NewCaptureArea.height};
            }
            break;
      }
      //if(animateObj._options.animationType == WD.Animation.TYPE.MOVE)
      //  console.info(JSON.stringify(NewCaptureArea));

      if(animateObj.animateOn) {
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
              WD.Animation.animate(lastTime,_rect,animateObj);
          });
    
        }
    }

}

WD.Animation.slide = function(animateObj){
    var NewCaptureArea = {};

    if(animateObj._options.direction === WD.Animation.DIRECTION.UP || animateObj._options.direction === WD.Animation.DIRECTION.DOWN){
        NewCaptureArea.xPlacement = animateObj._gameTile.getCanvasLocation().x - 1;
        NewCaptureArea.width = animateObj.sourceImage.width;
        NewCaptureArea.x = 0;       
    } else { //right or left
        NewCaptureArea.yPlacement = animateObj._gameTile.getCanvasLocation().y - 1;
        NewCaptureArea.height = animateObj.sourceImage.height;
        NewCaptureArea.y = 0;   
    }
              
    switch (animateObj._options.direction){
        case WD.Animation.DIRECTION.UP :    
            NewCaptureArea.yPlacement = animateObj._gameTile.getCanvasLocation().y  - animateObj._options.NewSectionSlice;         
            NewCaptureArea.height = animateObj.sourceImage.height - animateObj._options.NewSectionSlice;
            NewCaptureArea.y = animateObj._options.NewSectionSlice;
            break;
        case WD.Animation.DIRECTION.DOWN :
            NewCaptureArea.yPlacement = animateObj._gameTile.getCanvasLocation().y + animateObj._options.NewSectionSlice;
            NewCaptureArea.height = animateObj.sourceImage.height - animateObj._options.NewSectionSlice;
            NewCaptureArea.y = 0;       
            break;
        case WD.Animation.DIRECTION.LEFT :      
            NewCaptureArea.xPlacement = animateObj._gameTile.getCanvasLocation().x - animateObj._options.NewSectionSlice;
            NewCaptureArea.width = animateObj.sourceImage.width - animateObj._options.NewSectionSlice;
            NewCaptureArea.x = animateObj._options.NewSectionSlice;
            break;
        case WD.Animation.DIRECTION.RIGHT :     
            NewCaptureArea.xPlacement = animateObj._gameTile.getCanvasLocation().x + animateObj._options.NewSectionSlice;
            NewCaptureArea.width = animateObj.sourceImage.width - animateObj._options.NewSectionSlice;
            NewCaptureArea.x = 0;   
            break;
    }

    return NewCaptureArea;
}

WD.Animation.move = function(animateObj){
  //console.info('in WD.Animation.move')
  var NewCaptureArea = {};
  NewCaptureArea.x = 0;
  NewCaptureArea.y = 0;
  NewCaptureArea.width = animateObj.sourceImage.width;
  NewCaptureArea.height = animateObj.sourceImage.height;
  NewCaptureArea.xPlacement = animateObj._gameTile.getCanvasLocation().x;
  NewCaptureArea.yPlacement = animateObj._gameTile.getCanvasLocation().y + animateObj._options.newY;
 // console.info('new placement: ' + JSON.stringify(NewCaptureArea));
  return NewCaptureArea;
}

/**
  * @param GameTile<arraylist>
  * @return void
  * @description Determines animation direction of each tile and assigns it to gametile.setDirection()
  **/
WD.Animation.assignDirection = function(gameTiles){

  //console.info(gameTiles);
  //console.info(gameTiles.toString());
  var middle = false,
  direction = 0;
  if(gameTiles.length > 1){
    //console.info(gameTiles.length);

    //if the starter tile is in the middle of a 3 tile pattern
    if(gameTiles.length === 3 &&
      gameTiles[0].xMap > gameTiles[1].xMap &&
      gameTiles[0].xMap < gameTiles[2].xMap
      ) {
      console.info('monkey in the middle situation');
      middle = true;
    } else {
        if(gameTiles[0].getMapLocation().y == gameTiles[1].getMapLocation().y){
          direction = (gameTiles[0].getMapLocation().x > gameTiles[1].getMapLocation().x) ? WD.Animation.DIRECTION.RIGHT : WD.Animation.DIRECTION.LEFT;
        } else {
          direction = WD.Animation.DIRECTION.UP; //only other possible direction to animate
        }
    }

    for(x = 1; x < gameTiles.length; x++){
      if(middle){
        if(x === 1){
          console.info(WD.Animation.DIRECTION.RIGHT);
          gameTiles[x].setDirection(WD.Animation.DIRECTION.RIGHT);
        } else {
          gameTiles[x].setDirection(WD.Animation.DIRECTION.LEFT);
        }
      } else {
        gameTiles[x].setDirection(direction);
      }
     
    }

   
  }
}

});