define(['lib/prototype'],function(){

window.WD || ( window.WD = {} ) //application namespace


WD.ScoreTracker = Class.create({
	backgroundColor : 'rgb(77,77,77)',
	textColor : 'rgb(255,255,255)',
	textSpaceWidth : 90,
	activeSquare : 'rgb(33,128,53)',
	inActiveSquare : 'rgb(106,91,91)',
	textPosition : { 'x' : 0, 'y' : 0},
	dollarSign : new Image(),
	canvasEl : null,
	drawScoreBoard : function(_canvasContext){

		this.dollarSign = WD.AssetLoader.getResource('objects');
		this.canvasEl = document.getElementById('wdCanvas');
		
		this.setToGradient(_canvasContext);
		_canvasContext.fillRect(0,this.canvasEl.height-WD.ScoreTracker.height,this.canvasEl.width,WD.ScoreTracker.height);
		
		//draw score text
		
		this.textPosition.x = 10;
		this.textPosition.y = this.canvasEl.height - WD.ScoreTracker.height  + 30;

		this.updateScore(0,_canvasContext);

		//draw money blocks
		this.drawMoneySquares(10, _canvasContext);

	},
	updateScore : function(score,_canvasContext){
		//clear first
		this.setToGradient(_canvasContext);
		_canvasContext.fillRect(0,this.canvasEl.height-WD.ScoreTracker.height,100,50);
		
		var score = score.toFixed(2);
		_canvasContext.fillStyle = this.textColor;
		_canvasContext.font ='12px verdana, arial, sans-serif bold';
		_canvasContext.fillText("Total: $" + score, this.textPosition.x, this.textPosition.y);

		this.drawMoneySquares(10,_canvasContext,score)

		if(score>0) {
			WD.AssetLoader.getResource('dollarSound').play();
		}
	},
	setToGradient : function(_canvasContext){
		//draw background
		var my_gradient = _canvasContext.createLinearGradient(0,this.canvasEl.height-WD.ScoreTracker.height,0, this.canvasEl.height);
		my_gradient.addColorStop(0,"rgb(140,131,130)");
		my_gradient.addColorStop(1,"rgb(28,24,24)");
		_canvasContext.fillStyle = my_gradient;//this.backgroundColor;
	},
	drawMoneySquares : function(num,_canvasContext,score){
		
		score = (score!==undefined) ? Math.round(score) : score = 0;
		
		var totalWidth = this.canvasEl.width - this.textSpaceWidth,
		boxWidth = Math.floor((totalWidth - (num-1) * 5) / num),
		startX = this.textSpaceWidth,
		yPos =  this.canvasEl.height - WD.ScoreTracker.height + 15;

		for(var x=0;x<num;x++){	
			

			if(x < score) {
				_canvasContext.drawImage(this.dollarSign,34,142,25,25,startX + (boxWidth * .25),yPos + (boxWidth * .1),25,25);	
			} else {
				_canvasContext.drawImage(this.dollarSign,2,142,25,25,startX + (boxWidth * .25),yPos + (boxWidth * .1),25,25);		
			}
					
			
			startX += boxWidth + 5;
		}


	}

});

WD.ScoreTracker.height = 100;


});