
var PLAN_URL = 'http://122.160.230.125:8080/planupdate/';
var PLAN_TIMEOUT = 5000;
var notAirtelBroadbandHTML = "<br/><h6 class='error-msg'>You do not seem to be connected to Airtel Broadband.</h6>";

function showPlanDetails(){
    $.ajax({url: PLAN_URL,
            timeout: PLAN_TIMEOUT,
            success: function(result){
                parseHTML(result);
            },
            error: function(jqXHR, textStatus, errorThrown){
                $("#plan-details").append(notAirtelBroadbandHTML);
                console.log(errorThrown, textStatus);
            }
    });
}

function parseHTML(HTML){
    var page = $("<div>");
    page.html(HTML);
    var plan       = $(page.find(".description")[0]).find("span").html();
    var dataLeft   = $(page.find(".description")[1]).find("span").html();
    var daysLeft   = $(page.find(".description")[2]).find("span").html();
    var DSLNumber  = $(page.find(".description")[3]).find("span").html();
    var smartBytes = $($(page.find(".description")[0]).find("span")[1]).html() || "0 GB";
    var message    = $(page.find(".detail")[0]).find("p").html();
    addDetailsToPage(plan, dataLeft, daysLeft, DSLNumber, smartBytes, message);
    showCharts(DSLNumber, false);
    addRefreshEventListener(DSLNumber);
}

function addDetailsToPage(plan, dataLeft, daysLeft, DSLNumber, smartBytes, message){
    $("#DSLNumber").html(DSLNumber);
    $("#plan").html(plan);
    $("#dataLeft").html(dataLeft);
    $("#daysLeft").html(daysLeft);
    $("#smartBytes").html(smartBytes);
    $("#message").html(message);
    setDataBadge(dataLeft.substring(0, 4));
}

function addRefreshEventListener(DSLNumber){
    $("#24hrs-usage-refresh").click(function(){
        showCharts(DSLNumber, true);
    });
    $("#30days-usage-refresh").click(function(){
        showCharts(DSLNumber, true);
    });
}

function setDataBadge(data){
    chrome.browserAction.setBadgeBackgroundColor({ color: [0, 0, 255, 255] });
    chrome.browserAction.setBadgeText({text: data});
}

function showCharts(acctId, refresh){
    if(refresh)
    {
        var date = new Date();
        var endDate24 = date.toISOString().split('T')[0];
        date.setDate(date.getDate()-1);
        var startDate24 = date.toISOString().split('T')[0];

        var endDate = date.toISOString().split('T')[0];
        date.setDate(date.getDate()-30);
        var startDate = date.toISOString().split('T')[0];

        params = {
                acctId: acctId,
                startDate: startDate24,
                endDate: endDate24,
                IsHistoricalRequired: 'N'
        };
        getUsageHistory(params, '24hrs-usage');

        params = {
                acctId: acctId,
                startDate: startDate,
                endDate: endDate,
                IsHistoricalRequired: 'Y'
        };
        getUsageHistory(params, '30days-usage');
    }
    else
    {
        showOldData('24hrs-usage', acctId);
        showOldData('30days-usage', acctId);
    }
}

function getUsageHistory(params, div_id) { 
    var baseUrl   = 'https://www.airtel.in/services/reportserviceusagerecords_V1_1/customerusagedata';
    $.ajax({url: baseUrl,
          data: params,
          success: function(result){
              if(typeof(result) == "object")
                  bucketAndDisplay(result, div_id);
              else
                  loggedOutMessage();
          },
          error: function(jqXHR, textStatus, errorThrown){
              console.log(errorThrown, textStatus);
          }
    });
}

function airtelLoginPage(){
    var newURL = "https://www.airtel.in/personal/myaccount/home";
    chrome.tabs.create({ url: newURL });
}

function loggedOutMessage(){
    var loginHTML = "<a class='waves-effect waves-light btn blue' id='airtel-page'>Login</a>"
    $("#24hrs-usage").html(loginHTML);
    $("#30days-usage").html(loginHTML);
    $("#airtel-page").click(airtelLoginPage); 
}

function bucketAndDisplay(response, div_id){
    usageList = response.GetCustomerDSLUsageResponse.Usage;
    dataDict = {}
    for(var i=0;i<usageList.length;i++)
    {
        data = parseFloat(usageList[i].ConsumedData);
        var date = usageList[i].UsageSearchTime.substring(0, 10);
        if(date in dataDict)
            dataDict[date] += data;
        else
            dataDict[date] = data;
    }
    var x=[], y=[];
    for(var object in dataDict){
        x.push(object);
        y.push(dataDict[object]/(1024*1024));
    }
    saveData(x, y, div_id);
    displayChart(x, y, div_id);
}

function displayChart(x, y, div_id){
    $('#'+div_id+'-chart').highcharts({
        chart: {
            type: 'line',
            width: 650,
            height: 400
        },
        title: {
            text: 'Data Consumption'
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            title: {
                text: 'Data (GB)'
            }
        },
        series: [{
            name: 'Data (GB)',
            data: y
        }]
    });
}

function saveData(x, y, div_id){
    var stuff = {};
    stuff[div_id] = {'x': x, 'y': y};
    chrome.storage.local.set(stuff);
}

function showOldData(div_id, acctId){
    chrome.storage.local.get(div_id, function(result){
            if(Object.keys(result).length === 0){
                showCharts(acctId, true);
            }
            else{
                var x = result[div_id].x;
                var y = result[div_id].y;
                displayChart(x, y, div_id);   
            }
        });
}


window.onload = showPlanDetails;

