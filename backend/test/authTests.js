const should = require("chai")
, expect = require("chai").expect()
, assert = require("chai").assert
, auth = require("../lib/auth.js");

it("signUpError function should return null", (done) => {
  const signUpError = auth.signUpError({username: "raf", password: "Du3", validationPassword: "Du3"})
  assert.equal(signUpError, null);
  done();
});

it("signUpError function should return paramUndefined  (username missing)", (done) => {
  const signUpError = auth.signUpError({password: "Du3", validationPassword: "Du3"})
  assert.equal(signUpError, "paramUndefined");
  done();
});

it("signUpError function should return paramUndefined (password missing)", (done) => {
  const signUpError = auth.signUpError({username: "raf", validationPassword: "Du3"})
  assert.equal(signUpError, "paramUndefined");
  done();
});


it("signUpError function should return whitespace (username is just whitepace)", (done) => {
  const signUpError = auth.signUpError({username: "     ", password: "Du3", validationPassword: "Du3"})
  assert.equal(signUpError, "whitespace");
  done();
});

it("signUpError function should return whitespace (password is just whitepace)", (done) => {
  const signUpError = auth.signUpError({username: "raf", password: "     ", validationPassword: "Du3"})
  assert.equal(signUpError, "whitespace");
  done();
});

it("signUpError function should return whitespace (password is just whitepace)", (done) => {
  const signUpError = auth.signUpError({username: "raf", password: "     ", validationPassword: "Du3"})
  assert.equal(signUpError, "whitespace");
  done();
});

it("signUpError function should return tooLong (username is too long)", (done) => {
  const signUpError = auth.signUpError({username: "thisistoolongbecauseitisoverthirtychars", password: "Du3", validationPassword: "Du3"})
  assert.equal(signUpError, "tooLong");
  done();
});

it("signUpError function should return tooLong (password is too long)", (done) => {
  const signUpError = auth.signUpError({username: "raf", password: "thisistoolongbecauseitisoverthirtychars", validationPassword: "Du3"})
  assert.equal(signUpError, "tooLong");
  done();
});
