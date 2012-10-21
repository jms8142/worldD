var ScoreTracker = Class.create(DrawableElement, {
	backgroundColor : 'rgb(77,77,77)',
	textColor : 'rgb(255,255,255)',
	textSpaceWidth : 100,
	activeSquare : 'rgb(33,128,53)',
	inActiveSquare : 'rgb(106,91,91)',
	textPosition : { 'x' : 0, 'y' : 0},
	dollarSign : new Image(),
	height : 50,
	canvasEl : null,
	drawScoreBoard : function(_canvasContext){

		this.dollarSign.src = 'assets/dollar.png';
		
		this.canvasEl = document.getElementById('wdCanvas');
		
		this.setToGradient(_canvasContext);
		_canvasContext.fillRect(0,this.canvasEl.height-this.height,this.canvasEl.width,50);
		
		//draw score text
		
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
		//clear first
		this.setToGradient(_canvasContext);
		_canvasContext.fillRect(0,this.canvasEl.height-this.height,100,50);
		
		var score = score.toFixed(2);
		_canvasContext.fillStyle = this.textColor;
		_canvasContext.fillText("Total: $" + score, this.textPosition.x, this.textPosition.y);

		this.drawMoneySquares(10,_canvasContext,score)
	},
	setToGradient : function(_canvasContext){
		//draw background
		var my_gradient = _canvasContext.createLinearGradient(0,this.canvasEl.height-this.height,0, this.canvasEl.height);
		my_gradient.addColorStop(0,"rgb(140,131,130)");
		my_gradient.addColorStop(1,'rgb(28,24,24)');
		_canvasContext.fillStyle = my_gradient;//this.backgroundColor;
	},
	drawMoneySquares : function(num,_canvasContext,score){
		
		score = (score!==undefined) ? Math.round(score) : score = 0;
		
		var totalWidth = this.canvasEl.width - this.textSpaceWidth,
		boxWidth = Math.floor((totalWidth - (num-1) * 5) / num),
		startX = this.textSpaceWidth,
		yPos =  this.canvasEl.height - this.height + ((this.height - boxWidth) / 2);

		for(var x=0;x<num;x++){	

			if(x < score) {
				_canvasContext.fillStyle = this.activeSquare;
			} else {
				_canvasContext.fillStyle = this.inActiveSquare;
			}

			_canvasContext.fillRect(startX,yPos,boxWidth,boxWidth);

			if(x < score)
				_canvasContext.drawImage(this.dollarSign,startX + (boxWidth * .25),yPos + (boxWidth * .1));
			
			startX += boxWidth + 5;
		}


	}

});
