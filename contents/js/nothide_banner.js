(function(){
        
    var bg = document.querySelector("#nothide_banner > div:nth-child(1)");
	var city_back = document.querySelector("#nothide_banner > div:nth-child(2)");
    var city_front = document.querySelector("#nothide_banner > div:nth-child(3)");
    var cam = document.querySelector("#nothide_banner > div:nth-child(4)");

	window.onscroll = function(){

        var scroll = window.scrollY;
        if(scroll<0) scroll=0;

        bg.style.top = Math.round(scroll*0.8) + "px";
        city_back.style.top = Math.round(scroll*0.6+25) + "px";
        city_front.style.top = Math.round(scroll*0.4) + "px";
        cam.style.top = Math.round(scroll*0.2) + "px";

	};
    window.onscroll();

})();