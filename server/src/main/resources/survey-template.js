var defaultThemeColors = Survey
    .StylesManager
    .ThemeColors["default"];

defaultThemeColors["$main-color"] = "#a30000";
defaultThemeColors["$main-hover-color"] = "#820000";
defaultThemeColors["$text-color"] = "#4a4a4a";
defaultThemeColors["$header-color"] = "#ffffff";
defaultThemeColors["$header-background-color"] = "#cc0000";
defaultThemeColors["$body-container-background-color"] = "#f8f8f8";
defaultThemeColors["$error-color"]="#a30000";
defaultThemeColors["$border-color"]="#cc0000";

Survey
    .StylesManager
    .applyTheme();

Survey.requiredText = "AA";


Survey.ChoicesRestfull.onBeforeSendRequest = function(sender, options) {
        options.request.setRequestHeader("Content-Type", "application/javascript");
        //options.request.setRequestHeader("Authorization", "Bearer "+jwtToken);
};

var json = SURVEY_CONTENT;

window.survey = new Survey.Model(json);

//survey
//    .onComplete
//    .add(function (result) {
//            var xmlhttp = new XMLHttpRequest();
//            tmpResult = result.data;
//   		    var custID = Utils.getParameterByName("customerId");
//   		    var appID  = Utils.getParameterByName("applicationId");
//
//            //dependencies array needs special handling
//            var tmpDEPSOUTLIST = tmpResult.DEPSOUTLIST;
//            var tmpDEPSINLIST = tmpResult.DEPSINLIST;
//            delete tmpResult.DEPSOUTLIST;
//            delete tmpResult.DEPSINLIST;
//            xmlhttp.open("POST", addAuthToken(Utils.SERVER+"/api/pathfinder/customers/"+custID+"/applications/"+appID+"/assessments"));
//            xmlhttp.setRequestHeader("Content-Type", "application/json");
//            myObj = { "payload": tmpResult,"depsOUT":tmpDEPSOUTLIST, "depsIN":tmpDEPSINLIST,"datetime":new Date()};
//            var payload=JSON.stringify(myObj);
//            console.log("payload="+payload);
//            xmlhttp.send(payload);
//
//            if (undefined!=$('#surveyCompleteLink')){
//            	$('#surveyCompleteLink').attr('href', '/pathfinder-ui/assessments-v2.jsp?customerId='+Utils.getParameterByName("customerId"));
//            }
//    });
//
//

var timeInfo=[];


var geoInfo=undefined;
if (undefined==geoInfo){
  $.ajax({
    url: "http://ip-api.com/json?fields=continentCode,country,countryCode,region",
    type: 'GET',
    success: function(json){
	  geoInfo=json;
	  console.log("GeoInfo:: Identified country: " + json.country);
    },
    error: function(err){
      console.log("GeoInfo Failed: " + err);
    }});
}


//survey.showTimerPanelMode = 'page';
survey.startTimer();
survey.showTimerPanel = 'bottom';
survey
      .onAfterRenderPage
      .add(function(result, options){
    	  ////startPageTimer();
    	  //var timeTaken=survey.koTimerInfoText();
    	  //
    	  //if (""==timeTaken) return;
    	  //var expr= /.+spent (.+?) on this page and (.+?) in total./g;
    	  //var match=expr.exec(timeTaken);
    	  //timeInfo[survey.currentPageValue.name]=match[1];
    	  ////var arr = /.+spent (.+?) on this page and (.+?) in total./.exec(timeTaken);
    	  //
    	  //console.log("page "+ survey.currentPageValue.name+" - "+timeTaken);
      })

survey
	.onCurrentPageChanged
	.add(function(sender, options){
		var page=options.oldCurrentPage;
		var timeTaken=page.survey.koTimerInfoText();
		if (""==timeTaken) return;
		var expr= /.+spent (.+?) on this page and (.+?) in total./g;
		var match=expr.exec(timeTaken);
		timeInfo[page.name]=match[1];
		console.log("Metrics:: sending page message: page "+ page.name+" - "+timeInfo[page.name]);
		
    	var data={};
    	data["info.time_on_page"]=timeInfo[page.name];
    	data["info.geo"]=geoInfo["continentCode"];
    	data["info.countryCode"]=geoInfo["countryCode"];
    	data["info.region"]=geoInfo["region"];
		Http.httpPost(env.server+"/api/surveys/"+surveyId+"/metrics/"+page.name+"/onPageChange?cookie="+Cookie.get("rhrti-uid"), data);
	});
		
survey
    .onComplete
    .add(function (result) {
    	var page=result.currentPageValue;
    	console.log("Metrics:: sending survey complete message");
    	
		var timeTaken=result.currentPageValue.survey.koTimerInfoText();
		if (""==timeTaken) return;
		var expr= /.+spent (.+?) on this page and (.+?) in total./g;
		var match=expr.exec(timeTaken);
		timeInfo[page.name]=match[1];
		console.log("Metrics:: sending page message: page "+ page.name+" - "+timeInfo[page.name]);

//		var data={};
//    	data["time_on_page"]=timeInfo[page.name];
//    	data["geo"]=geoInfo["continentCode"];
//    	data["countryCode"]=geoInfo["countryCode"];
//    	data["region"]=geoInfo["region"];
		
		var data={};
    	data["info.time_on_page"]=timeInfo[page.name];  
    	data["info.geo"]=geoInfo["continentCode"];      
    	data["info.countryCode"]=geoInfo["countryCode"];
    	data["info.region"]=geoInfo["region"];          
    	
    	Http.httpPost(env.server+"/api/surveys/"+surveyId+"/metrics/"+page.name+"/onComplete?cookie="+Cookie.get("rhrti-uid"), data);
    	//Http.httpPost(env.server+"/api/surveys/"+surveyId+"/metrics/"+page.name+"?event=onComplete&cookie="+Cookie.get("rhrti-uid")+"&time="+timeInfo[page.name]+"&country="+geoInfo["countryCode"]+"region"+geoInfo["region"]);

    	Http.httpPost(env.server+"/api/surveys/"+surveyId+"/metrics/onResults?cookie="+Cookie.get("rhrti-uid"), survey.data);
    	
    	
    });
    	
//survey
//    .onAfterRenderPage
//    .add(function (result) {
//      console.log("result="+JSON.stringify(survey.data));
//      
//      // this adds the question weighting to the css class so we can add a visual clue to where the thresholds are 
//      $('input', $(".iradio_square-blue")).each(function(){
//        var valueSplit=this.value.split('-');
//        if (valueSplit.length>1){
//          var color=valueSplit[1];
//          $(this).parent().addClass("radio-weighting");
//          $(this).parent().addClass("radio-weighting-"+color.toLowerCase());
//          //console.log("Adding question weighting to: "+$(this).name);
//        }
//      });
//      
//      var custID = Utils.getParameterByName("customerId");
//      var appID  = Utils.getParameterByName("applicationId");
//        
//      if (survey.currentPageNo === 1){
//        
//	    result.data.CUSTID=result.data.CUSTNAME;
//	    var d1 = survey.getQuestionByName('DEPSOUTLIST');
//	    d1.choicesByUrl.url = addAuthToken(Utils.SERVER+"/api/pathfinder/customers/"+custID+"/applications/?exclude="+appID);
//	    d1.choicesByUrl.valueName = "Id";
//	    d1.choicesByUrl.titleName = "Name";
//	    d1.choicesByUrl.run();
//
//        var d2 = survey.getQuestionByName('DEPSINLIST');
//        d2.choicesByUrl.url = addAuthToken(Utils.SERVER+"/api/pathfinder/customers/"+custID+"/applications/?exclude="+appID);
//        d2.choicesByUrl.valueName = "Id";
//        d2.choicesByUrl.titleName = "Name";
//        d2.choicesByUrl.run();
//	  }
//    });

if (null!=results){
	survey.data=results;
}

$("#surveyElement").Survey({
    model: survey
});

//survey.locale = languageCode;
survey.render();


