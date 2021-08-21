const openWeatherApiKey = "04d131c2b9eeaab1201354e60c24c6fe";
var showtimer = setInterval(showTimer,1000);

function showTimer () {
    var now = new moment().format('dddd, MMMM Do YYYY [at] h:mm:ss a');
    $("#currentTime").text(now);
}

//Get Input of city and use geocoding to convert to lat/lon
var historyArr = [];
var queryCity = {
    query : [],
    city : "",
    region : "",
    zip : 0,
    lat : 0,
    lon : 0,
}
//TODO fix user input valiation, breaks on various queries
$('#searchBttn').click( function getInput () {
    console.log("...searching")
    queryCity.query = $('#search').val();
    searchStr = queryCity.query;
    if (searchStr.includes(',')) {
        searchArr = searchStr.split(',');
        queryCity.city = searchArr[0];
        queryCity.region = searchArr[1];
        getGeocode(queryCity.city,queryCity.region);
    } else { 
        queryCity.city = $('#search').val();
        console.log(queryCity);
        getGeocode(queryCity.city);
    }
});

function getGeocode (city,state,country) {
    $.ajax({
        url : "https://api.openweathermap.org/geo/1.0/direct?q="+city+","+state+","+country+"&limit="+1+"&appid="+openWeatherApiKey+"",
        method : 'GET',
        error : function(jqXHR,status,text){
            console.log("The request returned error status: "+status+" or the text: "+text);
        },
        success : function(response,status,jqXHR){
            console.log("Returned Data: \n Status text:"+status+"\n");
            console.log(response);
            $("#cityName").text(response[0].name);
            queryCity.lat = response[0].lat;
            queryCity.lon = response[0].lon;
            queryCity.region = response[0].state;

            getWeather(queryCity.lat,queryCity.lon);
        },
    });
}

var exclude = "minutely,hourly,alerts"

function getWeather (lat,lon) {
    $.ajax({
        url : "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude="+exclude+"&units=imperial&appid="+openWeatherApiKey+"",
        method : 'GET',
        error : function(jqXHR,status,text){
            console.log("The request returned error status: "+status+" or the text: "+text);
        },
        success : function(response,status,jqXHR){
            console.log("Returned Data: \n Status text:"+status+"\n");
            console.log(response);
            drawCurrent(response);
        },
    });
}

function drawCurrent (response) {
    $('#curTempBox').text(response.current.temp+" °F")
    $('#curWindBox').text(response.current.wind_speed+" MPH")
    $('#curHumBox').text(response.current.humidity+" %")
    $('#curUvBox').text(response.current.uvi)
    if (response.current.uvi < 3) { 
        $('#curUvBox').attr("class", "low"); 
    } else if (response.current.uvi >= 3 && response.current.uvi < 6) {
        $('#curUvBox').attr("class", "mod"); 
    } else if (response.current.uvi >= 6 && response.current.uvi < 8) {
        $('#curUvBox').attr("class", "high"); 
    } else if (response.current.uvi >= 8 && response.current.uvi < 10) {
        $('#curUvBox').attr("class", "vhigh"); 
    } else if (response.current.uvi >= 10 && response.current.uvi < 11) {
        $('#curUvBox').attr("class", "xhigh"); 
    }
    drawForcast(response);
}

function drawForcast (response) {
    let options = { weekday: 'long', month: 'long', day: 'numeric' };
    var epoch = new Date(response.daily[1].dt * 1000);
    $("#oneDayAhead .forcastDT").text(epoch.toLocaleString("en-US", options));
    $("#oneDayAhead img").attr("src", "https://openweathermap.org/img/w/"+response.daily[1].weather[0].icon+".png");
    $("#oneDayAhead .forcastTemp").text(response.daily[1].temp.day);
    $("#oneDayAhead .forcastWind").text(response.daily[1].wind_speed);
    $("#oneDayAhead .forcastHum").text(response.daily[1].humidity);
    var epoch2 = new Date(response.daily[2].dt * 1000);
    $("#twoDaysAhead .forcastDT").text(epoch2.toLocaleString("en-US", options));
    $("#twoDaysAhead img").attr("src", "https://openweathermap.org/img/w/"+response.daily[2].weather[0].icon+".png");
    $("#twoDaysAhead .forcastTemp").text(response.daily[2].temp.day);
    $("#twoDaysAhead .forcastWind").text(response.daily[2].wind_speed);
    $("#twoDaysAhead .forcastHum").text(response.daily[2].humidity);
    var epoch3 = new Date(response.daily[3].dt * 1000);
    $("#threeDaysAhead .forcastDT").text(epoch3.toLocaleString("en-US", options));
    $("#threeDaysAhead img").attr("src", "https://openweathermap.org/img/w/"+response.daily[3].weather[0].icon+".png");
    $("#threeDaysAhead .forcastTemp").text(response.daily[3].temp.day);
    $("#threeDaysAhead .forcastWind").text(response.daily[3].wind_speed);
    $("#threeDaysAhead .forcastHum").text(response.daily[3].humidity);
    var epoch4 = new Date(response.daily[4].dt * 1000);
    $("#fourDaysAhead .forcastDT").text(epoch4.toLocaleString("en-US", options));
    $("#fourDaysAhead img").attr("src", "https://openweathermap.org/img/w/"+response.daily[4].weather[0].icon+".png");
    $("#fourDaysAhead .forcastTemp").text(response.daily[4].temp.day);
    $("#fourDaysAhead .forcastWind").text(response.daily[4].wind_speed);
    $("#fourDaysAhead .forcastHum").text(response.daily[4].humidity);
    var epoch5 = new Date(response.daily[5].dt * 1000);
    $("#fiveDaysAhead .forcastDT").text(epoch5.toLocaleString("en-US", options));
    $("#fiveDaysAhead img").attr("src", "https://openweathermap.org/img/w/"+response.daily[5].weather[0].icon+".png");
    $("#fiveDaysAhead .forcastTemp").text(response.daily[5].temp.day);
    $("#fiveDaysAhead .forcastWind").text(response.daily[5].wind_speed);
    $("#fiveDaysAhead .forcastHum").text(response.daily[5].humidity);
    storeArray();
}

function storeArray () {
    localStorage.setItem('historyArr', JSON.stringify(queryCity));
    fillHistory();
}

$("#searchHistory").on('click', '.queryBtt', function historySearch (e) {
    var historyTarget = $(e.target);
    searchStr = historyTarget[0].innerHTML;
    searchArr = searchStr.split(',');
    console.log("History entry search for "+searchArr[0]+" in "+searchArr[1]);
    getGeocode(searchArr[0],searchArr[1]);
});
$("#searchHistory").on('click', '.clearBttn', function deleteEntry (e) { 
    var historyTarget = $(e.target).attr("id");
    $("div[id*='"+historyTarget+"']").remove();
});

function fillHistory (){
    if(localStorage.getItem('historyArr') != null) {
        historyArr = JSON.parse(localStorage.getItem('historyArr'));
        let city = historyArr.city;
        let region = historyArr.region;
        historyDiv = $('<div id="'+city+'"></div>');
        newHistory = $('<button type="button" class="queryBtt" id="bttn '+city+'">'+city+', '+region+'</button>');
        clrBttn = $('<button type="button" class="clearBttn" id="'+city+'">X</button>')
        historyDiv.append(newHistory);
        historyDiv.append(clrBttn);
        $('#queryHistory').append(historyDiv);
        localStorage.setItem('historyArr', '');
    }
}
