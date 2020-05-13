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


const LOAD_MORE_BTN = '<button class="btn btn-small z-depth-0 grey lighten-3 black-text" onclick="loadMore()">Load More</button>';

const LOADING = '<div class="preloader-wrapper small active"><div div class="spinner-layer spinner-blue-only" ><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>';

function resetApp(){
	hide(el('#result'));
	el('#timeline').innerHTML=LOADING;
	el('#displayProfile').innerHTML=LOADING;
}

function processing(){
	show(el('#result'));
	el('#timeline').innerHTML=LOADING;
	el('#displayProfile').innerHTML = LOADING;
}

function msg(msg){
	M.toast({
		html: msg.message,
		displayLength:4000,
		classes: 'red'
	});
}


const API_URL = 'https://insta-api-gamma.now.sh';

let CURRENT_PROFILE = {};

const form = el('#user-details');
form.addEventListener('submit',(event)=>{
	event.preventDefault();
	resetApp();
	processing();
	const formData = new FormData(form);
	const username = formData.get('username');
	if(!username || username==''){
		msg({message:'Username cannot be empty!'});
		resetApp();
	}
	else{
		fetch(API_URL+'/profile',{
			method:'POST',
			body:JSON.stringify({username}),
			headers:{
				'content-type':'application/json'
			}
		})
		.then(response => response.json())
		.then(data=>{
			setProfile(data);
			return data;
		})
		.then(profile=>{
			if(profile.profile.private){
				return false;
			}
			else{
				return fetch(API_URL+'/posts',{
					method:'POST',
					body:JSON.stringify({username}),
					headers:{
						'content-type':'application/json'
					}
				});
			}
		})
		.then(response2=>response2.json())
		.then(data2=>setPosts(data2))
		.catch(error=>msg(error));
	}

});

function setProfile(profile){
	CURRENT_PROFILE = profile.profile;

		let profileBox = '<h5>'+CURRENT_PROFILE.name+'</h5><div><img src="'+CURRENT_PROFILE.profile_pic+'" alt="'+CURRENT_PROFILE.name+'" id="profilePic" width="100%"></div>';
		el('#displayProfile').innerHTML = profileBox;

		let dwBtn = document.createElement('button');
		dwBtn.innerHTML="Download";
		dwBtn.classList = "btn waves-effect green waves-light download-dp-btn";
		dwBtn.addEventListener('click',()=>{
			downloadImage(CURRENT_PROFILE.profile_pic, CURRENT_PROFILE.username+'-InstaDown-'+Date.now());
		});
		el('#displayProfile').appendChild(dwBtn);
	
} 


async function setPosts(posts){
	CURRENT_PROFILE.posts = posts;

	el('#timeline').innerHTML = '';

		await CURRENT_PROFILE.posts.data.forEach(post=>{
			let postItem = document.createElement('img');
			postItem.classList = "col s12 post-item card z-depth-0 cur-pointer";
			postItem.src=post.image;
			postItem.addEventListener('click',()=>{
				downloadImage(post.image, CURRENT_PROFILE.username+'-InstaDown-'+Date.now());
			});
			el('#timeline').appendChild(postItem);
			
		});

	el("#loadMoreCont").innerHTML=LOAD_MORE_BTN;
}

async function loadMore(){
	el("#loadMoreCont").innerHTML = LOADING;
	const username = CURRENT_PROFILE.username;
	const next = CURRENT_PROFILE.posts.next;

	fetch(API_URL+'/posts',{
		method:'POST',
		body:JSON.stringify({username:username,next:next}),
		headers:{
			'content-type':'application/json'
		}
	})
	.then(response=>response.json())
	.then(data=>{
		CURRENT_PROFILE.posts.data.push(data.data);
		CURRENT_PROFILE.posts.has_next_page = data.has_next_page;
		CURRENT_PROFILE.posts.next = data.next;
		return data;
	})
	.then(morePosts => {
		
		morePosts.data.forEach(post=>{
			let postItem = document.createElement('img');
			postItem.classList = "col s12 post-item card z-depth-0 cur-pointer";
			postItem.src=post.image;
			postItem.addEventListener('click',()=>{
				downloadImage(post.image, CURRENT_PROFILE.username+'-InstaDown-'+Date.now());
			});
			el('#timeline').appendChild(postItem);
		});

		el("#loadMoreCont").innerHTML = LOAD_MORE_BTN;

	})
	.catch(error=>msg(error));

}

async function downloadImage(url,filename){
	if(!url || url==''){
		msg({message:'Empty image URL'});
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
		.catch(error => msg(error));
}
