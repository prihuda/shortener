"use strict";

const express			= require('express');
const userRoutes	= express.Router();
const authService	= require('../services/auth.service');
const { to }  		= require('../services/util.service');

userRoutes.post("/register", async (req, res) => {
	let { email, password } = req.body;

	if (!email) {
		req.flash('danger', "Please provide a valid email.");
		return res.redirect("/register");
	}

	if (!password) {
		req.flash('danger', "Please provide a password.");
		return res.redirect("/register");
	}

	let err, user;
	[err, user] = await to(authService.createUser(req.body)).catch(e => { err = e; });
	if (err) {
		req.flash('danger', err.message);
		return res.redirect("/register")
	}
	
	let data = user.toWeb();
	req.session.token = user.getJWT();
	req.session.user_id = data.id;
	req.session.email = data.email;
	req.flash('success', "Your account has been successfully created. Add a new URL above to get started!");
	res.redirect("../urls");
});

// Login form data
userRoutes.post("/login", async (req, res) => {
	let userFound = false;
	let { email, password } = req.body;
	let err, user;

	[err, user] = await to(authService.authUser(req.body));
	if (err) {
		req.flash('danger', "Please check your username and/or password.");
		return res.redirect("/login");
	}
	let data = user.toWeb();
	req.session.token = user.getJWT();
	req.session.user_id = data.id;
	req.session.email = data.email;
	res.redirect("/urls");
});

userRoutes.post("/logout", (req, res) => {
	req.session = null;
	res.redirect("/");
});

module.exports = userRoutes;