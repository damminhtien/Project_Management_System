$("document").ready(function() {

    for (var i = 0; i < 6; i++) {
        (async function(i) {
            $.ajax({
                url: "./da/da/gettop",
                type: "GET",
                success: function(data) {
                    $('#tendetai' + i).html(data[i].tendetai);
                    $('#star' + i).html(data[i].star);
                    if (data[i].id < 1000) {
                        $('#link' + i).html("<a href=\"./da1/byid=" + data[i].uploadby + "\">Xem</a>");
                    } else if (data[i].id < 2000) {
                        $('#link' + i).html("<a href=\"./da2/byid=" + data[i].uploadby + "\">Xem</a>");
                    } else if (data[i].id < 3000) {
                        $('#link' + i).html("<a href=\"./da3/byid=" + data[i].uploadby + "\">Xem</a>");
                    } else {
                        $('#link' + i).html("<a href=\"./datn/byid=" + data[i].uploadby + "\">Xem</a>");
                    }
                }
            });
        })(i);
    }
    var post = 0;
    $("#inputSearch").focusin(function() {
        $(this).css("background-color", "#f0f5f5");
        $("#div_search_tool form").css({ "width": "60%", "transition": "2s" });
        $("#btnSearch").css("background-color", "#999");
    })
    $("#inputSearch").focusout(function() {
        $(this).css("background-color", "#fff");
        $("#div_search_tool form").css({ "width": "50%", "transition": "2s" });
        $("#btnSearch").css("background-color", "#fff");
    })
    $("#btnPageNext").click(function() {
        post++;
        var url = "/recent/post=" + post + ".json";
        $.get(url).then(function(data) {
            console.log(data);
            for (var i = 0; i < 8; i++) {
                var postTitle = "#postTitle" + i,
                    postBody = "#postBody" + i,
                    postView = "#postView" + i,
                    postDate = "#postDate" + i,
                    postTag = "#postTag" + i,
                    postImg = "#postImg" + i;
                $(postTitle).html(data[i].tieude);
                $(postBody).html(data[i].tomtatnoidung);
                $(postView).html(data[i].luotxem);
                $(postDate).html(data[i].ngaygioupload);
                $(postImg).attr("src", "./images/" + data[i].anhdaidien);
            }
        });
    })
    $("#btnPagePrev").click(function() {
        if (post >= 1) {
            post--;
            var url = "/recent/post=" + post + ".json";
            $.get(url).then(function(data) {
                for (var i = 0; i < 8; i++) {
                    var postTitle = "#postTitle" + i,
                        postBody = "#postBody" + i,
                        postView = "#postView" + i,
                        postDate = "#postDate" + i,
                        postTag = "#postTag" + i,
                        postImg = "#postImg" + i;
                    $(postTitle).html(data[i].tieude);
                    $(postBody).html(data[i].tomtatnoidung);
                    $(postView).html(data[i].luotxem);
                    $(postDate).html(data[i].ngaygioupload);
                    $(postImg).attr("src", "./images/" + data[i].anhdaidien);
                }
            });
        }
    })
    $("#btnPage1").click(function() {
        post = 0;
        var url = "/recent/post=" + post + ".json";
        $.get(url).then(function(data) {
            for (var i = 0; i < 8; i++) {
                var postTitle = "#postTitle" + i,
                    postBody = "#postBody" + i,
                    postView = "#postView" + i,
                    postDate = "#postDate" + i,
                    postTag = "#postTag" + i,
                    postImg = "#postImg" + i;
                $(postTitle).html(data[i].tieude);
                $(postBody).html(data[i].tomtatnoidung);
                $(postView).html(data[i].luotxem);
                $(postDate).html(data[i].ngaygioupload);
                $(postImg).attr("src", "./images/" + data[i].anhdaidien);
            }
        });
    })
    setInterval(getStrTime, 1000);
    getWeather();
});

function getStrTime() {
    var timeNow = new Date();
    var strTime = timeNow.getHours() + " : " + timeNow.getMinutes() + " : " + timeNow.getSeconds();
    $("#timeNow").html('Bây giờ là : ' + strTime);
}

async function getWeather() {
    var city = 'hanoi';
    $.getJSON('http://api.openweathermap.org/data/2.5/weather?q=' + city + ' ,vn&appid=df4ca86cb38492490550c4be6a4e7961', function(data) {
        console.log(data);
        var today = new Date();
        var weekday = new Array(7);
        weekday[0] = "Chủ Nhật";
        weekday[1] = "Thứ Hai";
        weekday[2] = "Thứ Ba";
        weekday[3] = "Thứ Tư";
        weekday[4] = "Thứ Năm";
        weekday[5] = "Thứ Sáu";
        weekday[6] = "Thứ Bảy";
        var day = weekday[today.getDay()];
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        var x = data.weather[0].main;
        changeBackground(x);
        var content = "";
        content = "Hôm nay " + day + " ngày " + dd + " tháng " + mm + " năm " + yyyy;
        content += '<br/>' + "Thành phố: " + city;
        content += '<br/>' + "Nhiệt độ: " + (data.main.temp - data.main.temp % 1 - 273) + " *C";
        content += '<br/>' + "Trạng thái: " + data.weather[0].main;
        content += '<br/>' + "Miêu tả: " + data.weather[0].description;
        content += '<br/>' + "Gió: " + data.wind.speed + " m/s";
        content += '<br/>' + "Độ ẩm: " + data.main.humidity + " %";
        content += '<br/>' + "Áp suất: " + data.main.pressure + " Pa";
        $("#weather").html(content);
    });
}

function changeBackground(day) {
    if (day == "Clouds") {
        document.getElementById("weather").className += " clouds";
    } else if (day == "Rain" || day == "Light Rain" || day == "Heavy Rain") {
        document.getElementById("weather").className += " rain";
    } else if (day == "Sunny") {
        document.getElementById("weather").className += " sunny";
    } else {
        document.getElementById("weather").className += " defautl";
    }
}