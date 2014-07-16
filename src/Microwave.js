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
	}
	return true;
};
Microwave.prototype.setRule = function(rule) {
	this._rule=rule;
	this._parseRules();
	return true;
};
Microwave.prototype._parseRules = function() {
	this._parsedRules={};
	var stringRulesMap={};
	for(var x in rule){
		//If it's not a string it's not a rule we should parse
		if(typof(rule)==='string'){
			var type=this.getRuleType(rule);
			if(type===TYPE_PRIMITIVE_JS){
				continue;
			}

		}
	}
};

Microwave.prototype._getSourceComponentsAsArray = function(sourceString) {
	var getStartPositionForDotSearch=function(str){
		if(str.indexOf('[')==0){
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
Microwave.prototype._getSourceItem = function(sourceString){
	var sourceComponents=this._getSourceComponentsAsArray(sourceString);
	var length=sourceComponents.length;
	
	for(var i=0;i<length;i++){

	}
	//First check if ti has a reference item
	return	function(currentIndex,currentItem) {

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