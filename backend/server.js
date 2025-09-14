require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { init, User } = require('./models/index');

const authRoutes = require('./routes/auth');
const ingestRoutes = require('./routes/ingest');
const segmentsRoutes = require('./routes/segments');
const campaignsRoutes = require('./routes/campaigns');
const vendorRoutes = require('./routes/vendor');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.APP_PORT || 4000;

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/auth/google/callback`
}, async (accessToken, refreshToken, profile, cb) => {
  // find or create user
  try {
    const [user] = await User.findOrCreate({
      where: { googleId: profile.id },
      defaults: { email: profile.emails && profile.emails[0] && profile.emails[0].value, name: profile.displayName }
    });
    cb(null, user);
  } catch (err) {
    cb(err);
  }
}));

// Routes
app.use('/auth', authRoutes(passport));
app.use('/api/ingest', ingestRoutes);
app.use('/api/segments', segmentsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/vendor', vendorRoutes);
app.use('/api/ai', aiRoutes);

// simple health
app.get('/health', (req, res) => res.json({ ok: true }));

// start
init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize', err);
});
