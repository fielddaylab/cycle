var TutorialScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var n_ticks;
  var clicker;

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

  var chosen_card_i;
  var chosen_card_t;
  var chosen_target_p;
  var hovering_card_i;
  var hovering_card_p;
  var hovering_card_t;

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

  //tut stuff
  var next_btn;
  var prompts;
  var cur_prompt;
  var Prompt = function(lines,x,y){this.lines = lines, this.x = x; this.y = y;};

  self.ready = function()
  {
    dc.context.font = "12px Arial";
    clicker = new Clicker({source:stage.dispCanv.canvas});

    //tut stuff
    game.multiplayer = MULTIPLAYER_LOCAL;
    game.turns = 10;

    next_btn = new ButtonBox(0,0,dc.width,dc.height,function(){
      cur_prompt++;
      if(cur_prompt == 17) p1_cards[1].click();
      else if(cur_prompt == 18) p1_target_btn.click({});
      else if(cur_prompt == 19) ready_btn.click({});
      else if(cur_prompt == 21) p2_cards[3].click();
      else if(cur_prompt == 22) p2_target_btn.click({});
      else if(cur_prompt == 24) ready_btn.click({});
      else if(cur_prompt >= prompts.length) game.setScene(2);
    });
    prompts = [];
    cur_prompt = 0;
    var i = 0;

    /*0*/prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Hi!"),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Cycle Game is a 2 Player Game"),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Here's Player 1 (Red)"),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "And Here's Player 2 (Blue)"),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Both Players begin with 0 points..."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "and tokens spread around the board."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "The game takes place over 10 turns."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Each turn has a few steps:"),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "First, player 1 plays a card."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Then, player 2 plays a card."),dc.width/4,dc.height-50); i++;
    /*10*/prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Playing a card moves tokens from one node to another."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "After both cards have been played,"),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "all the tokens at the \"goal node\" are added as points"),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "to the corresponding player"),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "The player with the most points at the end of 10 turns, wins."),dc.width/4,dc.height-50); i++;
    /*15*/prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Ok. Let's go through a turn."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Player 1 selects a card to play by clicking on it."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/3, "Then, they choose who to target with this card."),(dc.width/4)*3-50,dc.height-40); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/3, "After a quick confirmation..."),(dc.width/4)*3-50,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Player 2 goes through the same motions."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Choose a card..."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/3, "Choose a target..."),(dc.width/4)*3-50,dc.height-40); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/3, "Quick confirmation..."),(dc.width/4)*3-50,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "(Watch the goal node after we click confirm...)"),dc.width/4,dc.height-100); i++;
    /*0*/prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Some other things to look out for:"),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "1. Every 3 turns, the goal node will make a move through the cycle."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "2. Some cards move more than one token."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "3. Some cards take more than one turn to move tokens."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Ok. You should be able to figure it out from here."),dc.width/4,dc.height-50); i++;
    prompts[i] = new Prompt(textToLines(dc, "20px Arial", dc.width/2, "Good luck!"),dc.width/4,dc.height-50); i++;
    clicker.register(next_btn);

    if(game.join) sr = new SeededRand(game.join);
    else          sr = new SeededRand(Math.floor(Math.random()*100000));

    //g = constructGame(GameTemplate,sr);
    //g = constructGame(OldCarbonCycleGameTemplate,sr);
    g = constructGame(CarbonCycleGameTemplate,sr);
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
      card.player = 1;

      card.w = size;
      card.h = 45;
      card.x = 0;
      card.y = 40+10+(card.h+10)*i;

      p1_cards.push(card);
    }
    p2_cards = [];
    for(var i = 0; i < g.players[0].hand.length; i++)
    {
      card = new Card();
      card.index = i;
      card.player = 2;

      card.w = size;
      card.h = 45;
      card.x = dc.width-card.w;
      card.y = 40+10+(card.h+10)*i;

      p2_cards.push(card);
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
        chosen_target_p = 1;
        if(game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_NET_JOIN)
          cli.add(cli.id+" MOVE "+chosen_card_i+" "+chosen_target_p);
        turn_stage = TURN_SUMMARY;
        hit_ui = true;
      }
    );
    p2_target_btn = new ButtonBox(dc.width/2+10,dc.height-60,90,20,
      function()
      {
        if(hit_ui || turn_stage != TURN_CHOOSE_TARGET) return;
        chosen_target_p = 2;
        if(game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_NET_JOIN)
          cli.add(cli.id+" MOVE "+chosen_card_i+" "+chosen_target_p);
        turn_stage = TURN_SUMMARY;
        hit_ui = true;
      }
    );
    cancel_target_btn = new ButtonBox(dc.width/2-100,dc.height-30,200,20,
      function()
      {
        if(hit_ui || turn_stage != TURN_CHOOSE_TARGET) return;
        chosen_card_i = -1;
        turn_stage = TURN_CHOOSE_CARD;
        hit_ui = true;
      }
    );

    ready_btn  = new ButtonBox(dc.width/2-200,dc.height-60,400,50,
      function()
      {
        if(hit_ui || turn_stage != TURN_SUMMARY) return;

        playCard(g,chosen_card_i,chosen_target_p,sr);
        chosen_card_i = -1;
        chosen_target_p = 0;
        transition_t = 1;

        if(g.turn == game.turns) turn_stage = TURN_DONE;
        else if(game.multiplayer == MULTIPLAYER_LOCAL)
          turn_stage = TURN_CHOOSE_CARD;
        else if(game.multiplayer == MULTIPLAYER_AI)
        {
          if(g.player_turn == 1) turn_stage = TURN_CHOOSE_CARD;
          else
          {
            var new_chosen_card_i = randIntBelow(g.players[1].hand.length);
            if(chosen_card_i != new_chosen_card_i) chosen_card_t = 0;
            chosen_card_i = new_chosen_card_i;
            chosen_target_p = 1+randIntBelow(2);
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

    if(game.multiplayer == MULTIPLAYER_LOCAL)
      turn_stage = TURN_CHOOSE_CARD;
    else if(game.multiplayer == MULTIPLAYER_AI)
      turn_stage = TURN_CHOOSE_CARD;
    else if(game.multiplayer == MULTIPLAYER_NET_CREATE)
      turn_stage = TURN_WAIT_FOR_JOIN;
    else if(game.multiplayer == MULTIPLAYER_NET_JOIN)
      turn_stage = TURN_WAIT;

    chosen_card_i = -1;
    chosen_card_t = 0;
    chosen_target_p = 0;
    hovering_card_i = -1;
    hovering_card_p = 0;
    hovering_card_t = 0;

    n_ticks = 0;
  };

  self.tick = function()
  {
    n_ticks++;
    chosen_card_t++;
    hovering_card_t++;

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
              if(chosen_card_i != cli.database[i].args[0]) chosen_card_t = 0;
              chosen_card_i = cli.database[i].args[0];
              chosen_target_p = cli.database[i].args[1];
              turn_stage = TURN_SUMMARY;
            }
          }
          cli.last_known = cli.database.length-1;
          cli.updated = false;
        }
        break;
      case TURN_CHOOSE_CARD:
      case TURN_CHOOSE_TARGET:
      case TURN_SUMMARY:
      case TURN_DONE:
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

    clicker.flush();
  };

  self.draw = function()
  {
    dc.context.fillStyle = "#FFFFAA";
    if(g.player_turn == 1) dc.context.fillRect(0,0,150,dc.height);
    if(g.player_turn == 2) dc.context.fillRect(dc.width-150,0,150,dc.height);

    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";

    //events
    var sim_t = 40;
    for(var i = 0; i < g.events.length; i++)
    {
      var e = g.events[i];
      if(hovering_card_i >= 0)
      {
        var e_id = g.players[hovering_card_p-1].hand[hovering_card_i];
        if(e_id && e_id == e.id)
        {
          dc.context.strokeStyle = "#FFFF00";
          dc.context.lineWidth = 10;
          dc.context.beginPath();
          dc.context.moveTo(e.start_x,e.start_y);
          dc.context.lineTo(e.end_x,e.end_y);
          dc.context.stroke();
          dc.context.lineWidth = 2;
          dc.context.strokeStyle = "#000000";
          var t = (hovering_card_t%sim_t)/sim_t;
          t *= t;
          dc.context.drawImage(circle_icon,lerp(e.start_x,e.end_x,t)-5,lerp(e.start_y,e.end_y,t)-5,10,10);
        }
      }
      if(chosen_card_i >= 0 && !(hovering_card_i >= 0))
      {
        var e_id = g.players[g.player_turn-1].hand[chosen_card_i];
        if(e_id && e_id == e.id)
        {
          dc.context.strokeStyle = "#FFFF00";
          dc.context.lineWidth = 10;
          dc.context.beginPath();
          dc.context.moveTo(e.start_x,e.start_y);
          dc.context.lineTo(e.end_x,e.end_y);
          dc.context.stroke();
          dc.context.lineWidth = 2;
          dc.context.strokeStyle = "#000000";
          var t = (chosen_card_t%sim_t)/sim_t;
          t *= t;
          dc.context.drawImage(circle_icon,lerp(e.start_x,e.end_x,t)-5,lerp(e.start_y,e.end_y,t)-5,10,10);
        }
      }
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
      dc.context.drawImage(ghost_circle_icon,n.x-12,n.y-10,10,10);
      dc.context.fillStyle = g.players[0].color;
      dc.context.fillText(n.disp_p1_tokens,n.x-10,n.y);
      dc.context.drawImage(ghost_circle_icon,n.x-12,n.y,10,10);
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
      if(cur_prompt == 5) dc.context.drawImage(highlit_token_icon,t.x-2,t.y-2,t.w+4,t.h+4);
      dc.context.drawImage(g.players[t.player_id-1].token_img,t.x,t.y,t.w,t.h);
    }
    var goal_node = g.nodes[g.goal_node-1];
    var goal_close = false;
    if(Math.abs(goal_bounds.x-goal_node.x)+Math.abs(goal_bounds.y-goal_node.y) < 10)
      goal_close = true;
    var turns_left = 3-(g.turn%g.turns_per_goal_shift);
    if(!goal_close && turns_left == 3) turns_left = 0;
    if(cur_prompt == 12) dc.context.strokeStyle = "#00FF00";
    dc.context.strokeRect(goal_bounds.x,goal_bounds.y,goal_bounds.w,goal_bounds.h);
    dc.outlineText(turns_left+" turns til goal shift",goal_bounds.x,goal_bounds.y-3,"#000000","#FFFFFF");

    //hand
    dc.context.textAlign = "left";
    var player;
    player = g.players[0];
    dc.context.textAlign = "left";
    dc.context.fillStyle = player.color;
    if(cur_prompt == 4) dc.context.fillStyle = "#00FF00";
    dc.context.fillText(player.title+": "+player.disp_pts,10,20);
    dc.context.fillStyle = "#000000";
    for(var i = 0; i < player.hand.length; i++)
    {
      var event = g.events[player.hand[i]-1];
      if(g.player_turn == 1 && chosen_card_i == i) dc.context.strokeStyle = "#00FF00";
      else dc.context.strokeStyle = player.color;
      if(cur_prompt == 2) dc.context.strokeStyle = "#00FF00";
      dc.context.strokeRect(p1_cards[i].x,p1_cards[i].y,p1_cards[i].w,p1_cards[i].h);
      dc.context.fillText(event.title,p1_cards[i].x+10,p1_cards[i].y+20);
      dc.context.font = "italic 10px Arial";
      dc.context.fillText(event.description,p1_cards[i].x+10,p1_cards[i].y+30);
      dc.context.font = "12px Arial";
      dc.context.fillText(event.info,p1_cards[i].x+10,p1_cards[i].y+40);
    }
    player = g.players[1];
    dc.context.textAlign = "right";
    dc.context.fillStyle = player.color;
    if(cur_prompt == 4) dc.context.fillStyle = "#00FF00";
    dc.context.fillText(player.disp_pts+" :"+player.title,dc.width-10,20);
    dc.context.fillStyle = "#000000";
    for(var i = 0; i < player.hand.length; i++)
    {
      var event = g.events[player.hand[i]-1];
      if(g.player_turn == 2 && chosen_card_i == i) dc.context.strokeStyle = "#00FF00";
      else dc.context.strokeStyle = player.color;
      if(cur_prompt == 3) dc.context.strokeStyle = "#00FF00";
      dc.context.strokeRect(p2_cards[i].x,p2_cards[i].y,p2_cards[i].w,p2_cards[i].h);
      dc.context.fillText(event.title,p2_cards[i].x+p2_cards[i].w-10,p2_cards[i].y+20);
      dc.context.font = "italic 10px Arial";
      dc.context.fillText(event.description,p2_cards[i].x+p2_cards[i].w-10,p2_cards[i].y+30);
      dc.context.font = "12px Arial";
      dc.context.fillText(event.info,p2_cards[i].x+p2_cards[i].w-10,p2_cards[i].y+40);
    }

    //info
    dc.context.fillStyle = "#000000";
    dc.context.textAlign = "center";
    if(cur_prompt == 6) dc.context.fillStyle = "#00FF00";
    dc.context.fillText("Turn: "+g.turn,dc.width/2,20);
    dc.context.fillStyle = "#000000";
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
        dc.context.fillText(player.title+" played "+g.events[player.hand[chosen_card_i]-1].title+" on "+g.players[chosen_target_p-1].title+"'s tokens",ready_btn.x+10,ready_btn.y+20);
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
    dc.context.font = "20px Arial";
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

    //tut stuff
    var p = prompts[cur_prompt];
    dc.context.fillStyle = "#000000";
    dc.context.font = "20px Arial";
    for(var i = 0; i < p.lines.length; i++)
      dc.outlineText(p.lines[i],p.x,p.y+i*20,"#000000","#FFFFFF");

    dc.context.font = "12px Arial";
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };

  //no data- just used for interface
  var Card = function()
  {
    var self = this;

    self.index = 0; //index into current player's hand
    self.player = 0;

    self.x;
    self.y;
    self.w;
    self.h;

    self.click = function(evt)
    {
      if(hit_ui) return;
      if(chosen_card_i != self.index) chosen_card_t = 0;
      chosen_card_i = self.index;
      turn_stage = TURN_CHOOSE_TARGET;
      hit_ui = true;
    }

    self.hover = function(evt)
    {
      if(hovering_card_i == -1) hovering_card_t = 0;
      hovering_card_i = self.index;
      hovering_card_p = self.player;
    }
    self.unhover = function()
    {
      hovering_card_i = -1;
      hovering_card_p = 0;
    }
  }
};

