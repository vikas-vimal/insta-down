if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js').then(function(registration) {
		console.log('Registration successful, scope is:', registration.scope);
	}).catch(function(error) {
		console.log('Service worker registration failed, error:', error);
	});
}


function el(selector, scope){
	scope = scope ? scope : document;
	return scope.querySelector(selector);
}
function hide(selector){
	selector.style.display="none";
}
function show(selector){
	selector.style.display="";
}

function resetApp(){
	hide(el('#result'));
	hide(el('#loading'));
	el('#displayProfile').innerHTML='';
	el('#timeline').innerHTML='';
}

function processing(){
	hide(el('#result'));
	el('#displayProfile').innerHTML='';
	el('#timeline').innerHTML='';
	show(el('#loading'));
}

function msg(msg){
	hide(el('#loading'));
	msg.forEach(toast => {
		M.toast(toast);
		if(msg.length > 1){
			setTimeout((toast)=>M.toast(toast),toast.displayLength+50);
		}
	});
}


const API_URL = 'http://localhost:5000';

const form = el('#user-details');
form.addEventListener('submit',(event)=>{
	event.preventDefault();
	resetApp();
	processing();
	const formData = new FormData(form);
	const username = formData.get('username');
	if(!username){
		msg([{
			html: 'Username cannot be empty!',
			displayLength:5000,
			classes:'red'
		}]);
	}
	else{
		fetch(API_URL,{
			method:'POST',
			body:JSON.stringify({username}),
			headers:{
				'content-type':'application/json'
			}
		})
		.then(response => response.json())
		.then(data=>processData(data));
	}

});

function processData(data){
	let objectConstructor = ({}).constructor;
	if(Array.isArray(data) && data[0].status===false){
		console.log("errors");
		msg(data);
	}
	else if(data.constructor === objectConstructor){
		console.log(data);

		if(data.alerts.length){
			msg(data.alerts);
		}

		let profileBox = '<h5>'+data.profile.name+'</h5><div><img src="'+data.profile.profile_pic+'" alt="'+data.profile.name+'" id="profilePic"></div>';
		el('#displayProfile').innerHTML = profileBox;

		let dwBtn = document.createElement('button');
		dwBtn.innerHTML="Download";
		dwBtn.classList = "btn waves-effect green waves-light download-dp-btn";
		dwBtn.addEventListener('click',()=>{
			downloadImage(data.profile.profile_pic, data.profile.username+'-InstaDown-'+Date.now());
		});
		el('#displayProfile').appendChild(dwBtn);
		
		show(el('#result'));
		
		if(data.posts.length){
			processPosts(data);
		}
		hide(el('#loading'));
	}
}

async function processPosts(data){
	el('#timeline').innerHTML = '';

	await data.posts.forEach(post=>{
		let postItem = document.createElement('img');
		postItem.classList = "col s12 post-item card z-depth-0 cur-pointer";
		postItem.src=post.image;
		postItem.addEventListener('click',()=>{
			downloadImage(post.image, data.profile.username+'-InstaDown-'+Date.now());
		});
		el('#timeline').appendChild(postItem);
		
	});
	
}

async function downloadImage(url,filename){
	if(!url || url==''){
		msg([{
			html:'Empty image URL',
			displayLength:4000,
			classes:'red'
		}]);
	}
	filename = (!filename || filename=='')? 'InstaDown-'+Date.now() : filename;
	await fetch(url)
		.then(response=>response.blob())
		.then(blob=>{
			let dwImage = document.createElement('a');
			dwImage.href=URL.createObjectURL(blob);
			dwImage.src=URL.createObjectURL(blob);
			dwImage.style.display='none';
			dwImage.setAttribute('download',filename);
			el("body").appendChild(dwImage);
			dwImage.click();
		})
		.catch(error => console.log(error));
}
