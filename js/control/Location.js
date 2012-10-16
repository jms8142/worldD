var Location = Class.create({
	MoveDirection : { LEFT : 0, DOWN : 1, RIGHT : 2},
	/**		
	* @param object	coords tilemap coordinates
	* @param enum MoveDirection enum represention direction to transform to
	* @desc - returns coordinates of a new location based on direction passed
	* @return object coords of transformed location
	**/
	TransformLocation : function(coords,direction){
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
		//console.info(_coords);
		return _coords;
	},
	FindPhysicalLocation : function(coords) {
		var mapX = coords.x;
		var mapY = coords.y;
		mapX = coords.x * window._game.defaultSettings.tileWidth;
		mapY = coords.y * window._game.defaultSettings.tileHeight;
		return { x : mapX, y : mapY };

	}


});