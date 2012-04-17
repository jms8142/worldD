var Game = Class.create({

	_canvas : null,
	_canvasContext : null,
	_canvasBuffer : null,
	_canvasBufferContext : null,
	defaultSettings : { 
						columns : 9,
						currencyValues : [-1,1,5,10,25],
						tileWidth : 50,
						tileHeight : 50,
						gameRows: 10,
						actionTileFill: 'rgb(251,182,182)',
						actionTileStroke: 'rgb(255,0,0)'
					},
	gameBoard : null,
	actionTile : null,
	MoveDirection : { LEFT : 0, DOWN : 1, RIGHT : 2},
	MoveDescription : ["Left","Down","Right"], //for debugging
	actionBehavior : null,  //'starter' gametile which represents the newly placed tile with potential to begin a reaction
	chainMemberIndex : 0,
	keysLocked : false,

	initialize : function (opts){
		_canvas = document.getElementById('canvas');
		if (_canvas && _canvas.getContext) {
			_canvasContext = _canvas.getContext('2d');
			_canvasBuffer = document.createElement('canvas');
			_canvasBuffer.width = _canvas.width;
			_canvasBuffer.height = _canvas.height;
			_canvasBufferContext = _canvasBuffer.getContext('2d');
		}
		this.GenerateTestGrid();

		if(opts && opts.gameBoard)
			gameBoard = opts.gameBoard;
		else
			this.CreateTileMap();

		//starting piece
		var startingPiece = (opts && opts.startingPiece !== undefined) ? opts.startingPiece : 1;
		var startingPiecePositionX = (opts && opts.startingPiecePosition) ? opts.startingPiecePosition.x : 4;
		var startingPiecePositionY = (opts && opts.startingPiecePosition) ? opts.startingPiecePosition.y : 2;
		
		this.CreateActionPiece(startingPiecePositionX,startingPiecePositionY,startingPiece);
		this.DrawGameTiles();
		

		this.Draw();
		//this.PrintGameBoardtoConsole();

		//register events
		$(document).observe('keydown',this.KeyGrab.bind(this));
		
	},

	Update : function(){
		this.ClearCanvas();
		this.GenerateTestGrid();
		this.DrawGameTiles();
		this.Draw();	
		//this.PrintGameBoardtoConsole();
		
	},

	Draw : function(){
    	_canvasContext.drawImage(_canvasBuffer, 0, 0);
	},
	ClearCanvas : function(){
		_canvasContext.clearRect(0,0,_canvas.width,_canvas.height);
		_canvasBufferContext.clearRect(0,0,_canvasBuffer.width,_canvasBuffer.height);
	},
	CreateTileMap : function(){
			gameBoard = new Array(this.defaultSettings.gameRows);
			for(var i = 0; i < gameBoard.length; i++){
					gameBoard[i] = new Array(this.defaultSettings.columns);
					for (var j = 0; j < gameBoard[i].length; j++){
						//pick random game tile value from currencyValues
						if(i < (this.defaultSettings.gameRows - this.defaultSettings.rows)){
							gameBoard[i][j] = { val : 0, active : false };
						} else {
							var randomVal = Math.floor(Math.random()*(this.defaultSettings.currencyValues.length-1));
							
							gameBoard[i][j] = { val : (randomVal + 1), active : false };
						}
						
					}


			}
			//console.info(gameBoard.length)
	},
	DrawGameTiles : function(){
		var coordX = 0;
		var coordY = 0;
		
		for(var i = 0; i < gameBoard.length;i++){
			for(var j = 0; j < gameBoard[i].length; j++){
				//console.info(gameBoard[i][j]);
				if(gameBoard[i][j].val>0) {

					var _gameTile = new GameTile({ x : coordX, y : coordY, mapX : j, mapY : i });
					_gameTile.setHeight(this.defaultSettings.tileHeight);
					_gameTile.setWidth(this.defaultSettings.tileWidth);
					_gameTile.setValue(gameBoard[i][j].val);
					_gameTile.setCurVal(this.defaultSettings.currencyValues[gameBoard[i][j].val])
					if(gameBoard[i][j].active) {
						_gameTile.setStroke(this.defaultSettings.actionTileStroke);
						_gameTile.setFill(this.defaultSettings.actionTileFill);
					}

					_gameTile.render(_canvasBufferContext);
				}
				
				coordX += this.defaultSettings.tileWidth;
			}

			coordX = 0;
			coordY += this.defaultSettings.tileHeight;
		}

		//update the canvas
		this.Draw();

	},
	CreateActionPiece : function(x,y,val) {
		actionTile = new GameTile(this.LocationMapper({ x : x, y : y, mapX : x, mapY : y}));
		if(val === undefined) 
			var singlePieceVal = Math.floor(Math.random()*(this.defaultSettings.currencyValues.length-1));
		else
			var singlePieceVal = val;

		actionTile.setValue(singlePieceVal+1);	
		actionTile.setCurVal(this.defaultSettings.currencyValues[singlePieceVal+1]);				
		gameBoard[y][x] = { val : actionTile.getValue(), active : true };
	},
	LocationMapper : function(MapCoordinates) {
		MapCoordinates.x *= this.defaultSettings.tileWidth;
		MapCoordinates.y *= this.defaultSettings.tileHeight;
		return MapCoordinates;
	},
	KeyGrab : function(event){
		if(!this.keysLocked){
			var keyID = event.keyCode;
			switch (keyID) {
				case 83 : //S
					this.Move(this.MoveDirection.DOWN);
				break;
				case 40: //down arrow
					this.Move(this.MoveDirection.DOWN);
				break; 
				case 65: //A
					this.Move(this.MoveDirection.LEFT);
				break;
				case 37: //left arrow
					this.Move(this.MoveDirection.LEFT);
				break;
				case 68: //D
					this.Move(this.MoveDirection.RIGHT);
				break;
				case 39: //right arrow
					this.Move(this.MoveDirection.RIGHT);
				break;
			}
		}
		
		//console.info(event);
	},
	Move : function(direction){
		if(this.ValidateMove(actionTile.getMapLocation(),direction)){
			//console.clear();
			//console.info('current location:')
			// console.info(actionTile.getMapLocation());
			gameBoard[actionTile.getMapLocation().y][actionTile.getMapLocation().x] = { val : 0, active : false };
			//console.info('ok to move!')
			var newLocation = this.TransformLocation(actionTile.getMapLocation(),direction);

			//console.info('new location');
			//console.info(newLocation);
			gameBoard[newLocation.y][newLocation.x] = { val : actionTile.getValue(), active : true };
			actionTile.setMapLocation(newLocation);
			//this.PrintGameBoardtoConsole();
			this.Update();
			//console.info(actionTile.toString());
			
		} 

		
		//if tile has reached another tile (or bottom) - freeze and create a new one
		if(this.LookAhead(actionTile.getMapLocation())){
			if(this.Reactive(actionTile)){ //A reaction has been detected - start cleaning up tiles
				this.StartBoardTransition();
			} else {
				gameBoard[actionTile.getMapLocation().y][actionTile.getMapLocation().x].active = false;
				this.CreateActionPiece(4,4);
				this.Update();
			}
			
		}
		
	},
	ValidateMove : function(currentLocation,direction){
		var newLocation = this.TransformLocation(currentLocation,direction);

		if(!(this.LegalRealm(newLocation)) ||
			gameBoard[newLocation.y][newLocation.x].val > 0
			) {
			return false;
		}

		return true;

	},
	LegalRealm : function(coords){
		return (coords.x < this.defaultSettings.columns &&
				coords.x >= 0 &&
				coords.y < this.defaultSettings.gameRows &&
				coords.y >= 0);
	},
	LookAhead : function(currentLocation){
		var LookAheadLocation = this.TransformLocation(currentLocation,this.MoveDirection.DOWN);
		//console.info(this.LegalRealm(LookAheadLocation));
		if(!this.LegalRealm(LookAheadLocation) || gameBoard[LookAheadLocation.y][LookAheadLocation.x].val > 0)
			return true;

		return false;
	},
	/**		
	* @param object	coords tilemap coordinates
	* @param enum MoveDirection enum represention direction to transform to
	* @return object coords of transformed location
	**/
	TransformLocation : function(coords,direction){
		var _coords = { x : coords.x, y : coords.y }; //make sure the function modifies by value, not ref
		switch (direction){
			case this.MoveDirection.DOWN :
				_coords.y += 1;
				break;
			case this.MoveDirection.LEFT :
				_coords.x -= 1;
				break;
			case this.MoveDirection.RIGHT :
				_coords.x += 1;
				break;
		}

		return _coords;
	},
	Reactive : function(_gameTile){
		
		//console.info(_gameTile.toString());
		//console.clear();
		//console.info(_gameTile.currentLocation);
		var searchVectors = Array(this.MoveDirection.LEFT,this.MoveDirection.DOWN,this.MoveDirection.RIGHT);
		//var actionValue = gameBoard[_gameTile.getMapLocation().y][_gameTile.getMapLocation().x].val;
		
		//console.info('actionValue ' + actionValue);
		//console.info('game actionValue ' + _gameTile.getValue());

		//console.info('this location:');
		//console.info(currentLocation);
		//console.info('current val: ' + this.defaultSettings.currencyValues[gameBoard[currentLocation.y][currentLocation.x].val]);
		//this.actionBehavior = new Behavior(this.defaultSettings.currencyValues[actionValue],_gameTile);
		this.actionBehavior = new Behavior(_gameTile);
		
		for(var i = 0; i < searchVectors.length; i++){

			//Skip looking LEFT if tile is on left most column
			if((_gameTile.getMapLocation().x == 0) && 
				searchVectors[i] == this.MoveDirection.LEFT)
				i++;

			//Skip looking DOWN if tile is on bottom row
			if((this.defaultSettings.gameRows-1 == _gameTile.getMapLocation().y) && 
				searchVectors[i] == this.MoveDirection.DOWN)
				i++;
			
			//Skip looking RIGHT if tile is on right most column
			if((_gameTile.getMapLocation().x == this.defaultSettings.columns - 1) && 
				searchVectors[i] == this.MoveDirection.RIGHT)
				break;

			
			var nextLocation = this.TransformLocation(_gameTile.getMapLocation(),searchVectors[i]);
			var nextLocationVal = gameBoard[nextLocation.y][nextLocation.x].val;
			var nextLocationCurrencyVal = this.defaultSettings.currencyValues[nextLocationVal];
			var nextLocationPosition = this.FindPhysicalLocation(nextLocation);
			//console.info('nextLocation: x:' + nextLocation.x + ' y:' + nextLocation.y);
			//console.info('nextLocationPosition: x:' + nextLocationPosition.x + ' y:' + nextLocationPosition.y);
			//console.info('nextLocationVal: ' + nextLocationVal);
			//console.info('nextLocationCurrencyVal: ' + nextLocationCurrencyVal);
			//console.info('checking ' + searchVectors[i]);
			//lets make a gametile instead
			//var _nextTile = new GameTile()
			//var nextInit = { x. }
			//console.info('physical location:');
			//console.info(this.FindPhysicalLocation(nextLocation));
			var nextTileParams = { x : nextLocationPosition.x,
									y : nextLocationPosition.y,
									mapX : nextLocation.x,
									mapY : nextLocation.y,
									val : nextLocationVal,
									curVal : nextLocationCurrencyVal
								};
								//console.info(JSON.stringify(nextTileParams));

			while(this.LegalRealm(nextLocation) && 
					nextLocationVal > 0 && 
					this.actionBehavior.hasReaction(new GameTile(nextTileParams))) 
				{

				//console.info('searching ' + searchVectors[i]);
				//console.info('next location:');
				//console.info(nextLocation);
				//console.info(gameBoard[nextLocation.y][nextLocation.x].val);
				nextLocation = this.TransformLocation(nextLocation,searchVectors[i]);
				
				if(this.LegalRealm(nextLocation)) {
					nextLocationVal = gameBoard[nextLocation.y][nextLocation.x].val;
					nextLocationCurrencyVal = this.defaultSettings.currencyValues[nextLocationVal];
					nextLocationPosition = this.FindPhysicalLocation(nextLocation);
					nextTileParams = { x : nextLocationPosition.x,
									y : nextLocationPosition.y,
									mapX : nextLocation.x,
									mapY : nextLocation.y
								};
				}
				
			}
		}

		return this.actionBehavior.getAnimationStart();
	},
	StartBoardTransition : function(){
		
		var tileGroup = this.actionBehavior.getChain();
		
		//lock keys
		this.keysLocked = true;
		this.PrintGameBoardtoConsole();
		//console.info(tileGroup.length);
		for(var i = 0; i < tileGroup.length; i++){
			console.info(tileGroup[i].toString());
		}


		
		for(i = tileGroup.length - 2; i >= 0; i--){
			gameBoard[tileGroup[i].getMapLocation().y][tileGroup[i].getMapLocation().x] = { val : 0, active : false }; //for now just make them disappear - we'll add fancy animation later
		}

		//console.info(tileGroup[0].getMapLocation().y);
		
		//console.info(tileGroup[0].getMapLocation().x);

		gameBoard[tileGroup[tileGroup.length-1].getMapLocation().y][tileGroup[tileGroup.length-1].getMapLocation().x] = { val : this.actionBehavior.getUpgradedValue(), active : false };
		this.PrintGameBoardtoConsole();
		//now check for any suspended tiles - right now just deal with the action (this may be all we need)
		if(!this.LookAhead(actionTile.getMapLocation())){
			this.chainMemberIndex = tileGroup.length;
			
			document.observe('WD::tileFinished',this.RunChainAnimation.bind(this));
			document.observe('WD::animationFinished',this.animationFinished.bind(this));

			//console.info('about to animate these:');
			/*for(var x = tileGroup.length-1; x > 0; x--){
				console.info('index[' + x + '] ' + tileGroup[x].toString());
			} */

			this.RunChainAnimation();
				
		}
				
	} ,
	RunChainAnimation : function(){	
		var tileGroup = this.actionBehavior.getChain();
		var direction = WDAnimation.DIRECTION.UP;
		
		if(this.chainMemberIndex>1){
			var _options = { animationType : WDAnimation.TYPE.SLIDE, 
								direction : WDAnimation.DIRECTION.UP, 
								pixelSpeed : 400,  
								endEvent : 'WD::tileFinished' 
							};

			var animObject = new WDAnimation(_options);
			animObject.animateBlock(tileGroup[--this.chainMemberIndex]);
		} else {

			var _options = { animationType : WDAnimation.TYPE.MOVE, 
								endX : tileGroup[tileGroup.length-1].getCanvasLocation().x, 
								endY : tileGroup[tileGroup.length-1].getCanvasLocation().y, 
								speed : 100, 
								pixelSpeed : 100, 
								endEvent : 'WD::animationFinished'
							};

			//animate action block
			//var _options = { animationType : WDAnimation.TYPE.MOVE, startX : 0, startY : 0, endX : 0, endY : 0, speed : 100,  endEvent : 'WD::animationFinished' };
			var animObject = new WDAnimation(_options);

			animObject.animateBlock(tileGroup[0]);
		}
	},
	animationFinished : function(){
		this.keysLocked = false;
		this.CreateActionPiece(4,0);
		this.Update();
		//this.PrintGameBoardtoConsole();
		//console.info('animation finished!');
	},
	FindPhysicalLocation : function(coords) {
		var mapX = coords.x;
		var mapY = coords.y;
		mapX = coords.x * this.defaultSettings.tileWidth;
		mapY = coords.y * this.defaultSettings.tileHeight;
		return { x : mapX, y : mapY };

	}/* */,
	// Debugging and Testing Functions 
	GenerateTestGrid : function(){

		var x = 0;
		var y = 0;
		for(var i = 0; i < (this.defaultSettings.gameRows); i++){
			for(var j = 0;j < this.defaultSettings.columns; j++){
				_canvasContext.strokeStyle = 'rgb(234,234,234)';//this.tileColor;
				_canvasContext.lineWidth = 1;
				_canvasContext.strokeRect(x,y,this.defaultSettings.tileWidth,this.defaultSettings.tileHeight);
				x += this.defaultSettings.tileWidth;
			}
			y += this.defaultSettings.tileHeight
			x = 0;
		}
		
	},
	PrintGameBoardtoConsole : function(){
		var lineout;
		for(var i = 0; i < gameBoard.length; i++){
			lineout = '';
			for(var j = 0;j < gameBoard[i].length; j++){
				lineout += gameBoard[i][j].val + '|';
			}
			console.info('[row ' + (i + 1) + '] \t' +  lineout.substr(0,lineout.length-1));
		}
	}/**/
});