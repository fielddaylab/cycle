var ConfigScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var clicker;

  ENUM = 0;
  var CONFIG_MULTIPLAYER = ENUM; ENUM++;
  var CONFIG_N_PLAYERS   = ENUM; ENUM++;
  var CONFIG_COMMIT      = ENUM; ENUM++;

  var mode;
  var hit_ui;

  var mbtn_local;
  var mbtn_ai;
  var mbtn_net;
  var multiplayer;

  var nbtn_2;
  var nbtn_3;
  var nbtn_4;
  var players;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    mode = CONFIG_MULTIPLAYER;

    mbtn_local = new ButtonBox(10,10,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_LOCAL; mode = CONFIG_N_PLAYERS; });
    mbtn_ai    = new ButtonBox(10,50,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_AI;    mode = CONFIG_N_PLAYERS; });
    mbtn_net   = new ButtonBox(10,90,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_NET;   mode = CONFIG_N_PLAYERS; });

    nbtn_2 = new ButtonBox(10,10,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_N_PLAYERS) return; hit_ui = true; players = 2; mode = CONFIG_COMMIT; });;
    nbtn_3 = new ButtonBox(10,50,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_N_PLAYERS) return; hit_ui = true; players = 3; mode = CONFIG_COMMIT; });;
    nbtn_4 = new ButtonBox(10,90,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_N_PLAYERS) return; hit_ui = true; players = 4; mode = CONFIG_COMMIT; });;

    clicker.register(mbtn_local);
    clicker.register(mbtn_ai);
    clicker.register(mbtn_net);
    clicker.register(nbtn_2);
    clicker.register(nbtn_3);
    clicker.register(nbtn_4);
  };

  self.tick = function()
  {
    clicker.flush();
    hit_ui = false;
    switch(mode)
    {
      case CONFIG_MULTIPLAYER:
        break;
      case CONFIG_N_PLAYERS:
        break;
      case CONFIG_COMMIT:
        game.multiplayer = multiplayer;
        game.players = players;
        game.nextScene();
        break;
    }
  };

  self.draw = function()
  {
    switch(mode)
    {
      case CONFIG_MULTIPLAYER:
        mbtn_local.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("Local",mbtn_local.x+10,mbtn_local.y+20);
        mbtn_ai.draw(dc);    dc.context.fillStyle = "#000000"; dc.context.fillText("AI",   mbtn_ai.x+10,   mbtn_ai.y+20);
        mbtn_net.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Net",  mbtn_net.x+10,  mbtn_net.y+20);
        break;
      case CONFIG_N_PLAYERS:
        nbtn_2.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("2",nbtn_2.x+10,nbtn_2.y+20);
        nbtn_3.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("3",nbtn_3.x+10,nbtn_3.y+20);
        nbtn_4.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("4",nbtn_4.x+10,nbtn_4.y+20);
        break;
      case CONFIG_COMMIT:
        break;
    }
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};
