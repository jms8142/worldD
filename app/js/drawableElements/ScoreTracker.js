/**
* Score Management Class
* Dependencies: 
* 
*/

WD.namespace('WD.drawableElements.ScoreTracker');

WD.drawableElements.ScoreTracker = (function(wdapp){
	var assetLoader = wdapp.util.AssetLoader,
	_ScoreTracker = wdapp.drawableElements.ScoreTracker,
	backgroundColor = 'rgb(77,77,77)',
	textColor = '#FFF',
	textSpaceWidth = 90,
	activeSquare = 'rgb(33,128,53)',
	inActiveSquare = 'rgb(106,91,91)',
	font = '16px Arial Black',
	textPosition = { 'x' : 0, 'y' : 0},
	dollarSign = new Image(),
	canvasEl = null,
	construct;

	updateScore = function(score,_canvasContext){
		console.info('updalte');
		var scoreTop = canvasEl.height-_ScoreTracker.HEIGHT;
		//console.info(scoreTop)
		//clear first
		
		setToGradient(_canvasContext);
		_canvasContext.fillRect(0,this.canvasEl.height-_ScoreTracker.height,this.canvasEl.width,_ScoreTracker.height);
		
		var score = score.toFixed(2);
		_canvasContext.fillStyle = '#e14824';
		_canvasContext.font = this.font;
		_canvasContext.fillText("Total: $" + score, this.textPosition.x, this.textPosition.y);


		_canvasContext.fillStyle = this.textColor;
		_canvasContext.font = this.font;
		_canvasContext.fillText("Level 1 ", this.canvasEl.width-70, this.textPosition.y);

		this.drawOutlines(_canvasContext);
		this.drawMoneySquares(10,_canvasContext,score)

		if(score>0) {
			WD.AssetLoader.getResource('dollarSound').play();
		}
	}

	setToGradient = function(_canvasContext){
		//draw background
		var my_gradient = _canvasContext.createLinearGradient(0,this.canvasEl.height-_ScoreTracker.height,0, this.canvasEl.height);
		my_gradient.addColorStop(0,"rgb(96,96,96)");
		my_gradient.addColorStop(.5,"rgb(88,88,88)");
		my_gradient.addColorStop(1,"rgb(58,58,58)");
		_canvasContext.fillStyle = my_gradient;//this.backgroundColor;
	}

	construct = function(){
		
	}

	construct.prototype = {
		drawScoreBoard : function(_canvasContext){
		
			dollarSign = assetLoader.getResource('objects');
			canvasEl = document.getElementById('wdCanvas');
				
			//draw score text
			textPosition.x = 10;
			textPosition.y = canvasEl.height - this.getHeight()  + 80;

			updateScore(0,_canvasContext);

		}
	}



	return construct;


}(WD));

WD.drawableElements.ScoreTracker.HEIGHT = 100;
/*

WD.ScoreTracker = Class.create({
	
	,
	drawOutlines : function(_canvasContext){
		_canvasContext.lineWidth = 1;

		_canvasContext.strokeStyle = "#292929";
		_canvasContext.beginPath();
		_canvasContext.moveTo(0,501);
		_canvasContext.lineTo(_canvasContext.canvas.width,501);
		_canvasContext.stroke();

		_canvasContext.strokeStyle = "#787878";
		_canvasContext.beginPath();
		_canvasContext.moveTo(0,503);
		_canvasContext.lineTo(_canvasContext.canvas.width,503);
		_canvasContext.stroke();
	},
	drawMoneySquares : function(num,_canvasContext,score){
		
		score = (score!==undefined) ? Math.round(score) : score = 0;
		
		var totalWidth = this.canvasEl.width - this.textSpaceWidth,
		boxWidth = 40,
		boxHeight = 40,
		startX = 7,
		gutter = 4,
		yPos =  this.canvasEl.height - WD.ScoreTracker.height + 10;

		for(var x=0;x<num;x++){	
			

			if(x < score) {
				_canvasContext.drawImage(this.dollarSign,50,140,boxWidth,boxHeight,startX,yPos,boxWidth,boxHeight);	
			} else {
				_canvasContext.drawImage(this.dollarSign,4,140,boxWidth,boxHeight,startX,yPos,boxWidth,boxHeight);		
			}
					
			
			startX += boxWidth + gutter;
		}


	}

});

WD.ScoreTracker.height = 100;


});*/