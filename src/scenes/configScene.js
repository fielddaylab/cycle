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

  var btn_tutorial;

  var mbtn_ai;
  var mbtn_local;
  var mbtn_net_create;
  var mbtn_net_join;
  var multiplayer;

  var btn_back;

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

  var btn_s;
  var btn_y;

  var btn_0_x;
  var btn_1_x;
  var btn_2_x;
  var btn_3_x;
  var btn_4_x;
  var section_line_0_y;
  var section_line_1_y;

  var arrow_img;
  var single_img;
  var multi_img;
  var crystal_img;
  var tassle_img;
  var net_add_img;
  var net_check_img;
  self.ready = function()
  {
    dc.context.font = "12px Arial";
    clicker = new Clicker({source:stage.dispCanv.canvas});

    mode = CONFIG_MULTIPLAYER;

    btn_s = (dc.width/5)-20;
    btn_y = (3*dc.height/4)-btn_s/2;
    btn_0_x = 0*(btn_s+20)+10;
    btn_1_x = 1*(btn_s+20)+10;
    btn_2_x = 2*(btn_s+20)+10;
    btn_3_x = 3*(btn_s+20)+10;
    btn_4_x = 4*(btn_s+20)+10;

    section_line_0_y = dc.height/3;
    section_line_1_y = dc.height/3+btn_s;

    btn_tutorial   = new ButtonBox(0,0,dc.width,section_line_0_y,function(evt){ if(hit_ui) return; game.setScene(3); });

    mbtn_ai         = new ButtonBox(btn_0_x,btn_y,btn_s,btn_s,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_AI;         mode = CONFIG_TURN; });
    mbtn_local      = new ButtonBox(btn_2_x,btn_y,btn_s,btn_s,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_LOCAL;      mode = CONFIG_TURN; });
    mbtn_net_create = new ButtonBox(btn_3_x,btn_y,btn_s,btn_s,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_NET_CREATE; mode = CONFIG_TURN; cli.begin(); });
    mbtn_net_join   = new ButtonBox(btn_4_x,btn_y,btn_s,btn_s,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_NET_JOIN;   mode = CONFIG_JOIN; cli.begin(); });

    btn_back = new ButtonBox(20,section_line_0_y,btn_s,section_line_1_y-section_line_0_y,function(evt){ if(hit_ui || mode == CONFIG_MULTIPLAYER) return; mode = CONFIG_MULTIPLAYER; multiplayer = undefined; });

    joins = [];
    jbtn_a = new ButtonBox(10,10, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 1) return; hit_ui = true; join = joins[0]; turn = turns[0]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_b = new ButtonBox(10,50, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 2) return; hit_ui = true; join = joins[1]; turn = turns[1]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_c = new ButtonBox(10,90, dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 3) return; hit_ui = true; join = joins[2]; turn = turns[2]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_d = new ButtonBox(10,130,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 4) return; hit_ui = true; join = joins[3]; turn = turns[3]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_e = new ButtonBox(10,170,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 5) return; hit_ui = true; join = joins[4]; turn = turns[4]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_f = new ButtonBox(10,210,dc.width-20,30,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 6) return; hit_ui = true; join = joins[5]; turn = turns[5]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });

    tbtn_10 = new ButtonBox(1*(btn_s+20)+10,btn_y,btn_s,btn_s,function(evt){ if(hit_ui || mode != CONFIG_TURN) return; hit_ui = true; turn = 10; mode = CONFIG_COMMIT; });
    tbtn_20 = new ButtonBox(2*(btn_s+20)+10,btn_y,btn_s,btn_s,function(evt){ if(hit_ui || mode != CONFIG_TURN) return; hit_ui = true; turn = 20; mode = CONFIG_COMMIT; });
    tbtn_30 = new ButtonBox(3*(btn_s+20)+10,btn_y,btn_s,btn_s,function(evt){ if(hit_ui || mode != CONFIG_TURN) return; hit_ui = true; turn = 30; mode = CONFIG_COMMIT; });

    clicker.register(btn_back);
    clicker.register(btn_tutorial);
    clicker.register(mbtn_ai);
    clicker.register(mbtn_local);
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

    arrow_img = new Image();
    arrow_img.src = "assets/arrow.png";
    single_img = new Image();
    single_img.src = "assets/single_play.png";
    multi_img = new Image();
    multi_img.src = "assets/multi_play.png";
    crystal_img = new Image();
    crystal_img.src = "assets/crystal.png";
    tassle_img = new Image();
    tassle_img.src = "assets/tassle.png";
    net_add_img = new Image();
    net_add_img.src = "assets/net_add.png";
    net_check_img = new Image();
    net_check_img.src = "assets/net_check.png";
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
        game.setScene(4);
        break;
    }
  };

  self.draw = function()
  {
    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(0,0,dc.width,dc.height,5);
    dc.context.strokeStyle = "#000000";
    dc.strokeRoundRect(0,0,dc.width,dc.height,5);
    dc.context.fillStyle = "#000000";

    dc.context.fillStyle = "#00FFFF";
    dc.roundRectOptions(btn_tutorial.x,btn_tutorial.y,btn_tutorial.w,btn_tutorial.h,5,1,1,0,0,1,1)
    dc.context.drawImage(crystal_img,dc.width-section_line_0_y,0,section_line_0_y,section_line_0_y);
    dc.context.drawImage(tassle_img,dc.width/3-100,20,section_line_0_y-40,section_line_0_y-60);

    dc.context.fillStyle = "#000000";

    dc.context.lineWidth = 0.5;
    dc.context.strokeStyle = "#666666";
    dc.drawLine(0,section_line_0_y,dc.width,section_line_0_y);
    dc.drawLine(0,section_line_1_y,dc.width,section_line_1_y);
    switch(mode)
    {
      case CONFIG_MULTIPLAYER:
        imgBtn(mbtn_ai,single_img);        dc.context.fillText("Play against a (bad) AI", mbtn_ai.x+10,         mbtn_ai.y+mbtn_ai.h+20);
        imgBtn(mbtn_local,multi_img);      dc.context.fillText("Same Screen",             mbtn_local.x+10,      mbtn_local.y+mbtn_local.h+20);
        imgBtn(mbtn_net_create,multi_img); dc.context.drawImage(net_add_img,mbtn_net_create.x+mbtn_net_create.w-30,mbtn_net_create.y-10,40,40); dc.context.fillText("Web: Create Room",        mbtn_net_create.x+10, mbtn_net_create.y+mbtn_net_create.h+20);
        imgBtn(mbtn_net_join,multi_img);   dc.context.drawImage(net_check_img,mbtn_net_join.x+mbtn_net_join.w-30,mbtn_net_join.y-10,40,40); dc.context.fillText("Web: Join Room",          mbtn_net_join.x+10,   mbtn_net_join.y+mbtn_net_join.h+20);
        dc.drawLine(btn_1_x+btn_s/2,section_line_1_y,btn_1_x+btn_s/2,dc.height);
        dc.context.textAlign = "center";
        dc.context.font = "40px Arial";
        dc.context.fillText("CREATE A GAME!",dc.width/2,dc.height/2-20);
        dc.context.font = "12px Arial";
        dc.context.textAlign = "left";
        dc.context.fillText("Single Player",btn_0_x, btn_y-20);
        dc.context.fillText("Multiplayer",btn_2_x, btn_y-20);
        break;
      case CONFIG_JOIN:
        dc.context.drawImage(arrow_img,btn_back.x+btn_back.w/2-50,btn_back.y+btn_back.h/2-30,100,60);
        if(!joins.length)    {                  dc.context.fillStyle = "#000000"; dc.context.fillText("Waiting For Room...", jbtn_a.x+10, jbtn_a.y+20); };
        if(joins.length > 0) { rectBtn(jbtn_a); dc.context.fillText("Join "+joins[0], jbtn_a.x+10, jbtn_a.y+20); }
        if(joins.length > 1) { rectBtn(jbtn_b); dc.context.fillText("Join "+joins[1], jbtn_b.x+10, jbtn_b.y+20); }
        if(joins.length > 2) { rectBtn(jbtn_c); dc.context.fillText("Join "+joins[2], jbtn_c.x+10, jbtn_c.y+20); }
        if(joins.length > 3) { rectBtn(jbtn_d); dc.context.fillText("Join "+joins[3], jbtn_d.x+10, jbtn_d.y+20); }
        if(joins.length > 4) { rectBtn(jbtn_e); dc.context.fillText("Join "+joins[4], jbtn_e.x+10, jbtn_e.y+20); }
        if(joins.length > 5) { rectBtn(jbtn_f); dc.context.fillText("Join "+joins[5], jbtn_f.x+10, jbtn_f.y+20); }
        break;
      case CONFIG_TURN:
        dc.context.textAlign = "center";
        dc.context.drawImage(arrow_img,btn_back.x+btn_back.w/2-50,btn_back.y+btn_back.h/2-30,100,60);
        rectBtn(tbtn_10); dc.context.fillText("10 Turns", tbtn_10.x+btn_s/2, tbtn_10.y+btn_s/2);
        rectBtn(tbtn_20); dc.context.fillText("20 Turns", tbtn_20.x+btn_s/2, tbtn_20.y+btn_s/2);
        rectBtn(tbtn_30); dc.context.fillText("30 Turns", tbtn_30.x+btn_s/2, tbtn_30.y+btn_s/2);
        dc.context.textAlign = "center";
        dc.context.font = "40px Arial";
        dc.context.fillText("CREATE A GAME!",dc.width/2,dc.height/2-20);
        dc.context.font = "12px Arial";
        dc.context.textAlign = "left";
        dc.context.fillText("How many turns?",btn_1_x, btn_y-20);
        break;
      case CONFIG_COMMIT:
        break;
    }
  };

  var imgBtn = function(btn,img)
  {
    dc.context.drawImage(img,btn.x,btn.y,btn.w,btn.h);
  }
  var rectBtn = function(btn)
  {
    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    dc.context.strokeStyle = "#000000";
    dc.strokeRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    dc.context.fillStyle = "#000000";
  }

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

