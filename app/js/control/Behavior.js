define(['lib/prototype'],function(){

window.WD || ( window.WD = {} ) //application namespace


WD.Behavior = Class.create({

	name : null,
	value : null,
	reactors : [],
	chain: null, //arraylist of gameTile objects
	startAnimation : false,
	nextReactor : null, //array of upgraded tiles which may start their own reactions
	rules : {
		minThreshold : 2 //when to start looking for patterns
		,maxSize : 8
	},
	upgradedValue : 0,
	patternMatrix : 
		[
			{
				pattern : /^1{5}$/,
				name : "penny to nickel",
				lookahead: false,
				newVal : [2]
			},
			{
				pattern : /^5{2}$/,
				name : "nickel to dime",
				lookahead : true,
				newVal : [3]
			},
			{
				pattern : /^5{5}$/,
				name : "nickel to quarter",
				lookahead : false,
				newVal : [4]
			},
			{
				pattern : /^(10105|51010|10510)$/,
				name : "2 dimes and a nickel to quarter",
				lookahead : false,
				newVal : [4]
			},
			{
				pattern : /^(25){4}$/,
				name : "4 quarters to a dollar",
				lookahead : false,
				newVal : [5]
			},
			{
				pattern : /^(10){5}$/,
				name : "5 dimes to a quarter",
				lookahead : false,
				newVal : [4,4]
			}
		]

	,
	reactorDefinition : {
		1 : [1],
		5 : [5,10],
		10 : [5,10],
		25 : [25]
	},
	/**
	* @param WD.Game.Tile
	* @return void
	* @description Constructor function - accepts a WD.Game.Tile object
	**/
	//initialize : function (val,_gameTile){
	initialize : function(_gameTile) {

		console.info('Behavior created');
		
		if(window.navigator.userAgent.indexOf('AppleWebKit') === -1) //Chrome doesn't have clear()
			//console.clear();

		if(_game.debugFlags & WD.Game.debugBehavior)
			console.info("[BEHAVIOR] Chain[0]:" + _gameTile.toString());

		this.chain = new Array();
		this.nextReactor = new Array();
		this.chain[0] = _gameTile;		
	},
	addReactors : function(reactors){
		this.reactors = reactors;
	},
	getAnimationStart : function(){
		return this.startAnimation;
	},
	getChain : function(){
		//console.info(this.chain);
		return this.chain;
	},
	getUpgradedValue : function(){
		return this.upgradedValue;
	},
	addChild : function(_gameTile){
		//console.info(typeof _gameTile);
		//console.info(typeof this.nextReactor);
		//console.info(this.nextReactor);
		//console.info(this.chain);
		//console.info(_gameTile2);
		(this.nextReactor.length === 0) ? this.nextReactor[0] = _gameTile : this.nextReactor.push(_gameTile);
		//this.nextReactor[0] = _gameTile;//_gameTile;
		//this.nextReactor.push({ name : "random object"});
		//this.nextReactor.push(_gameTile2);

		//console.info(this.nextReactor);
	},
	getChildren : function(){
		return this.nextReactor;
	},
	/**		
	* True if gameTile value is in the reactorDefinition of the current 'starter' tile, which is index 0 in this.chain
	* @param object GameTile The game tile we're comparing against
	* @return bool
	**/
	hasReaction : function(_gameTile) {
		if(_game.debugFlags & WD.Game.debugBehavior)
				console.info('[BEHAVIOR] Testing against:' + _gameTile.toString());

		for(var i = 0; i < this.reactorDefinition[this.chain[0].getCurVal()].length; i++){
			if(_gameTile.getCurVal() === this.reactorDefinition[this.chain[0].getCurVal()][i]) {
				this.addCombo(_gameTile);
				return true;
			}
		}
		
		return false;
	},
	/**		
	* @param GameTile
	* @return void
	* @desc  - Adds gameTile object the chain array
	**/
	addCombo : function(_gameTile) {
		//console.info('pushing' + _gameTile.toString());
		this.chain.push(_gameTile);
		//console.info(this.chain);
		if(this.Validate()){
			WD.Animation.assignDirection(this.chain);
			this.startAnimation = true;
		}
	},
	/**
	* @param GameTile
	* @return bool 
	* @desc - tests whether or not this gametile is in a group of 4 reactive tiles (like 4 quarters) - for now this is hardcoded to react against $.25 values
	*/
	runBoxCheck : function(_gameTile){

		var searching = true,
		location = new WD.Location,
		thisVal = _gameTile.getValue(),
		reaction,
		tempChain = new Array(),
		magicNumber = 3,
		positionVectors = [
			[{ x : 1, y : 0},{ x : 1, y : 1},{ x : 0, y : 1}],//top left
			[{ x : 0, y : 1},{ x : -1, y : +1},{ x : -1, y : 0}],//top right
			[{ x : -1, y : 0},{ x : -1, y : -1},{ x : 0, y : -1}],//bottom right
			[{ x : 0, y : -1},{ x : 1, y : -1},{ x : 1, y : 0}]//bottom left
		];

		tempChain[0] = _gameTile;

		for(var x = 0;x < positionVectors.length;x++){ //attempt 4 snapshots
			reaction = 0;

			for(var y = 0;y<positionVectors[x].length;y++){
				tileView = {
					x : _gameTile.getMapLocation().x + positionVectors[x][y].x,
					y : _gameTile.getMapLocation().y + positionVectors[x][y].y,
				}

				//legal realm
				if(WD.Location.LegalRealm(tileView)){
					if(thisVal === window._game.gameBoard[tileView.x][tileView.y].val){
						tempChain[y+1] = new WD.GameTile({xMap : tileView.x, yMap : tileView.y, val : thisVal});
						reaction++
					}
				} else {
					break;
				}
				

			}

			if(reaction === magicNumber){
				this.upgradedValue = [5];
				this.startAnimation = true;
				this.chain = tempChain.slice(0,tempChain.length);
				break;
			}		
			
		}

	},
	/**
	* returns true if a pattern is matched against the chain[]
	* @return bool
	*/
	Validate : function(){
		if(this.chain.length >= this.rules.minThreshold && this.chain.length < this.rules.maxSize){
			//console.info(this.chain);
			var _string = '';
			for(i = 0; i < this.chain.length; i++){
				_string += this.chain[i].getCurVal();
			}

			
			if(_game.debugFlags & WD.Game.debugBehavior)
			console.info("[BEHAVIOR] Starting Pattern Search:" + _string);

			for(i = 0;i < this.patternMatrix.length; i++){
				//console.info('trying' + this.patternMatrix[i].pattern);
				var patt= this.patternMatrix[i].pattern; 
				if(patt.test(_string)){
					if(_game.debugFlags & WD.Game.debugBehavior)
						console.info("[BEHAVIOR] Tested positive pattern:" + patt);

					this.upgradedValue = this.patternMatrix[i].newVal;
					//console.info(this.upgradedValue);
					return true;
				}
			}

		}
	}

	
});

});