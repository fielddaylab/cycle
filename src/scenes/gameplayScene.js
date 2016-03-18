var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var clicker;
  var p1_card_clicker;
  var p2_card_clicker;

  ENUM = 0;
  var TURN_WAIT_FOR_JOIN = ENUM; ENUM++;
  var TURN_WAIT          = ENUM; ENUM++;
  var TURN_CHOOSE_CARD   = ENUM; ENUM++;
  var TURN_CHOOSE_TARGET = ENUM; ENUM++;
  var TURN_SUMMARY       = ENUM; ENUM++;
  var TURN_DONE          = ENUM; ENUM++;

  var turn_stage;

  //seeded rand!
  var sr;

  //game definition
  var g;

  var chosen_card;
  var chosen_target;

  var transition_t;
  var TRANSITION_KEY_SHUFFLE   = 50;
  var TRANSITION_KEY_MOVE_TOK  = 100;
  var TRANSITION_KEY_SCORE_PTS = 150;
  var TRANSITION_KEY_MOVE_GOAL = 200;

  //ui only
  var hit_ui;
  var goal_bounds;
  var p1_pts_bounds;
  var p2_pts_bounds;
  var p1_cards;
  var p2_cards;

  var p1_target_btn;
  var p2_target_btn;
  var cancel_target_btn;
  var ready_btn;
  var done_btn;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    p1_card_clicker = new Clicker({source:stage.dispCanv.canvas});
    p2_card_clicker = new Clicker({source:stage.dispCanv.canvas});

    if(game.join) sr = new SeededRand(game.join);
    else          sr = new SeededRand(Math.floor(Math.random()*100000));

    //g = constructGame(GameTemplate,sr);
    //g = constructGame(CarbonCycleGameTemplate,sr);
    g = constructGame(NewCarbonCycleGameTemplate,sr);
    //g = constructGame(WaterCycleGameTemplate,sr);
    //g = constructGame(NitrogenCycleGameTemplate,sr);
    transition_t = 0;
    transformGame(dc,g.nodes,g.events,g.tokens)

    var card;
    p1_cards = [];
    var size = ((dc.width-10)/g.players[0].hand.length)-10;
    for(var i = 0; i < g.players[0].hand.length; i++)
    {
      card = new Card();
      card.index = i;

      card.w = size;
      card.h = 45;
      card.x = 0;
      card.y = 40+10+(card.h+10)*i;

      p1_cards.push(card);
      p1_card_clicker.register(card);
    }
    p2_cards = [];
    for(var i = 0; i < g.players[0].hand.length; i++)
    {
      card = new Card();
      card.index = i;

      card.w = size;
      card.h = 45;
      card.x = dc.width-card.w;
      card.y = 40+10+(card.h+10)*i;

      p2_cards.push(card);
      p2_card_clicker.register(card);
    }

    var n = g.nodes[g.goal_node-1];
    goal_bounds = {
      x:n.x,
      y:n.y,
      w:n.w,
      h:n.h,
    };

    p1_pts_bounds = {
      x:50,
      y:10,
      w:10,
      h:10,
    };

    p2_pts_bounds = {
      x:dc.width-50-10,
      y:10,
      w:10,
      h:10,
    };

    p1_target_btn = new ButtonBox(dc.width/2-100,dc.height-60,90,20,
      function()
      {
        if(hit_ui || turn_stage != TURN_CHOOSE_TARGET) return;
        chosen_target = 1;
        if(game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_NET_JOIN)
          cli.add(cli.id+" MOVE "+chosen_card+" "+chosen_target);
        turn_stage = TURN_SUMMARY;
        hit_ui = true;
      }
    );
    p2_target_btn = new ButtonBox(dc.width/2+10,dc.height-60,90,20,
      function()
      {
        if(hit_ui || turn_stage != TURN_CHOOSE_TARGET) return;
        chosen_target = 2;
        if(game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_NET_JOIN)
          cli.add(cli.id+" MOVE "+chosen_card+" "+chosen_target);
        turn_stage = TURN_SUMMARY;
        hit_ui = true;
      }
    );
    cancel_target_btn = new ButtonBox(dc.width/2-100,dc.height-30,200,20,
      function()
      {
        if(hit_ui || turn_stage != TURN_CHOOSE_TARGET) return;
        chosen_card = -1;
        turn_stage = TURN_CHOOSE_CARD;
        hit_ui = true;
      }
    );

    ready_btn  = new ButtonBox(dc.width/2-200,dc.height-60,400,50,
      function()
      {
        if(hit_ui || turn_stage != TURN_SUMMARY) return;

        playCard(g,chosen_card,chosen_target,sr);
        chosen_card = -1;
        chosen_target = 0;
        transition_t = 1;

        if(g.turn == game.turns) turn_stage = TURN_DONE;
        else if(game.multiplayer == MULTIPLAYER_LOCAL)
          turn_stage = TURN_CHOOSE_CARD;
        else if(game.multiplayer == MULTIPLAYER_AI)
        {
          if(g.player_turn == 1) turn_stage = TURN_CHOOSE_CARD;
          else
          {
            chosen_card = randIntBelow(g.players[1].hand.length);
            chosen_target = 1+randIntBelow(2);
          }
        }
        else if(game.multiplayer == MULTIPLAYER_NET_CREATE)
        {
          if(g.player_turn == 1) turn_stage = TURN_CHOOSE_CARD;
          else turn_stage = TURN_WAIT;
        }
        else if(game.multiplayer == MULTIPLAYER_NET_JOIN)
        {
          if(g.player_turn == 1) turn_stage = TURN_WAIT;
          else turn_stage = TURN_CHOOSE_CARD;
        }
        hit_ui = true;
      }
    );
    done_btn  = new ButtonBox(dc.width/2-200,dc.height-60,400,50,
      function()
      {
        if(hit_ui || turn_stage != TURN_DONE) return;
        cli.stop();
        game.setScene(2);
        hit_ui = true;
      }
    );
    clicker.register(p1_target_btn);
    clicker.register(p2_target_btn);
    clicker.register(cancel_target_btn);

    clicker.register(ready_btn);
    clicker.register(done_btn);

    if(game.multiplayer == MULTIPLAYER_LOCAL)
      turn_stage = TURN_CHOOSE_CARD;
    else if(game.multiplayer == MULTIPLAYER_AI)
      turn_stage = TURN_CHOOSE_CARD;
    else if(game.multiplayer == MULTIPLAYER_NET_CREATE)
      turn_stage = TURN_WAIT_FOR_JOIN;
    else if(game.multiplayer == MULTIPLAYER_NET_JOIN)
      turn_stage = TURN_WAIT;

    chosen_card = -1;
  };

  self.tick = function()
  {
    switch(turn_stage)
    {
      case TURN_WAIT_FOR_JOIN:
        if(cli.updated)
        {
          for(var i = cli.last_known+1; i < cli.database.length; i++)
          {
            if(cli.database[i].event == "JOIN" && cli.database[i].args[0] == cli.id)
            {
              game.opponent = cli.database[i].user;
              turn_stage = TURN_CHOOSE_CARD;
            }
          }
          cli.last_known = cli.database.length-1;
          cli.updated = false;
        }
        break;
      case TURN_WAIT:
        if(cli.updated)
        {
          for(var i = cli.last_known+1; i < cli.database.length; i++)
          {
            if(cli.database[i].user == game.opponent && cli.database[i].event == "MOVE")
            {
              chosen_card = cli.database[i].args[0];
              chosen_target = cli.database[i].args[1];
              turn_stage = TURN_SUMMARY;
            }
          }
          cli.last_known = cli.database.length-1;
          cli.updated = false;
        }
        break;
      case TURN_CHOOSE_CARD:
        if(g.player_turn == 1) p1_card_clicker.flush();
        if(g.player_turn == 2) p2_card_clicker.flush();
        clicker.ignore();
        break;
      case TURN_CHOOSE_TARGET:
      case TURN_SUMMARY:
      case TURN_DONE:
        p1_card_clicker.ignore();
        p2_card_clicker.ignore();
        clicker.flush();
        break;
    }
    hit_ui = false;

    if(transition_t)
    {
      transition_t++;
      if(transition_t < TRANSITION_KEY_SHUFFLE)
      {
      }
      else if(transition_t < TRANSITION_KEY_MOVE_TOK)
      {
        var t;
        for(var i = 0; i < g.tokens.length; i++)
        {
          t = g.tokens[i];
          t.disp_node_id = t.node_id;
          t.wx = lerp(t.wx,t.target_wx,0.1);
          t.wy = lerp(t.wy,t.target_wy,0.1);
          transformToScreen(dc,t);
        }
      }
      else if(transition_t < TRANSITION_KEY_SCORE_PTS)
      {
        //update tok count
        var n;
        for(var i = 0; i < g.nodes.length; i++)
        {
          n = g.nodes[i];
          if(n.disp_p1_tokens > n.p1_tokens) n.disp_p1_tokens--;
          if(n.disp_p1_tokens < n.p1_tokens) n.disp_p1_tokens++;
          if(n.disp_p2_tokens > n.p2_tokens) n.disp_p2_tokens--;
          if(n.disp_p2_tokens < n.p2_tokens) n.disp_p2_tokens++;
        }
      }
      else if(transition_t < TRANSITION_KEY_MOVE_GOAL)
      {
        //increase dispd player counts
        for(var i = 0; i < g.players.length; i++)
        {
          if(g.players[i].pts > g.players[i].disp_pts)
            g.players[i].disp_pts++;
        }

        //update goal pos
        var n = g.nodes[g.goal_node-1];
        goal_bounds.x = lerp(goal_bounds.x,n.x,0.1);
        goal_bounds.y = lerp(goal_bounds.y,n.y,0.1);
        goal_bounds.w = lerp(goal_bounds.w,n.w,0.1);
        goal_bounds.h = lerp(goal_bounds.h,n.h,0.1);
      }
      else if(transition_t >= TRANSITION_KEY_MOVE_GOAL)
        transition_t = 0;
    }
  };

  self.draw = function()
  {
    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";

    //events
    dc.context.strokeStyle = "#000000";
    for(var i = 0; i < g.events.length; i++)
    {
      var e = g.events[i];
      dc.context.beginPath();
      dc.context.moveTo(e.start_x,e.start_y);
      dc.context.lineTo(e.end_x,e.end_y);
      dc.context.stroke();
    }
    //nodes
    for(var i = 0; i < g.nodes.length; i++)
    {
      var n = g.nodes[i];
      dc.context.drawImage(n.img,n.x,n.y,n.w,n.h);
      dc.context.textAlign = "center";
      dc.context.fillText(n.title,n.x+n.w/2,n.y+20);
      dc.context.textAlign = "left";
      dc.context.fillStyle = g.players[0].color;
      dc.context.fillText(n.disp_p1_tokens,n.x-10,n.y);
      dc.context.fillStyle = g.players[1].color;
      dc.context.fillText(n.disp_p2_tokens,n.x-10,n.y+10);
      dc.context.fillStyle = "#000000";
    }

    if(transition_t)
    {
      if(transition_t < TRANSITION_KEY_SHUFFLE)
      {
        var random_highlit_tok_i;

        var last_event = g.events[g.last_event-1];
        var fromnode = g.nodes[last_event.from_id-1];
        var toks_at_last_target;
        if(g.last_target == 1) target_toks = fromnode.disp_p1_tokens;
        else                   target_toks = fromnode.disp_p2_tokens;
        random_highlit_tok_i = Math.floor(Math.random()*target_toks);

        for(var i = 0; i < g.tokens.length; i++)
        {
          var t = g.tokens[i];
          if(t.disp_node_id == fromnode.id && t.player_id == g.last_target)
          {
            if(random_highlit_tok_i == 0)
              dc.context.drawImage(highlit_token_icon,t.x-2,t.y-2,t.w+4,t.h+4);
            random_highlit_tok_i--;
          }
        }
      }
      else if(transition_t < TRANSITION_KEY_MOVE_TOK)
      {
        for(var i = 0; i < g.tokens.length; i++)
        {
          var t = g.tokens[i];
          if(Math.abs(t.wx-t.target_wx) > 0.01 || Math.abs(t.wy-t.target_wy) > 0.01)
            dc.context.drawImage(highlit_token_icon,t.x-2,t.y-2,t.w+4,t.h+4);
        }
      }
      else if(transition_t < TRANSITION_KEY_SCORE_PTS)
      {
        if(g.player_turn == 1)
        {
          var trans_len = 50;
          var progress = (transition_t+trans_len-TRANSITION_KEY_SCORE_PTS)/50;

          for(var i = 0; i < g.tokens.length; i++)
          {
            var t = g.tokens[i];
            if(t.disp_node_id == g.nodes[g.last_goal_node-1].id)
            {
                   if(t.player_id == 1) dc.context.drawImage(g.players[0].token_img,lerp(t.x-2,p1_pts_bounds.x,progress*progress),lerp(t.y-2,p1_pts_bounds.y,1-(1-progress)*(1-progress)),t.w+4,t.h+4);
              else if(t.player_id == 2) dc.context.drawImage(g.players[1].token_img,lerp(t.x-2,p2_pts_bounds.x,progress*progress),lerp(t.y-2,p2_pts_bounds.y,1-(1-progress)*(1-progress)),t.w+4,t.h+4);
            }
          }
        }
      }
      else if(transition_t < TRANSITION_KEY_MOVE_GOAL)
      {
      }
    }

    for(var i = 0; i < g.tokens.length; i++)
    {
      var t = g.tokens[i];
      dc.context.drawImage(g.players[t.player_id-1].token_img,t.x,t.y,t.w,t.h);
    }
    dc.context.strokeRect(goal_bounds.x,goal_bounds.y,goal_bounds.w,goal_bounds.h);

    //hand
    dc.context.textAlign = "left";
    var player;
    player = g.players[0];
    dc.context.textAlign = "left";
    dc.context.fillStyle = player.color;
    dc.context.fillText(player.title+": "+player.disp_pts,10,20);
    for(var i = 0; i < player.hand.length; i++)
    {
      var event = g.events[player.hand[i]-1];
      if(g.player_turn == 1 && chosen_card == i) dc.context.strokeStyle = "#00FF00";
      else dc.context.strokeStyle = "#000000";
      dc.context.strokeRect(p1_cards[i].x,p1_cards[i].y,p1_cards[i].w,p1_cards[i].h);
      dc.context.fillText(event.title,p1_cards[i].x+10,p1_cards[i].y+20);
      dc.context.fillText(event.description,p1_cards[i].x+10,p1_cards[i].y+30);
      dc.context.fillText(event.info,p1_cards[i].x+10,p1_cards[i].y+40);
    }
    player = g.players[1];
    dc.context.textAlign = "right";
    dc.context.fillStyle = player.color;
    dc.context.fillText(player.disp_pts+" :"+player.title,dc.width-10,20);
    for(var i = 0; i < player.hand.length; i++)
    {
      var event = g.events[player.hand[i]-1];
      if(g.player_turn == 2 && chosen_card == i) dc.context.strokeStyle = "#00FF00";
      else dc.context.strokeStyle = "#000000";
      dc.context.strokeRect(p2_cards[i].x,p2_cards[i].y,p2_cards[i].w,p2_cards[i].h);
      dc.context.fillText(event.title,p2_cards[i].x+p2_cards[i].w-10,p2_cards[i].y+20);
      dc.context.fillText(event.description,p2_cards[i].x+p2_cards[i].w-10,p2_cards[i].y+30);
      dc.context.fillText(event.info,p2_cards[i].x+p2_cards[i].w-10,p2_cards[i].y+40);
    }

    //info
    dc.context.fillStyle = "#000000";
    dc.context.textAlign = "center";
    dc.context.fillText("Turn: "+g.turn,dc.width/2,20);
    player = g.players[g.player_turn-1];
    dc.context.fillStyle = player.color;
    dc.context.fillText(player.title,dc.width/2,35);


    switch(turn_stage)
    {
      case TURN_WAIT_FOR_JOIN: break;
      case TURN_WAIT: break;
      case TURN_CHOOSE_CARD: break;
      case TURN_CHOOSE_TARGET:
        dc.context.textAlign = "center";
        dc.context.strokeStyle = "#000000";
        dc.context.fillStyle = g.players[0].color;
        dc.context.strokeRect(p1_target_btn.x,p1_target_btn.y,p1_target_btn.w,p1_target_btn.h); dc.context.fillText("Target P1",p1_target_btn.x+p1_target_btn.w/2,p1_target_btn.y+10);
        dc.context.fillStyle = g.players[1].color;
        dc.context.strokeRect(p2_target_btn.x,p2_target_btn.y,p2_target_btn.w,p2_target_btn.h); dc.context.fillText("Target P2",p2_target_btn.x+p2_target_btn.w/2,p2_target_btn.y+10);
        dc.context.fillStyle = "#000000";
        dc.context.strokeRect(cancel_target_btn.x,cancel_target_btn.y,cancel_target_btn.w,cancel_target_btn.h); dc.context.fillText("Cancel",cancel_target_btn.x+cancel_target_btn.w/2,cancel_target_btn.y+10);
        break;
      case TURN_SUMMARY:
        dc.context.textAlign = "left";
        dc.context.fillStyle = "#000000";
        dc.context.strokeStyle = "#000000";
        dc.context.strokeRect(ready_btn.x,ready_btn.y,ready_btn.w,ready_btn.h);

        var player = g.players[g.player_turn-1];
        dc.context.fillText(player.title+" played "+g.events[player.hand[chosen_card]-1].title+" on "+g.players[chosen_target-1].title+"'s tokens",ready_btn.x+10,ready_btn.y+20);
        dc.context.fillText("When ready, click to continue.",ready_btn.x+10,ready_btn.y+40);
        break;
      case TURN_DONE:
        dc.context.textAlign = "left";
        dc.context.fillStyle = "#000000";
        dc.context.strokeRect(done_btn.x,done_btn.y,done_btn.w,done_btn.h);

        var player = g.players[g.player_turn-1];
        dc.context.fillText("Game Over!",done_btn.x+10,done_btn.y+20);
        dc.context.fillText("When ready, click to continue.",done_btn.x+10,done_btn.y+40);
        break;
    }

    dc.context.textAlign = "center";
    switch(turn_stage)
    {
      case TURN_WAIT_FOR_JOIN:
        dc.context.fillText("waiting for opponent...",dc.width/2,50);
        dc.context.fillText("(Room #"+game.join+")",dc.width/2,70);
        break;
      case TURN_WAIT:
        dc.context.fillText("waiting for opponent's turn...",dc.width/2,50);
      break;
      case TURN_CHOOSE_CARD:
        dc.context.fillText("Choose A Card!",dc.width/2,50);
        break;
      case TURN_CHOOSE_TARGET:
        dc.context.fillText("Choose A Target!",dc.width/2,50);
        break;
      case TURN_SUMMARY:
        dc.context.fillText("",dc.width/2,50);
        break;
      case TURN_DONE:
        dc.context.fillText("Game Over!",dc.width/2,50);
        break;
    }

    dc.context.textAlign = "left";
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
    p1_card_clicker.detach();
    p1_card_clicker = undefined;
    p2_card_clicker.detach();
    p2_card_clicker = undefined;
  };

  //no data- just used for interface
  var Card = function()
  {
    var self = this;

    self.index = 0; //index into current player's hand

    self.x;
    self.y;
    self.w;
    self.h;

    self.click = function(evt)
    {
      if(hit_ui) return;
      chosen_card = self.index;
      turn_stage = TURN_CHOOSE_TARGET;
      hit_ui = true;
    }
  }
};

