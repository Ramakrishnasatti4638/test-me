'use strict';

const authService = require('../services/auth.service');
const config = require('../config');

const cookieOpts = (maxAgeMs) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: config.nodeEnv === 'production',
  maxAge: maxAgeMs,
  path: '/',
});

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  // 15m default; refresh 7d default. Pull from JWT exp would be cleaner;
  // these constants match config defaults.
  res.cookie('access_token', accessToken, cookieOpts(15 * 60 * 1000));
  res.cookie('refresh_token', refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));
};

const clearAuthCookies = (res) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
};

const register = async (req, res) => {
  const { email, password, name } = req.body;
  const result = await authService.register({ email, password, name });
  setAuthCookies(res, result);
  res.status(201).json({
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  setAuthCookies(res, result);
  res.json({
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
};

const logout = (req, res) => {
  clearAuthCookies(res);
  res.json({ ok: true });
};

const me = async (req, res) => {
  const user = await authService.profile(req.user.id);
  res.json({ user });
};

module.exports = { register, login, logout, me };