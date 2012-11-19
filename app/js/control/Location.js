define(['lib/prototype'],function(){

window.WD || ( window.WD = {} ) //application namespace

WD.Location = Class.create({});

WD.Location.MoveDirection = { LEFT : 0, DOWN : 1, RIGHT : 2, EXPRESS : 3};
WD.Location.MoveDescription = ["Left","Down","Right"];


/**		
* @param object	coords tilemap coordinates
* @param enum MoveDirection enum represention direction to transform to
* @desc - returns coordinates of a new location based on direction passed
* @return object|boolean - coords of transformed location or false if it's not legal
**/
WD.Location.TransformLocation = function(coords,direction){
		var _coords = { x : coords.x, y : coords.y }; //make sure the function modifies by value, not ref
		switch (direction){
			case WD.Location.MoveDirection.UP :
				_coords.y -= 1;
				break;
			case WD.Location.MoveDirection.DOWN :
				_coords.y += 1;
				break;
			case WD.Location.MoveDirection.LEFT :
				_coords.x -= 1;
				break;
			case WD.Location.MoveDirection.RIGHT :
				_coords.x += 1;
				break;
		}
		//console.info(_coords);

		if(WD.Location.LegalRealm(_coords))
			return _coords;
		else
			return false;
}

/**		
* @param object	coords tilemap coordinates
* @desc - returns physical coordinates of object in field
* @return object coords of transformed location
**/
WD.Location.FindPhysicalLocation = function(coords) {
		var xMap = coords.x;
		var yMap = coords.y;
		xMap = coords.x * WD.Game.defaultSettings.tileWidth;
		yMap = coords.y * WD.Game.defaultSettings.tileHeight;
		return { x : xMap, y : yMap };
}

/**		
* @param object	coords tilemap coordinates
* @return bool 
* @desc - returns true if the coordinated passed exists in the game field
**/
WD.Location.LegalRealm = function(coords){
		return (coords.x < WD.Game.defaultSettings.columns &&
				coords.x >= 0 &&
				coords.y < WD.Game.defaultSettings.gameRows &&
				coords.y >= 0);
}

WD.Location.ValidateMove = function(coords){

	if(!(WD.Location.LegalRealm(coords)) ||
		window._game.gameBoard[coords.x][coords.y].val > 0
		) {
		return false;
	}

	return true;
}
/**		
* @param object	coords tilemap coordinates
* @return bool 
* @desc - returns true if the next space down is another tile or the floor
**/
WD.Location.LookAhead = function(coords){
	var LookAheadLocation = WD.Location.TransformLocation(coords,WD.Location.MoveDirection.DOWN);
		
	return !WD.Location.LegalRealm(LookAheadLocation) ||  window._game.gameBoard[LookAheadLocation.x][LookAheadLocation.y].val > 0;

}
/**		
* @param object	gametile
* @return object coords 
* @desc - returns coordinates of the furthest open space directly below the coordinates of the gametile given
**/
WD.Location.nextBottom = function(_gametile){
	var nextspace = _gametile.getMapLocation(), lastSpace;

	while(nextspace = WD.Location.TransformLocation(nextspace,WD.Location.MoveDirection.DOWN)) {
			if(window._game.gameBoard[nextspace.x][nextspace.y].val === 0)
				lastSpace = nextspace;
			
	}

	return lastSpace;

}

});