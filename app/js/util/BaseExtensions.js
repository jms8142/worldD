
/**
* Helper to initialize our multidimensional arrays
*/

Array.matrix = function(m,n,init){
	var i, a, j, mat = []; 
	for(i = 0; i < m; i += 1){
		a = [];
		for(j = 0; j < n; j +=1){
			a[j] = init;
		}
		mat[i] = a;
	}
	return mat;
}