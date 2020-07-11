angular
.module("authFront",[])
.factory("myAuth",function($http){

	var factobj = {};
	factobj.userinfo = {login: false, username: ""};
	factobj.updateUserinfo = function(obj){
		factobj.userinfo = {login: obj.status, username: obj.fullname};
		return true;
	};
	
	 var years = [];
    for (var i = 2014; i <= 2050; i++) {
       years.push(i);
    }
    factobj.years = years;
	
	var days=[];
	for(var i=1;i<=31;i++){	
		days.push(i);
	}
	factobj.days=days;
	
	factobj.resetUserinfo=function(){
		factobj.userinfo = {login: false, username: ""};
	};

	//factobj.baseurl = "http://localhost/book_keeping/";
	factobj.baseurl = "http://smartbookspro.com/";
	factobj.getNavlinks = function(){
		var login = factobj.userinfo.login,
			username = (typeof factobj.userinfo.username == "undefined" || factobj.userinfo.username=="") ? "Unknown" : factobj.userinfo.username;
		if(!login){
			return [{name:"Login", href:"#/login"}];
		}else{
			return [
				{name:"Home", href:"#/account"},
				{name:"Log Out", href:"#/logout"},
				{name: username, href:"#/profile"}
			];
		}
	};
	
	
	factobj.getAuthorisation = function(){
		var authResp = {};
		$.ajax({
			type:"POST",
			url: factobj.baseurl+"users/checklogin",
			dataType:'json',
			async:false,
			success:function(responseData){authResp = responseData;}
		});
		return authResp;
	};
	
	
	return factobj;
	
})