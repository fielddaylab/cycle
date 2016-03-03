var ConfigScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var clicker;

  ENUM = 0;
  var CONFIG_MULTIPLAYER = ENUM; ENUM++;
  var CONFIG_JOIN        = ENUM; ENUM++;
  var CONFIG_N_PLAYERS   = ENUM; ENUM++;
  var CONFIG_COMMIT      = ENUM; ENUM++;

  var mode;
  var hit_ui;

  var mbtn_local;
  var mbtn_ai;
  var mbtn_net_create;
  var mbtn_net_join;
  var multiplayer;

  var jbtn_a;
  var jbtn_b;
  var jbtn_c;
  var jbtn_d;
  var jbtn_e;
  var jbtn_f;
  var joins;
  var join;

  var nbtn_2;
  var nbtn_3;
  var nbtn_4;
  var players;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    mode = CONFIG_MULTIPLAYER;

    mbtn_local      = new ButtonBox(10,10, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_LOCAL;      mode = CONFIG_N_PLAYERS; });
    mbtn_ai         = new ButtonBox(10,50, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_AI;         mode = CONFIG_N_PLAYERS; });
    mbtn_net_create = new ButtonBox(10,90, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_NET_CREATE; mode = CONFIG_N_PLAYERS; cli.add(cli.id+" CREATE"); });
    mbtn_net_join   = new ButtonBox(10,130,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_NET_JOIN;   mode = CONFIG_JOIN; });

    joins = [];
    jbtn_a = new ButtonBox(10,10, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN) return; hit_ui = true; join = joins[0]; mode = CONFIG_N_PLAYERS; });
    jbtn_b = new ButtonBox(10,50, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN) return; hit_ui = true; join = joins[1]; mode = CONFIG_N_PLAYERS; });
    jbtn_c = new ButtonBox(10,90, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN) return; hit_ui = true; join = joins[2]; mode = CONFIG_N_PLAYERS; });
    jbtn_d = new ButtonBox(10,130,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN) return; hit_ui = true; join = joins[3]; mode = CONFIG_N_PLAYERS; });
    jbtn_e = new ButtonBox(10,170,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN) return; hit_ui = true; join = joins[4]; mode = CONFIG_N_PLAYERS; });
    jbtn_f = new ButtonBox(10,210,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN) return; hit_ui = true; join = joins[5]; mode = CONFIG_N_PLAYERS; });

    nbtn_2 = new ButtonBox(10,10,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_N_PLAYERS) return; hit_ui = true; players = 2; mode = CONFIG_COMMIT; });;
    nbtn_3 = new ButtonBox(10,50,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_N_PLAYERS) return; hit_ui = true; players = 3; mode = CONFIG_COMMIT; });;
    nbtn_4 = new ButtonBox(10,90,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_N_PLAYERS) return; hit_ui = true; players = 4; mode = CONFIG_COMMIT; });;

    clicker.register(mbtn_local);
    clicker.register(mbtn_ai);
    clicker.register(mbtn_net_create);
    clicker.register(mbtn_net_join);
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
      case CONFIG_JOIN:
        if(cli.updated)
        {
          joins = [];
          for(var i = 0; i < cli.database.length; i++)
          {
            var line = cli.database[i].data.split(" ");
            if(line.length && line[1])
            {
              if(line[1] == "CREATE") //add to list of known joinables
                joins[joins.length] = parseInt(line[0]);
              else if(line[1] == "JOIN") //game already joined- remove from list
              {
                var joined = parseInt(line[0]);
                for(var j = 0; j < joins.length; j++)
                {
                  if(joins[j] == joined)
                    joins.splice(j,1);
                }
              }
            }
          }
          cli.updated = false;
        }
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
        mbtn_local.draw(dc);      dc.context.fillStyle = "#000000"; dc.context.fillText("Local",        mbtn_local.x+10,      mbtn_local.y+20);
        mbtn_ai.draw(dc);         dc.context.fillStyle = "#000000"; dc.context.fillText("AI",           mbtn_ai.x+10,         mbtn_ai.y+20);
        mbtn_net_create.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("Net (Create)", mbtn_net_create.x+10, mbtn_net_create.y+20);
        mbtn_net_join.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Net (Join)",   mbtn_net_join.x+10,   mbtn_net_join.y+20);
        break;
      case CONFIG_JOIN:
        if(joins.length > 0) jbtn_a.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[0], jbtn_a.x+10, jbtn_a.y+20);
        if(joins.length > 1) jbtn_b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[1], jbtn_b.x+10, jbtn_b.y+20);
        if(joins.length > 2) jbtn_c.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[2], jbtn_c.x+10, jbtn_c.y+20);
        if(joins.length > 3) jbtn_d.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[3], jbtn_d.x+10, jbtn_d.y+20);
        if(joins.length > 4) jbtn_e.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[4], jbtn_e.x+10, jbtn_e.y+20);
        if(joins.length > 5) jbtn_f.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[5], jbtn_f.x+10, jbtn_f.y+20);
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
