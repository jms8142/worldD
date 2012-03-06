var Behavior = Class.create({

	name : null,
	value : null,
	reactors : [],
	chain: [],
	startAnimation : false,
	rules : {
		minThreshold : 2 //when to start looking for patterns
		,maxSize : 8
	},
	patternMatrix : 
		[{
			pattern : /^1{5}$/,
			name : "penny to nickel",
			lookahead: false
		},
		{
			pattern : /^5{2}$/,
			name : "nickel to dime",
			lookahead : true
		},
		{
			pattern : /^5{5}$/,
			name : "nickel to quarter",
			lookahead : false
		},
		{
			pattern : /^(10105|51010|10510)$/,
			name : "2 dimes and a nickel to quarter",
			lookahead : false
		},
		{
			pattern : /^(25){4}$/,
			name : "4 quarters to a dollar",
			lookahead : false
		}]

	,
	reactorDefinition : {
		1 : [1],
		5 : [5,10],
		10 : [5,10],
		25 : [25]
	},

	initialize : function (val){
		//console.info('new behavior created with ' + val);
		this.value = val;
		this.chain = [];
		this.chain[0] = this.value;

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
	hasReaction : function(val){
		console.info('in hasReaction with ' + val);

		for(var i = 0; i < this.reactorDefinition[this.value].length; i++){
			//console.info('looking at ' + this.reactorDefinition[this.value][i]);
			if(val === this.reactorDefinition[this.value][i]) {
				this.addCombo(val);
				return true;
			}
		}
		
		return false;
	},
	addCombo : function(val){
		this.chain.push(val);
		if(this.Validate()){
			console.info(this.chain.toString() + ' means money changing!');
			this.startAnimation = true;
		}
	},
	Validate : function(){
		if(this.chain.length >= 2 && this.chain.length < this.rules.maxSize){
			//console.info(this.chain.toString());
			var _string = this.chain.toString().replace(/\,/g,'');
			
			//console.info('starting pattern search for ' + _string);
			for(i = 0;i < this.patternMatrix.length; i++){
				//console.info('trying' + this.patternMatrix[i].pattern);
				var patt= this.patternMatrix[i].pattern; 
				if(patt.test(_string)){
					return true;
				}
			}

		}
	}

	
});