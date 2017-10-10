$("document").ready(function(){
	for(var i=0; i<6; i++){
		(async function(i){
				$.ajax({
        		    url: "./da/da/gettop",
           			type: "GET",
            		success: function(data) {
                		$('#tendetai'+ i).html(data[i].tendetai);
						$('#star' + i).html(data[i].star);
						if(data[i].id < 1000){
							$('#link' + i).html("<a href=\"./da1/byid="+data[i].uploadby+"\">Xem</a>");
						}
						else if(data[i].id < 2000){
							$('#link' + i).html("<a href=\"./da2/byid="+data[i].uploadby+"\">Xem</a>");
						}
						else if(data[i].id < 3000){
							$('#link' + i).html("<a href=\"./da3/byid="+data[i].uploadby+"\">Xem</a>");
						}
						else{
							$('#link' + i).html("<a href=\"./datn/byid="+data[i].uploadby+"\">Xem</a>");
						}
            		}
        		});
		})(i);
	}
	var post = 0;
	$("#inputSearch").focusin(function(){
		$(this).css("background-color", "#f0f5f5");
		$("#div_search_tool form").css({"width":"60%","transition":"2s"});
		$("#btnSearch").css("background-color", "#999");
	})
	$("#inputSearch").focusout(function(){
		$(this).css("background-color", "#fff");
		$("#div_search_tool form").css({"width":"50%","transition":"2s"});
		$("#btnSearch").css("background-color", "#fff");
	})
	$("#btnPageNext").click(function(){
		post++;
		var url = "/recent/post="+post+".json";
		$.get(url).then(function(data){
  			for(var i=0; i<8; i++){
  				var postTitle = "#postTitle" + i,
  				 	postBody = "#postBody" + i,
  					postView = "#postView" + i,
  					postDate = "#postDate" + i,
  					postTag = "#postTag" + i;
  				$(postTitle).html(data[i].tieude);
				$(postBody).html(data[i].tomtatnoidung);
				$(postView).html(data[i].luotxem);
				$(postDate).html(data[i].ngaygioupload);
  			}
		});
	})
	$("#btnPagePrev").click(function(){
		if(post>=1){
			post--;
			var url = "/recent/post="+post+".json";
			$.get(url).then(function(data){
	  			for(var i=0; i<8; i++){
	  				var postTitle = "#postTitle" + i,
	  				 	postBody = "#postBody" + i,
	  					postView = "#postView" + i,
	  					postDate = "#postDate" + i,
	  					postTag = "#postTag" + i;
	  				$(postTitle).html(data[i].tieude);
					$(postBody).html(data[i].tomtatnoidung);
					$(postView).html(data[i].luotxem);
					$(postDate).html(data[i].ngaygioupload);
	  			}
			});
		}
	})
	$("#btnPage1").click(function(){
		post = 0;
		var url = "/recent/post="+post+".json";
		$.get(url).then(function(data){
				for(var i=0; i<8; i++){
					var postTitle = "#postTitle" + i,
					 	postBody = "#postBody" + i,
						postView = "#postView" + i,
						postDate = "#postDate" + i,
						postTag = "#postTag" + i;
					$(postTitle).html(data[i].tieude);
					$(postBody).html(data[i].tomtatnoidung);
					$(postView).html(data[i].luotxem);
					$(postDate).html(data[i].ngaygioupload);
				}
		});
	})
	setInterval(getStrTime, 1000);
});

function getStrTime() {
    var timeNow = new Date();
    var strTime = timeNow.getHours() + " : " + timeNow.getMinutes() + " : " + timeNow.getSeconds();
    $("#timeNow").html('Bây giờ là : ' + strTime);
}