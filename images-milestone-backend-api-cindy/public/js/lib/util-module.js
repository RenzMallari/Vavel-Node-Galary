angular
.module("myUtils",["authFront"])
.factory("utilFactory", function($http, myAuth){
	var utilobj = {};	
	utilobj.getexpenseList=function(mm,yr){
		var expenses = {};
		$.ajax({
			type:"POST",
			url: myAuth.baseurl+"expenses/index/"+mm+"/"+yr,
			dataType:'json',
			async:false,
			success:function(responseData){
				if(responseData.length>0){    
					expenses=responseData;
				 }
			}
		});
		
		return expenses;
	}
	utilobj.getincomeList=function(mm,yr)
	{
		var incomes={};
		$.ajax({
			type:"POST",
			url: myAuth.baseurl+"incomes/index/"+mm+"/"+yr,
			dataType:'json',
			async:false,
			success:function(responseData){
				if(responseData.length>0){    
					incomes=responseData;
				 }
			}
		});
		return incomes;

	}
	utilobj.getmileageList=function(mm,yr){
		var mileages = {};
		$.ajax({
			type:"POST",
			url: myAuth.baseurl+"mileages/index/"+mm+"/"+yr,
			dataType:'json',
			async:false,
			success:function(responseData){
				if(responseData.length>0){    
					mileages=responseData;
				 }
			}
		});
		
		return mileages;
	}
	utilobj.getpropertyList=function(yy){
		var properties = {};
		$.ajax({
			type:"POST",
			url: myAuth.baseurl+"properties/index/"+yy,
			dataType:'json',
			async:false,
			success:function(responseData){
				if(responseData.length>0){    
					properties=responseData;
				 }
			}
		});
		
		return properties;
	}
	utilobj.getvehicleList=function(yy){
		var vehicles = {};
		$.ajax({
			type:"POST",
			url: myAuth.baseurl+"vehicles/index/"+yy,
			dataType:'json',
			async:false,
			success:function(responseData){
				if(responseData.length>0){    
					vehicles=responseData;
				 }
			}
		});
		
		return vehicles;
	}
	utilobj.getMonthlyReport=function(date1){
		
			 var reports={};			 
			 $.ajax({
				type:"POST",
				url: myAuth.baseurl+"reports/monthlyreport",
				dataType:'json',
				data:{date : date1},
				async:false,
				success:function(responseData){
					
					if(responseData){ 
						
						reports=responseData;
					 }
				}
			});		
			
			return reports;
	}
	
	utilobj.getYearlyReport=function(date1){
		
			 var reports={};			 
			 $.ajax({
				type:"POST",
				url: myAuth.baseurl+"reports/yearlyreport",
				dataType:'json',
				data:{date : date1},
				async:false,
				success:function(responseData){
					
					if(responseData){ 
						
						reports=responseData;
					 }
				}
			});		
			
			return reports;
	}

	return utilobj
	
 })