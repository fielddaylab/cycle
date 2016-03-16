var ConfigScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var clicker;

  ENUM = 0;
  var CONFIG_MULTIPLAYER = ENUM; ENUM++;
  var CONFIG_JOIN        = ENUM; ENUM++;
  var CONFIG_TURN        = ENUM; ENUM++;
  var CONFIG_COMMIT      = ENUM; ENUM++;

  var mode;
  var hit_ui;

  var mbtn_local;
  var mbtn_ai;
  var mbtn_net_create;
  var mbtn_net_join;
  var multiplayer;

  var tbtn_10;
  var tbtn_20;
  var tbtn_30;
  var turn;

  var jbtn_a;
  var jbtn_b;
  var jbtn_c;
  var jbtn_d;
  var jbtn_e;
  var jbtn_f;
  var joins;
  var turns;
  var join;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    mode = CONFIG_MULTIPLAYER;

    mbtn_local      = new ButtonBox(10,10, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_LOCAL;      mode = CONFIG_TURN; });
    mbtn_ai         = new ButtonBox(10,50, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_AI;         mode = CONFIG_TURN; });
    mbtn_net_create = new ButtonBox(10,90, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_NET_CREATE; mode = CONFIG_TURN; cli.begin(); });
    mbtn_net_join   = new ButtonBox(10,130,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_NET_JOIN;   mode = CONFIG_JOIN; cli.begin(); });

    joins = [];
    jbtn_a = new ButtonBox(10,10, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 1) return; hit_ui = true; join = joins[0]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_TURN; });
    jbtn_b = new ButtonBox(10,50, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 2) return; hit_ui = true; join = joins[1]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_TURN; });
    jbtn_c = new ButtonBox(10,90, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 3) return; hit_ui = true; join = joins[2]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_TURN; });
    jbtn_d = new ButtonBox(10,130,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 4) return; hit_ui = true; join = joins[3]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_TURN; });
    jbtn_e = new ButtonBox(10,170,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 5) return; hit_ui = true; join = joins[4]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_TURN; });
    jbtn_f = new ButtonBox(10,210,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 6) return; hit_ui = true; join = joins[5]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_TURN; });

    tbtn_10 = new ButtonBox(10,10, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_TURN) return; hit_ui = true; turn = 10; mode = CONFIG_COMMIT; });
    tbtn_20 = new ButtonBox(10,50, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_TURN) return; hit_ui = true; turn = 20; mode = CONFIG_COMMIT; });
    tbtn_30 = new ButtonBox(10,90, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_TURN) return; hit_ui = true; turn = 30; mode = CONFIG_COMMIT; });

    clicker.register(mbtn_local);
    clicker.register(mbtn_ai);
    clicker.register(mbtn_net_create);
    clicker.register(mbtn_net_join);
    clicker.register(jbtn_a);
    clicker.register(jbtn_b);
    clicker.register(jbtn_c);
    clicker.register(jbtn_d);
    clicker.register(jbtn_e);
    clicker.register(jbtn_f);
    clicker.register(tbtn_10);
    clicker.register(tbtn_20);
    clicker.register(tbtn_30);
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
          turns = [];
          for(var i = 0; i < cli.database.length; i++)
          {
            if(cli.database[i].event)
            {
              if(cli.database[i].event == "CREATE") //add to list of known joinables
              {
                joins[joins.length] = cli.database[i].user;
                turns[turns.length] = parseInt(cli.database[i].args[0]);
              }
              else if(cli.database[i].event == "JOIN") //game already joined- remove from list
              {
                var joined = parseInt(cli.database[i].args[0]);
                for(var j = 0; j < joins.length; j++)
                {
                  if(joins[j] == joined)
                  {
                    joins.splice(j,1);
                    turns.splice(j,1);
                  }
                }
              }
            }
          }
          cli.updated = false;
        }
        break;
      case CONFIG_COMMIT:
        game.multiplayer = multiplayer;
        game.turns = turn;
        console.log(game.turns);
        if(game.multiplayer == MULTIPLAYER_NET_CREATE)
        {
          cli.add(cli.id+" CREATE "+turn);
          game.join = cli.id;
          game.me = cli.id;
        }
        else if(game.multiplayer == MULTIPLAYER_NET_JOIN)
        {
          game.join = join;
          game.opponent = game.join;
          game.me = cli.id;
        }
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
        if(joins.length > 0) { jbtn_a.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[0], jbtn_a.x+10, jbtn_a.y+20); }
        if(joins.length > 1) { jbtn_b.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[1], jbtn_b.x+10, jbtn_b.y+20); }
        if(joins.length > 2) { jbtn_c.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[2], jbtn_c.x+10, jbtn_c.y+20); }
        if(joins.length > 3) { jbtn_d.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[3], jbtn_d.x+10, jbtn_d.y+20); }
        if(joins.length > 4) { jbtn_e.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[4], jbtn_e.x+10, jbtn_e.y+20); }
        if(joins.length > 5) { jbtn_f.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("join "+joins[5], jbtn_f.x+10, jbtn_f.y+20); }
        break;
      case CONFIG_TURN:
        tbtn_10.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("10 Turns", tbtn_10.x+10, tbtn_10.y+20);
        tbtn_20.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("20 Turns", tbtn_20.x+10, tbtn_20.y+20);
        tbtn_30.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("30 Turns", tbtn_30.x+10, tbtn_30.y+20);
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
