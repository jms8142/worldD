var GameTile = Class.create(DrawableElement,{
	_x : 0,
	_y : 0,
	mapX : 0,
	mapY : 0,
	_height : 50,
	_width : 50,
	_val : 0,
	_text : '',
	currencyValue : 0,
	strokeWidth : 1,
	colorMap : ['','rgb(183,129,26)','rgb(136,181,180)','rgb(136,181,180)','rgb(136,181,180)'],
	tileStroke : 'rgb(43,136,148',
	tileFill : 'rgb(201,227,230)',
	textAdjust : [0,4,4,8,8],
	defaultCoinColor : 'rgb(136,181,180)',
	/**
	* @param Object coords
	* @return void
	* @description Constructor function - accepts an object containing the following properties:
	* { x : float, y : float, mapX : int, mapY : int }
	* x int 'x' coordinate represented in the actual space of the canvas object
	* y int 'y' coordinate represented in the actual space of the canvas object
	* mapX Float 'x' coordinate in relation to the tile map - zero based
	* mapY Float 'y' coordinate in relation to the tile map - zero based
	**/
	initialize : function(opts){
		//console.info(opts);
		this._x = opts.x;
		this._y = opts.y;
		this.mapX = opts.mapX;
		this.mapY = opts.mapY;
		this._val = opts.val;
		this.currencyValue = opts.curVal;
		//console.info(opts.curVal);
		//console.info('new game tile created with the coords ' + this._x + ' and ' + this._y + ' (Map: x:' + this.mapX + ', y:' + this.mapY + ')');
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
	/**		
	* @param int val
	* @return void
	* @description tile currency value as represented as the index of Game.defaultSettings.currencyValues[]
	**/
	setValue : function(val){	
		this._val = val;
	},
	getValue : function(){
		return this._val;
	},
	setCurVal : function(currencyVal){
		this.currencyValue = currencyVal;
		this.setText(this.currencyValue);
		//console.info(this.currencyValue);
	},
	getCurVal : function(){
		return this.currencyValue;
	},
	setText : function(text){
		this._text = text;
	},
	getMapLocation : function(){
		return { x : this.mapX, y : this.mapY };
	},
	setMapLocation : function(coords){
		this.mapX = coords.x;
		this.mapY = coords.y;		

		//update physical location
		this.setCanvasLocation(this.mapX * this._width, this.mapY * this._height)
	},
	setCanvasLocation : function(x,y){
		this._x = x;
		this._y = y;
	},
	getCanvasLocation : function(){
		return { x : this._x, y : this._y };
	},
	getPosition : function() {
		return { x : this._x, y : this._y, width : this._width, height : this._height };
	},
	setStroke : function(color){
		this.tileStroke = color;
	},
	setFill : function(color){
		this.tileFill = color;
	},
	render : function(_canvasContext){
		
		//console.info('game tile');
		//console.info(_canvasContext);
		//fill
		_canvasContext.fillStyle = this.tileFill;
		_canvasContext.fillRect(this._x,this._y,this._width,this._height);

		_canvasContext.strokeStyle = this.tileStroke;
		_canvasContext.lineWidth = this.strokeWidth;
		_canvasContext.strokeRect(this._x,this._y,this._width,this._height);

		/* Print Text */
		
		if((this.colorMap[this._val] !== undefined))
			_canvasContext.fillStyle = this.colorMap[this._val];
		else
			_canvasContext.fillStyle = this.defaultCoinColor;

		_canvasContext.font = "bold 14px sans-serif";
		_canvasContext.textBaseline = 'middle';
		var textX = this._x + ((this._width / 2)-this.textAdjust[this._val]);
		var textY = this._y + (this._height / 2)
		//console.info(this._val);
		//console.info(this.textAdjust[this._val]);

		_canvasContext.fillText(this._text, textX, textY);
		
	},
	toString : function(){
		//console.info(this._val);
		//console.info(this.currencyValue);
		return '[val: ' + this._val + ', curVal: ' + this.currencyValue + '] x:' + this._x + ' y:' + this._y + ' tilemapX: ' + this.mapX + ' tilemapY: ' + this.mapY;
	}
});