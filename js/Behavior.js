var Behavior = Class.create({

	name : null,
	value : null,
	reactors : [],
	chain: null, //arraylist of gameTile objects
	startAnimation : false,
	rules : {
		minThreshold : 2 //when to start looking for patterns
		,maxSize : 8
	},
	upgradedValue : 0,
	patternMatrix : 
		[{
			pattern : /^1{5}$/,
			name : "penny to nickel",
			lookahead: false,
			newVal : 2
		},
		{
			pattern : /^5{2}$/,
			name : "nickel to dime",
			lookahead : true,
			newVal : 3
		},
		{
			pattern : /^5{5}$/,
			name : "nickel to quarter",
			lookahead : false,
			newVal : 4
		},
		{
			pattern : /^(10105|51010|10510)$/,
			name : "2 dimes and a nickel to quarter",
			lookahead : false,
			newVal : 4
		},
		{
			pattern : /^(25){4}$/,
			name : "4 quarters to a dollar",
			lookahead : false,
			newVal : 5
		}]

	,
	reactorDefinition : {
		1 : [1],
		5 : [5,10],
		10 : [5,10],
		25 : [25]
	},
	/**
	* @param Object GameTile
	* @return void
	* @description Constructor function - accepts a GameTile object
	**/
	//initialize : function (val,_gameTile){
	initialize : function(_gameTile) {
		console.info(_gameTile.toString());
		this.chain = new Array();
		this.chain[0] = _gameTile;
	},
	addReactors : function(reactors){
		this.reactors = reactors;
	},
	getAnimationStart : function(){
		return this.startAnimation;
	},
	getChain : function(){
		return this.chain;
	},
	getUpgradedValue : function(){
		return this.upgradedValue;
	},
	/**		
	* @param object	_gameTile gameTile object
	* @return bool
	* @description true if gameTile value is in the reactorDefinition of the current 'starter' tile
	**/
	//hasReaction : function(val,location){
	hasReaction : function(_gameTile) {
		//console.info('in hasReaction with ' + val);

		for(var i = 0; i < this.reactorDefinition[this.chain[0].getValue()].length; i++){
			//console.info('looking at ' + this.reactorDefinition[this.value][i]);
			if(_gameTile.getValue() === this.reactorDefinition[this.chain[0].getValue()][i]) {
				this.addCombo(_gameTile);
				return true;
			}
		}
		
		return false;
	},
	/**		
	* @param object	_gameTile gameTile object
	* @return void
	* @description Adds gameTile object the chain array
	**/
	//addCombo : function(val,location){
	addCombo : function(_gameTile) {

		//this.chain.push({ val : val, x : location.x, y : location.y});
		//this.chain.push(new GameTile(location.x,location.y));
		//this.chain[this.chain.length-1].setValue(val);
		this.chain.push(_gameTile);

		if(this.Validate()){
			console.info('money changing!');
			this.startAnimation = true;
		}
	},
	Validate : function(){
		if(this.chain.length >= 2 && this.chain.length < this.rules.maxSize){
			//console.info(this.chain);
			var _string = '';
			for(i = 0; i < this.chain.length; i++){
				_string += this.chain[i].getValue();
			}

			//console.info(_string);
		
			//console.info('starting pattern search for ' + _string);
			for(i = 0;i < this.patternMatrix.length; i++){
				//console.info('trying' + this.patternMatrix[i].pattern);
				var patt= this.patternMatrix[i].pattern; 
				if(patt.test(_string)){
					this.upgradedValue = this.patternMatrix[i].newVal;
					return true;
				}
			}

		}
	}

	
});