"use strict";

const express           = require('express');
const uRoutes           = express.Router();
const methodOverride    = require('method-override')
const { Url, Visitor }	= require('../models');
const { to, ReE, ReS }  = require('../services/util.service');
const protocolChecker = require("../lib/protocolChecker");

// Short-link redirection
uRoutes.get("/:shortURL", async (req, res) => {
	let err, url;
	
	[err, url] = await to(Url.findOne({
		where: {
			short_url: req.params.shortURL
		}
	}));
	if (err) {
		req.flash('danger', "That short URL couldn't be found.");
		return res.redirect("/");
	}
	
	let target = url['url'];
	let ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 
					  req.connection.remoteAddress || 
					  req.socket.remoteAddress || 
					  req.connection.socket.remoteAddress || '';
	
	let data = {
		UrlId: url['id'],
		ip_address: ip,
		referrer_url: req.headers.referrer || req.headers.referer
	};
	
	[err, url] = await to(Visitor.create(data));
	if (err) { console.log(err) }
	
	res.redirect('//'+ target);
	return;
});
	
module.exports = uRoutes;
