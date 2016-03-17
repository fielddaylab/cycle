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
  var TURN_CHOOSE        = ENUM; ENUM++;
  var TURN_TOGETHER      = ENUM; ENUM++;
  var TURN_AWAY          = ENUM; ENUM++;

  var turn_stage;

  //seeded rand!
  var sr;

  //game definition
  var g;

  var chosen_card;

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
  var commit_btn;
  var ready_btn;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    p1_card_clicker = new Clicker({source:stage.dispCanv.canvas});
    p2_card_clicker = new Clicker({source:stage.dispCanv.canvas});

    if(game.join) sr = new SeededRand(game.join);
    else          sr = new SeededRand(Math.floor(Math.random()*100000));

    g = constructGame(CarbonCycleGameTemplate,sr);
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

    commit_btn = new ButtonBox(10,dc.height-110,dc.width-20,100,
      function()
      {
        if(hit_ui || turn_stage != TURN_TOGETHER) return;
        playCard(g,chosen_card,sr);
        transition_t = 1;
        turn_stage = TURN_AWAY;
        hit_ui = true;
      }
    );
    ready_btn  = new ButtonBox(10,dc.height-110,dc.width-20,100,
      function()
      {
        if(hit_ui || turn_stage != TURN_AWAY) return;
        if(game.multiplayer == MULTIPLAYER_LOCAL)
          turn_stage = TURN_CHOOSE;
        else if(game.multiplayer == MULTIPLAYER_AI)
        {
          if(g.player_turn == 1) turn_stage = TURN_CHOOSE;
          else
          {
            chosen_card = randIntBelow(g.players[1].hand.length);
            turn_stage = TURN_TOGETHER;
          }
        }
        else if(game.multiplayer == MULTIPLAYER_NET_CREATE)
        {
          if(g.player_turn == 1) turn_stage = TURN_CHOOSE;
          else turn_stage = TURN_WAIT;
        }
        else if(game.multiplayer == MULTIPLAYER_NET_JOIN)
        {
          if(g.player_turn == 1) turn_stage = TURN_WAIT;
          else turn_stage = TURN_CHOOSE;
        }
        hit_ui = true;
      }
    );
    clicker.register(commit_btn);
    clicker.register(ready_btn);

    if(game.multiplayer == MULTIPLAYER_LOCAL)
      turn_stage = TURN_CHOOSE;
    else if(game.multiplayer == MULTIPLAYER_AI)
      turn_stage = TURN_CHOOSE;
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
              turn_stage = TURN_CHOOSE;
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
              turn_stage = TURN_TOGETHER;
            }
          }
          cli.last_known = cli.database.length-1;
          cli.updated = false;
        }
        break;
      case TURN_CHOOSE:
        if(g.player_turn == 1) p1_card_clicker.flush();
        if(g.player_turn == 2) p2_card_clicker.flush();
        clicker.ignore();
        break;
      case TURN_TOGETHER:
      case TURN_AWAY:
        clicker.flush();
        p1_card_clicker.ignore();
        p2_card_clicker.ignore();
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
      dc.context.fillText(n.disp_p1_tokens,n.x-10,n.y);
      dc.context.fillText(n.disp_p2_tokens,n.x-10,n.y+10);
    }

    if(transition_t)
    {
      if(transition_t < TRANSITION_KEY_SHUFFLE)
      {
        var fromnode;
        var random_highlit_tok_i;

        var last_event = g.events[g.last_event-1];
        fromnode = g.nodes[last_event.from_id-1];
        random_highlit_tok_i = Math.floor(Math.random()*(fromnode.disp_p1_tokens+fromnode.disp_p2_tokens));

        for(var i = 0; i < g.tokens.length; i++)
        {
          var t = g.tokens[i];
          if(t.disp_node_id == fromnode.id)
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

    switch(turn_stage)
    {
      case TURN_WAIT_FOR_JOIN:
        dc.context.textAlign = "center";
        dc.context.fillText("Room "+game.join,dc.width/2,dc.height/2-10+100);
        dc.context.fillText("Waiting for opponent...",dc.width/2,dc.height/2+10+100);
        break;
      case TURN_WAIT:
        dc.context.textAlign = "center";
        dc.context.fillText("Waiting for opponent's turn...",dc.width/2,dc.height/2+100);
        break;
      case TURN_CHOOSE:
        //hand
        var player;
        player = g.players[0];
        for(var i = 0; i < player.hand.length; i++)
        {
          var event = g.events[player.hand[i]-1];
          dc.context.strokeRect(p1_cards[i].x,p1_cards[i].y,p1_cards[i].w,p1_cards[i].h);
          dc.context.fillText(event.title,p1_cards[i].x+10,p1_cards[i].y+20);
        }
        player = g.players[1];
        for(var i = 0; i < player.hand.length; i++)
        {
          var event = g.events[player.hand[i]-1];
          dc.context.strokeRect(p2_cards[i].x,p2_cards[i].y,p2_cards[i].w,p2_cards[i].h);
          dc.context.fillText(event.title,p2_cards[i].x+10,p2_cards[i].y+20);
        }
        break;
      case TURN_TOGETHER:
        //commit_btn.draw(dc);
        dc.context.fillStyle = "#000000";
        dc.context.strokeRect(commit_btn.x,commit_btn.y,commit_btn.w,commit_btn.h);
        dc.context.fillText("Card Chosen:"+g.events[g.players[g.player_turn-1].hand[chosen_card]-1].title,commit_btn.x+20,commit_btn.y+20);
        if(game.multiplayer == MULTIPLAYER_LOCAL)
          dc.context.fillText("When both players have seen, click to continue.",commit_btn.x+20,commit_btn.y+40);
        else if(game.multiplayer == MULTIPLAYER_AI)
          dc.context.fillText("Click to continue.",commit_btn.x+20,commit_btn.y+40);
        else if(game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_NET_JOIN)
          dc.context.fillText("click to continue.",commit_btn.x+20,commit_btn.y+40);
        break;
      case TURN_AWAY:
        //ready_btn.draw(dc);
        dc.context.fillStyle = "#000000";
        dc.context.strokeRect(ready_btn.x,ready_btn.y,ready_btn.w,ready_btn.h);
        if(game.multiplayer == MULTIPLAYER_LOCAL)
          dc.context.fillText(g.players[g.player_turn-1].title+"'s turn. All players except "+g.players[g.player_turn-1].title+" look away.",ready_btn.x+20,ready_btn.y+20);
        else if(game.multiplayer == MULTIPLAYER_AI)
          dc.context.fillText(g.players[g.player_turn-1].title+"'s turn.",ready_btn.x+20,ready_btn.y+20);
        else if(game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_NET_JOIN)
          dc.context.fillText(g.players[g.player_turn-1].title+"'s turn.",ready_btn.x+20,ready_btn.y+20);
        dc.context.fillText("When ready, click to continue.",ready_btn.x+20,ready_btn.y+40);
        break;
    }

    //info
    dc.context.fillStyle = "#000000";
    dc.context.textAlign = "center";
    dc.context.fillText("Turn: "+g.turn,dc.width/2,20);
    dc.context.fillStyle = g.players[g.player_turn-1].color;
    dc.context.fillText("Player: "+g.players[g.player_turn-1].title,dc.width/2,35);

    var p;

    dc.context.textAlign = "left";
    p = g.players[0];
    dc.context.fillStyle = p.color;
    dc.context.fillText(p.title+": "+p.disp_pts,10,20);

    dc.context.textAlign = "right";
    p = g.players[1];
    dc.context.fillStyle = p.color;
    dc.context.fillText(p.disp_pts+" :"+p.title,dc.width-10,20);

    dc.context.textAlign = "left";
  };

  self.cleanup = function()
  {

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
      if(game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_NET_JOIN)
        cli.add(cli.id+" MOVE "+chosen_card);
      turn_stage = TURN_TOGETHER;
      hit_ui = true;
    }
  }
};

