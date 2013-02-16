/**
* Location functions
* Dependencies: 
* 
*/

WD.namespace('WD.control.Location');

WD.control.Location = (function(wdapp){

	return {
		MoveDirection : { LEFT : 0, DOWN : 1, RIGHT : 2, EXPRESS : 3}
		,MoveDescription : ["Left","Down","Right"]
		/**		
		* @param object	coords tilemap coordinates
		* @desc - returns physical coordinates of object in field
		* @return object coords of transformed location
		*/
		,FindPhysicalLocation : function(coords,width,height) {
			
			var xMap = coords.x;
			var yMap = coords.y;
			xMap = coords.x * width;
			yMap = coords.y * height;
			return { x : xMap, y : yMap };
		}
		/**		
		* Returns coordinates of a new location based on direction passed
		* @param object	coords tilemap coordinates
		* @param enum MoveDirection enum represention of direction to transform to
		* @return object|boolean - coords of transformed location or false if it's not legal
		*/
		,TransformLocation : function(coords,direction){
			var _coords = { x : coords.x, y : coords.y }; //make sure the function modifies by value, not ref
			switch (direction){
				case this.MoveDirection.UP :
					_coords.y -= 1;
					break;
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
		//console.info(gamesettings);

		if(this.LegalRealm(_coords))
			return _coords;
		else
			return false;
		}
		/**		
		* @param object	coords tilemap coordinates
		* @return bool 
		* @desc - returns true if the coordinated passed exists in the game field
		*/
		,LegalRealm : function(coords){
			var gamesettings = wdapp.control.main.getSettings();
			return (coords.x < gamesettings.columns &&
				coords.x >= 0 &&
				coords.y < gamesettings.gameRows &&
				coords.y >= 0);
		}
		,ValidateMove : function(coords){
			var gamesettings = wdapp.control.main.getSettings();
			if(!(this.LegalRealm(coords,gamesettings)) ||
				window._game.gameBoard[coords.x][coords.y].val > 0
				) {
				return false;
			}

			return true;
		}
		/**		
		* returns true if the next space down is another tile or the floor
		* @param object	coords tilemap coordinates
		* @return bool 
		*/
		,LookAhead : function(coords){
			var LookAheadLocation = this.TransformLocation(coords,this.MoveDirection.DOWN);
				
			return !this.LegalRealm(LookAheadLocation) ||  window._game.gameBoard[LookAheadLocation.x][LookAheadLocation.y].val > 0;

		}

	}

}(WD));


/*define(['lib/prototype'],function(){

window.WD || ( window.WD = {} ) //application namespace

WD.Location = Class.create({});



*/

/**		
* @param object	gametile
* @return object coords 
* @desc - returns coordinates of the furthest open space directly below the coordinates of the gametile given
**/
/*
WD.Location.nextBottom = function(_gametile){
	var nextspace = _gametile.getMapLocation(), lastSpace;

	while(nextspace = WD.Location.TransformLocation(nextspace,WD.Location.MoveDirection.DOWN)) {
			if(window._game.gameBoard[nextspace.x][nextspace.y].val === 0)
				lastSpace = nextspace;
			
	}

	return lastSpace;

}

});*/