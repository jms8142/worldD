var Location = Class.create({
	

});

Location.MoveDirection = { LEFT : 0, DOWN : 1, RIGHT : 2, EXPRESS : 3};
Location.MoveDescription = ["Left","Down","Right"];


/**		
* @param object	coords tilemap coordinates
* @param enum MoveDirection enum represention direction to transform to
* @desc - returns coordinates of a new location based on direction passed
* @return object|boolean - coords of transformed location or false if it's not legal
**/
Location.TransformLocation = function(coords,direction){
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
}

/**		
* @param object	coords tilemap coordinates
* @desc - returns physical coordinates of object in field
* @return object coords of transformed location
**/
Location.FindPhysicalLocation = function(coords) {
		var xMap = coords.x;
		var yMap = coords.y;
		xMap = coords.x * Game.defaultSettings.tileWidth;
		yMap = coords.y * Game.defaultSettings.tileHeight;
		return { x : xMap, y : yMap };
}


Location.LegalRealm = function(coords){
		return (coords.x < Game.defaultSettings.columns &&
				coords.x >= 0 &&
				coords.y < Game.defaultSettings.gameRows &&
				coords.y >= 0);
}

Location.ValidateMove = function(coords){

	if(!(Location.LegalRealm(coords)) ||
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
Location.LookAhead = function(coords){
	var LookAheadLocation = Location.TransformLocation(coords,Location.MoveDirection.DOWN);
		
	if(!Location.LegalRealm(LookAheadLocation) || window._game.gameBoard[LookAheadLocation.x][LookAheadLocation.y].val > 0)
		return true;

	return false;
}
/**		
* @param object	gametile
* @return object coords 
* @desc - returns coordinates of the furthest open space directly below the coordinates of the gametile given
**/
Location.nextBottom = function(_gametile){
	var nextspace = _gametile.getMapLocation(), lastSpace;

	while(nextspace = Location.TransformLocation(nextspace,Location.MoveDirection.DOWN)) {
			if(window._game.gameBoard[nextspace.x][nextspace.y].val === 0)
				lastSpace = nextspace;
			
	}

	return lastSpace;

}