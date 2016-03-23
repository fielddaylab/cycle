var TutorialScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  var clicker;

  var btn;
  var tuts;
  var cur_tut;
  var loaded_first;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    btn = new ButtonBox(0,0,dc.width,dc.height,
      function()
      {
        cur_tut++;
        if(cur_tut == 2) cur_tut++; //lol whoops naming...
        if(cur_tut >= tuts.length) game.setScene(2);
      }
    );
    clicker.register(btn);

    tuts = [];
    for(var i = 0; i < 37; i++)
    {
      if(i == 2) continue; //lol whoops naming...
      tuts[i] = new Image();
      if(i == 0)
      {
        tuts[i].onload = function(){ loaded_first = true; };
      }
      tuts[i].src = "assets/tut/tut_"+i+".png";
    }

    cur_tut = 0;
    loaded_first = false;
  };

  self.tick = function()
  {
    if(loaded_first) clicker.flush();
    else clicker.ignore();
  };

  self.draw = function()
  {
    dc.context.drawImage(tuts[cur_tut],0,0,dc.width,dc.height);
  };

  self.cleanup = function()
  {

  };
};
