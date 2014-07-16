function Microwave(){
	this._sources={};
	this._output={};
	this._functions={};
	this._rule;

}
Microwave.TYPE_PRIMITIVE_JS=0;
Microwave.TYPE_STRING=1;
Microwave.TYPE_SOURCE=2;
Microwave.TYPE_FUNCTION=3;
Microwave.TYPE_SET_FUNCTION=4;
Microwave.TYPE_STRING_ARRAY=5;

Microwave.REGEX_SOURCE=/^\$[A-Za-z]\w+\.\w+(\.\w*)*$/;
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
	return true;
};
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
Microwave.prototype._executeRule = function(name) {
	if(!this._rules[name]){
		throw new Error('The rule '+name+' is not set, please add it before converting');
	}
};
module.exports=Microwave;