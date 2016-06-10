
var PLAN_URL = 'http://122.160.230.125:8080/planupdate/';
var PLAN_TIMEOUT = 5000;
var notAirtelBroadbandHTML = "<br><div class='error-msg'>You do not seem to be connected to Airtel Broadband.</div>";
var USAGE_URL = 'https://www.airtel.in/services/reportserviceusagerecords_V1_1/customerusagedata';
var AIRTEL_LOGIN_PAGE = "https://www.airtel.in/personal/myaccount/home";
var preloaderHTML = '<div class="preloader-wrapper big active" id="preloader">'+
                        '<div class="spinner-layer spinner-blue-only">'+
                          '<div class="circle-clipper left">'+
                            '<div class="circle"></div>'+
                          '</div><div class="gap-patch">'+
                            '<div class="circle"></div>'+
                          '</div><div class="circle-clipper right">'+
                            '<div class="circle"></div>'+
                          '</div>'+
                    '</div>';

function showPlanDetails(){
    showPreLoader();
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

function showPreLoader(){
    $("#24hrs-usage-chart").html(preloaderHTML);
    $("#30days-usage-chart").html(preloaderHTML);
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
    showOldChart('24hrs-usage', DSLNumber);
    showOldChart('30days-usage', DSLNumber);
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
        showPreLoader();
        showCharts(DSLNumber);
    });
    $("#30days-usage-refresh").click(function(){
        showPreLoader();
        showCharts(DSLNumber);
    });
}

function setDataBadge(data){
    chrome.browserAction.setBadgeBackgroundColor({ color: [0, 0, 255, 255] });
    chrome.browserAction.setBadgeText({text: data});
}

function showDivChart(DSLNumber, div_id){
    if(div_id === '24hrs-usage')
        showChart(DSLNumber, 1, 'N', '24hrs-usage');
    else if(div_id === '30days-usage')
        showChart(DSLNumber, 30, 'Y', '30days-usage');
}

function showCharts(DSLNumber){
    showDivChart(DSLNumber, '24hrs-usage');
    showDivChart(DSLNumber, '30days-usage');
}

function showChart(acctId, days, IsHistoricalRequired, div_id){
    var date = new Date();
    var endDate = date.toISOString().split('T')[0];
    date.setDate(date.getDate()-days);
    var startDate = date.toISOString().split('T')[0];
    params = {
            acctId: acctId,
            startDate: startDate,
            endDate: endDate,
            IsHistoricalRequired: IsHistoricalRequired
    };
    getUsageHistory(params, div_id);
}

function getUsageHistory(params, div_id) { 
    $.ajax({url: USAGE_URL,
            data: params,
            success: function(result){
              if(typeof(result) == "object")
                  bucketAndDisplay(result, div_id);
              else
                  login();
            },
            error: function(jqXHR, textStatus, errorThrown){
              console.log(errorThrown, textStatus);
            }
    });
}

function airtelLoginPage(){
    chrome.tabs.create({ url: AIRTEL_LOGIN_PAGE });
}

function login(){
    loginGeneric('24hrs-usage');
    loginGeneric('30days-usage');
}

function loginGeneric(div_id){
    var id = "airtel-page" + div_id;
    $('#'+div_id).html("<a class='waves-effect waves-light btn blue airtel-page' id="+ id +">Login</a>");
    $('#'+id).click(airtelLoginPage);
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
    var usageData = {};
    usageData[div_id] = {'x': x, 'y': y};
    chrome.storage.local.set(usageData);
}

function showOldChart(div_id, DSLNumber){
    chrome.storage.local.get(div_id, function(result){
        if(Object.keys(result).length === 0){
            showDivChart(DSLNumber, div_id);
        }
        else{
            var x = result[div_id].x;
            var y = result[div_id].y;
            displayChart(x, y, div_id);   
        }
    });
}


window.onload = showPlanDetails;

