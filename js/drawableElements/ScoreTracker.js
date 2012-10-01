var ScoreTracker = Class.create(DrawableElement, {
	backgroundColor : 'rgb(77,77,77)',
	textColor : 'rgb(255,255,255)',
	textSpaceWidth : 100,
	inActiveSquare : 'rgb(106,91,91)',
	textPosition : { 'x' : 0, 'y' : 0},
	height : 50,
	canvasEl : null,
	drawScoreBoard : function(_canvasContext){
		
		this.canvasEl = document.getElementById('wdCanvas');
		
		//draw background
		_canvasContext.fillStyle = this.backgroundColor;
		_canvasContext.fillRect(0,this.canvasEl.height-this.height,this.canvasEl.width,50);
		
		//draw score text
		_canvasContext.fillStyle = this.textColor;
		this.textPosition.x = 10;
		this.textPosition.y = this.canvasEl.height - (this.height / 2);

		this.updateScore(0,_canvasContext);

		//draw money blocks
		this.drawMoneySquares(10, _canvasContext);


	},
	render : function(){
		console.info('render this');
	},
	updateScore : function(score,_canvasContext){
		var score = score.toFixed(2);
		_canvasContext.fillText("Total: $" + score, this.textPosition.x, this.textPosition.y);
	},
	drawMoneySquares : function(num,_canvasContext){
		var totalWidth = this.canvasEl.width - this.textSpaceWidth,
		boxWidth = Math.floor((totalWidth - (num-1) * 5) / num),
		startX = this.textSpaceWidth,
		yPos =  this.canvasEl.height - this.height + ((this.height - boxWidth) / 2);
		
		_canvasContext.fillStyle = this.inActiveSquare;

		for(var x=0;x<num;x++){	
			_canvasContext.fillRect(startX,yPos,boxWidth,boxWidth);
			startX += boxWidth + 5;
		}


	}

});
