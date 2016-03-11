
function showPopUp(){
    var acctId = $("#phoneNum24").html();
    var startDate24 = $("#strt_date24").val();
    var endDate24 = $("#end_date24").val();
    var startDate = $("#strt_date").val();
    var endDate = $("#end_date").val();

    var popUpParent = $('.light_box_shadow_box2');
    var popUpHTML = "<div class='popup'>"+
                        "<div class='paper'>"+
                            "<a class='boxclose' id='closePopUp'/>"+
                            "<br/><br/><br/><br/>"+
                            "<h1>Last 24 Hours Data Usage</h1>"+
                            "<div id='container24'>Loading...</div>"+
                            "<br/><br/><br/><br/>"+
                            "<br/><br/><br/><br/>"+
                            "<h1>Historical Data Usage</h1>"+
                            "<div id='container'>Loading...</div>"+
                        "</div>"+
                    "</div>";
    popUpParent.html(popUpHTML);

    showCharts(acctId, startDate24, endDate24, startDate, endDate);
    $('#closePopUp').click(function(){
        location.reload();
    });
}

function showButton(){
    //var strip = $(".bill-details-strip-right");
    var strip = $(".return_home_link");
    var x = strip.html();
    var viewChartButton = "<button class='view-chart-button' style='position:relative; z-index: 2;' >View Chart</button>";
    strip.html(x+viewChartButton);
    $('.view-chart-button').click(showPopUp);
}


function showCharts(acctId, startDate24, endDate24, startDate, endDate){
        params = {
                acctId: acctId,
                startDate: startDate24,
                endDate: endDate24
        };
        getUrl(params, 'N', getDataUsage);

        params = {
                acctId: acctId,
                startDate: startDate,
                endDate: endDate
        };
        getUrl(params, 'Y', getDataUsage);
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

function convert_date_format(date){
    return date.substring(6, 10)+'-'+date.substring(3, 5)+'-'+date.substring(0, 2);
}

function getUrl(params, IsHistoricalRequired, callback) { 
  var baseUrl   = 'https://www.airtel.in/services/reportserviceusagerecords_V1_1/customerusagedata';
  var startDate = convert_date_format(params.startDate);
  var endDate   = convert_date_format(params.endDate);
  $.ajax({url: baseUrl,
          data: {
              acctId: params.acctId,
              startDate: startDate,
              endDate: endDate,
              IsHistoricalRequired: IsHistoricalRequired
          },
          success: function(result){
              callback(result, IsHistoricalRequired);
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

window.onload = function(){
    showButton();
}
