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
						populatedRows : 2,
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
	constantPiece : null,
	debugWindow : false,
	debugFlags : 0x0,

	initialize : function (opts){
		if(opts && opts.constantPiece)
			this.constantPiece = opts.constantPiece;

		if(opts && opts.debugShow)
			this.debugFlags = opts.debugShow;

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


		//debug window
		if(opts && opts.debugWindow)
			this.debugWindow = true;

		//console.info(debugWindow);
		//this.PrintGameBoardtoConsole();

		//starting piece
		var startingPiece = (opts && opts.startingPiece !== undefined) ? opts.startingPiece : 1;
		var startingPiecePositionX = (opts && opts.startingPiecePosition) ? opts.startingPiecePosition.x : 4;
		var startingPiecePositionY = (opts && opts.startingPiecePosition) ? opts.startingPiecePosition.y : 2;
		
		this.CreateActionPiece(startingPiecePositionX,startingPiecePositionY,startingPiece);
		this.DrawGameTiles();
		

		this.Draw();
		//this.PrintGameBoardtoConsole();
		if(this.debugWindow)
			this.PrintGameBoardtoDebugWindow();

		//register events
		$(document).observe('keydown',this.KeyGrab.bind(this));
		
	},

	Update : function(){
		this.ClearCanvas();
		this.GenerateTestGrid();
		this.DrawGameTiles();
		this.Draw();	
		//this.PrintGameBoardtoConsole();

		if(this.debugWindow)
			this.PrintGameBoardtoDebugWindow();
	},

	Draw : function(){
    	_canvasContext.drawImage(_canvasBuffer, 0, 0);
	},
	ClearCanvas : function(){
		_canvasContext.clearRect(0,0,_canvas.width,_canvas.height);
		_canvasBufferContext.clearRect(0,0,_canvasBuffer.width,_canvasBuffer.height);
	},
	CreateTileMap : function(){
			gameBoard = new Array(this.defaultSettings.columns);
			for(var i = 0; i < gameBoard.length; i++){
					gameBoard[i] = new Array(this.defaultSettings.gameRows);
					for (var j = 0; j < gameBoard[i].length; j++){
						//pick random game tile value from currencyValues
						if(j < (this.defaultSettings.gameRows - this.defaultSettings.populatedRows)){
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
		

		for(var col = 0; col < this.defaultSettings.columns;col++){
			for(var row = 0; row < this.defaultSettings.gameRows;row++){
				if(gameBoard[col][row].val > 0){
					var _gameTile = new GameTile({ x : coordX, y : coordY, mapX : col, mapY : row });
					_gameTile.setHeight(this.defaultSettings.tileHeight);
					_gameTile.setWidth(this.defaultSettings.tileWidth);
					_gameTile.setValue(gameBoard[col][row].val);
					_gameTile.setCurVal(this.defaultSettings.currencyValues[gameBoard[col][row].val])
					if(gameBoard[col][row].active) {
						_gameTile.setStroke(this.defaultSettings.actionTileStroke);
						_gameTile.setFill(this.defaultSettings.actionTileFill);
					}

					_gameTile.render(_canvasBufferContext);
				}

				coordY += this.defaultSettings.tileHeight;
			}

			coordY = 0;
			coordX += this.defaultSettings.tileWidth;
		}

		//update the canvas
		this.Draw();

	},
	CreateActionPiece : function(x,y,val) {
		//console.info(constantPiece);
		if(this.constantPiece)
			val = this.constantPiece;

		actionTile = new GameTile(this.LocationMapper({ x : x, y : y, mapX : x, mapY : y}));
		if(val === undefined) 
			var singlePieceVal = Math.floor(Math.random()*(this.defaultSettings.currencyValues.length-1));
		else
			var singlePieceVal = val;

		actionTile.setValue(singlePieceVal+1);	
		actionTile.setCurVal(this.defaultSettings.currencyValues[singlePieceVal+1]);				
		gameBoard[x][y] = { val : actionTile.getValue(), active : true };
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
			console.clear();

		
			gameBoard[actionTile.getMapLocation().x][actionTile.getMapLocation().y] = { val : 0, active : false };
			//console.info('ok to move!')
			var newLocation = this.TransformLocation(actionTile.getMapLocation(),direction);

			//console.info('new location');
			//console.info(newLocation);
			gameBoard[newLocation.x][newLocation.y] = { val : actionTile.getValue(), active : true };
			actionTile.setMapLocation(newLocation);
			//this.PrintGameBoardtoConsole();
			this.Update();
			
			if(this.debugFlags & Game.debugMovement)
				console.info('[MOVEMENT] Action Tile:' + actionTile.toString());

		} 

		
		//if tile has reached another tile (or bottom) - freeze and create a new one
		if(this.LookAhead(actionTile.getMapLocation())){
			if(this.Reactive(actionTile)){ //A reaction has been detected - start cleaning up tiles
				this.StartBoardTransition();
			} else {
				gameBoard[actionTile.getMapLocation().x][actionTile.getMapLocation().y].active = false;
				this.CreateActionPiece(4,4);
				this.Update();
			}
			
		}
		
	},
	ValidateMove : function(currentLocation,direction){
		var newLocation = this.TransformLocation(currentLocation,direction);

		if(!(this.LegalRealm(newLocation)) ||
			gameBoard[newLocation.x][newLocation.y].val > 0
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
		//console.info(LookAheadLocation);
		//console.info(this.LegalRealm(LookAheadLocation));
		if(!this.LegalRealm(LookAheadLocation) || gameBoard[LookAheadLocation.x][LookAheadLocation.y].val > 0)
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
		//console.info(_coords);
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

			if(this.debugFlags & Game.debugBehavior)
				console.info('[BEHAVIOR] Checking:' + this.MoveDescription[searchVectors[i]]);
			var nextLocation = this.TransformLocation(_gameTile.getMapLocation(),searchVectors[i]);
			var nextLocationVal = gameBoard[nextLocation.x][nextLocation.y].val;
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
								
			while(this.LegalRealm(nextLocation) &&  //next tile is in legal space
					nextLocationVal > 0 &&  //next tile isn't air
					this.actionBehavior.hasReaction(new GameTile(nextTileParams)) && //next tile has reaction
					this.actionBehavior.getAnimationStart() != true) //that next tile didn't start an instant reaction
				{
					console.info('in while');
				//console.info(JSON.stringify(nextTileParams));
				//console.info('searching ' + searchVectors[i]);
				//console.info('next location:');
				//console.info(nextLocation);
				//console.info(gameBoard[nextLocation.y][nextLocation.x].val);
				nextLocation = this.TransformLocation(nextLocation,searchVectors[i]);
				
				if(this.LegalRealm(nextLocation)) {
					nextLocationVal = gameBoard[nextLocation.x][nextLocation.y].val;
					nextLocationCurrencyVal = this.defaultSettings.currencyValues[nextLocationVal];
					nextLocationPosition = this.FindPhysicalLocation(nextLocation);
					nextLocationCurrencyVal = this.defaultSettings.currencyValues[nextLocationVal];

					nextTileParams = { x : nextLocationPosition.x,
									y : nextLocationPosition.y,
									mapX : nextLocation.x,
									mapY : nextLocation.y,
									curVal : nextLocationCurrencyVal
								};
				}
				
			}
		}

		return this.actionBehavior.getAnimationStart();
	},
	StartBoardTransition : function(){
		if(this.debugFlags & Game.debugTransition)
				console.info('[TRANSITION] Starting Transition');

		var tileGroup = this.actionBehavior.getChain();
		
		//lock keys
		this.keysLocked = true;
		//this.PrintGameBoardtoConsole();
		//console.info(tileGroup.length);
		if(this.debugFlags & Game.debugTransition) {
			for(var i = 0; i < tileGroup.length; i++){
				console.info('[TRANSITION] tile ' + i + ' : ' + tileGroup[i].toString());
			}
		}
		
		//console.info(tileGroup.length);
		for(i = tileGroup.length - 1; i > 0; i--){
		//for(i=0;i<tileGroup.length; i++) {
			console.info('zeroing out tiles index: x ' + tileGroup[i].getMapLocation().x + ' y ' + tileGroup[i].getMapLocation().y);
			gameBoard[tileGroup[i].getMapLocation().x][tileGroup[i].getMapLocation().y] = { val : 0, active : false }; //for now just make them disappear - we'll add fancy animation later
		}

		//this.PrintGameBoardtoConsole();
		//console.info(tileGroup[0].getMapLocation().y);
		
		//console.info(tileGroup[0].getMapLocation().x);
		//gameBoard[tileGroup[tileGroup.length-1].getMapLocation().x][tileGroup[tileGroup.length-1].getMapLocation().y] = { val : this.actionBehavior.getUpgradedValue(), active : false };
		console.info('setting tile index: x ' + tileGroup[0].getMapLocation().x + ' y ' + tileGroup[0].getMapLocation().y + ' to ' + this.actionBehavior.getUpgradedValue());
		gameBoard[tileGroup[0].getMapLocation().x][tileGroup[0].getMapLocation().y] = { val : this.actionBehavior.getUpgradedValue(), active : false };
		
		this.PrintGameBoardtoConsole();
		//this.PrintGameBoardtoConsole('clear');
		//now check for any suspended tiles - right now just deal with the action (this may be all we need)
		//console.info('lookAhead' + this.LookAhead(actionTile.getMapLocation()));
		//if(!this.LookAhead(actionTile.getMapLocation())){
			this.chainMemberIndex = tileGroup.length;
			
			document.observe('WD::tileFinished',this.RunChainAnimation.bind(this));
			document.observe('WD::animationFinished',this.animationFinished.bind(this));

			
			this.RunChainAnimation();
				
		//}
				
	} ,
	RunChainAnimation : function(){	
		console.info('RUNNING CHAIN ANIMATION');
		var tileGroup = this.actionBehavior.getChain();
		var direction = WDAnimation.vector(tileGroup);
		console.info('direction ' + direction);
		//console.info(this.chainMemberIndex);
		if(this.chainMemberIndex>1){
			//determine direction to slide


			var _options = { animationType : WDAnimation.TYPE.SLIDE, 
								direction : direction, 
								pixelSpeed : 40,  
								endEvent : 'WD::tileFinished' 
							};

			var animObject = new WDAnimation(_options);
			animObject.animateBlock(tileGroup[--this.chainMemberIndex]);
		} else { 
			if(tileGroup[0].getMapLocation().y < (this.defaultSettings.gameRows - 1)){ //move this only if tile is in the air (gravity move)
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
			} else {
				//console.info('calling animation Finished');
				this.animationFinished();
			}
			
		}
	},
	animationFinished : function(){
		this.keysLocked = false;
		this.CreateActionPiece(4,4);
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
		var testGrid = 'rgb(234,234,234)';
		var testColor = 'rgb(128,128,128)';
		for(var i = 0; i < (this.defaultSettings.gameRows); i++){
			for(var j = 0;j < this.defaultSettings.columns; j++){
				_canvasContext.strokeStyle = testGrid;
				_canvasContext.lineWidth = 1;
				_canvasContext.strokeRect(x,y,this.defaultSettings.tileWidth,this.defaultSettings.tileHeight);

				//draw coords
				_canvasContext.fillStyle = testColor;
				_canvasContext.font = "bold 10px sans-serif";
				_canvasContext.textBaseline = 'top';
				_canvasContext.fillText(j + "," + i, x + 3,y + 3);


				x += this.defaultSettings.tileWidth;

			}
			y += this.defaultSettings.tileHeight
			x = 0;
		}
		
	},
	PrintGameBoardtoConsole : function(clr){
		if(clr)
			console.clear();

		for(var row = 0; row < this.defaultSettings.gameRows; row++){
			var lineout = '';
			for(var col = 0; col < this.defaultSettings.columns; col++){
				lineout += gameBoard[col][row].val + '|';
			}
			console.info('[row ' + (row + 1) + '] \t' +  lineout.substr(0,lineout.length-1));
		}
	},
	PrintGameBoardtoDebugWindow : function(){
		var HTMLout = '';
		for(var row = 0; row < this.defaultSettings.gameRows; row++){
			HTMLout += '<tr>';
			for(var col = 0;col < this.defaultSettings.columns; col++){
				var displayVal = (gameBoard[col][row].val === 0) ? '-' : this.defaultSettings.currencyValues[gameBoard[col][row].val];
				HTMLout += '<td>' + displayVal + '</td>';
			}
			HTMLout += '</tr>\n';
			//console.info(row);
			jQuery('.debugWindow').html("<table class='gameMap'>" + HTMLout + "</table>");
		}
	}/**/
});

Game.debugBehavior = 0x1;
Game.debugMovement = 0x2;
Game.debugScore = 0x4;
Game.debugTransition = 0x8;