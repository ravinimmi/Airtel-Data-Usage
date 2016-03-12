
function airtelDataUsagePage(){
    var newURL = "https://www.airtel.in/personal/myaccount/telemedia/dsl-usage-details-24h";
    chrome.tabs.create({ url: newURL });
}

function showPlanDetails(){
    $.ajax({url: 'http://122.160.230.125:8080/planupdate/',
            success: function(result){
                var page = $("<div>");
                page.html(result);
                var plan      = $(page.find(".description")[0]).find("span").html();
                var dataLeft  = $(page.find(".description")[1]).find("span").html();
                var daysLeft  = $(page.find(".description")[2]).find("span").html();
                var DSLNumber = $(page.find(".description")[3]).find("span").html();
                var smartBytes = $($(page.find(".description")[0]).find("span")[1]).html() || "0 GB";
                addDetailsToPage(plan, dataLeft, daysLeft, DSLNumber, smartBytes);
                showCharts(DSLNumber);
            }
    });
}

function addDetailsToPage(plan, dataLeft, daysLeft, DSLNumber, smartBytes)
{
    $("#DSLNumber").html(DSLNumber);
    $("#plan").html(plan);
    $("#dataLeft").html(dataLeft);
    $("#daysLeft").html(daysLeft);
    $("#smartBytes").html(smartBytes);
    setDataBadge(dataLeft.substring(0, 4));
}

function setDataBadge(data){
    chrome.browserAction.setBadgeBackgroundColor({ color: [0, 0, 255, 255] });
    chrome.browserAction.setBadgeText({text: data});
}

function onWindowLoad(){
    showPlanDetails();
}

window.onload = onWindowLoad;


function LoggedOutMessage(){
    $("#container").html("");
    $("#container24").html("");
    var loginHTML ="<span style='color: red;'>Please log in to your broadband account to view past internet usage details below.</span>"+
                   "<br/>"+
                   "<a class='waves-effect waves-light btn #00bcd4 cyan' id='airtel_page'>Login</a>"+
                   "<br/><br/>";
    $("#login").html(loginHTML);
    $("#airtel_page").click(airtelDataUsagePage); 
}

function showCharts(acctId){
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
        getUrl(params, getDataUsage, LoggedOutMessage);

        params = {
                acctId: acctId,
                startDate: startDate,
                endDate: endDate,
                IsHistoricalRequired: 'Y'
        };
        getUrl(params, getDataUsage, LoggedOutMessage);
}

function displayChart(x, y, div_id){
    $('#'+div_id).highcharts({
        chart: {
            type: 'line'
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


function getUrl(params, callback, callbackLogin) { 
  var baseUrl   = 'https://www.airtel.in/services/reportserviceusagerecords_V1_1/customerusagedata';
  $.ajax({url: baseUrl,
          data: params,
          success: function(result){
              if(typeof(result) == "object")
                  callback(result, params.IsHistoricalRequired);
              else
                  callbackLogin();
          },
          error: function(jqXHR, textStatus, errorThrown){
              console.log(errorThrown, textStatus);
          }
  });
}

function getDataUsage(response, IsHistoricalRequired){
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
    if(IsHistoricalRequired === 'N')
        displayChart(x, y, 'container24');
    else
        displayChart(x, y, 'container');
}
