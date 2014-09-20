/** @constructor */
var Person = function() {
	"use strict";
    this.say = function() {
        return "I'm an instance.";
    }

//    function say() {
//        return "I'm inner.";
//    }
}
Person.say = function() {
	"use strict";
    return "I'm static.";
}

var p = new Person();
p.say();      // I'm an instance.
Person.say(); // I'm static.
// there is no way to directly access the inner function from here