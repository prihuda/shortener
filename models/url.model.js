'use strict';
const randomizer        = require("../lib/randomizer");

module.exports = (sequelize, DataTypes) => {
	var Model = sequelize.define('Url', {
		id				: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
		title			: {type: DataTypes.TEXT},
		short_url	: {type: DataTypes.CHAR(6), unique: true, defaultValue: function() { return randomizer() }},
		url				: {type: DataTypes.TEXT, validate: { isUrl: {msg: "Url address invalid."} }}
	}, {
		timestamps: true,
		updatedAt : false
	});

	Model.associate = function(models){
		this.User = this.belongsTo(models.User);
	};

	Model.prototype.toWeb = function (pw) {
		let json = this.toJSON();
		return json;
	};

	return Model;
};
