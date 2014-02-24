define(['control/Location'],function(WDLocation){

		
	var WDGameTile = {
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
		bgroundOffset : [{},
							{ xActive : 0, yActive : 0, xinActive : 0, yinActive : 46},  //one cent
							{ xActive : 46, yActive : 0, xinActive : 46, yinActive : 46},  //five cents
							{ xActive : 92, yActive : 0, xinActive : 92, yinActive : 46},  //ten cents
							{ xActive : 138, yActive : 0, xinActive : 138, yinActive : 46}  //two five cents
							],
		tileStroke : 'rgb(43,136,148',
		tileFill : 'rgb(201,227,230)',
		textAdjust : [0,4,4,8,8],
		defaultCoinColor : 'rgb(136,181,180)',
		_location : null,
		direction : 0, //The direction this tile will animate
		/**
		* @param Object coords
		* @return void
		* @description Constructor function - accepts an object containing the following properties:
		* xPos int 'x' coordinate represented in the actual space of the canvas object
		* yPos int 'y' coordinate represented in the actual space of the canvas object
		* xMap Float 'x' coordinate in relation to the tile map - zero based
		* yMap Float 'y' coordinate in relation to the tile map - zero based
		* val int currency value represented in index this.currencyValues[]
		**/
		initialize : function(opts){
			this.xMap = opts.xMap;
			this.yMap = opts.yMap;
			this.xPos = (opts.xPos===undefined) ? WDLocation.FindPhysicalLocation({x : this.xMap, y : this.yMap}).x : opts.xPos;
			this.yPos = (opts.yPos===undefined) ? WDLocation.FindPhysicalLocation({x : this.xMap, y : this.yMap}).y : opts.yPos;
			this._val = opts.val;
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
		* @description tile currency value as represented as the index of Game.defaultSettings.currencyValues[]
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
			//console.info('setting setCurVal:' + currencyVal)
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
			window._game.gameBoard[this.getMapLocation().x][this.getMapLocation().y].active = false;
		},
		removeFromBoard : function() {
			window._game.gameBoard[this.getMapLocation().x][this.getMapLocation().y] = { val : 0, active : false };
		},
		addToBoard : function(newlocation) {
			window._game.gameBoard[newlocation.x][newlocation.y] = { val : this.getValue(), active : true };
			this.setMapLocation(newlocation);
		},
		move : function(direction){
			
			var newLocation = (direction === WDLocation.MoveDirection.EXPRESS) ? WDLocation.nextBottom(this) : WDLocation.TransformLocation(this.getMapLocation(),direction);

			if(WDLocation.ValidateMove(newLocation)){

				this.removeFromBoard();
				this.addToBoard(newLocation);
				window._game.Update();
				
				if(window._game.debugFlags & WD.Game.debugMovement)
					console.info('[MOVEMENT] Action Tile:' + this.toString());

			}

			window._game.lastgameBoard.push(jQuery.extend(true, {}, window._game.gameBoard));
			window.debugger.updateSnapshotText(window._game.lastgameBoard.length);

			//if tile has reached another tile (or bottom) - freeze and create a new one
			this.checkRestingPlace();

		},
		checkRestingPlace : function(){
			
			//console.info(WDLocation.LookAhead(this.getMapLocation()));
			if(WDLocation.LookAhead(this.getMapLocation())){
				if(window._game.Reactive(this)){ //A reaction has been detected - start cleaning up tiles
					window._game.StartBoardTransition();
					WD.AssetLoader.getResource('matchSound').play();
				} else if(this.getMapLocation().y === 0) { //at the top
					Event.fire(document,'WD:gameover');
				} else {
					this.setInActive();
					window._game.CreateActionPiece(startingPiecePositionX,startingPiecePositionY);
					window._game.Update();
				} 
			}
		},
		render : function(_canvasContext,activeState){
			if(showSkin){ 
				if(activeState) {
					_canvasContext.drawImage(this.activePic,this.bgroundOffset[this._val].xActive,this.bgroundOffset[this._val].yActive,46,46,this.xPos+2,this.yPos+2,46,46);
				} else {
					//console.info(this._val);
					_canvasContext.drawImage(this.activePic,this.bgroundOffset[this._val].xinActive,this.bgroundOffset[this._val].yinActive,46,46,this.xPos+2,this.yPos+2,46,46);
				}
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
			return '[curVal: ' + this.currencyValue + '] x:' + this.xPos + ' y:' + this.yPos + ' xMap: ' + this.xMap + ' yMap: ' + this.yMap + ' |direction: ' + WDLocation.MoveDescription[this.getDirection()];
		}
	};
		//static properties
		WDGameTile.currencyValues = [-1,1,5,10,25];
		
		return WDGameTile;


});