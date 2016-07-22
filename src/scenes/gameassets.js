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

w = 183.92;
h = 105.27;
lw = 10;
var hex_icon = GenIcon(w,h);
var xr = w/2-lw/2;
var yr = h/2-lw/2;
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

w = 183.92*2;
h = 105.27*2;
lw = 5;
var thin_hex_icon = GenIcon(w,h);
xr = w/2-lw/2;
yr = h/2-lw/2;
i = 0;
thin_hex_icon.context.strokeStyle = "white";
thin_hex_icon.context.lineWidth = 2.5*2;
thin_hex_icon.context.beginPath();
thin_hex_icon.context.moveTo(w*0.015,h*0.5 );
thin_hex_icon.context.lineTo(w*0.26,h*0.0875);
thin_hex_icon.context.lineTo(w*0.74,h*0.0875);
thin_hex_icon.context.lineTo(w*0.985,h*0.5 );
thin_hex_icon.context.lineTo(w*0.74,h*0.9125);
thin_hex_icon.context.lineTo(w*0.26,h*0.9125);
thin_hex_icon.context.closePath();
thin_hex_icon.context.stroke();
/*
thin_hex_icon.context.strokeStyle = "#FFFFFF";
thin_hex_icon.context.globalAlpha = 0.5;
thin_hex_icon.context.lineWidth = lw;
thin_hex_icon.context.beginPath();
thin_hex_icon.context.moveTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.closePath();
thin_hex_icon.context.stroke();
thin_hex_icon.context.globalAlpha = 1;
thin_hex_icon.context.lineWidth = lw/2;
thin_hex_icon.context.beginPath();
thin_hex_icon.context.moveTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
thin_hex_icon.context.closePath();
thin_hex_icon.context.stroke();
*/

w = 183.92;
h = 105.27;
lw = 10;
var hl_hex_icon = GenIcon(w,h);
xr = w/2-lw/2;
yr = h/2-lw/2;
i = 0;
twopi = Math.PI*2;
hl_hex_icon.context.fillStyle = "#D1AFF2";
hl_hex_icon.context.globalAlpha = 0.6;
hl_hex_icon.context.lineWidth = lw;
hl_hex_icon.context.beginPath();
hl_hex_icon.context.moveTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hl_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hl_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hl_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hl_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hl_hex_icon.context.lineTo(w/2+Math.cos(i/6*twopi)*xr,h/2+Math.sin(i/6*twopi)*yr); i++;
hl_hex_icon.context.closePath();
hl_hex_icon.context.fill();

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

var atmosphere_img = new Image();
atmosphere_img.src = "assets/atmosphere.png";

var animal_img = new Image();
animal_img.src = "assets/animal.png";

var animal2_img = new Image();
animal2_img.src = "assets/animal2.png";

var earth_deep_img = new Image();
earth_deep_img.src = "assets/earth_deep.png";

var earth_surface_img = new Image();
earth_surface_img.src = "assets/earth_surface.png";

var dark_earth_surface_img = new Image();
dark_earth_surface_img.src = "assets/dark_earth_surface.png";

var fuel_img = new Image();
fuel_img.src = "assets/fuel.png";

var ocean_img = new Image();
ocean_img.src = "assets/ocean.png";

var river_img = new Image();
river_img.src = "assets/river.png";

var groundwater_img = new Image();
groundwater_img.src = "assets/groundwater.png";

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

var carbon_fg_img = new Image();
carbon_fg_img.src = "assets/carbon_fg.png";

var water_bg_img = new Image();
water_bg_img.src = "assets/water_bg.png";

var water_fg_img = new Image();
water_fg_img.src = "assets/water_fg.png";

var nitrogen_bg_img = new Image();
nitrogen_bg_img.src = "assets/nitrogen_bg.png";

var nitrogen_fg_img = new Image();
nitrogen_fg_img.src = "assets/nitrogen_fg.png";

var tutorial_img = new Image();
tutorial_img.src = "assets/tutorial_qs.png";

var next_button_img = new Image();
next_button_img.src = "assets/nextbtn-white.png";

var grad_img = GenIcon(10,100);
var grd=grad_img.context.createLinearGradient(0,0,0,grad_img.height);
grd.addColorStop(0,"rgba(99,228,248,0)");
grd.addColorStop(0.5,"rgba(99,228,248,1)");
grad_img.context.fillStyle = grd;
grad_img.context.fillRect(0,0,grad_img.width,grad_img.height);

var char_imgs = [];
for(var i = 0; i < 7; i++)
{
  char_imgs[i] = new Image();
  char_imgs[i].src = "assets/chars/face/char_"+i+".png";
}

