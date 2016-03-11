
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
    $("#airtel_page").click(airtelDataUsagePage); 
    showPlanDetails();
}

window.onload = onWindowLoad;
