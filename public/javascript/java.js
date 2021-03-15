var barsbtn = document.querySelector('#bars');
var removebtn = document.querySelector('#remove');
var remove2btn = document.querySelector('#remove2');

var nav1btn= document.querySelector('#nav1');
var nav2btn = document.querySelector('#nav2');
var searchbar = document.querySelector('#searchbar');
var searchForm = document.querySelector('#searchForm');
var logo = document.querySelector('.logo2');




barsbtn.addEventListener('click', function(){
    nav1btn.style.display='block';
    nav2btn.style.display='block';
    removebtn.style.display='block';
    barsbtn.style.display='none';

})


removebtn.addEventListener('click', function(){
    nav1btn.style.display='none';
    nav2btn.style.display='none';
    removebtn.style.display='none';
    barsbtn.style.display='block';

})

remove2btn.addEventListener('click', function(){
    barsbtn.style.display='block';
    searchForm.style.display='none';
    logo.style.display='block';
    searchbar.style.display='block';
    remove2btn.style.display='none';

})


searchbar.addEventListener('click', function(){
    nav1btn.style.display='none';
    nav2btn.style.display='none';
    removebtn.style.display='none';
    barsbtn.style.display='none';
    searchForm.style.display='block';
    logo.style.display='none';
    searchbar.style.display='none';
    remove2btn.style.display='block';

})


var pass = document.getElementById('passer')


function myFunction(){
    
    if(pass.type === 'password'){
        pass.type = 'text';
    }else{
        pass.type = 'password';
    }
};
