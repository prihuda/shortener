'use strict';
const bcrypt			= require('bcrypt');
const bcrypt_p		= require('bcrypt-promise');
const jwt					= require('jsonwebtoken');
const {TE, to}		= require('../services/util.service');
const CONFIG			= require('../config/config');
const randomizer	= require("../lib/randomizer");

module.exports = (sequelize, DataTypes) => {
	var Model = sequelize.define('User', {
		id        : {type: DataTypes.CHAR(6), defaultValue: function() { return randomizer() }, primaryKey: true},
		email     : {type: DataTypes.STRING, unique: true, validate: { isEmail: {msg: "Email address invalid."} }},
		password  : DataTypes.CHAR(60)
	});

	Model.beforeSave(async (user, options) => {
		let err;
		if (user.changed('password')){
			let salt, hash
			[err, salt] = await to(bcrypt.genSalt(10));
			if(err) TE(err.message, true);

			[err, hash] = await to(bcrypt.hash(user.password, salt));
			if(err) TE(err.message, true);

			user.password = hash;
		}
	});

	Model.prototype.comparePassword = async function (pw) {
		let err, pass
		if(!this.password) TE('password not set');

		[err, pass] = await to(bcrypt_p.compare(pw, this.password));
		if(err) TE(err);

		if(!pass) TE('invalid password');

		return this;
	}

	Model.prototype.getJWT = function () {
		let expiration_time = parseInt(CONFIG.jwt_expiration);
		return "Bearer "+jwt.sign({user_id:this.id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
	};

	Model.prototype.toWeb = function (pw) {
		let json = this.toJSON();
		return json;
	};

	return Model;
};
