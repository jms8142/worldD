/**
* Helper class
* @class Helper
* @constructor
* @module Utilities
* @requires
*
*/
define(function() {


	return {
		/**
		* Converts array into gameboard matrix
		*
		* @method matrix
		* @param {Object} foo Argument 1
		* @param {Object} config A config object
		* @param {Object} config.name The name on the config object
		*/
		matrix:  function(m,n,init){

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
});
