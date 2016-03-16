var circle_icon = GenIcon(20,20);
circle_icon.context.fillStyle = "#FFFFFF";
circle_icon.context.strokeStyle = "#555555";
circle_icon.context.beginPath();
circle_icon.context.arc(circle_icon.width/2,circle_icon.height/2,circle_icon.width/2,0,2*Math.PI);
circle_icon.context.fill();
circle_icon.context.stroke();

var red_circle_icon = GenIcon();
red_circle_icon.context.fillStyle = "#FF0000";
red_circle_icon.context.beginPath();
red_circle_icon.context.arc(red_circle_icon.width/2,red_circle_icon.height/2,red_circle_icon.width/2,0,2*Math.PI);
red_circle_icon.context.fill();

var blue_circle_icon = GenIcon();
blue_circle_icon.context.fillStyle = "#0000FF";
blue_circle_icon.context.beginPath();
blue_circle_icon.context.arc(blue_circle_icon.width/2,blue_circle_icon.height/2,blue_circle_icon.width/2,0,2*Math.PI);
blue_circle_icon.context.fill();

var green_circle_icon = GenIcon();
green_circle_icon.context.fillStyle = "#00FF00";
green_circle_icon.context.beginPath();
green_circle_icon.context.arc(green_circle_icon.width/2,green_circle_icon.height/2,green_circle_icon.width/2,0,2*Math.PI);
green_circle_icon.context.fill();

var yellow_circle_icon = GenIcon();
yellow_circle_icon.context.fillStyle = "#FFFF00";
yellow_circle_icon.context.beginPath();
yellow_circle_icon.context.arc(yellow_circle_icon.width/2,yellow_circle_icon.height/2,yellow_circle_icon.width/2,0,2*Math.PI);
yellow_circle_icon.context.fill();

var highlit_token_icon = GenIcon();
highlit_token_icon.context.fillStyle = "#FFFF00";
highlit_token_icon.context.beginPath();
highlit_token_icon.context.arc(highlit_token_icon.width/2,highlit_token_icon.height/2,highlit_token_icon.width/2,0,2*Math.PI);
highlit_token_icon.context.fill();

