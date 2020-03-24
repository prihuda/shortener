"use strict";

const express           = require('express');
const urlRoutes         = express.Router();
const methodOverride    = require('method-override')
const { Url, Visitor }  = require('../models');
const authService       = require('../services/auth.service');
const { to, ReE, ReS }  = require('../services/util.service');
const randomizer        = require("../lib/randomizer");
const passport      	  = require('passport');

require('./../middleware/passport')(passport)

var authenticate = function(req, res, next) {
	passport.authenticate('jwt', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
			req.session.user_id = null;
			return res.redirect('/'); 
		}
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return next();
    });
  })(req, res, next);
};

urlRoutes.get("/", authenticate, async (req, res) => {
	let user_id = req.session.user_id;
	let email = req.session.email;		
	let err, urls;
	[err, urls] = await to(Url.findAll({
		where: {
			UserId: user_id
		}
	}));
	
	let templateVars = {
		email,
		user_id,
		urls
	};
	res.render("urls_index", templateVars);
});

urlRoutes.get("/new", authenticate, (req, res) => {
	let user_id = req.session.user_id;
	let email = req.session.email;
	let templateVars = {
		email,
		user_id,
	};
	res.render("urls_new", templateVars);
});

urlRoutes.post("/new", authenticate, async (req, res) => {
	let user_id = req.session.user_id;
	let err, url = req.body.longURL;
	let urlInfo = {
		url : url,
		UserId: user_id
	};
	
	[err, url] = await to(Url.create(urlInfo));
	if (err) {
		req.flash('danger', err.message);
		res.redirect("new");
	};
	
	return res.redirect("/urls/" + url.short_url);
});

// Rendering of urls_show (/urls:id)
urlRoutes.get("/:id", authenticate, async (req, res) => {
	let { id } = req.params;
	let user_id = req.session.user_id;
	let email = req.session.email;
	let err, url;
	[err, url] = await to(Url.findOne({
		where: {
			short_url: id
		}
	}));
	if (err) { console.log(err.message) }
	
	let count, distinct, visitors;
	
	[err, count]    = await to(url.countVisitors());
	if (err) { console.log(err.message) }
	
	[err, distinct] = await to(Visitor.count({
		distinct: true,
		col: 'ip_address'
	}));
	if (err) { console.log(err.message) }
	
	[err, visitors] = await to(Visitor.findAll({
		where: {
			UrlId: url['id']
		}
	}));
	if (err) { console.log(err.message) }
	let templateVars = {
		email,
		user_id,
		shortURL: url["short_url"],
		longURL: url["url"],
		date: url["createdAt"],
		clickthroughs: count,
		uniqueClickthroughs: distinct,
		visitors:  visitors
	}
	res.render("urls_show", templateVars);
	return;
});
  
// Update existing shortURL
urlRoutes.put("/:id", authenticate, async (req, res) => {
	let { id } = req.params;
	let err, urls;
	[err, urls] = await to(Url.update(
		{ url: req.body.newURL },
		{ where: { short_url: id } }
	));
	req.flash('warning', "The details for this URL have been updated.");
	res.redirect("/urls/" + id);
});

// Deletion of existing short URL
urlRoutes.delete("/:id", authenticate, async (req, res) => {
	let { id } = req.params;
	let err, urls;
	[err, urls] = await to(Url.destroy({
		where: { short_url: id } 
	}));
	if (err) console.log('ERROORRR');
	req.flash('warning', "This URL has been deleted");
	res.redirect('/urls');
});

module.exports = urlRoutes;
