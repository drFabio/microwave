/*The MIT License (MIT)

Copyright (c) 2014 Fabio Oliveira Costa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var chai=require('chai');
chai.config.includeStack =true;
var expect=chai.expect;
var should = chai.should;
var Microwave=require(__dirname+'/../src/Microwave');
describe('Transformation',function(){
	describe('Setup',function(){
		var transformer;
		before(function(){
			transformer=new Microwave();
		})	
		it('Should be able to add a source to the data',function(){
			var s1=[
				{'id':1,'name':'foo'},
				{'id':2,'name':'bar'}
			];
			var res=transformer.addSource('s1',s1);
			expect(res).to.be.true;
		});
		it('Should be able to add multiple sources to the data',function(){
			var s2=[
				{'id':1,'name':'foo'},
				{'id':2,'name':'bar'}
			];
			var s3=s2;
			var toAdd={'s2':s2,'s3':s3};

			var res=transformer.addSource(toAdd);
			expect(res).to.be.true;
		});
		it('Should be able to add a function',function(){
			var res=transformer.addFunction('sum',function(a,b){return a+b});
			expect(res).to.be.true;

		});
		it('Should be able to add multiple functions',function(){
			var sub=function(a,b){
					return a-b;
			};
			var mult=function(a,b){
					return a*b;
			};
			var data={
				'subtract':sub,
				'multiply':mult
			}

			var res=transformer.addFunctions(data);
			expect(res).to.be.true;
		});
		it('Should be able to set a rule',function(){
			var rule={
				'number':10,
				'name':'John doe'
			};
			var res=transformer.setRule(rule);
			expect(res).to.be.true;

		});
	});
	describe('rule recognition',function(){
		var transformer;
		before(function(){
			transformer=new Microwave();
		})	
		it('should be able to recognize primitive JS types (number,string,etc ..)',function(){
			var primitives=[
				1,
				'foo',
				10.0,
				true,
				false,
				-1

			];
			primitives.forEach(function(p){
				var type=transformer.getRuleType(p);
				expect(type).to.equal(Microwave.TYPE_PRIMITIVE_JS);
			},this);
		

		});
		it('Should be able to recognize a source value',function(){
			var type=transformer.getRuleType('$myExampleSource.thing');

			expect(type).to.equal(Microwave.TYPE_SOURCE);
		});
		it('Should be able to recognize a source value with the current index as index',function(){
			var type=transformer.getRuleType('$myExampleSource.$.thing');

			expect(type).to.equal(Microwave.TYPE_SOURCE);
		});
		it('Should be able to recognize a source value with the a variable as index',function(){
			var type=transformer.getRuleType('$myExampleSource[$otherSource.stuff].thing');

			expect(type).to.equal(Microwave.TYPE_SOURCE);
		});
		
		it('Should be  able to recognize already set functions',function(){
			var type=transformer.getRuleType('$someFunction(10,20,$myExampleSource.thing2)');
			expect(type).to.equal(Microwave.TYPE_SET_FUNCTION);
		});
		it('Should be able to recognize embedded functions',function () {
			var type=transformer.getRuleType(function(){return 10});
				expect(type).to.equal(Microwave.TYPE_FUNCTION);
		});
		it('Should be able to recognize string arrays',function () {
			var type=transformer.getRuleType('[a,b,c,10,\'10\',$foo.bar]');
				expect(type).to.equal(Microwave.TYPE_STRING_ARRAY);
		});

	});
	describe('Source recognition',function(){
		var transformer;
		before(function(){
			transformer=new Microwave();
			transformer.addSource('a',{'b':{'c':{'d':10}}});
			transformer.addSource('foo',{'bar':{'baz':'c'}});

		});
		describe('#Simple case ',function(){
			var components;
			it('Should be able to separate a source',function(){
				components=transformer._getSourceComponentsAsArray('$a.b.c.d');
				expect(components[0]).to.equal('$a');
				expect(components[1]).to.equal('b');
				expect(components[2]).to.equal('c');
				expect(components[3]).to.equal('d');

			});
			it('Should be able to interpret source variables',function(done){
				var funcToExecute=transformer._getSourceHandlerFunction(components);
				funcToExecute(null,null,function(err,res){
					if(err){
						done(err);
						return;
					}
					expect(res).to.equal(10);
					done();
				});
			});
		});
		describe('#Complex case',function(){
			var components;

			it('Should be able to correctly separate a source',function(){
				components=transformer._getSourceComponentsAsArray('$a.b[$foo.bar.baz].d');
				expect(components[0]).to.equal('$a');
				expect(components[1]).to.equal('b');
				expect(components[2]).to.equal('[$foo.bar.baz]');
				expect(components[3]).to.equal('d');
			});
			it('Should be able to interpret source variables',function(done){
				var funcToExecute=transformer._getSourceHandlerFunction(components);
				funcToExecute(null,null,function(err,res){
					if(err){
						done(err);
						return;
					}
					expect(res).to.equal(10);
					done();
				});
			});
		});
	});
	describe('Function execution',function(){
		var transformer;
		before(function(){
			transformer=new Microwave();
		})
		it('Should be able to execute a normal function');
		it('should be able to execute a set function');
	});
});