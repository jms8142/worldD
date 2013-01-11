define(['lib/prototype'],function(){
window.WD || ( window.WD = {} ) //application namespace

WD.GameTile = Class.create({
	xPos : 0,
	yPos : 0,
	xMap : 0,
	yMap : 0,
	_height : 50,
	_width : 50,
	_val : 0,
	_text : '',
	currencyValue : 0,
	quad : false,
	strokeWidth : 1,
	colorMap : ['','rgb(183,129,26)','rgb(136,181,180)','rgb(136,181,180)','rgb(136,181,180)'],
	bgroundOffset : [[],
						[  //one cent
								{ x : 0, y : 46 } , { x : 0, y : 0 } , { x : 0, y : 92 }
							],  
						[ //five cents
								{ x : 46, y : 46 }, { x : 46, y : 0 } , { x : 46, y : 92}  
							],
						[ //ten cents
								{ x : 92, y : 46 }, { x : 92, y : 0 } , { x : 92, y : 92}
						],
						[  
								{ x : 138,y : 46 }, { x : 138, y : 0 }, { x : 138, y : 92}  //two five cents
						]
					],
	tileStroke : 'rgb(43,136,148)',
	tileFill : 'rgb(201,227,230)',
	textAdjust : [0,4,4,8,8],
	defaultCoinColor : 'rgb(136,181,180)',
	_location : null,
	direction : 0, //The direction this tile will animate
	/**
	* @param Object coords
	* @return void
	* @description Constructor function - accepts an object containing the following properties:
	* xPos int 'x' coordinate represented in the actual space of the canvas object in pixels
	* yPos int 'y' coordinate represented in the actual space of the canvas object in pixels
	* xMap int 'x' coordinate in relation to the tile map - zero based
	* yMap int 'y' coordinate in relation to the tile map - zero based
	* val int currency value represented in index WD.GameTile.currencyValues[]
	**/
	initialize : function(opts){
		this.xMap = opts.xMap;
		this.yMap = opts.yMap;
		this.xPos = (opts.xPos===undefined) ? WD.Location.FindPhysicalLocation({x : this.xMap, y : this.yMap}).x : opts.xPos;
		this.yPos = (opts.yPos===undefined) ? WD.Location.FindPhysicalLocation({x : this.xMap, y : this.yMap}).y : opts.yPos;
		this.setValue(opts.val);
		this.currencyValue = (opts.curVal===undefined) ? WD.GameTile.currencyValues[this._val] : opts.curVal;

		this.activePic = WD.AssetLoader.getResource('objects');
	},
	getQuad : function(){
		return this.quad;
	},
	setHeight : function(_height){
		this._height = _height;
	},
	getHeight : function(){
		return this._height;
	},
	setWidth : function(_width){
		this._width = _width;
	},
	getWidth : function(){
		return this._width;
	},
	setDirection : function(dir){
		this.direction = dir;
	},
	getDirection : function(){
		return this.direction;
	},
	/**		
	* @param int val
	* @return void
	* @description tile currency value as represented as the index val of WD.GameTile.currencyValues[]
	**/
	setValue : function(val){	
		this._val = val;
		this.setCurVal(WD.GameTile.currencyValues[this._val]);
		if(this._val===4){ this.quad = true; }//a coin that can react when in a 2x2 configuration (basically quarters)
	},
	getValue : function(){
		return this._val;
	},
	setCurVal : function(currencyVal){
		this.currencyValue = currencyVal;
		this.setText(this.currencyValue);
	},
	getCurVal : function(){
		return this.currencyValue;
	},
	setText : function(text){
		//console.info('[[setting text to ' + text);
		this._text = text;
	},
	getMapLocation : function(){
		return { x : this.xMap, y : this.yMap };
	},
	setMapLocation : function(coords){
		this.xMap = coords.x;
		this.yMap = coords.y;		

		//update physical location
		this.setCanvasLocation(this.xMap * this._width, this.yMap * this._height)
	},
	setCanvasLocation : function(x,y){
		this.xPos = x;
		this.yPos = y;
	},
	getCanvasLocation : function(){
		return { x : this.xPos, y : this.yPos };
	},
	getPosition : function() {
		return { x : this.xPos, y : this.yPos, width : this._width, height : this._height };
	},
	setStroke : function(color){
		this.tileStroke = color;
	},
	setFill : function(color){
		this.tileFill = color;
	},
	setInActive : function(){
		window._game.gameBoard[this.getMapLocation().x][this.getMapLocation().y].active = WD.GameTile.STATE.INACTIVE;
	},
	removeFromBoard : function() {
		window._game.gameBoard[this.getMapLocation().x][this.getMapLocation().y] = { val : 0, active : WD.GameTile.STATE.INACTIVE };
	}
	/**		
	* places tile into gameboard (currently, a global object)
	* @param object newlocation - location of new tile placement
	* @return void
	**/
	,addToBoard : function(newlocation) {
		window._game.gameBoard[newlocation.x][newlocation.y] = { val : this.getValue(), active : WD.GameTile.STATE.ACTIVE };
		this.setMapLocation(newlocation);
	},
	move : function(direction){
		
		var newLocation = (direction === WD.Location.MoveDirection.EXPRESS) ? WD.Location.nextBottom(this) : WD.Location.TransformLocation(this.getMapLocation(),direction);

		if(WD.Location.ValidateMove(newLocation)){

			this.removeFromBoard();
			this.addToBoard(newLocation);
			window._game.UpdateView();
			
			if(window._game.debugFlags & WD.Game.debugMovement)
				console.info('[MOVEMENT] Action Tile:' + this.toString());

		}
	
		if(_game.settings.debugWindow){
			window._game.lastgameBoard.push(jQuery.extend(true, {}, window._game.gameBoard));
			window.debugger.updateSnapshotText(window._game.lastgameBoard.length);
		}
		//if tile has reached another tile (or bottom) - freeze and create a new one
		this.checkRestingPlace();

	}
	/**		
	* checks reaction potention of resting place for this tile
	* @param bool recursive - set to true if you're calling from any child tile reactions
	* @return void
	**/
	,checkRestingPlace : function(recursive){
		
		if(WD.Location.LookAhead(this.getMapLocation())){
			if(window._game.Reactive(this)){ //A reaction has been detected - start cleaning up tiles
				window._game.StartBoardTransition();
				if(!window._game.settings.testing)
					WD.AssetLoader.getResource('matchSound').play();
			} else if(this.getMapLocation().y === 0) { //at the top
				Event.fire(document,'WD:gameover');
			} else {
				this.setInActive();
				window._game.keysLocked = false;
				//console.info('calling scan from checkRestingPlace()');
				//window._game.scanForSpaces();

				if(!window._game.settings.testing && !recursive) {
					window._game.CreateActionPiece(window._game.startingPiecePositionX,window._game.startingPiecePositionY);
				}
			} 
		}
	}
	,render : function(_canvasContext,activeState){
		if(showSkin){ 
			if(activeState===WD.GameTile.STATE.ANGEL) {
				_canvasContext.globalAlpha = .5;
			}
			_canvasContext.drawImage(this.activePic,this.bgroundOffset[this._val][activeState].x,this.bgroundOffset[this._val][activeState].y,46,46,this.xPos+2,this.yPos+2,46,46);
			
			_canvasContext.globalAlpha = 1;
		} else {
			//fill
			_canvasContext.fillStyle = this.tileFill;
			_canvasContext.fillRect(this.xPos,this.yPos,this._width,this._height);

			_canvasContext.strokeStyle = this.tileStroke;
			_canvasContext.lineWidth = this.strokeWidth;
			_canvasContext.strokeRect(this.xPos,this.yPos,this._width,this._height);

			/* Print Text */			
			if((this.colorMap[this._val] !== undefined))
				_canvasContext.fillStyle = this.colorMap[this._val];
			else
				_canvasContext.fillStyle = this.defaultCoinColor;

			_canvasContext.font = "bold 14px sans-serif";
			_canvasContext.textBaseline = 'middle';
			var textX = this.xPos + ((this._width / 2)-this.textAdjust[this._val]);
			var textY = this.yPos + (this._height / 2)

			_canvasContext.fillText(this._text, textX, textY);
		}
		
	},
	toString : function(){
		return '[x:' + this.xMap + '] ' + this.xPos + 'px, [y:' + this.yMap + '] ' + this.yPos + 'px, dir: ' + WD.Animation.S_DIRECTION[this.direction];
	}
});

//static properties
WD.GameTile.currencyValues = [-1,1,5,10,25];
WD.GameTile.STATE = { INACTIVE : 0, ACTIVE : 1, ANGEL : 2};


});