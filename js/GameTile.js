var GameTile = Class.create(DrawableElement,{
	_x : 0,
	_y : 0,
	mapX : 0,
	mapY : 0,
	_height : 50,
	_width : 50,
	_val : 1,
	_text : '',
	strokeWidth : 1,
	colorMap : ['','rgb(183,129,26)','rgb(136,181,180)','rgb(136,181,180)','rgb(136,181,180)'],
	tileStroke : 'rgb(43,136,148',
	tileFill : 'rgb(201,227,230)',
	textAdjust : [0,4,4,8,8],
	defaultCoinColor : 'rgb(136,181,180)',
	currencyValues : [-1,1,5,10,25],
	initialize : function(coords){
		this._x = coords.x;
		this._y = coords.y;
		this.mapX = coords.mapX;
		this.mapY = coords.mapY;
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
	setValue : function(val){		
		this._val = val;
	},
	setText : function(text){
		this._text = text;
	},
	getValue : function(){
		return this._val;
	},
	getLocation : function(){
		return { x : this.mapX, y : this.mapY };
	},
	setLocation : function(coords){
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
		
	}
});