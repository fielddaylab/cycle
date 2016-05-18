var LoadingScene = function(game, stage)
{
  var self = this;
  var pad;
  var barw;
  var progress;
  var canv = stage.drawCanv;

  var imagesloaded = 0;
  var img_srcs = [];
  var images = [];

  var imageLoaded = function()
  {
    imagesloaded++;
  };

  self.ready = function()
  {
    pad = 20;
    barw = (canv.width-(2*pad));
    progress = 0;
    canv.context.fillStyle = "#000000";
    canv.context.font = "12px Open Sans";
    canv.context.fillText(".",0,0);// funky way to encourage any custom font to load

    //put strings in 'img_srcs' as separate array to get "static" count
    img_srcs.push("assets/red_token.png");
    img_srcs.push("assets/blue_token.png");
    img_srcs.push("assets/arrow.png");
    img_srcs.push("assets/crystal.png");
    img_srcs.push("assets/multi_play.png");
    img_srcs.push("assets/single_play.png");
    img_srcs.push("assets/tassle.png");
    img_srcs.push("assets/net_add.png");
    img_srcs.push("assets/net_check.png");
    img_srcs.push("assets/scout.png");
    img_srcs.push("assets/jack.png");
    img_srcs.push("assets/atmosphere.png");
    img_srcs.push("assets/animal.png");
    img_srcs.push("assets/earth_deep.png");
    img_srcs.push("assets/earth_surface.png");
    img_srcs.push("assets/fuel.png");
    img_srcs.push("assets/ocean.png");
    img_srcs.push("assets/plants.png");
    img_srcs.push("assets/hex.png");
    img_srcs.push("assets/hex_b.png");
    img_srcs.push("assets/hex_g.png");
    img_srcs.push("assets/hex_y.png");

    img_srcs.push("assets/bg.jpg");
    for(var i = 0; i < img_srcs.length; i++)
    {
      images[i] = new Image();
      images[i].onload = imageLoaded;
      images[i].src = img_srcs[i];
    }
    imageLoaded(); //call once to prevent 0/0 != 100% bug
  };

  self.tick = function()
  {
    if(progress <= imagesloaded/(img_srcs.length+1)) progress += 100;//0.01;
    if(progress >= 1.0) game.nextScene();
  };

  self.draw = function()
  {
    canv.context.fillRect(pad,canv.height/2,progress*barw,1);
    canv.context.strokeRect(pad-1,(canv.height/2)-1,barw+2,3);
  };

  self.cleanup = function()
  {
    progress = 0;
    imagesloaded = 0;
    images = [];//just used them to cache assets in browser; let garbage collector handle 'em.
    canv.context.fillStyle = "#FFFFFF";
    canv.context.fillRect(0,0,canv.width,canv.height);
  };
};
