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
function Microwave(){
	this._sources={};
	this._output={};
	this._functions={};
	this._rule;
	/**
	* List of all functions
	*/
	this._parsedRules={};
}
Microwave.TYPE_PRIMITIVE_JS=0;
Microwave.TYPE_STRING=1;
Microwave.TYPE_SOURCE=2;
Microwave.TYPE_FUNCTION=3;
Microwave.TYPE_SET_FUNCTION=4;
Microwave.TYPE_STRING_ARRAY=5;
Microwave.CONSTANT_CURRENT_INDEX='$';
Microwave.CONSTANT_CURREM_ITEM='$CURRENT';
/**
 * Matches $aa.bb $aa.$.foo $aa.$ $a.foo[$d.baz]
 * @type {RegExp}
 */
Microwave.REGEX_SOURCE=/^\$[A-Za-z]\w*(\.(\w+|\$)|\[.*\]).*$/;
Microwave.REGEX_FUNCTION=/^\$[A-Za-z]\w+\((.*)\)$/;
Microwave.REGEX_ARRAY=/^\[.*\]$/;


Microwave.prototype.addSource = function(name,source) {
	this._sources[name]=source;
	return true;
};
Microwave.prototype.addSources = function(sources) {
	for(var name in sources){
		this.addSource(name,sources[name]);
	}
	return true;
};
Microwave.prototype.addFunction = function(name,func) {
	this._functions[name]=func;
	return true;
};
Microwave.prototype.addFunctions = function(funcs) {
	for(var name in funcs){
		this.addFunction(name,funcs[name]);
	}104
	return true;
};
Microwave.prototype.setRule = function(rule) {
	this._rule=rule;
	return true;
};
// Microwave.prototype._parseRules = function() {
// 	this._parsedRules={};
// 	var stringRulesMap={};
// 	for(var x in rule){
// 		//If it's not a string it's not a rule we should parse
// 		if(typof(rule)==='string'){
// 			var type=this.getRuleType(rule);
// 			if(type===TYPE_PRIMITIVE_JS){
// 				continue;
// 			}

// 		}
// 	}
// };
// Microwave.prototype.getRuleData = function(ruleComponents) {
// 	var self=this;
// 	return function(currentIndex,currentItem,cb){

// 	}
// };

Microwave.prototype._getSourceComponentsAsArray = function(sourceString) {
	var self=this;
	var getStartPositionForDotSearch=function(str){
		if(self._isSourceElmentAnotherSource(str)){
			return str.indexOf(']');
		}
		return 0;
	}
	//convert the [$foo]  to a dot notation
	var sourceString=sourceString.replace('[','.[');

	var components=[];
	var remainingString=sourceString;
	var nextPosition;
	var startToSearch=0;
	var item;
	while((nextPosition=remainingString.indexOf('.',startToSearch))!=-1){

		item=remainingString.substr(0,nextPosition);
		remainingString=remainingString.substr(nextPosition+1);
		
		startToSearch=getStartPositionForDotSearch(remainingString);
		components.push(item);
	}
	if(remainingString){
		components.push(remainingString);
	}
	return components;


};
Microwave.prototype._isSourceElementCurrentItem = function(sourceElement) {
	return sourceElement===Microwave.CONSTANT_CURREM_ITEM;

};
Microwave.prototype._isSourceElementCurrentIndex = function(sourceElement) {
	return sourceElement===Microwave.CONSTANT_CURRENT_INDEX;
};
Microwave.prototype._isSourceElmentAnotherSource = function(sourceElement) {
		return sourceElement.indexOf('[')==0;
};
Microwave.prototype._getSourceElementPlainName = function(sourceElement) {
	return sourceElement.substr(1);
};
Microwave.prototype._getCleanEmbeddedSourceElement = function(sourceElement) {
	var length=sourceElement.length;
	return sourceElement.substr(1).substr(0,length-2);
};
Microwave.prototype._getNextComponentItem = function(currentData,currentComponent,currentIndex,cb) {
	if(this._isSourceElementCurrentIndex(currentComponent)){
			currentComponent=currentIndex;
			cb(null,currentData[currentComponent]);
			return;

		}
		else if(this._isSourceElmentAnotherSource(currentComponent)){
		var sourceElement=this._getCleanEmbeddedSourceElement(currentComponent);

		var sourceComponents=this._getSourceComponentsAsArray(sourceElement);
		var hf=this._getSourceHandlerFunction(sourceComponents);
		hf(currentIndex,currentComponent,function(err,currentComponent){
			cb(err,currentData[currentComponent]);
		});
		return;
	}
	cb(null,currentData[currentComponent]);
};

/**
 * @todo clean code
 * @param  {[type]} sourceString [description]
 * @return {[type]}              [description]
 */
Microwave.prototype._getSourceHandlerFunction = function(sourceComponents){
	var length=sourceComponents.length;
	var isCurrentItem=false;
	var sourceElement;
	if(this._isSourceElementCurrentItem(sourceComponents[0])){
		isCurrentItem=true;
	}
	else{
		var plainName=this._getSourceElementPlainName(sourceComponents[0]);
		sourceElement=this._sources[plainName];
	}
	var self=this;

	//Removing the source identificator
	sourceComponents.shift();
	//First check if ti has a reference item
	return	function(currentIndex,currentItem,cb) {
		var currentData=sourceElement;
		if(isCurrentItem){
			currentData=currentItem;
		}
		var walkComponent=function(){
			var currentComponent=sourceComponents.shift();
			if(!currentComponent){
				cb(null,currentData);
			}
			else{
				self._getNextComponentItem(currentData,currentComponent,currentIndex,function(err,data){
					currentData=data;
					walkComponent();
				});
			}
		}
		walkComponent();
	};	
}
Microwave.prototype.getRuleType = function(rule) {
	var type=typeof(rule);
	switch(type){
		case 'number':
		case 'object':
		case 'boolean':
			return Microwave.TYPE_PRIMITIVE_JS;
		break;
		case 'function':
			return Microwave.TYPE_FUNCTION;
		break;
		case 'string':
			if(this._isStringASource(rule)){
				return Microwave.TYPE_SOURCE;
			}
			else if(this._isStringAFunction(rule)){
				return Microwave.TYPE_SET_FUNCTION;
			}
			else if(this._isStringAnArray(rule)){
				return Microwave.TYPE_STRING_ARRAY;
			}
			return Microwave.TYPE_PRIMITIVE_JS;
		break;
	}
};
Microwave.prototype._isStringASource = function(rule) {
	return rule.match(Microwave.REGEX_SOURCE);
}
Microwave.prototype._isStringAFunction = function(rule) {
	return rule.match(Microwave.REGEX_FUNCTION);
}

Microwave.prototype._isStringAnArray=function(rule){
	return rule.match(Microwave.REGEX_ARRAY);

}
Microwave.prototype.isSourceSet = function(name) {
	return !!this._sources[name];
};
Microwave.prototype._getproccessItenFunction = function(mainSource) {
	var self=this;
	return function(currentIndex,currentItem){
		var keyToReturn;
		var ruleToApply;
		for(var x in self._rule){
			keyToReturn=x;
			ruleToApply=self._rule[x];
		}
	}
};
/**
 * Execute the transform operation with the current rules and function sets
 * @param  {String} mainSource the mainSource to loop, it should be an array or an object
 * @return {Array}	The transformation result
 */
Microwave.prototype.execute = function(mainSource) {
	if(!this.isSourceSet(mainSource)){
		throw new Error('The source '+mainSource+' is not set');
	}
	var sourceToTransform=this._sources[mainSource];
	var proccessItenFunction=this._getproccessItenFunction(mainSource);
	var returnObject=[];
	if(Array.isArray(sourceToTransform)){
		var length=sourceToTransform.length;
		for(var i=0;i<length;i++){
			var currentIndex=i;
			var currentItem=sourceToTransform[i];
			proccessItenFunction(currentItem,currentItem);
		}
	}
	else{
		for(var x in sourceToTransform){
			var currentIndex=x;
			var currentItem=sourceToTransform[x];
			proccessItenFunction(currentItem,currentItem);
		}
	}
};
module.exports=Microwave;