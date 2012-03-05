//some test configs



oneRowMap = [
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1]
];

var oneRow = mapToObject(oneRowMap);


fiveTowerMap = [
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0],
	[0,0,0,0,1,0,0,0,0],
	[0,0,0,0,1,0,0,0,0],
	[0,0,0,0,1,0,0,0,0],
	[1,1,1,1,1,1,1,1,1]
];

var fiveTowerMap = mapToObject(fiveTowerMap);







/**
Conversion function for rewriting maps as a gameboard objects
**/

function mapToObject (_matrix){
	//console.info(_matrix.length);
	var retObj = new Array(_matrix.length);
	for(var i = 0; i < oneRowMap.length; i++){
		retObj[i] = new Array(_matrix[i].length);
		for(y = 0; y < oneRowMap[i].length; y++){
			retObj[i][y] = { val : _matrix[i][y], active : false};
			//console.info(retObj);
		}
	}

	return retObj;
}