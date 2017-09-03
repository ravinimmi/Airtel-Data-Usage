
function showRemainingData(){
    $.ajax({url: 'http://122.160.230.125:8080/planupdate/',
            success: function(result){
                var page = $("<div>");
                page.html(result);
                var dataLeft  = $($(page.find(".description")[0].parentElement.parentElement).find('span')[1]).html()
                setDataBadge(dataLeft.substring(0, 4));
            }
    });
}

function setDataBadge(data){
    chrome.browserAction.setBadgeBackgroundColor({ color: [0, 0, 255, 255] });
    chrome.browserAction.setBadgeText({text: data});
}

showRemainingData();
setInterval(showRemainingData, 300000); //5 minutes

