/**
* Location class
* Dependencies: 
* jQuery ($.extend(),$.bind()), BaseExtensions
* 
*/
define(function() {

	

	var Location = {

		MoveDirection : { LEFT : 0, DOWN : 1, RIGHT : 2, EXPRESS : 3},
	/**		
	* @param object	coords tilemap coordinates
	* @param enum MoveDirection enum represention direction to transform to
	* @desc - returns coordinates of a new location based on direction passed
	* @return object|boolean - coords of transformed location or false if it's not legal
	**/
	TransformLocation : function(coords,direction){
			var _coords = { x : coords.x, y : coords.y }; //make sure the function modifies by value, not ref
			switch (direction){
				case Location.MoveDirection.UP :
					_coords.y -= 1;
					break;
				case Location.MoveDirection.DOWN :
					_coords.y += 1;
					break;
				case Location.MoveDirection.LEFT :
					_coords.x -= 1;
					break;
				case Location.MoveDirection.RIGHT :
					_coords.x += 1;
					break;
			}
			//console.info(_coords);

			if(Location.LegalRealm(_coords))
				return _coords;
			else
				return false;
	},

	/**		
	* @param object	coords tilemap coordinates
	* @desc - returns physical coordinates of object in field
	* @return object coords of transformed location
	**/
	FindPhysicalLocation : function(coords) {
			var xMap = coords.x;
			var yMap = coords.y;

			xMap = coords.x * _wd.defaultSettings.tileWidth;
			yMap = coords.y * _wd.defaultSettings.tileHeight;
			return { x : xMap, y : yMap };
	},

	/**		
	* @param object	coords tilemap coordinates
	* @return bool 
	* @desc - returns true if the coordinated passed exists in the game field
	**/
	LegalRealm : function(coords){
			return (coords.x < _wd.defaultSettings.columns &&
					coords.x >= 0 &&
					coords.y < _wd.defaultSettings.gameRows &&
					coords.y >= 0);
	},

	ValidateMove : function(coords){

		if(!(Location.LegalRealm(coords)) ||
			window._game.gameBoard[coords.x][coords.y].val > 0
			) {
			return false;
		}

		return true;
	},
	/**		
	* @param object	coords tilemap coordinates
	* @return bool 
	* @desc - returns true if the next space down is another tile or the floor
	**/
	LookAhead : function(coords){
		var LookAheadLocation = Location.TransformLocation(coords,Location.MoveDirection.DOWN);
			
		return !Location.LegalRealm(LookAheadLocation) ||  window._game.gameBoard[LookAheadLocation.x][LookAheadLocation.y].val > 0;

	},
	/**		
	* @param object	gametile
	* @return object coords 
	* @desc - returns coordinates of the furthest open space directly below the coordinates of the gametile given
	**/
	nextBottom : function(_gametile){
		var nextspace = _gametile.getMapLocation(), lastSpace;

		while(nextspace = Location.TransformLocation(nextspace,Location.MoveDirection.DOWN)) {
				if(window._game.gameBoard[nextspace.x][nextspace.y].val === 0)
					lastSpace = nextspace;
				
		}

		return lastSpace;

	}

};
		
	

		return Location;

});