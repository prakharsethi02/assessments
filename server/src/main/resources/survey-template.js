

var config=SURVEY_CONFIG;

// Page theme
if (undefined!=config.theme && ""!=config.theme)
	loadCSS("assets/themes/"+config.theme+"/css/style.css");


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
//defaultThemeColors["$border-color"]="#cc0000";

Survey
    .StylesManager
    .applyTheme();

Survey
	.Serializer
	.addProperty("page", {
	    name: "navigationTitle:string",
	    isLocalizable: true
});
Survey
	.Serializer
	.addProperty("page", {
		name: "navigationDescription:string",
		isLocalizable: true
});

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
    	
		saveState(survey);
		
		Http.httpPost(env.server+"/api/surveys/"+surveyId+"/metrics/"+page.name+"/onPageChange?visitorId="+Cookie.get("rhrti-uid"), buildPageChangePayload(page));
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

		//window.localStorage.removeItem("data");
		window.localStorage.removeItem(storageName);
		clearInterval(timerId);
		saveState(survey);
    	
		Http.httpPost(env.server+"/api/surveys/"+surveyId+"/metrics/"+page.name+"/onComplete?visitorId="+Cookie.get("rhrti-uid"), buildPageChangePayload(page));
    	//Http.httpPost(env.server+"/api/surveys/"+surveyId+"/metrics/"+page.name+"?event=onComplete&cookie="+Cookie.get("rhrti-uid")+"&time="+timeInfo[page.name]+"&country="+geoInfo["countryCode"]+"region"+geoInfo["region"]);
    	
    	Http.httpPost(env.server+"/api/surveys/"+surveyId+"/metrics/onResults?cookie="+Cookie.get("rhrti-uid"), survey.data, function(result){
    		if (result.status==200){
    			// navigate to a results page
    			
    		}else{
    			// Handle the error scenario
    		}
    	});
    	
    	
    });

function buildPageChangePayload(page){
	var payload={};
	payload["visitorId"]=Cookie.get("rhrti-uid");
	payload["timeOnpage"]=timeInfo[page.name];
	payload["geo"]=geoInfo["continentCode"];
	payload["countryCode"]=geoInfo["countryCode"];
	payload["region"]=geoInfo["region"];
//	payload["info"]={};
//	payload["info"]["visitorId"]=Cookie.get("rhrti-uid");
//	payload["info"]["timeOnpage"]=timeInfo[page.name];
//	payload["info"]["geo"]=geoInfo["continentCode"];
//	payload["info"]["countryCode"]=geoInfo["countryCode"];
//	payload["info"]["region"]=geoInfo["region"];
//	payload["data"]=survey.data;
	return payload;
}

//if (undefined!=window.localStorage.getItem("data"))
//	survey.data=JSON.parse(window.localStorage.getItem("data"));

$("#surveyElement").Survey({
    model: survey
});



// MAT - ADDING TOP NAV
var navTopEl = document.querySelector("#surveyNavigation");
navTopEl.className = "navigationContainer";
//var leftImg = document.createElement("img");
//leftImg.src = "/Content/Images/examples/covid/Left.svg";
//leftImg.style = "width: 16px; height: 16px";
//leftImg.className = "navigationProgressbarImage";
//navTopEl.appendChild(leftImg);
var navProgBarDiv = document.createElement("div");
navProgBarDiv.className = "navigationProgressbarDiv";
navTopEl.appendChild(navProgBarDiv);
var navProgBar = document.createElement("ul");
navProgBar.className = "navigationProgressbar";
navProgBarDiv.appendChild(navProgBar);
//leftImg.onclick = function () {
//    navProgBarDiv.scrollLeft -= 70;
//};
//var liEls = [];
//for (var i = 0; i < survey.PageCount; i++) {
//    var liEl = document.createElement("li");
//    if (survey.currentPageNo == i) {
//        liEl
//            .classList
//            .add("current");
//    }
//    //liEl.onclick = function (index) {
//    //    return function () {
//    //        if (survey['isCompleted']) 
//    //            return;
//    //        liEls[survey.currentPageNo]
//    //            .classList
//    //            .remove("current");
//    //        if (index < survey.currentPageNo) {
//    //            survey.currentPageNo = index;
//    //        } else if (index > survey.currentPageNo) {
//    //            var j = survey.currentPageNo;
//    //            for (; j < index; j++) {
//    //                if (survey.visiblePages[j].hasErrors(true, true)) 
//    //                    break;
//    //                if (!liEls[j].classList.contains("completed")) {
//    //                    liEls[j]
//    //                        .classList
//    //                        .add("completed");
//    //                }
//    //            }
//    //            survey.currentPageNo = j;
//    //        }
//    //        liEls[survey.currentPageNo]
//    //            .classList
//    //            .add("current");
//    //    };
//    //}(i);
//    var pageTitle = document.createElement("span");
//    if (!survey.pages[i].navigationTitle) {
//        pageTitle.innerText = survey.pages[i].name;
//    } else 
//        pageTitle.innerText = survey.pages[i].navigationTitle;
//    pageTitle.className = "pageTitle";
//    liEl.appendChild(pageTitle);
//    var br = document.createElement("br");
//    liEl.appendChild(br);
//    var pageDescription = document.createElement("span");
//    if (!!survey.pages[i].navigationDescription) {
//        pageDescription.innerText = survey.pages[i].navigationDescription;
//    }
//    pageDescription.className = "pageDescription";
//    liEl.appendChild(pageDescription);
//    liEls.push(liEl);
//    navProgBar.appendChild(liEl);
//}
//survey
//    .onCurrentPageChanged
//    .add(function (sender, options) {
//        var oldIndex = options.oldCurrentPage.visibleIndex;
//        var newIndex = options.newCurrentPage.visibleIndex;
//        if (undefined!=liEls[oldIndex])
//	        liEls[oldIndex]
//	            .classList
//	            .remove("current");
//        if (newIndex > oldIndex) {
//            for (var i = oldIndex; i < newIndex; i++) {
//                if (sender.visiblePages[i].hasErrors(true, true)) 
//                    break;
//                if (!liEls[i].classList.contains("completed")) {
//                    liEls[i]
//                        .classList
//                        .add("completed");
//                }
//            }
//        }
//        if (undefined!=liEls[newIndex])
//	        liEls[newIndex]
//	            .classList
//	            .add("current");
//    });




var liEls = {};
for (var i = 0; i < survey.PageCount; i++) {
    var liEl = document.createElement("li");
    if (survey.currentPageNo == i) {
        liEl
            .classList
            .add("current");
    }
    var pageTitle = document.createElement("span");
    if (!survey.pages[i].navigationTitle) {
        pageTitle.innerText = survey.pages[i].name;
    } else 
        pageTitle.innerText = survey.pages[i].navigationTitle;
    pageTitle.className = "pageTitle";
    liEl.appendChild(pageTitle);
    var br = document.createElement("br");
    liEl.appendChild(br);
    var pageDescription = document.createElement("span");
    if (!!survey.pages[i].navigationDescription) {
        pageDescription.innerText = survey.pages[i].navigationDescription;
    }
    pageDescription.className = "pageDescription";
    liEl.appendChild(pageDescription);
    liEls[survey.pages[i].name]=liEl;
    navProgBar.appendChild(liEl);
}
survey
    .onCurrentPageChanged
    .add(function (sender, options) {
    	var oldIndex = options.oldCurrentPage.name;
        var newIndex = options.newCurrentPage.name;
        var oldIndexI = options.oldCurrentPage.visibleIndex;
        var newIndexI = options.newCurrentPage.visibleIndex;
        
        if (undefined!=liEls[oldIndex])
	        liEls[oldIndex].classList.remove("current");
        // change li color once transitioned beyond it
        if (newIndexI > oldIndexI) {
            for (var i = oldIndexI; i < newIndexI; i++) {
                if (sender.visiblePages[i].hasErrors(true, true)) 
                    break;
                if (!liEls[sender.visiblePages[i].name].classList.contains("completed")) {
                    liEls[sender.visiblePages[i].name].classList.add("completed");
                }
            }
        }
        // highlight current
        if (undefined!=liEls[newIndex])
	        liEls[newIndex].classList.add("current");
    });
    
/*
var rightImg = document.createElement("img");
rightImg.src = "https://img.icons8.com/material/4ac144/256/user-male.png";
rightImg.style = "width: 16px; height: 16px";
rightImg.className = "navigationProgressbarImage";
rightImg.onclick = function () {
    navProgBarDiv.scrollLeft += 70;
};
navTopEl.appendChild(rightImg);

var updateScroller = setInterval(() => {
    if (navProgBarDiv.scrollWidth <= navProgBarDiv.offsetWidth) {
        leftImg
            .classList
            .add("hidden");
        rightImg
            .classList
            .add("hidden");
    } else {
        leftImg
            .classList
            .remove("hidden");
        rightImg
            .classList
            .remove("hidden");
    }
}, 100);
 * */
// /MAT - ADDING TOP NAV



// State saving feature (+ timed saving)
var timerId=0;
var saveIntervalInSeconds=20;
var storageName="RHAssessmentPlatform_State";
function saveState(survey) {
	console.log("Saving state... (page "+survey.currentPageNo+")");
    window.localStorage.setItem(storageName, JSON.stringify({ currentPageNo: survey.currentPageNo, data: survey.data }));
}
function loadState(survey) {
	var storageSt = window.localStorage.getItem(storageName) || "";
	var loaded=storageSt?JSON.parse(storageSt):{ currentPageNo: 1, data: json };
	if (loaded.data) 
	    survey.data=loaded.data;
	if (loaded.currentPageNo){
		console.log("set page to "+loaded.currentPageNo);
		survey.currentPageNo=loaded.currentPageNo;
	}
}
//save data every x seconds
timerId = window.setInterval(function () {
    saveState(survey);
}, saveIntervalInSeconds*1000);

loadState(survey);
// /State saving feature




//survey.showPreviewBeforeComplete = 'showAnsweredQuestions';

//survey.locale = languageCode;
survey.render();


