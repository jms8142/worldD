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

	initialize : function (val,coords){
		//console.info('new behavior created with ' + val);
		this.value = val;
		this.chain = new Array();
		this.chain[0] = new GameTile(coords.x,coords.y);
		this.chain[0].setValue(this.value);
			//{ val : this.value, x : coords.x, y : coords.y };

	},
	setValue : function(val){
		this.value = val;
	},
	getValue : function(){
		return this.value;
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
	hasReaction : function(val,location){
		//console.info('in hasReaction with ' + val);

		for(var i = 0; i < this.reactorDefinition[this.value].length; i++){
			//console.info('looking at ' + this.reactorDefinition[this.value][i]);
			if(val === this.reactorDefinition[this.value][i]) {
				this.addCombo(val,location);
				return true;
			}
		}
		
		return false;
	},
	addCombo : function(val,location){

		//this.chain.push({ val : val, x : location.x, y : location.y});
		this.chain.push(new GameTile(location.x,location.y));
		this.chain[this.chain.length-1].setValue(val);
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