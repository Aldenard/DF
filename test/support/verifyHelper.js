var expect = require('expect.js'),
    helper = require('./helper');

var verifyParty = function (party, tnum, dnum, hnum) {
  expect(party).to.be.ok();
  expect(party.t.current).to.eql(tnum);
  expect(party.d.current).to.eql(dnum);
  expect(party.h.current).to.eql(hnum);
};

var verifyParties = function (num) {
  expect(helper.getNumberOfParties()).to.eql(num);
};

var verifyAccept = function (party, tnum, dnum, hnum) {
  expect(party).to.be.ok();
  expect(party.t.accept).to.eql(tnum);
  expect(party.d.accept).to.eql(dnum);
  expect(party.h.accept).to.eql(hnum);
};

//
// Export
//
exports.verifyParty = verifyParty;
exports.verifyParties = verifyParties;
exports.verifyAccept = verifyAccept;
