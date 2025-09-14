const express = require('express');

module.exports = (passport) => {
  const router = express.Router();

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login-failed', session: true }),
    (req, res) => {
      // successful auth
      // redirect to frontend app with a simple cookie/session
      res.redirect(process.env.FRONTEND_URL ? process.env.FRONTEND_URL + '/app' : 'http://localhost:3000/');
    });

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    res.json({ user: req.user });
  });

  return router;
};
