var w;
var h;
var lw;

var null_icon = GenIcon(1,1);

w = 100;
h = 100;
lw = 10;
var oct_icon = GenIcon(w,h);
oct_icon.context.strokeStyle = "#BBBBBB";
oct_icon.context.lineWidth = lw;
oct_icon.context.beginPath();
oct_icon.context.moveTo(w/3,lw/2);
oct_icon.context.lineTo(w/3*2,lw/2);
oct_icon.context.lineTo(w-lw/2,h/3);
oct_icon.context.lineTo(w-lw/2,h/3*2);
oct_icon.context.lineTo(w/3*2,h-lw/2);
oct_icon.context.lineTo(w/3,h-lw/2);
oct_icon.context.lineTo(lw/2,h/3*2);
oct_icon.context.lineTo(lw/2,h/3);
oct_icon.context.closePath();
oct_icon.context.stroke();

w = 200;
h = 150;
lw = 10;
var hex_icon = GenIcon(w,h);
var xr = w/2-lw/2;
var yr = h/2-lw/2;
var t = 0;
var i = 0;
var twopi = Math.PI*2;
hex_icon.context.strokeStyle = "#FFFFFF";
hex_icon.context.globalAlpha = 0.5;
hex_icon.context.lineWidth = lw;
hex_icon.context.beginPath();
hex_icon.context.moveTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.closePath();
hex_icon.context.stroke();
hex_icon.context.globalAlpha = 1;
hex_icon.context.lineWidth = lw/2;
hex_icon.context.beginPath();
hex_icon.context.moveTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hex_icon.context.closePath();
hex_icon.context.stroke();

w = 100;
h = 100;
lw = 2;
var highlit_hex_icon = GenIcon(w,h);
highlit_hex_icon.context.strokeStyle = "#FFFF00";
highlit_hex_icon.context.lineWidth = lw;
highlit_hex_icon.context.beginPath();
highlit_hex_icon.context.moveTo(w/3,lw/2);
highlit_hex_icon.context.lineTo(w/3*2,lw/2);
highlit_hex_icon.context.lineTo(w-lw/2,h/2);
highlit_hex_icon.context.lineTo(w/3*2,h-lw/2);
highlit_hex_icon.context.lineTo(w/3,h-lw/2);
highlit_hex_icon.context.lineTo(lw/2,h/2);
highlit_hex_icon.context.closePath();
highlit_hex_icon.context.stroke();

w = 100;
h = 100;
var circle_icon = GenIcon(100,100);
circle_icon.context.fillStyle = "#FFFFFF";
circle_icon.context.strokeStyle = "#BBBBBB";
circle_icon.context.lineWidth = 5;
circle_icon.context.beginPath();
circle_icon.context.arc(w/2,h/2,w/2-circle_icon.context.lineWidth,0,2*Math.PI);
circle_icon.context.stroke();

w = 100;
h = 100;
var red_circle_icon = GenIcon(w,h);
red_circle_icon.context.fillStyle = red;
red_circle_icon.context.beginPath();
red_circle_icon.context.arc(w/2,h/2,w/2,0,2*Math.PI);
red_circle_icon.context.fill();

w = 100;
h = 100;
var blue_circle_icon = GenIcon(w,h);
blue_circle_icon.context.fillStyle = blue;
blue_circle_icon.context.beginPath();
blue_circle_icon.context.arc(w/2,h/2,w/2,0,2*Math.PI);
blue_circle_icon.context.fill();

w = 100;
h = 100;
var green_circle_icon = GenIcon(w,h);
green_circle_icon.context.fillStyle = "#00FF00";
green_circle_icon.context.beginPath();
green_circle_icon.context.arc(w/2,h/2,w/2,0,2*Math.PI);
green_circle_icon.context.fill();

w = 100;
h = 100;
var yellow_circle_icon = GenIcon(w,h);
yellow_circle_icon.context.fillStyle = "#FFFF00";
yellow_circle_icon.context.beginPath();
yellow_circle_icon.context.arc(w/2,h/2,w/2,0,2*Math.PI);
yellow_circle_icon.context.fill();

w = 100;
h = 100;
var ghost_circle_icon = GenIcon(w,h);
ghost_circle_icon.context.fillStyle = "rgba(255,255,255,0.9)";
ghost_circle_icon.context.beginPath();
ghost_circle_icon.context.arc(w/2,h/2,w/2,0,2*Math.PI);
ghost_circle_icon.context.fill();

w = 100;
h = 100;
var highlit_token_icon = GenIcon(w,h);
highlit_token_icon.context.fillStyle = "#FFFF00";
highlit_token_icon.context.beginPath();
highlit_token_icon.context.arc(w/2,h/2,w/2,0,2*Math.PI);
highlit_token_icon.context.fill();

var red_token_icon = new Image();
red_token_icon.src = "assets/red_token.png";

var blue_token_icon = new Image();
blue_token_icon.src = "assets/blue_token.png";

var arrow_icon = new Image();
arrow_icon.src = "assets/arrow.png";

var biarrow_icon = new Image();
biarrow_icon.src = "assets/biarrow.png";

var p_0_img = new Image();
p_0_img.src = "assets/scout.png";

var p_1_img = new Image();
p_1_img.src = "assets/francis.png";

var p_2_img = new Image();
p_2_img.src = "assets/honey.png";

var p_3_img = new Image();
p_3_img.src = "assets/jack.png";

var atmosphere_img = new Image();
atmosphere_img.src = "assets/atmosphere.png";

var animal_img = new Image();
animal_img.src = "assets/animal.png";

var earth_deep_img = new Image();
earth_deep_img.src = "assets/earth_deep.png";

var earth_surface_img = new Image();
earth_surface_img.src = "assets/earth_surface.png";

var fuel_img = new Image();
fuel_img.src = "assets/fuel.png";

var ocean_img = new Image();
ocean_img.src = "assets/ocean.png";

var plants_img = new Image();
plants_img.src = "assets/plants.png";

var hex_img = new Image();
hex_img.src = "assets/hex.png";

var hex_b_img = new Image();
hex_b_img.src = "assets/hex_b.png";

var hex_g_img = new Image();
hex_g_img.src = "assets/hex_g.png";

var hex_y_img = new Image();
hex_y_img.src = "assets/hex_y.png";

var red_win_img = new Image();
red_win_img.src = "assets/red_win.png";

var blue_win_img = new Image();
blue_win_img.src = "assets/blue_win.png";

var tie_win_img = new Image();
tie_win_img.src = "assets/tie_win.png";

var carbon_bg_img = new Image();
carbon_bg_img.src = "assets/carbon_bg.png";

var water_bg_img = new Image();
water_bg_img.src = "assets/water_bg.png";

var nitrogen_bg_img = new Image();
nitrogen_bg_img.src = "assets/nitrogen_bg.png";

