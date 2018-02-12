'use strict';
var answer = 41;
answer = answer +1;
console.log(answer);   

var circle = { x: 3, y: 4, radius: 5 };
var person = { name: "Mickey", family: "Mouse" };
var list = [ person, circle ];//everything is an object, some objects are immutable e.g. string, numbers
console.log(list);

var circle = { x: 3, y: 4, radius: 5 };
var square = { x: circle.x, y: circle["y"] };
circle.diameter = 12;
circle.radius = 6;
square["y"] = 7;

var i = 42;
var f = 42.56789;
console.log(typeof i, typeof f,
Math.floor(f), i.toFixed(2), f.toFixed(2));//one number type, double precision, numbers are immutable

//Arrays
var a = [4, 5, 6];
console.log(typeof a, a[1]);
a.push(7); 
console.log(a);
a = []; console.log(a == []);//bad
console.log(a.length == 0);//good
//push, pop, shift, unshift, join, slice, splice, concat, sort

console.log(typeof true);//boolean types are immutable
console.log(0 ? true : false);
console.log(0 == false, 0 === false);//0, "", NaN, null, undefined are treated like false, everything else like true
//== (implicit type conversion before comparison) vs === (no type conversion)
console.log(0 == false);
console.log(0===false);

//three types of error responses you might get
//exception/program crash
//null, no exisiting reference
//undefined value