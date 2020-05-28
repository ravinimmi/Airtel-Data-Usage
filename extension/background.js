function parseDescription(text) {
    var data = text.split("\n").map(
        function(x) {return x.trim()}
    ).filter(
        function(x) {return x != ""}
    );

    var keywords = [];

    for(i in data) {
        keywords = keywords.concat(data[i].split(":"));
    }

    var data = {}
    var key = []
    for(i in keywords) {
        keywords[i] = keywords[i].trim();
        if (keywords[i] == "") continue;

        if(!isNaN(keywords[i][0])) {
            data[key.join(" ")] = keywords[i];
            key = [];
        }
        else {
            key.push(keywords[i]);
        }
    }

    return data
}


function showRemainingData(){
    $.ajax({url: 'http://122.160.230.125:8080/planupdate/',
            success: function(result){
                var page = $("<div>");
                page.html(result);
                var descriptionParent = $(page.find(".description")[0].parentElement.parentElement);
                var data = parseDescription(descriptionParent.text());
                var dataLeft = data['You are left with'];
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

