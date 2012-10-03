var Location = Class.create({

	/**		
	* @param object	coords tilemap coordinates
	* @param enum MoveDirection enum represention direction to transform to
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
	}




});