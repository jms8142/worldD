/**
* @todo - add functions to literal initialization
*
*/

define(function(){


var Debugger = {
	initialize : function(){
		var _this = this;
		jQuery('.step').live('click',function(e){
			var ind = jQuery(this).attr('id') - 1;
			WD.Debugger.PrintGameBoardtoConsole(WD.Game.defaultSettings.gameRows,WD.Game.defaultSettings.columns,window._game.lastgameBoard[ind]);
		});
	},
	updateSnapshotText : function(step){
		jQuery('.utilinfo').append('<a class="step" href="#" id=' + step + '>' + step + '</a>');
	}

};


Debugger.PrintGameBoardtoDebugWindow = function(_gameboard){
		var HTMLout = '';

		for(var row = 0; row < _wd.defaultSettings.gameRows; row++){
			HTMLout += '<tr>';
			for(var col = 0;col < _wd.defaultSettings.columns; col++){

				var displayVal = _gameboard[col][row].hasOwnProperty('currencyValue') ?  _gameboard[col][row]._val : '-';
				HTMLout += '<td>' + displayVal + '</td>';
			}
			HTMLout += '</tr>\n';
			//console.info(row);
			jQuery('.debugWindow').html("<table class='gameMap'>" + HTMLout + "</table>");
		}

}

Debugger.PrintGameBoardtoConsole = function(rows,cols,_gameBoard, clr){
	if(clr)
		console.clear();

	console.info('---------------------------------');

	for(var row = 0; row < rows; row++){
		var lineout = '';
		for(var col = 0; col < cols; col++){
			lineout += _gameBoard[col][row].val + '|';
		}
		console.info('[row ' + (row + 1) + '] \t' +  lineout.substr(0,lineout.length-1));
	}
}

return Debugger;


}); //require.js
