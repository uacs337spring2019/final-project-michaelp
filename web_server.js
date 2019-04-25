/*
Michael Perez
CSC 337, Spring 2019
Final Homework


Java script server for the pictures, and the get and send file names and info
used for Home.html, About.html, ExecutiveBoard.html, Events.html, Member.html
*/


//Desktop\337 Projects\Final Homework
/* eslint no-implicit-globals: 0 */
/* global require */
"use strict";
const express = require("express");
const app = express();
let fs = require('fs');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
               "Origin, X-Requested-With, Content-Type, Accept");
	next();
});




app.use(express.static('public'));
app.use(express.static(___dirname));

/** reads data asynchronously fromt he passed in file name **/
/** returns the contents of the file as a string **/
function readFile(fileName, name) {
	let file = '';
	try {
		if(name === "none"){
			file = fs.readdirSync("Data\\" + fileName, 'utf8');
		}else{
			file = fs.readdirSync("Data\\" + fileName + "\\" + name, 'utf8');
    }
	} catch(e) {
		console.log('Error:', e.stack);
	}
	return file;
}

/** reads data asynchronously fromt he passed in file name **/
/** returns the contents of the file as a string **/
function MyFile(name, mode) {
  let myFile = '';
  try {
		if(mode === "1"){
			myFile = fs.readFileSync("Data\\Members\\" + name + "\\info.txt", 'utf8');
		}else{
			myFile = fs.readFileSync("Data/newMembers.txt", 'utf8');
		}
	} catch(e) {
		console.log('Error:', e.stack);
	}
	return myFile;
}

/** retrievs the name of the pic from the folder**/
function getImg(name){
	let myList = readFile("Members", name);
	let json = myList;
	for(let i = 0; i < json.length; i++){
		if(!json[i].endsWith(".txt")){
			return json[i];
		}
	}
	return "none";
}

/** sets up the json imputs for the new members **/
function makeList(myList) {
	let data = [];
	let json = myList;
	for(let i = 0; i < json.length; i++){
		let myImg = getImg(json[i]);
		let myLine = MyFile(json[i], "1");
		let line = myLine.split(":::");
		let myStr = {"name":line[0], "role":line[1], "link":line[2], "img":myImg};
		data.push(myStr);
	}
	return data;
}

/** builds a JSON representation of the review data **/
function buildJson(myLine) {
  let data = [];
	let line = myLine.split("&&&&&");
	console.log(line);
  for (let i = 0; i < line.length; i++) {
    let mySingle = line[i].split(":::");
		let theName  = mySingle[0].replace(/_/g, " ");
		let myStr = {"name":theName, "comment":mySingle[2]};
    data.push(myStr);
	}
	let myData = {"messages": data};
	return myData;
}


console.log('web service started');
app.get('', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");


	let mode = req.query.mode;
	let name = req.query.name;

  let myfile = "";

	if( mode === "Photos"){
		myfile = readFile(mode, name);
	}else if(mode === "Members"){
    let myList = readFile(mode, name);
		myfile = makeList(myList);
  }else if(mode === "newMembers"){
		let mylines = MyFile("0", "0");
		myfile = buildJson(mylines);
	}


  // returns an error if one of the parameters is missing
  if(mode == undefined || name == undefined) {
    res.status(400);
    res.send("Missing required parameters");
  }
	res.send(JSON.stringify(myfile));

});


app.post('', jsonParser, function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
  let first = req.body.first;
	let last = req.body.last;
	let email = req.body.email;
	let why = req.body.why;

	let myText = "\n&&&&&" + first + "_" + last + ":::" + email + ":::" + why;

	fs.appendFile( "Data/newMembers.txt", myText, function(err) {
		if(err) {
			console.log(err);
			res.status(400);
		}
		console.log("The file was saved!");
		res.send("Success!");
	});
});


app.listen(process.env.PORT);
