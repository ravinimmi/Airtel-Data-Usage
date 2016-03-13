
function showPlanDetails(){
    $.ajax({url: 'http://122.160.230.125:8080/planupdate/',
            timeout: 2000,
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
            },
            error: function(jqXHR, textStatus, errorThrown){
                var page = $(".container").html();
                $(".container").html("<br/><h6 class='error-msg'>You do not seem to be connected to Airtel Broadband.</h6>" + page);
                console.log(errorThrown, textStatus);
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
    getUsageHistory(params, 'container24');

    params = {
            acctId: acctId,
            startDate: startDate,
            endDate: endDate,
            IsHistoricalRequired: 'Y'
    };
    getUsageHistory(params, 'container');
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
    $("#container").html("");
    $("#container24").html("");
    var loginHTML ="<span style='color: red;'>Please log in to your broadband account to view past internet usage details below.</span>"+
                   "<br/>"+
                   "<a class='waves-effect waves-light btn #00bcd4 cyan' id='airtel_page'>Login</a>"+
                   "<br/><br/>";
    $("#login").html(loginHTML);
    $("#airtel_page").click(airtelLoginPage); 
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
    displayChart(x, y, div_id);
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

window.onload = showPlanDetails;

