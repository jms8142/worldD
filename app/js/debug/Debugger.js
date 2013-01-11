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

WD.Debugger.PrintGameBoard = function(_gameboard, output){
	var HTMLout = '', lineout = '';
	for(var row = 0; row < WD.Game.defaultSettings.gameRows; row++){

		HTMLout += '<tr>';
		lineout = '';
		for(var col = 0;col < WD.Game.defaultSettings.columns; col++){
			var displayVal = (_gameboard[col][row].val === 0) ? '-' : WD.GameTile.currencyValues[_gameboard[col][row].val];
			HTMLout += '<td>' + displayVal + '</td>';
			lineout += _gameboard[col][row].val + '|';
		}
		HTMLout += '</tr>\n';

		if(output===WD.Debugger.printDebugWindow) {
			jQuery('.debugWindow').html("<table class='gameMap'>" + HTMLout + "</table>");
		} else if(output === WD.Debugger.printConsole){
			console.info('[row ' + (row + 1) + '] \t' +  lineout.substr(0,lineout.length-1));
		} 
	}
}


WD.Debugger.printDebugWindow = 0x1;
WD.Debugger.printConsole = 0x2;


}); //require.js