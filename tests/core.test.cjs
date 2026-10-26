const test = require('node:test');
const assert = require('node:assert/strict');
const {classify,reflection}=require('../extension/core.js');
test('high-stakes categories and mixed topics',()=>{assert.equal(classify('Can this medication treat symptoms?').primary,'health');assert.equal(classify('This investment guarantees returns').primary,'finance');assert.equal(classify('The study proves a causal link').primary,'science');assert.equal(classify('Clinical research about a medical treatment').categories.length,2);});
test('ordinary ideas and empty text do not trigger',()=>{assert.equal(classify('Name my cozy reading corner').triggered,false);assert.equal(classify('').triggered,false);assert.equal(classify('A stocking full of gifts').triggered,false);});
test('reflection rejects short, repeated or vague input',()=>{assert.equal(reflection('I agree').valid,false);assert.equal(reflection('evidence '.repeat(15)).valid,false);assert.equal(reflection('I really think this is an entirely wonderful answer and would like to continue now').valid,false);});
test('reflection allows specific verification and exposes word counts',()=>{const r=reflection('I would check the original study to compare its sample size and methods before trusting this claim.');assert.equal(r.valid,true);assert.ok(r.words>=12);});
test('manifest limits access to the intended AI sites',()=>{const m=require('../extension/manifest.json');assert.equal(m.manifest_version,3);assert.equal(m.content_scripts[0].matches.length,3);assert.equal(m.permissions,undefined);});
