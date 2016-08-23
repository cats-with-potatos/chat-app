const should = require("chai")
, expect = require("chai").expect()
, assert = require("chai").assert
, auth = require("../lib/auth.js");

it("signUpError function should return null", (done) => {
  const signUpError = auth.signUpError({username: "raf", password: "Du3", validationPassword: "Du3"})
  assert.equal(signUpError, null);
  done();
});

it("signUpError function should return param undefined (username missing)", (done) => {
  const signUpError = auth.signUpError({password: "Du3", validationPassword: "Du3"})
  assert.equal(signUpError, "paramUndefined");
  done();
});

it("signUpError function should return param undefined (password missing)", (done) => {
  const signUpError = auth.signUpError({username: "raf", validationPassword: "Du3"})
  assert.equal(signUpError, "paramUndefined");
  done();
});
