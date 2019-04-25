/*
Michael Perez
CSC 337, Spring 2019
Final Homework


Java script for the pictures, and the get and send to the server
used for Home.html, About.html, ExecutiveBoard.html, Events.html, Member.html
*/



//Desktop\337 Projects\Final Homework
"use strict";
(function() {

	/** connects the buttons to the functions**/
	/** divides the onload functions by what page its on**/
	window.onload = function() {
		let path = window.location.pathname;
		let page = path.split("/").pop();

		if(page === "Home.html"){
			callAjax("Photos", "Group");
		}else if(page === "About.html"){
			callAjax("Photos", "About");
		}else if(page === "ExecutiveBoard.html"){
			callAjax("Members", "none");
		}else if(page === "Events.html"){
			callAjax("Photos", "Events");
		}else if(page === "Member.html"){
			callAjax("newMembers", "0");
			setInterval(function(){callAjax("newMembers", "0"); }, 5000);
			document.getElementById("submit").onclick = send;
		}



	};

	/** gets the appropriate data from server depending on parameters **/
		function callAjax(mode, name){
			//let url = "http://localhost:3000/?mode="+mode+"&name=" + name;
			let url = "http://eller.herokuapp.com/?mode="+mode+"&name=" + name;
			fetch(url)
				.then(checkStatus)
				.then(function(responseText) {
					if(mode === "Photos"){
						slideShow(responseText, name);
					}else if(mode === "newMembers"){
						myNews(responseText);
					}else{
						myMembers(responseText);
					}
				})
				.catch(function(error) {
					console.log(error);
				});
			}

/** sets up the picture scroller based on what folder it reads from**/
			function slideShow(responseText, name){
				let json = JSON.parse(responseText);
				for(let i = 0; i < json.length; i++){
					let url = '\\Data\\Photos\\' + name + '\\' + json[i];
					let myDiv = document.getElementById("row");
					let div = document.createElement("div");
					div.className = "column";
					let img = document.createElement("img");
					img.src = url;
					img.id = json[i];
					img.alt = json[i];
					img.onclick = myPics;
					div.appendChild(img);
					myDiv.appendChild(div);
				}

				let myPic = document.getElementById(json[0]);
				let expandImg = document.getElementById("expandedImg");
				let imgText = document.getElementById("imgtext");
				expandImg.src = myPic.src;
				imgText.innerHTML =  myPic.id.replace(".jpg", '') + ":";
			}


/** Sets up the big picture for when a smaller pic is clicked on the scroller**/
		function myPics(){
			let myId = this.id;
			let myPic = document.getElementById(myId);
			let expandImg = document.getElementById("expandedImg");
			let imgText = document.getElementById("imgtext");
			expandImg.src = myPic.src;
			imgText.innerHTML =  (myId.replace(".jpg", '') + ":");


		}

/** Sets up the member divs to display the different members and positions**/
		function myMembers(responseText){
			let mainDiv = document.getElementById("members");
			let json = JSON.parse(responseText);
			for(let i = 0; i < json.length; i++){
				let myDiv = document.createElement("div");
				let myP = document.createElement("p");
				let mySpan = document.createElement("span");

				myDiv.className = "myDiv";
				let myStr = json[i]["name"];
				myDiv.id =  myStr.replace(/ /g, "_");
				myDiv.value =json[i]["img"];
				myDiv.onmouseover = hover;
				myDiv.onmouseout = out;
				myP.innerHTML = json[i]["name"];
				mySpan.innerHTML = json[i]["role"];



				myDiv.appendChild(myP);
				myDiv.appendChild(mySpan);
				mainDiv.appendChild(myDiv);
			}
		}


/** sets up the new member manes and quotes**/
		function myNews(responseText) {
			reset();
			let mainDiv = document.getElementById("PMems");
			let json = JSON.parse(responseText);
			let mems = json["messages"];
			for(let i = 1; i < mems.length; i++){
				let span = document.createElement("span");
				let p = document.createElement("p");
				span.textContent = (mems[i]["name"]+ ": ");
				p.textContent = (mems[i]["comment"]);
				p.insertBefore(span, p.firstChild);
				mainDiv.appendChild(p);
			}
		}

/** changes the member divs background on hover**/
		function hover(){
			let myId = this.id;
			let url = "";
			if(this.value === "none"){
				url = "https://static.wixstatic.com/media/9edf81_b80ce19be" +
				"dbb4557acc606097a1db079.jpg/v1/crop/x_21,y_0,w_219,h_230/fill/" +
				"w_170,h_179,al_c,q_80,usm_0.66_1.00_0.01/9edf81_b80c" +
				"e19bedbb4557acc606097a1db079.jpg";
			}else{
				url = '/Data/Members/' + myId + '/' + this.value;
			}
			let myDiv = document.getElementById(myId);

			myDiv.style.backgroundImage = "url("+url +")";
			myDiv.style.backgroundSize = "300px 330px";
		}

/** returns the memebr divs to normal when mouse stops hovering**/
		function out(){
			let myId =  this.id;
			let myDiv = document.getElementById(myId);
			myDiv.style.background = "white";
		}

		/**clears the display **/
		function reset(){
			let myDiv = document.getElementById("PMems");
			myDiv.innerHTML = "";
		}



	/**sends the values the user input into the page as post parameters**/
	/**to a service and logs the response. **/
	function send() {
		let first = document.getElementById("theFirst").value;
		let last = document.getElementById("theLast").value;
		let email = document.getElementById("theEmail").value;
		let why= document.getElementById("theWhy").value;
		//let url = "http://localhost:3000/";
		let url = "http://eller.herokuapp.com/";
		const message = {first: first,
			last: last,
			email: email,
			why: why};
		const fetchOptions = {
				method : 'POST',
				headers : {
					'Accept': 'application/json',
					'Content-Type' : 'application/json'
				},
				body : JSON.stringify(message)
		};

		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				console.log(responseText);
				callAjax("newMembers", "O");
			})
			.catch(function(error) {
				console.log(error);
			});


	}






		/** returns the response text if the status is in the 200s**/
		/** otherwise rejects the promise with a message including the status**/
		function checkStatus(response) {
			if (response.status >= 200 && response.status < 300) {
				return response.text();
			} else if (response.status === 404) {
				// sends back a different error when we have a 404 than when we have
				// a different error
				return Promise.reject(new Error("Sorry, we couldn't find that page"));
			} else {
				return Promise.reject(new Error(response.status+": "+response.statusText));
			}
		}

}) ();
