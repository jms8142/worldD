/**
* Gameboard printing functions
* 
*/

WD.namespace('WD.debug.Debugger');

WD.debug.Debugger = (function(wdapp){

	return {
		printDebugWindow : 0x1
		,printConsole : 0x2
		,PrintGameBoard : function(gamesettings, output){
			var currencyValues = [-1,1,5,10,25];
			

			var HTMLout = '', lineout = '';
			for(var row = 0; row < gamesettings.gameRows; row++){

				HTMLout += '<tr>';
				lineout = '';
				for(var col = 0;col < gamesettings.columns; col++){
					var displayVal = (gamesettings.gameBoard[col][row].val === 0) ? '-' : currencyValues[gamesettings.gameBoard[col][row].val];
					HTMLout += '<td>' + displayVal + '</td>';
					lineout += gamesettings.gameBoard[col][row].val + '|';
				}
				HTMLout += '</tr>\n';

				if(output===this.printDebugWindow) {
					jQuery('.debugWindow').html("<table class='gameMap'>" + HTMLout + "</table>");
				} else if(output === this.printConsole){
					console.info('[row ' + (row + 1) + '] \t' +  lineout.substr(0,lineout.length-1));
				} 
			}
		}
	}


}(WD));


/*

define(['lib/prototype'],function(){

window.WD || ( window.WD = {} ) //application namespace

WD.Debugger = Class.create({
	initialize : function(){	
		var _this = this;
		jQuery('.step').live('click',function(e){
			var ind = jQuery(this).attr('id') - 1;
			WD.Debugger.PrintGameBoard(window._game.lastgameBoard[ind],WD.Debugger.printConsole);
		});	
	},
	updateSnapshotText : function(step){
		jQuery('.utilinfo').append('<a class="step" href="#" id=' + step + '>' + step + '</a>');
	}

});

}); //require.js
*/