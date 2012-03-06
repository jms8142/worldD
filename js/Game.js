var Game = Class.create({

	_canvas : null,
	_canvasContext : null,
	_canvasBuffer : null,
	_canvasBufferContext : null,
	defaultSettings : { 
						columns : 9,
						rows : 5,
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


	initialize : function (_gameBoard,_startingPiece){
		_canvas = document.getElementById('canvas');
		if (_canvas && _canvas.getContext) {
			_canvasContext = _canvas.getContext('2d');
			_canvasBuffer = document.createElement('canvas');
			_canvasBuffer.width = _canvas.width;
			_canvasBuffer.height = _canvas.height;
			_canvasBufferContext = _canvasBuffer.getContext('2d');
		}
		this.GenerateTestGrid();

		if(_gameBoard !== undefined)
			gameBoard = _gameBoard;
		else
			this.CreateTileMap();

		this.CreateActionPiece(4,3,_startingPiece);
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
					_gameTile.setText(this.defaultSettings.currencyValues[gameBoard[i][j].val])
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
		gameBoard[y][x] = { val : actionTile.getValue(), active : true };
	},
	LocationMapper : function(MapCoordinates) {
		MapCoordinates.x *= this.defaultSettings.tileWidth;
		MapCoordinates.y *= this.defaultSettings.tileHeight;
		return MapCoordinates;
	},
	KeyGrab : function(event){
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
		
		//console.info(event);
	},
	Move : function(direction){
		if(this.ValidateMove(actionTile.getLocation(),direction)){
			//console.clear();
			//console.info('current location:')
			// console.info(actionTile.getLocation());
			gameBoard[actionTile.getLocation().y][actionTile.getLocation().x] = { val : 0, active : false };
			//console.info('ok to move!')
			var newLocation = this.TransformLocation(actionTile.getLocation(),direction);

			//console.info('new location');
			//console.info(newLocation);
			gameBoard[newLocation.y][newLocation.x] = { val : actionTile.getValue(), active : true };
			actionTile.setLocation(newLocation);
			//this.PrintGameBoardtoConsole();
			this.Update();
			
		} 
		
		//if tile has reached another tile (or bottom) - freeze and create a new one
		if(this.LookAhead(actionTile.getLocation())){
			if(this.Reactive(actionTile.getLocation())){




				console.info('start some animation');
			} else {
				gameBoard[actionTile.getLocation().y][actionTile.getLocation().x].active = false;
				this.CreateActionPiece(4,0);
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

		if(gameBoard[LookAheadLocation.y][LookAheadLocation.x].val > 0)
			return true;

		return false;
	},
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
	Reactive : function(currentLocation){
		console.clear();
		var searchVectors = Array(this.MoveDirection.LEFT,this.MoveDirection.DOWN,this.MoveDirection.RIGHT);
		var actionValue = gameBoard[currentLocation.y][currentLocation.x].val;
		//console.info('this location:');
		//console.info(currentLocation);
		//console.info('current val: ' + this.defaultSettings.currencyValues[gameBoard[currentLocation.y][currentLocation.x].val]);
		var thisBehavior = new Behavior(this.defaultSettings.currencyValues[actionValue]);
		
		for(var i = 0; i < searchVectors.length; i++){
			//console.info('starting position ' + searchVectors[i]);	
			var nextLocation = this.TransformLocation(currentLocation,searchVectors[i]);
			var nextLocationVal = gameBoard[nextLocation.y][nextLocation.x].val;
			var nextLocationCurrencyVal = this.defaultSettings.currencyValues[nextLocationVal];

			//console.info('nextLocationPosition: x:' + nextLocation.x + ' y:' + nextLocation.y);
		
			//console.info('nextLocationVal: ' + nextLocationVal);
			//console.info('checking ' + searchVectors[i]);


			while(this.LegalRealm(nextLocation) && 
					nextLocationVal > 0 && 
					thisBehavior.hasReaction(nextLocationCurrencyVal)) 
				{

				//console.info('searching ' + searchVectors[i]);
				//console.info('next location:');
				//console.info(nextLocation);
				//console.info(gameBoard[nextLocation.y][nextLocation.x].val);
				nextLocation = this.TransformLocation(nextLocation,searchVectors[i]);
				
				if(this.LegalRealm(nextLocation)) {
					nextLocationVal = gameBoard[nextLocation.y][nextLocation.x].val;
					nextLocationCurrencyVal = this.defaultSettings.currencyValues[nextLocationVal];
				}
				
			}
		}

		return thisBehavior.getAnimationStart();
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
			console.info('[row ' + (i + 1) + '] ' + lineout.substr(0,lineout.length-1));
		}
	}/**/
});