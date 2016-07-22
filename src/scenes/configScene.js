var ConfigScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var ctx = dc.context;

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
  var title_y;
  var subtitle_y;

  var arrow_img;
  var single_img;
  var multi_img;
  var crystal_img;
  var tutorial_img;
  var net_add_img;
  var net_check_img;
  self.ready = function()
  {
    ctx.font = "12px Open Sans";
    clicker = new Clicker({source:stage.dispCanv.canvas});

    mode = CONFIG_MULTIPLAYER;

    btn_s = (dc.width/6)-20;
    btn_y = (3*dc.height/4)-btn_s/2;
    btn_0_x = btn_s/2+0*(btn_s+20)+10;
    btn_1_x = btn_s/2+1*(btn_s+20)+10;
    btn_2_x = btn_s/2+2*(btn_s+20)+10;
    btn_3_x = btn_s/2+3*(btn_s+20)+10;
    btn_4_x = btn_s/2+4*(btn_s+20)+10;

    section_line_0_y = dc.height/3;
    section_line_1_y = dc.height/3+btn_s;

    title_y = dc.height/2-30;
    subtitle_y = btn_y-40;

    btn_tutorial   = new ButtonBox(0,0,dc.width,section_line_0_y,function(evt){ if(hit_ui) return; hit_ui = true; multiplayer = MULTIPLAYER_TUT; turn = 10; mode = CONFIG_COMMIT; });

    mbtn_ai         = new ButtonBox(btn_0_x,btn_y,btn_s,btn_s-20,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_AI;         mode = CONFIG_TURN; });
    mbtn_local      = new ButtonBox(btn_2_x,btn_y,btn_s,btn_s-20,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_LOCAL;      mode = CONFIG_TURN; });
    mbtn_net_create = new ButtonBox(btn_3_x,btn_y,btn_s,btn_s-20,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_NET_CREATE; mode = CONFIG_TURN; cli.begin(); });
    mbtn_net_join   = new ButtonBox(btn_4_x,btn_y,btn_s,btn_s-20,function(evt){ if(hit_ui || mode != CONFIG_MULTIPLAYER) return; hit_ui = true; multiplayer = MULTIPLAYER_NET_JOIN;   mode = CONFIG_JOIN; cli.begin(); });

    btn_back = new ButtonBox(20,section_line_0_y,btn_s,section_line_1_y-section_line_0_y,function(evt){ if(hit_ui || mode == CONFIG_MULTIPLAYER) return; cli.stop(); mode = CONFIG_MULTIPLAYER; multiplayer = undefined; });

    joins = [];
    jbtn_a = new ButtonBox(btn_1_x,btn_y,        btn_s,btn_s/2-10,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 1) return; hit_ui = true; join = joins[0]; turn = turns[0]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_b = new ButtonBox(btn_2_x,btn_y,        btn_s,btn_s/2-10,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 2) return; hit_ui = true; join = joins[1]; turn = turns[1]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_c = new ButtonBox(btn_3_x,btn_y,        btn_s,btn_s/2-10,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 3) return; hit_ui = true; join = joins[2]; turn = turns[2]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_d = new ButtonBox(btn_1_x,btn_y+btn_s/2,btn_s,btn_s/2-10,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 4) return; hit_ui = true; join = joins[3]; turn = turns[3]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_e = new ButtonBox(btn_2_x,btn_y+btn_s/2,btn_s,btn_s/2-10,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 5) return; hit_ui = true; join = joins[4]; turn = turns[4]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });
    jbtn_f = new ButtonBox(btn_3_x,btn_y+btn_s/2,btn_s,btn_s/2-10,function(evt){ if(hit_ui || mode != CONFIG_JOIN || joins.length < 6) return; hit_ui = true; join = joins[5]; turn = turns[5]; cli.add(cli.id+" JOIN "+join); mode = CONFIG_COMMIT; });

    tbtn_10 = new ButtonBox(btn_1_x,btn_y,btn_s,btn_s-20,function(evt){ if(hit_ui || mode != CONFIG_TURN) return; hit_ui = true; turn = 10; mode = CONFIG_COMMIT; });
    tbtn_20 = new ButtonBox(btn_2_x,btn_y,btn_s,btn_s-20,function(evt){ if(hit_ui || mode != CONFIG_TURN) return; hit_ui = true; turn = 20; mode = CONFIG_COMMIT; });
    tbtn_30 = new ButtonBox(btn_3_x,btn_y,btn_s,btn_s-20,function(evt){ if(hit_ui || mode != CONFIG_TURN) return; hit_ui = true; turn = 30; mode = CONFIG_COMMIT; });

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
    tutorial_img = new Image();
    tutorial_img.src = "assets/tutorial_qs.png";
    net_add_img = new Image();
    net_add_img.src = "assets/net_add.png";
    net_check_img = new Image();
    net_check_img.src = "assets/net_check.png";
  };

  var space = String.fromCharCode(8202)+String.fromCharCode(8202);
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
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(0,0,dc.width,dc.height,5);
    ctx.fillStyle = "#000000";

    ctx.fillStyle = blue;
    dc.roundRectOptions(btn_tutorial.x,btn_tutorial.y,btn_tutorial.w,btn_tutorial.h,5,1,1,0,0,0,1)
    ctx.drawImage(tutorial_img,50,50,220,section_line_0_y-50);

    ctx.fillStyle = "#333333";
    ctx.font = "25px Open Sans";
    ctx.fillText("First Time Playing?".split("").join(space),dc.width/2-100,100);
    ctx.font = "Bold 16px Open Sans";
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(dc.width/2-110,120,175,30,20);
    ctx.fillStyle = "#333333";
    ctx.fillText("Play the Tutorial",dc.width/2-100,140);
    ctx.drawImage(arrow_img,dc.width/2+25,127,30,15);
    ctx.font = "12px Open Sans";

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#666666";
    dc.drawLine(0,section_line_0_y,dc.width,section_line_0_y);
    dc.drawLine(0,section_line_1_y,dc.width,section_line_1_y);
    switch(mode)
    {
      case CONFIG_MULTIPLAYER:
        ctx.textAlign = "center";
        imgBtn(mbtn_ai,single_img);
        imgBtn(mbtn_local,multi_img);      ctx.fillText("Same Screen",             mbtn_local.x+mbtn_local.w/2,      mbtn_local.y+mbtn_local.h+20);
        imgBtn(mbtn_net_create,multi_img); ctx.drawImage(net_add_img,mbtn_net_create.x+mbtn_net_create.w-30,mbtn_net_create.y-10,40,40); ctx.fillText("Web: Create Room",        mbtn_net_create.x+mbtn_net_create.w/2, mbtn_net_create.y+mbtn_net_create.h+20);
        imgBtn(mbtn_net_join,multi_img);   ctx.drawImage(net_check_img,mbtn_net_join.x+mbtn_net_join.w-30,mbtn_net_join.y-10,40,40); ctx.fillText("Web: Join Room",          mbtn_net_join.x+mbtn_net_join.w/2,   mbtn_net_join.y+mbtn_net_join.h+20);
        dc.drawLine(btn_1_x+btn_s/2,section_line_1_y,btn_1_x+btn_s/2,dc.height);
        ctx.font = "40px Open Sans";
        if(game_type == CARBON_GAME)
          ctx.fillText("CARBON CYCLE".split("").join(space+space),dc.width/2,title_y);
        else if(game_type == NITROGEN_GAME)
          ctx.fillText("NITROGEN CYCLE".split("").join(space+space),dc.width/2,title_y);
        else if(game_type == WATER_GAME)
          ctx.fillText("WATER CYCLE".split("").join(space+space),dc.width/2,title_y);
        ctx.font = "Bold 12px Open Sans";
        ctx.textAlign = "left";
        ctx.fillText("Single Player",btn_0_x, subtitle_y);
        ctx.fillText("Multiplayer",btn_2_x, subtitle_y);
        ctx.font = "12px Open Sans";
        break;
      case CONFIG_JOIN:
        ctx.save();
        ctx.translate(btn_back.x+btn_back.w/2,btn_back.y+btn_back.h/2);
        ctx.rotate(Math.PI);
        ctx.drawImage(arrow_img,-30,-15,60,30);
        ctx.restore();
        if(!joins.length)    {                  ctx.fillStyle = "#000000"; ctx.fillText("Waiting For Room...", jbtn_a.x+10, jbtn_a.y+20); };
        if(joins.length > 0) { rectBtn(jbtn_a); ctx.fillText("Join #"+joins[0], jbtn_a.x+10, jbtn_a.y+20); }
        if(joins.length > 1) { rectBtn(jbtn_b); ctx.fillText("Join #"+joins[1], jbtn_b.x+10, jbtn_b.y+20); }
        if(joins.length > 2) { rectBtn(jbtn_c); ctx.fillText("Join #"+joins[2], jbtn_c.x+10, jbtn_c.y+20); }
        if(joins.length > 3) { rectBtn(jbtn_d); ctx.fillText("Join #"+joins[3], jbtn_d.x+10, jbtn_d.y+20); }
        if(joins.length > 4) { rectBtn(jbtn_e); ctx.fillText("Join #"+joins[4], jbtn_e.x+10, jbtn_e.y+20); }
        if(joins.length > 5) { rectBtn(jbtn_f); ctx.fillText("Join #"+joins[5], jbtn_f.x+10, jbtn_f.y+20); }
        ctx.textAlign = "center";
        ctx.font = "40px Open Sans";
        ctx.fillText("Waiting for Web Game...",dc.width/2,title_y);
        ctx.font = "12px Open Sans";
        ctx.textAlign = "left";
        break;
      case CONFIG_TURN:
        ctx.save();
        ctx.translate(btn_back.x+btn_back.w/2,btn_back.y+btn_back.h/2);
        ctx.rotate(Math.PI);
        ctx.drawImage(arrow_img,-30,-15,60,30);
        ctx.restore();
        ctx.textAlign = "center";
        ctx.font = "40px Open Sans";
        fillRectBtn(tbtn_10); ctx.fillStyle = "#FFFFFF"; ctx.fillText("10", tbtn_10.x+btn_s/2, tbtn_10.y+btn_s/2);
        fillRectBtn(tbtn_20); ctx.fillStyle = "#FFFFFF"; ctx.fillText("20", tbtn_20.x+btn_s/2, tbtn_20.y+btn_s/2);
        fillRectBtn(tbtn_30); ctx.fillStyle = "#FFFFFF"; ctx.fillText("30", tbtn_30.x+btn_s/2, tbtn_30.y+btn_s/2);
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.font = "40px Open Sans";
        if(game_type == CARBON_GAME)
          ctx.fillText("CARBON CYCLE".split("").join(space+space),dc.width/2,title_y);
        else if(game_type == NITROGEN_GAME)
          ctx.fillText("NITROGEN CYCLE".split("").join(space+space),dc.width/2,title_y);
        else if(game_type == WATER_GAME)
          ctx.fillText("WATER CYCLE".split("").join(space+space),dc.width/2,title_y);
        ctx.textAlign = "left";
        ctx.font = "Bold 12px Open Sans";
        ctx.fillText("How many turns?",btn_1_x, subtitle_y);
        ctx.font = "12px Open Sans";
        break;
      case CONFIG_COMMIT:
        break;
    }
  };

  var imgBtn = function(btn,img)
  {
    ctx.drawImage(img,btn.x,btn.y,btn.w,btn.h);
  }
  var rectBtn = function(btn)
  {
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    ctx.strokeStyle = "#000000";
    dc.strokeRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    ctx.fillStyle = "#000000";
  }
  var fillRectBtn = function(btn)
  {
    ctx.fillStyle = blue;
    dc.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    ctx.fillStyle = "#000000";
  }

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

