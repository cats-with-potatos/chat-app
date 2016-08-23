const should = require("chai")
, crypto = require("crypto")
, expect = require("chai").expect()
, assert = require("chai").assert
, auth = require("../lib/auth.js");

describe("/signup authentication", () => {

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

  it("signUpError function should return badUsername (Contains a space)", (done) => {
    const signUpError = auth.signUpError({username: "raf ", password: "Du3", validationPassword: "Du3"})
    assert.equal(signUpError, "badUsername");
    done();
  });

  it("signUpError function should return badUsername (username contains illegal characters)", (done) => {
    const signUpError = auth.signUpError({username: "raf*`'", password: "Du3", validationPassword: "Du3"})
    assert.equal(signUpError, "badUsername");
    done();
  });

  it("signUpError function should return badPassword (password contains illegal characters)", (done) => {
    const signUpError = auth.signUpError({username: "raf", password: "du3", validationPassword: "Du3"})
    assert.equal(signUpError, "badPassword");
    done();
  });

  it("signUpError function should return badPassword (password contains illegal characters)", (done) => {
    const signUpError = auth.signUpError({username: "raf", password: "Duu", validationPassword: "Du3"})
    assert.equal(signUpError, "badPassword");
    done();
  });

  it("signUpError function should return badPassword (password contains illegal characters)", (done) => {
    const signUpError = auth.signUpError({username: "raf", password: "DUDUDDU3", validationPassword: "Du3"})
    assert.equal(signUpError, "badPassword");
    done();
  });

  it("signUpError function should return passNoMatch (password and passwordValidation do not match)", (done) => {
    const signUpError = auth.signUpError({username: "raf", password: "Du3", validationPassword: "Du4"})
    assert.equal(signUpError, "passNoMatch");
    done();
  });

  it("createHashAndSalt function should return a hash that is the hashed product of the salt appended to my password", (done) => {
    const myPassword = "myPassword";
    const hashAndSalt = auth.createHashAndSalt(myPassword);
    assert.equal(hashAndSalt.hash, crypto.createHash('sha1').update(hashAndSalt.salt + myPassword).digest('hex'));
    done();
  });

  it("createJwt function should return serverError (user is undefined)", (done) => {
    auth.createJwt()
    .then((token) => {
      done(new Error("Should be in .catch"));
    })
    .catch((e) => {
      done();
    })
  });

  it("createJwt function should return token", (done) => {
    const myObject = {id: 1, username: "myUsername"};

    auth.createJwt(myObject)
    .then((token) => {
      return auth.checkJwt(token);
    })
    .then((decoded) => {
      assert.equal(decoded.id, myObject.id);
      assert.equal(decoded.username, myObject.username);
      assert.isDefined(decoded.iat, "iat attribute is present");
      assert.isDefined(decoded.exp, "exp attribute is present");
      done();
    })
    .catch((e) => {
      done(e);
    })
  });

  it("checkPass function should return token payload", (done) => {

    const userObject = {
      id: 1,
      username: "hello",
      password: "hello",
    };

    const hashAndSalt = auth.createHashAndSalt(userObject.password);

    userObject.hash = hashAndSalt.hash;
    userObject.salt = hashAndSalt.salt;


    auth.checkPass(userObject)
    .then((jwtPayload) => {
      console.log(jwtPayload);
      assert.deepEqual(jwtPayload, {id: userObject.id, username: userObject.username});
      done();
    })
    .catch((e) => {
      done(e);
    })
  });
});
