/**
* Helper class
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 15db28ee2b88482ed9040612d002ebc355e73cea
* @class Helper
* @constructor
* @module Utilities
* @requires
<<<<<<< HEAD
>>>>>>> 15db28ee2b88482ed9040612d002ebc355e73cea
=======
>>>>>>> 15db28ee2b88482ed9040612d002ebc355e73cea
* 
*/
define(function() {

<<<<<<< HEAD
<<<<<<< HEAD
	return {
		matrix : function(m,n,init){
=======
=======
>>>>>>> 15db28ee2b88482ed9040612d002ebc355e73cea
	var utils = {
		/**
		* Converts array into gameboard matrix
		*
		* @method matrix
		* @param {Object} foo Argument 1
		* @param {Object} config A config object
		* @param {Object} config.name The name on the config object
		*/
		matrix:  function(m,n,init){
<<<<<<< HEAD
>>>>>>> 15db28ee2b88482ed9040612d002ebc355e73cea
=======
>>>>>>> 15db28ee2b88482ed9040612d002ebc355e73cea
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
	}
<<<<<<< HEAD
<<<<<<< HEAD
});
=======
=======
>>>>>>> 15db28ee2b88482ed9040612d002ebc355e73cea
	
	return utils;


});
<<<<<<< HEAD
>>>>>>> 15db28ee2b88482ed9040612d002ebc355e73cea
=======
>>>>>>> 15db28ee2b88482ed9040612d002ebc355e73cea
