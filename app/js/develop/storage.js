/**
 * Save/restore data depending on the execution device.
 *
 * @author Stanislav Kalashnik <sk@infomir.eu>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var data = require('stb/app').data;


// public export
module.exports = {
	get: function ( name ) {
		var value;

		if ( data.host ) {
			value = stbStorage.getItem(name);
		} else {
			value = localStorage.getItem(name);
		}

		return value ? JSON.parse(value) : null;
	},

	set: function ( name, value ) {
		value = JSON.stringify(value);

		if ( data.host ) {
			stbStorage.setItem(name, value);
		} else {
			localStorage.setItem(name, value);
		}
	}
};





