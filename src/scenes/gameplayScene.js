var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var ctx = dc.context;
  var n_ticks;
  var clicker;
  var hoverer;

  ENUM = 0;
  var TURN_WAIT_FOR_JOIN = ENUM; ENUM++;
  var TURN_WAIT          = ENUM; ENUM++;
  var TURN_CHOOSE_CARD   = ENUM; ENUM++;
  var TURN_CONFIRM_CARD  = ENUM; ENUM++;
  var TURN_CHOOSE_TARGET = ENUM; ENUM++;
  var TURN_SUMMARY       = ENUM; ENUM++;
  var TURN_ANIM_CARD     = ENUM; ENUM++;
  var TURN_DONE          = ENUM; ENUM++;
  var turn_stage;

  ENUM = 0;
  var INPUT_RESUME    = ENUM; ENUM++;
  var INPUT_INTERRUPT = ENUM; ENUM++;
  var INPUT_TUTORIAL  = ENUM; ENUM++;
  var input_state;

  //seeded rand!
  var sr;

  //game definition
  var g;

  var chosen_card_i;
  var chosen_target_p;
  var hovering_card_i;
  var hovering_card_p;

  var transition_t;
  var TRANSITION_KEY_SHUFFLE   = 50;
  var TRANSITION_KEY_MOVE_TOK  = 100;
  var TRANSITION_KEY_SCORE_PTS = 150;
  var TRANSITION_KEY_MOVE_GOAL = 200;

  var direction_viz_enabled;
  var displayed_turn_3_warning;

  //ui only
  var hit_ui;
  var hovhit_ui;
  var goal_bounds;
  var p1_pts_bounds;
  var p2_pts_bounds;
  var p1_cards_bounds;
  var p2_cards_bounds;
  var p1_cards;
  var p2_cards;
  var hover_card;
  var abyss;
  var hover_pulse_t;
  var hover_pulse;

  var ready_btn;
  var done_btn;
  var menu_btn;
  var interrupt_canvdom;
  var tutorial_canvdom;
  var disp_0; var dest_0; var w_0 = 100; var h_0 = 260;
  var disp_1; var dest_1; var w_1 = 140; var h_1 = 200;
  var disp_2; var dest_2; var w_2 = 300; var h_2 = 400;
  var disp_3; var dest_3; var w_3 = 150; var h_3 = 200;
  var blurb_x;
  var blurb_y;
  var blurb_w;
  var blurb_h;
  var announce_x;
  var announce_y;
  var announce_w;
  var announce_h;
  var summary;

  var tutorial_lines;
  var tutorial_tests;
  var tutorial_acts;
  var tutorial_draws;
  var tutorial_chars;
  var tutorial_n;

  var sidebar_w = 160;
  var topmost_bar_y = 55;
  var score_header_y = 85;
  var turn_header_y = 105;

  self.ready = function()
  {

    ctx.font = "12px Open Sans";
    clicker = new Clicker({source:stage.dispCanv.canvas});
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});

    if(game.join) sr = new SeededRand(game.join);
    else          sr = new SeededRand(Math.floor(Math.random()*100000));

    if(game_type == CARBON_GAME)
      g = constructGame(CarbonCycleGameTemplate,sr,dc);
    else if(game_type == NITROGEN_GAME)
      g = constructGame(NitrogenCycleGameTemplate,sr,dc);
    else if(game_type == WATER_GAME)
      g = constructGame(WaterCycleGameTemplate,sr,dc);
    else
      g = constructGame(GameTemplate,sr,dc);

    transition_t = 0;
    transformGame(dc,g.nodes,g.events,g.tokens)

    var w = sidebar_w-20;
    var gap = score_header_y+25;
    var h = (dc.height-gap)/g.players[0].hand.length;
    p1_cards_bounds = [];
    for(var i = 0; i < g.players[0].hand.length; i++)
    {
      p1_cards_bounds[i] = {
        x:10,
        y:gap+h*i,
        w:w,
        h:h,
      };
    }
    p2_cards_bounds = [];
    for(var i = 0; i < g.players[0].hand.length; i++)
    {
      p2_cards_bounds[i] = {
        x:dc.width-w-10,
        y:gap+h*i,
        w:w,
        h:h,
      };
    }

    var n = g.nodes[g.goal_node-1];
    goal_bounds = {
      x:n.x,
      y:n.y,
      w:n.w,
      h:n.h,
    };

    p1_pts_bounds = {
      x:sidebar_w-20,
      y:score_header_y-7,
      w:10,
      h:10,
    };

    p2_pts_bounds = {
      x:dc.width-20,
      y:score_header_y-7,
      w:10,
      h:10,
    };

    hover_card = new HoverCard();
    hover_card.x = p1_cards_bounds[0].x;
    hover_card.y = p1_cards_bounds[0].y;
    hover_card.w = p1_cards_bounds[0].w;
    hover_card.h = p1_cards_bounds[0].h*2;
    hover_card.set();
    //need to register before cards
    hoverer.register(hover_card);
    clicker.register(hover_card);

    var card;
    p1_cards = [];
    for(var i = 0; i < g.players[0].hand.length; i++)
    {
      card = new Card();
      card.index = i;
      card.player = 1;

      card.x = p1_cards_bounds[i].x;
      card.y = p1_cards_bounds[i].y;
      card.w = p1_cards_bounds[i].w;
      card.h = p1_cards_bounds[i].h;

      p1_cards.push(card);
      clicker.register(card);
      hoverer.register(card);
    }
    p2_cards = [];
    for(var i = 0; i < g.players[0].hand.length; i++)
    {
      card = new Card();
      card.index = i;
      card.player = 2;

      card.x = p2_cards_bounds[i].x;
      card.y = p2_cards_bounds[i].y;
      card.w = p2_cards_bounds[i].w;
      card.h = p2_cards_bounds[i].h;

      p2_cards.push(card);
      clicker.register(card);
      hoverer.register(card);
    }

    ready_btn = new ButtonBox(0,0,dc.width,dc.height,
      function()
      {
        if(input_state != INPUT_RESUME) return;
        if(hit_ui || turn_stage != TURN_SUMMARY) return;

        turn_stage = TURN_ANIM_CARD;
        hover_card.dx = dc.width/2-hover_card.w/2;
        hover_card.dy = dc.height-50;

        setTimeout(function() //oh god...
        {
          playCard(g,chosen_card_i,chosen_target_p,sr);
          genPostSummary();
          chosen_card_i = -1;
          chosen_target_p = 0;
          transition_t = 1;

          if(g.turn == game.turns) turn_stage = TURN_DONE;
          else if(game.multiplayer == MULTIPLAYER_LOCAL)
            turn_stage = TURN_CHOOSE_CARD;
          else if(game.multiplayer == MULTIPLAYER_AI || game.multiplayer == MULTIPLAYER_TUT)
          {
            if(g.player_turn == 1) turn_stage = TURN_CHOOSE_CARD;
            else
            {
              turn_stage = TURN_CHOOSE_CARD;
              setTimeout(function() //oh god oh god...
              {
                var new_chosen_card_i = randIntBelow(g.players[1].hand.length);
                chosen_card_i = new_chosen_card_i;
                chosen_target_p = 1+randIntBelow(2);
                turn_stage = TURN_ANIM_CARD;
                var card;
                if(g.player_turn == 1) card = p1_cards[chosen_card_i];
                else if(g.player_turn == 2) card = p2_cards[chosen_card_i];
                hover_pulse_t = Math.PI;
                hover_card.x = card.x;
                hover_card.y = card.y;
                hover_card.dx = card.x;
                hover_card.dy = card.y-card.h;
                hover_card.t = 0;

                genPreSummary();
                turn_stage = TURN_SUMMARY;
                setTimeout(function() //oh god oh god oh god...
                {
                  ready_btn.click({});
                },1000);
              },2000);
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
        }, 800);
      }
    );
    done_btn  = new ButtonBox(0,0,dc.width,dc.height,
      function()
      {
        if(input_state != INPUT_RESUME) return;
        if(hit_ui || turn_stage != TURN_DONE) return;
        cli.stop();
        game.setScene(2);
        hit_ui = true;
      }
    );
    menu_btn = new ButtonBox(0,0,100,topmost_bar_y,
      function(evt)
      {
        cli.stop();
        game.setScene(2);
        hit_ui = true;
      }
    );

    clicker.register(ready_btn);
    clicker.register(done_btn);
    clicker.register(menu_btn);

    interrupt_canvdom = new CanvDom(dc);
    clicker.register(interrupt_canvdom);
    tutorial_canvdom = new CanvDom(dc);
    clicker.register(tutorial_canvdom);
    disp_0 = 0; dest_0 = 0;
    disp_1 = 0; dest_1 = 0;
    disp_2 = 0; dest_2 = 0;
    disp_3 = 0; dest_3 = 0;
    blurb_x = sidebar_w+100;
    blurb_y = dc.height-200;
    blurb_w = dc.width-(sidebar_w*2)-110;
    blurb_h = 100;
    announce_x = sidebar_w+110;
    announce_y = dc.height-110;
    announce_w = dc.width-(sidebar_w*2)-120;
    announce_h = 100;

    switch(game.multiplayer)
    {
      case MULTIPLAYER_LOCAL:
      case MULTIPLAYER_AI:
      case MULTIPLAYER_TUT:
        turn_stage = TURN_CHOOSE_CARD;
        break;
      case MULTIPLAYER_NET_CREATE:
        turn_stage = TURN_WAIT_FOR_JOIN;
        break;
      case MULTIPLAYER_NET_JOIN:
        turn_stage = TURN_WAIT;
        break;
    }

    input_state = INPUT_RESUME;

    summary = [];
    var text;
    var team = g.players[0].title;
    var who = team+"'s";

    if(
      ((game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_AI) && g.player_turn == 1) ||
      ((game.multiplayer == MULTIPLAYER_NET_JOIN)                                         && g.player_turn == 2)
    )
      who = "your";

    if(game.multiplayer == MULTIPLAYER_AI || game.multiplayer == MULTIPLAYER_TUT) text = "You are "+team+", and it's "+who+" turn!";
    if(game.multiplayer == MULTIPLAYER_LOCAL) text = "It's "+who+" turn!";
    if(game.multiplayer == MULTIPLAYER_NET_CREATE)
    {
      if(turn_stage == TURN_WAIT_FOR_JOIN) text = "You are "+team+"! Hold tight while we wait for your opponent... (You are room #"+game.join+")";
      else text = "You are "+team+", and it's "+who+" turn!";
    }
    if(game.multiplayer == MULTIPLAYER_NET_JOIN) text = "You are "+g.players[1].title+". It's "+who+" turn! (Waiting on your opponent...)";
    summary = [textToLines(dc, "12px Open Sans", announce_w-10, text)];

    chosen_card_i = -1;
    chosen_target_p = 0;
    hovering_card_i = -1;
    hovering_card_p = 0;

    n_ticks = 0;

    direction_viz_enabled = true;
    displayed_turn_3_warning = false;

    abyss =
    {
     x:0,
     y:0,
     w:dc.width,
     h:dc.height
    }
    abyss.click = function(evt)
    {
      if(hit_ui) return;
      hit_ui = true;
      switch(turn_stage)
      {

        case TURN_CONFIRM_CARD:
        case TURN_CHOOSE_TARGET:
          chosen_target_p = 0;
          chosen_card_i = -1;
          turn_stage = TURN_CHOOSE_CARD;
          break;
      }
    }
    clicker.register(abyss);

    hover_pulse_t = 0;
    hover_pulse = Math.sin(hover_pulse_t);

    tutorial_lines = [];
    tutorial_tests = [];
    tutorial_acts  = [];
    tutorial_draws = [];
    tutorial_chars = [];
    tutorial_n = 0;

    tutorial_lines.push("The "+g.noun+" cycle is all about how "+g.noun+" moves and changes throughout the world!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    tutorial_lines.push("It's also a cool card game we found underneath a rusty old boat!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(3);
    if(game_type != WATER_GAME)
    {
    tutorial_lines.push("But, er.. What's a "+g.noun+"?");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(3);
    }
    if(game_type == CARBON_GAME)
    {
      tutorial_lines.push("It's an atom (often part of a molecule!), and it's pretty much everywhere.");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(0);
      tutorial_lines.push("It's in everything?");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(3);
      tutorial_lines.push("Well, not everything, but a lot of things! It's in the air we breathe, in our oceans, plants, animals, the atmosphere! It's all over!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(0);
    }
    if(game_type == NITROGEN_GAME)
    {
      tutorial_lines.push("It's an atom (often part of a molecule!), and it's really important in helping plants grow!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(0);
      tutorial_lines.push("That's it?");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(3);
      tutorial_lines.push("Getting Nitrogen into plants is the first steps in getting it into animals (like you and me)! It's an absolute necessity for life.");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(0);
    }
    tutorial_lines.push("But back to the game-");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    tutorial_lines.push("It takes two people to play:");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    tutorial_lines.push("Here's the RED TEAM,");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(function()
    {
      var y = 140 + Math.sin(n_ticks/10)*10;
      var w = 105;
      drawTip(sidebar_w+5,y,w,true,"RED TEAM");
    });
    tutorial_chars.push(0);
    tutorial_lines.push("and here's the BLUE TEAM.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(function()
    {
      var y = 140 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(dc.width-sidebar_w-w-5,y,w,false,"BLUE TEAM");
    });
    tutorial_chars.push(0);
    tutorial_lines.push("Each team has "+g.noun+" scattered around the environment.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(function()
    {
      var y = 320 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(dc.width/2-280,y,w,false,g.NOUN);
      var y = 240 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(dc.width/2+150,y,w,true,g.NOUN);
    });
    tutorial_chars.push(0);
    tutorial_lines.push("And we take turns playing cards that move them around!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(function()
    {
      var y = 240 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(sidebar_w+5,y,w,true,"CARDS");
      var y = 240 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(dc.width-sidebar_w-w-5,y,w,false,"CARDS");
    });
    tutorial_chars.push(0);
    tutorial_lines.push("Ooh, so the cards represent how "+g.noun+" moves through our environment,");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(3);
    tutorial_lines.push("Yep!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    tutorial_lines.push("The goal is to get your "+g.noun+" into the flashing zone.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(function()
    {
      var y = g.nodes[g.goal_node-1].y+g.nodes[g.goal_node-1].h/2 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(g.nodes[g.goal_node-1].x+g.nodes[g.goal_node-1].w,y,w,true,"GOAL ZONE");
    });
    tutorial_chars.push(0);
    tutorial_lines.push("After both players have played their cards, each player is awarded points corresponding to the amount of "+g.noun+" in the goal zone.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(function()
    {
      var y = 70 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(sidebar_w+5,y,w,true,"POINTS");
      var y = 70 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(dc.width-sidebar_w-w-5,y,w,false,"POINTS");
    });
    tutorial_chars.push(0);
    tutorial_lines.push("When you play a card, you can choose to affect either team's "+g.noun+". Maybe you would like to move your "+g.noun+" into the goal zone, or move your opponent's out of it.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    tutorial_lines.push("Cool! Lets try it out!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(3);
    tutorial_lines.push("Ok, I'll be blue and you can be red, why don't you try selecting a card and see what happens?");
    tutorial_tests.push(function(){ return g.player_turn == 2; });
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    tutorial_lines.push(function() { var delta = g.deltas[g.turn*2+(g.player_turn-1)-1]; var last_event = g.events[delta.event_id-1]; return "Cool, so you played \""+last_event.title+"\" to move "+g.noun+" to \""+g.nodes[last_event.to_id-1].title+"\"."; });
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    tutorial_lines.push("That card is now discarded, and you'll draw a new card at the beginning of your next turn.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    tutorial_lines.push("Now I'll go");
    tutorial_tests.push(function(){ return g.player_turn == 1; });
    tutorial_acts.push(function(){ ready_btn.click({});});
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    tutorial_lines.push(function() { var delta = g.deltas[g.turn*2+(g.player_turn-1)-1]; var last_event = g.events[delta.event_id-1]; return "Ok, I played \""+last_event.title+"\" to move "+g.noun+" to \""+g.nodes[last_event.to_id-1].title+"\"."; });
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);
    if(game_type == CARBON_GAME)
    {
      tutorial_lines.push("See how different actions make "+g.noun+" move throughout our environment? "+g.Noun+" affects just about every part of our planet!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(0);
    }
    if(game_type == NITROGEN_GAME)
    {
      tutorial_lines.push("See how different actions make "+g.noun+" move throughout our environment? "+g.Noun+" affects just about every stage of agriculture (and more)!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(0);
    }
    if(game_type == WATER_GAME)
    {
      tutorial_lines.push("See how different actions make "+g.noun+" move throughout our environment? "+g.Noun+" is constantly cycling through the air, the land, and the sea!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(0);
    }
    tutorial_lines.push("Wow! Cool!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(3);
    tutorial_lines.push("Yeah! In this game, the goal zone moves every three turns, so plan ahead! If you want to keep playing, It's your turn!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(0);

    if(game.multiplayer == MULTIPLAYER_TUT)
      tutorialDisplayMessage();
  };

  self.tick = function()
  {
    n_ticks++;
    hover_pulse_t += 0.05;
    hover_pulse = Math.sin(hover_pulse_t);

    if(g.turn >= 3 && !displayed_turn_3_warning)
    {
      displayed_turn_3_warning = true;

      text = "Hey! To make things interesting, we're going to stop showing you in which direction each event affects the "+g.noun+"... good luck!";
      interruptDisplayMessage(textToLines(dc, "12px Open Sans", blurb_w-20, text));
    }

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
              summary = [textToLines(dc, "12px Open Sans", announce_w-10, "You are "+g.players[0].title+", and it's your turn!")];
              turn_stage = TURN_CHOOSE_CARD;
            }
          }
          cli.last_known = cli.database.length-1;
          cli.updated = false;
        }
        clicker.ignore();
        break;
      case TURN_WAIT:
        if(cli.updated)
        {
          for(var i = cli.last_known+1; i < cli.database.length; i++)
          {
            if(cli.database[i].user == game.opponent && cli.database[i].event == "MOVE")
            {
              chosen_card_i = cli.database[i].args[0];
              chosen_target_p = cli.database[i].args[1];

              var card;
              if(g.player_turn == 1) card = p1_cards[chosen_card_i];
              else if(g.player_turn == 2) card = p2_cards[chosen_card_i];
              hover_pulse_t = Math.PI;
              hover_card.x = card.x;
              hover_card.y = card.y;
              hover_card.dx = card.x;
              hover_card.dy = card.y-card.h;
              hover_card.t = 0;

              genPreSummary();
              turn_stage = TURN_SUMMARY;
            }
          }
          cli.last_known = cli.database.length-1;
          cli.updated = false;
        }
        clicker.ignore();
        break;
      case TURN_CHOOSE_CARD:
      case TURN_CONFIRM_CARD:
      case TURN_CHOOSE_TARGET:
      case TURN_SUMMARY:
      case TURN_ANIM_CARD:
      case TURN_DONE:
        clicker.flush();
        break;
    }
    if(hoverer) hoverer.flush(); //check because "setScene" could have cleaned up hoverer. causes error in console, but no other issues.
    hit_ui = false;
    hovhit_ui = false;

    hover_card.tick();

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
      }
      else if(transition_t >= TRANSITION_KEY_MOVE_GOAL)
        transition_t = 0;
    }

    if(game.multiplayer == MULTIPLAYER_TUT)
    {
      if(tutorial_acts.length > tutorial_n && tutorial_acts[tutorial_n]) tutorial_acts[tutorial_n]();
      if(tutorial_tests.length > tutorial_n && (tutorial_tests[tutorial_n] && tutorial_tests[tutorial_n]()))
      {
        tutorial_n++;
        tutorialDisplayMessage();
      }
    }
  };

  self.draw = function()
  {
    //free space to allow card height
    //ctx.fillStyle = gray;
    //ctx.fillRect(0,0,dc.width,topmost_bar_y);
    ctx.fillStyle = white;
    dc.roundRectOptions(0,topmost_bar_y,dc.width,dc.height-topmost_bar_y,5,1,1,1,1,0,1);
    ctx.drawImage(g.bg_img,sidebar_w,topmost_bar_y+60,dc.width-sidebar_w*2,dc.height-topmost_bar_y-250);


    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px Open Sans";
    ctx.fillText("Return to Menu?",10,topmost_bar_y-5);

    //red section body
    ctx.fillStyle = red;
    dc.roundRectOptions(0,topmost_bar_y,sidebar_w,dc.height-topmost_bar_y,5,1,0,1,0,0,1);
    //header
    ctx.fillStyle = lred;
    dc.roundRectOptions(0,topmost_bar_y,sidebar_w,score_header_y-topmost_bar_y,5,1,0,0,0,0,1);
    ctx.fillStyle = dred;
    ctx.font = "18px Open Sans";
    ctx.fillText("RED TEAM",10,score_header_y-6);
    ctx.drawImage(red_token_icon,sidebar_w-50,score_header_y-18,20,15);
    ctx.fillStyle = gray;
    ctx.fillRect(0,score_header_y,sidebar_w,turn_header_y-score_header_y);
    ctx.fillStyle = white;
    ctx.font = "10px Open Sans";
    switch(game.multiplayer)
    {
      case MULTIPLAYER_LOCAL:
        if(g.player_turn == 1) ctx.fillText("RED'S TURN",10,turn_header_y-4);
        break;
      case MULTIPLAYER_AI:
      case MULTIPLAYER_TUT:
      case MULTIPLAYER_NET_CREATE:
        if(g.player_turn == 1) ctx.fillText("RED'S TURN (YOU)",10,turn_header_y-4);
        else                   ctx.fillText("YOU",10,turn_header_y-4);
        break;
      case MULTIPLAYER_NET_JOIN:
        if(g.player_turn == 1) ctx.fillText("RED'S TURN",10,turn_header_y-4);
        break;
    }

    //blue section body
    ctx.fillStyle = blue;
    dc.roundRectOptions(dc.width-sidebar_w,topmost_bar_y,sidebar_w,dc.height-topmost_bar_y,5,0,1,0,1,0,1);
    //header
    ctx.fillStyle = lblue;
    dc.roundRectOptions(dc.width-sidebar_w,topmost_bar_y,sidebar_w,score_header_y-topmost_bar_y,5,0,1,0,0,0,1);
    ctx.fillStyle = dblue;
    ctx.font = "18px Open Sans";
    ctx.fillText("BLUE TEAM",dc.width-sidebar_w+10,score_header_y-6);
    ctx.drawImage(blue_token_icon,dc.width-50,score_header_y-18,20,15);
    ctx.fillStyle = gray;
    ctx.fillRect(dc.width-sidebar_w,score_header_y,sidebar_w,turn_header_y-score_header_y);
    ctx.fillStyle = white;
    ctx.font = "10px Open Sans";
    switch(game.multiplayer)
    {
      case MULTIPLAYER_LOCAL:
        if(g.player_turn == 2) ctx.fillText("BLUE'S TURN",dc.width-sidebar_w+10,turn_header_y-4);
        break;
      case MULTIPLAYER_AI:
      case MULTIPLAYER_TUT:
      case MULTIPLAYER_NET_CREATE:
        if(g.player_turn == 2) ctx.fillText("BLUE'S TURN",dc.width-sidebar_w+10,turn_header_y-4);
        break;
      case MULTIPLAYER_NET_JOIN:
        if(g.player_turn == 2) ctx.fillText("BLUE'S TURN (YOU)",dc.width-sidebar_w+10,turn_header_y-4);
        else                   ctx.fillText("YOU",dc.width-sidebar_w+10,turn_header_y-4);
        break;
    }

    ctx.font = "12px Open Sans";
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";

    //hover data
    var hovering_valid = (hovering_card_i >= 0 && hovering_card_i < g.players[hovering_card_p-1].hand.length);
    var chosen_valid = (chosen_card_i >= 0 && chosen_card_i < g.players[g.player_turn-1].hand.length);
    var e_id;
    var e;
    if(hovering_valid || chosen_valid)
    {
      if(chosen_valid)        e_id = g.players[g.player_turn-1].hand[chosen_card_i];
      else if(hovering_valid) e_id = g.players[hovering_card_p-1].hand[hovering_card_i];
      e = g.events[e_id-1];
    }

    //nodes
    var goal_node = g.nodes[g.goal_node-1];
    var pulse = ((n_ticks/5)%10)/10;
    pulse = 1-pulse;
    pulse *= pulse;
    pulse *= pulse;
    pulse = 1-pulse;
    for(var i = 0; i < g.nodes.length; i++)
    {
      var n = g.nodes[i];
      if(e && (e.from_id == n.id || e.to_id == n.id))
        ctx.drawImage(hl_hex_icon,n.x,n.y,n.w,n.h);
      if(n == goal_node)
      {
        ctx.globalAlpha = pulse;
        ctx.globalAlpha *= ctx.globalAlpha;
        ctx.globalAlpha *= ctx.globalAlpha;
        ctx.globalAlpha = 1-ctx.globalAlpha;
        ctx.drawImage(hex_icon,n.x+n.w/2-n.w/2*pulse,n.y+n.h/2-n.h/2*pulse,n.w*pulse,n.h*pulse);
        ctx.globalAlpha = 1;
      }
      ctx.drawImage(n.img,n.x,n.y,n.w,n.h);
    }

    ctx.drawImage(g.fg_img,sidebar_w,topmost_bar_y+60,dc.width-sidebar_w*2,dc.height-topmost_bar_y-250);

    //draw hover arrow
    if(
      (hovering_valid && direction_viz_enabled) ||
      (chosen_valid &&
        (
          direction_viz_enabled ||
          turn_stage == TURN_SUMMARY ||
          turn_stage == TURN_ANIM_CARD
        )
      )
    )
    {
      var a = {x:e.start_x,y:e.start_y};
      var b = {x:e.end_x,y:e.end_y};
      var d = {x:b.x-a.x,y:b.y-a.y};
      var portion = 2;
      a.x += d.x/(portion*2);
      a.y += d.y/(portion*2);
      b.x -= d.x/(portion*2);
      b.y -= d.y/(portion*2);
      d.x /= portion;
      d.y /= portion;
      var len = Math.sqrt(d.x*d.x+d.y*d.y);
      var dir = Math.atan2(d.y,d.x);
      var s = Math.sin(n_ticks/10);

      ctx.strokeStyle = "#639B15";
      ctx.fillStyle = "#639B15";
      drawArrow(dc,a.x,a.y,b.x,b.y,10,15)
      ctx.strokeStyle = "#FFFFFF";
      ctx.fillStyle = "#FFFFFF";
      drawArrow(dc,a.x,a.y,b.x,b.y,6,15)
    }

    //transition
    if(transition_t)
    {
      var state = g.history[g.turn*2+(g.player_turn-1)-1];
      var delta = g.deltas[g.turn*2+(g.player_turn-1)-1];
      if(transition_t < TRANSITION_KEY_SHUFFLE)
      {
        var random_highlit_tok_i;
        var toks_at_last_target;
        var last_event = g.events[delta.event_id-1];
        //var last_event = g.events[g.last_event-1];
        var fromnode = g.nodes[last_event.from_id-1];
        if(delta.player_target == 1) target_toks = fromnode.disp_p1_tokens;
        else                         target_toks = fromnode.disp_p2_tokens;
        random_highlit_tok_i = Math.floor(Math.random()*target_toks);

        for(var i = 0; i < g.tokens.length; i++)
        {
          var t = g.tokens[i];
          if(t.disp_node_id == fromnode.id && t.player_id == delta.player_target)
          {
            if(random_highlit_tok_i == 0)
              ctx.drawImage(highlit_token_icon,t.x-2,t.y-2,t.w+4,t.h+4);
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
            ctx.drawImage(highlit_token_icon,t.x-2,t.y-2,t.w+4,t.h+4);
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
            if(t.disp_node_id == g.nodes[state.goal_node-1].id)
            {
                   if(t.player_id == 1) ctx.drawImage(g.players[0].token_img,lerp(t.x-2,p1_pts_bounds.x,progress*progress),lerp(t.y-2,p1_pts_bounds.y,1-(1-progress)*(1-progress)),t.w+4,t.h+4);
              else if(t.player_id == 2) ctx.drawImage(g.players[1].token_img,lerp(t.x-2,p2_pts_bounds.x,progress*progress),lerp(t.y-2,p2_pts_bounds.y,1-(1-progress)*(1-progress)),t.w+4,t.h+4);
            }
          }
        }
      }
      else if(transition_t < TRANSITION_KEY_MOVE_GOAL)
      {
      }
    }

    //tokens
    var event = g.events[g.players[g.player_turn-1].hand[chosen_card_i]-1];
    for(var i = 0; i < g.tokens.length; i++)
    {
      var t = g.tokens[i];
      if(turn_stage == TURN_ANIM_CARD ||
         turn_stage == TURN_SUMMARY   ||
        (turn_stage == TURN_CHOOSE_TARGET && direction_viz_enabled)
        )
      {
        if(t.disp_node_id == event.from_id && t.player_id == chosen_target_p)
          ctx.drawImage(highlit_token_icon,t.x-2,t.y-2,t.w+4,t.h+4);
      }
      ctx.drawImage(g.players[t.player_id-1].token_img,t.x,t.y,t.w,t.h);
    }

    //hand
    var player;
    player = g.players[0];
    ctx.fillStyle = dred;
    ctx.textAlign = "left";
    ctx.font = "14px Open Sans";
    ctx.fillText("X"+player.disp_pts,sidebar_w-30,score_header_y-7);
    ctx.fillStyle = "#000000";
    for(var i = 0; i < player.hand.length; i++)
    {
      if(g.player_turn == 1 && chosen_card_i == i)
        hover_card.draw(player,g.events[player.hand[chosen_card_i]-1]);
      else
        p1_cards[i].draw();
    }
    player = g.players[1];
    ctx.fillStyle = dblue;
    ctx.textAlign = "left";
    ctx.font = "14px Open Sans";
    ctx.fillText("X"+player.disp_pts,dc.width-30,score_header_y-7);
    ctx.fillStyle = "#000000";
    for(var i = 0; i < player.hand.length; i++)
    {
      if(g.player_turn == 2 && chosen_card_i == i)
        hover_card.draw(player,g.events[player.hand[chosen_card_i]-1]);
      else
        p2_cards[i].draw();
    }

    //info
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText("Turn: "+g.turn,dc.width/2,topmost_bar_y+20);
    player = g.players[g.player_turn-1];

    ctx.fillStyle = lblue;
    ctx.fillRect(sidebar_w,announce_y-30,dc.width-(sidebar_w*2),dc.height-(announce_y-30));
    ctx.drawImage(p_0_img,sidebar_w+20,dc.height-100,75,200);
    ctx.fillStyle = white;
    dc.fillRoundRect(announce_x,announce_y,announce_w,announce_h,5);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.font = "12px Open Sans";
    var yoff = 0;
    for(var i = 0; i < summary.length; i++)
    {
      for(var j = 0; j < summary[i].length; j++)
      {
        yoff += 20;
        ctx.fillText(summary[i][j],announce_x+10,announce_y+yoff);
      }
    }

    ctx.textAlign = "left";
    ctx.font = "12px Open Sans";
    ctx.fillStyle = gray;
    ctx.fillText("Current Zone: "+g.nodes[g.goal_node-1].title,sidebar_w+20,topmost_bar_y+15);
    ctx.textAlign = "right";
    var turns_left = 3-(g.turn%g.turns_per_goal_shift);
    ctx.fillText("Up Next ("+turns_left+" turns): "+g.nodes[g.next_goal_node-1].title,dc.width-sidebar_w-20,topmost_bar_y+15);

    if(input_state == INPUT_INTERRUPT)
    {
      ctx.fillStyle = "#C5F0F8";
      ctx.fillRect(sidebar_w,blurb_y-20,dc.width-(2*sidebar_w),dc.height-(blurb_y-20));

      ctx.fillStyle = white;
      dc.fillRoundRect(blurb_x,blurb_y,blurb_w,blurb_h,5);
      ctx.strokeSytle = lblue;
      ctx.lineWidth = 2;
      dc.strokeRoundRect(blurb_x,blurb_y,blurb_w,blurb_h,5);

      ctx.fillStyle = gray;
      ctx.fillRect(dc.width/2+90,dc.height-70,100,40);
      ctx.fillStyle = white;
      ctx.fillRect(dc.width/2+90,dc.height-80,100,40);
      ctx.fillStyle = "#000000";
      ctx.textAlign = "left";
      ctx.font = "30px Open Sans";
      ctx.fillText("Next",dc.width/2+100,dc.height-50);

      ctx.font = "12px Open Sans";
      interrupt_canvdom.draw(12,dc);
    }

    if(input_state == INPUT_TUTORIAL)
    {
      ctx.fillStyle = "#C5F0F8";
      ctx.fillRect(sidebar_w,blurb_y-20,dc.width-(2*sidebar_w),dc.height-(blurb_y-20));

      ctx.fillStyle = white;
      dc.fillRoundRect(blurb_x,blurb_y,blurb_w,blurb_h,5);
      ctx.strokeSytle = lblue;
      ctx.lineWidth = 2;
      dc.strokeRoundRect(blurb_x,blurb_y,blurb_w,blurb_h,5);

      ctx.fillStyle = gray;
      ctx.fillRect(dc.width/2+90,dc.height-70,100,40);
      ctx.fillStyle = white;
      ctx.fillRect(dc.width/2+90,dc.height-80,100,40);
      ctx.fillStyle = "#000000";
      ctx.textAlign = "left";
      ctx.font = "30px Open Sans";
      ctx.fillText("Next",dc.width/2+100,dc.height-50);

      ctx.font = "12px Open Sans";
      tutorial_canvdom.draw(12,dc);
    }

    disp_0 = lerp(disp_0,dest_0,0.1);
    disp_1 = lerp(disp_1,dest_1,0.1);
    disp_2 = lerp(disp_2,dest_2,0.1);
    disp_3 = lerp(disp_3,dest_3,0.1);
    if(input_state == INPUT_INTERRUPT)
    {
      dest_0 = 1;
      dest_1 = -.1;
      dest_2 = -.1;
      dest_3 = -.1;
    }
    else if(input_state == INPUT_TUTORIAL)
    {
      var c = tutorial_chars[tutorial_n];
      if(c == 0)
      {
        dest_0 = 1;
        dest_1 = -.1;
        dest_2 = -.1;
        dest_3 = -.1;
      }
      if(c == 1)
      {
        dest_0 = -.1;
        dest_1 = 1;
        dest_2 = -.1;
        dest_3 = -.1;
      }
      if(c == 2)
      {
        dest_0 = -.1;
        dest_1 = -.1;
        dest_2 = 1;
        dest_3 = -.1;
      }
      if(c == 3)
      {
        dest_0 = -.1;
        dest_1 = -.1;
        dest_2 = -.1;
        dest_3 = 1;
      }
    }
    else
    {
      dest_0 = -.1;
      dest_1 = -.1;
      dest_2 = -.1;
      dest_3 = -.1;
    }
    ctx.drawImage(p_0_img,sidebar_w+10,dc.height-h_0/2+(1-disp_0)*h_0/2,w_0,h_0);
    ctx.drawImage(p_1_img,sidebar_w+10,dc.height-h_1/2+(1-disp_1)*h_1/2,w_1,h_1);
    ctx.drawImage(p_2_img,sidebar_w+10,dc.height-h_2/2+(1-disp_2)*h_2/2,w_2,h_2);
    ctx.drawImage(p_3_img,sidebar_w+10,dc.height-h_3/2+(1-disp_3)*h_3/2,w_3,h_3);

    switch(turn_stage)
    {
      case TURN_WAIT_FOR_JOIN: break;
      case TURN_WAIT: break;
      case TURN_CHOOSE_CARD:
        if(g.turn == 0 && (game.multiplayer != MULTIPLAYER_TUT || input_state == INPUT_RESUME))
        {
          var y = dc.height-140 + Math.sin(n_ticks/10)*10;
          var w = 150;
          if(g.player_turn == 1)
            drawTip(sidebar_w+5,y,w,true,"Choose a card!");
          if(g.player_turn == 2 && (game.multiplayer == MULTIPLAYER_LOCAL || game.multiplayer == MULTIPLAYER_NET_JOIN))
            drawTip(dc.width-sidebar_w-w-5,y,w,false,"Choose a card!");
        }
        break;
      case TURN_CONFIRM_CARD: break;
      case TURN_CHOOSE_TARGET: break;
      case TURN_SUMMARY: break;
      case TURN_ANIM_CARD: break;
      case TURN_DONE:
        var w = 220;
        var h = 200;
        var offy = Math.sin(n_ticks/10);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        dc.fillRoundRect(0,topmost_bar_y,dc.width,dc.height-topmost_bar_y,5);
        ctx.fillStyle = white;
        dc.fillRoundRect(dc.width/2-(3*w/4),dc.height/2+offy,6*w/4,h+20,5);
             if(g.players[0].pts > g.players[1].pts) ctx.drawImage(red_win_img, dc.width/2-w/2,dc.height/2-h/2+offy,w,h);
        else if(g.players[1].pts > g.players[0].pts) ctx.drawImage(blue_win_img,dc.width/2-w/2,dc.height/2-h/2+offy,w,h);
        else                                         ctx.drawImage(tie_win_img, dc.width/2-w/2,dc.height/2-h/2+offy,w,h);
        ctx.fillStyle = black;
        ctx.font = "20px Open Sans";
        ctx.textAlign = "center";
        ctx.fillText("Final Score:",dc.width/2,dc.height/2+h/2+30+offy);
        ctx.textAlign = "right";
        ctx.fillText("RED TEAM: "+g.players[0].pts,dc.width/2-10,dc.height/2+h/2+55+offy);
        ctx.textAlign = "left";
        ctx.fillText("BLUE TEAM: "+g.players[1].pts,dc.width/2+10,dc.height/2+h/2+55+offy);

        ctx.fillStyle = dblue;
        ctx.fillRect(dc.width/2-w/2,dc.height/2+h-20+offy,w,30);
        ctx.fillStyle = lblue;
        ctx.fillRect(dc.width/2-w/2,dc.height/2+h-25+offy,w,30);
        ctx.fillStyle = white;
        ctx.textAlign = "center";
        ctx.fillText("Back to Games!",dc.width/2,dc.height/2+h-5+offy);
        break;
    }

    if(game.multiplayer == MULTIPLAYER_TUT)
    {
      if(tutorial_draws[tutorial_n]) tutorial_draws[tutorial_n]();
    }
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
    hoverer.detach();
    hoverer = undefined;
  };

  var drawTip = function(x,y,w,left,text)
  {
    var h = 25;
    y += Math.sin(n_ticks/10)*4;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.strokeStyle = "#888888";
    ctx.beginPath();
    if(left)
    {
      ctx.moveTo(x+1,y-h/2+5+2);
      ctx.lineTo(x-5,y+2);
      ctx.lineTo(x+1,y+h/2-5+2);
    }
    else
    {
      ctx.moveTo(x+w-1,y-h/2+5+2);
      ctx.lineTo(x+w+5,y+2);
      ctx.lineTo(x+w-1,y+h/2-5+2);
    }
    ctx.stroke();
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    if(left)
    {
      ctx.moveTo(x+1,y-h/2+5);
      ctx.lineTo(x-5,y);
      ctx.lineTo(x+1,y+h/2-5);
    }
    else
    {
      ctx.moveTo(x+w-1,y-h/2+5);
      ctx.lineTo(x+w+5,y);
      ctx.lineTo(x+w-1,y+h/2-5);
    }
    ctx.stroke();
    ctx.beginPath();
    if(left)
    {
      ctx.moveTo(x+1,y-h/2+5);
      ctx.lineTo(x-5,y);
      ctx.lineTo(x+1,y+h/2-5);
    }
    else
    {
      ctx.moveTo(x+w-1,y-h/2+5);
      ctx.lineTo(x+w+5,y);
      ctx.lineTo(x+w-1,y+h/2-5);
    }
    ctx.fill();
    ctx.strokeStyle = "#888888";
    dc.strokeRoundRect(x,y-h/2+2,w,h,5);
    dc.fillRoundRect(x,y-h/2,w,h,5);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#FFFFFF";
    dc.strokeRoundRect(x,y-h/2,w,h,5);
    if(left) ctx.textAlign = "left";
    else     ctx.textAlign = "right";
    ctx.fillStyle = "#444444";
    ctx.font = "20px Open Sans";
    if(left) ctx.fillText(text,x+4,y+9);
    else     ctx.fillText(text,x+w-4,y+9);
  }

  var interruptDoneDisplay = function ()
  {
    input_state = INPUT_RESUME;
    direction_viz_enabled = false;
  }
  var interruptDisplayMessage = function(lines)
  {
    input_state = INPUT_INTERRUPT;
    interrupt_canvdom.popDismissableMessage(lines,blurb_x+5,blurb_y,blurb_w-10,200,interruptDoneDisplay);
  }

  var tutorialDoneDisplay = function ()
  {
    if((!tutorial_tests[tutorial_n] || tutorial_tests[tutorial_n]()) && tutorial_tests.length > tutorial_n)
    {
      tutorial_n++;
      tutorialDisplayMessage();
    }
    else
    {
      input_state = INPUT_RESUME;
    }
  }
  var tutorialDisplayMessage = function()
  {
    input_state = INPUT_TUTORIAL;
    var line = tutorial_lines[tutorial_n];
    if(typeof line == "function") line = line();
    tutorial_canvdom.popDismissableMessage(textToLines(dc, "12px Open Sans", blurb_w-20, line),blurb_x+5,blurb_y,blurb_w-10,200,tutorialDoneDisplay);
  }

  var genPreSummary = function()
  {
    var player = g.players[g.player_turn-1];
    var target = g.players[chosen_target_p-1];
    var text;
    var actor = player.title;
    var actee = "their own";
    if(
      ((game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_AI) && g.player_turn == 1) ||
      ((game.multiplayer == MULTIPLAYER_NET_JOIN)                                         && g.player_turn == 2)
    )
    {
      actor = "You";
      if(g.player_turn == chosen_target_p)
        actee = "your own";
      else
        actee = target.title+"'s";
    }
    else
    {
      if(g.player_turn == chosen_target_p)
        actee = "their own";
      else if(
        ((game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_AI) && g.player_turn == 2) || //note reversal reversal
        ((game.multiplayer == MULTIPLAYER_NET_JOIN)                                         && g.player_turn == 1)
      )
        actee = "your";
      else
        actee = target.title+"'s";
    }

    text = actor+" played \""+g.events[player.hand[chosen_card_i]-1].title+"\" on "+actee+" "+g.noun+"!";
    summary = [textToLines(dc, "12px Open Sans", announce_w-10, text)];
  }

  var genPostSummary = function()
  {
    var delta = g.deltas[g.turn*2+(g.player_turn-1)-1];

    var player = g.players[delta.player_turn-1];
    var target = g.players[delta.player_target-1];
    var event = g.events[delta.event_id-1];

    var text;
    var actor = player.title;
    var actee = "their own";
    if(
      ((game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_AI) && g.player_turn == 2) || //note reversal
      ((game.multiplayer == MULTIPLAYER_NET_JOIN)                                         && g.player_turn == 1)
    )
    {
      actor = "You";
      if(g.player_turn != chosen_target_p) //note reversal
        actee = "your own";
      else
        actee = target.title+"'s";
    }
    else
    {
      if(g.player_turn != chosen_target_p) //note reversal
        actee = "their own";
      else if(
        ((game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_AI) && g.player_turn == 1) || //note reversal reversal
        ((game.multiplayer == MULTIPLAYER_NET_JOIN)                                         && g.player_turn == 2)
      )
        actee = "your";
      else
        actee = target.title+"'s";
    }

    text = actor+" played \""+event.title+"\" on "+actee+" "+g.noun+"!";

    summary = [textToLines(dc, "12px Open Sans", announce_w-10, text)];
    if(delta.pts_red_delta_n > 0 && delta.pts_blue_delta_n == 0)
      summary.push(textToLines(dc, "12px Open Sans", announce_w-10, "RED TEAM gained "+delta.pts_red_delta_n+" pts!"));
    else if(delta.pts_red_delta_n == 0 && delta.pts_blue_delta_n > 0)
      summary.push(textToLines(dc, "12px Open Sans", announce_w-10, "BLUE TEAM gained "+delta.pts_blue_delta_n+" pts!"));
    else if(delta.pts_red_delta_n > 0 && delta.pts_blue_delta_n > 0)
      summary.push(textToLines(dc, "12px Open Sans", announce_w-10, "RED TEAM gained "+delta.pts_red_delta_n+" pts, and BLUE TEAM gained "+delta.pts_blue_delta_n+" pts!"));

    var who = g.players[g.player_turn-1].title+"'s";
    if(
      ((game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_AI) && g.player_turn == 1) ||
      ((game.multiplayer == MULTIPLAYER_NET_JOIN)                                         && g.player_turn == 2)
    )
      who = "your";
    summary.push(textToLines(dc, "12px Open Sans", announce_w-10, "It's now "+who+" turn!"));
  }

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

    self.dx;
    self.dy;
    self.dw;
    self.dh;

    self.tick = function()
    {
      if(!self.dw || !self.dh)
      {
        self.dx = self.x;
        self.dy = self.y;
        self.dw = self.w;
        self.dh = self.h;
      }
      self.x = lerp(self.x,self.dx,0.1);
      self.y = lerp(self.y,self.dy,0.1);
      self.w = lerp(self.w,self.dw,0.1);
      self.h = lerp(self.h,self.dh,0.1);
    }

    self.draw = function()
    {
      var player = g.players[self.player-1];
      var event = g.events[player.hand[self.index]-1];

      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFAF7";
      dc.fillRoundRect(self.x,self.y,self.w,self.h+20,5);

      ctx.strokeStyle = player.color;
      ctx.lineWidth = 0.5;
      dc.strokeRoundRect(self.x,self.y,self.w,self.h+20,5);

      var icon_s = 35;
      var from_node = g.nodes[event.from_id-1];
      var to_node = g.nodes[event.to_id-1];
      if(g.turn < 3 || (g.turn == 3 && input_state == INPUT_INTERRUPT))
      {
        ctx.drawImage(from_node.icon_img,self.x+20,self.y+20,icon_s,icon_s);
        ctx.drawImage(to_node.icon_img,self.x+self.w-20-icon_s,self.y+20,icon_s,icon_s);
        ctx.drawImage(arrow_icon,self.x+self.w/2-(icon_s/4),self.y+20+icon_s/4,icon_s/2,icon_s/2);
      }
      else
      {
/*
        //rotating icons...
        var t = (n_ticks+self.index*100)/100;
        var x; var y;
        x = self.x+self.w/2-icon_s/2+Math.cos(t+Math.PI)*icon_s/2;
        y = self.y+20+Math.sin(t+Math.PI)*icon_s/2;
        ctx.drawImage(from_node.icon_img,x,y,icon_s,icon_s);
        x = self.x+self.w/2-icon_s/2+Math.cos(t)        *icon_s/2;
        y = self.y+20+Math.sin(t)        *icon_s/2;
        ctx.drawImage(to_node.icon_img,x,y,icon_s,icon_s);
*/
        if(self.index%2)
        {
          ctx.drawImage(from_node.icon_img,self.x+20,self.y+20,icon_s,icon_s);
          ctx.drawImage(to_node.icon_img,self.x+self.w-20-icon_s,self.y+20,icon_s,icon_s);
        }
        else
        {
          ctx.drawImage(to_node.icon_img,self.x+20,self.y+20,icon_s,icon_s);
          ctx.drawImage(from_node.icon_img,self.x+self.w-20-icon_s,self.y+20,icon_s,icon_s);
        }
      }

      ctx.fillStyle = "#000000";
      ctx.font = "10px Open Sans";
      ctx.fillText(event.title,self.x+self.w/2,self.y+70);
      ctx.fillText(event.info,self.x+self.w/2,self.y+95);
      ctx.font = "italic 10px Open Sans";
      ctx.fillText(event.flavor,self.x+self.w/2,self.y+85);
    }

    self.click = function(evt)
    {
      if(input_state != INPUT_RESUME) return;
      if(hit_ui) return;
      if(g.player_turn != self.player) return;
      if(g.player_turn == 1 && game.multiplayer == MULTIPLAYER_NET_JOIN) return;
      if(g.player_turn == 2 && (game.multiplayer == MULTIPLAYER_AI || game.multiplayer == MULTIPLAYER_TUT || game.multiplayer == MULTIPLAYER_NET_CREATE)) return;
      if(turn_stage == TURN_CONFIRM_CARD || turn_stage == TURN_CHOOSE_TARGET)
      {
        chosen_target_p = 0;
        turn_stage = TURN_CHOOSE_CARD;
      }
      if(turn_stage == TURN_CHOOSE_CARD)
      {
        chosen_card_i = self.index;
        hover_pulse_t = Math.PI;
        hover_card.x = self.x;
        hover_card.y = self.y;
        hover_card.dx = self.x;
        hover_card.dy = self.y-self.h;
        hover_card.t = 0;
        turn_stage = TURN_CONFIRM_CARD;
        hit_ui = true;
      }
    }

    self.hover = function(evt)
    {
      if(hovhit_ui) return;
      hovering_card_i = self.index;
      hovering_card_p = self.player;
    }
    self.unhover = function()
    {
      hovering_card_i = -1;
      hovering_card_p = 0;
    }
  }

  var HoverCard = function()
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.dx = 0;
    self.dy = 0;
    self.dw = 0;
    self.dh = 0;

    self.t = 0;

    //relative vals!
    self.play_x = 0;
    self.play_y = 0;
    self.play_w = 0;
    self.play_h = 0;
    self.target_1_x = 0;
    self.target_1_y = 0;
    self.target_1_w = 0;
    self.target_1_h = 0;
    self.target_2_x = 0;
    self.target_2_y = 0;
    self.target_2_w = 0;
    self.target_2_h = 0;

    self.set = function()
    {
      self.dx = self.x;
      self.dy = self.y;
      self.dw = self.w;
      self.dh = self.h;

      self.play_w = 80;
      self.play_h = 20;
      self.play_x = self.w/2-self.play_w/2;
      self.play_y = self.h-30;
      self.target_1_w = 40;
      self.target_1_h = 40;
      self.target_1_x = self.w/2-self.target_1_w-10;
      self.target_1_y = self.h/2+20;
      self.target_2_w = 40;
      self.target_2_h = 40;
      self.target_2_x = self.w/2+10;
      self.target_2_y = self.h/2+20;
    }

    self.tick = function()
    {
      self.t++;
      self.x = lerp(self.x,self.dx,0.1);
      self.y = lerp(self.y,self.dy+hover_pulse*5,0.1);
      self.w = lerp(self.w,self.dw,0.1);
      self.h = lerp(self.h,self.dh,0.1);

      if(self.w < 0)
      {
        self.w = Math.abs(self.w);
        self.dw = Math.abs(self.dw);
      }
    }

    self.draw = function(player,event)
    {
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFAF7";

      //background color
      dc.fillRoundRect(self.x,self.y,self.w,self.h,5);

      //element icons
      var icon_s = 35;
      var from_node = g.nodes[event.from_id-1];
      var to_node = g.nodes[event.to_id-1];
      if(g.turn < 3 || (g.turn == 3 && input_state == INPUT_INTERRUPT))
      {
        ctx.drawImage(from_node.icon_img,self.x+20,self.y+20,icon_s,icon_s);
        ctx.drawImage(to_node.icon_img,self.x+self.w-20-icon_s,self.y+20,icon_s,icon_s);
        ctx.drawImage(arrow_icon,self.x+self.w/2-(icon_s/4),self.y+20+icon_s/4,icon_s/2,icon_s/2);
      }
      else
      {
/*
        //rotating icons...
        var t = (n_ticks+6)/100;
        var x; var y;
        x = self.x+self.w/2-icon_s/2+Math.cos(t+Math.PI)*icon_s/2;
        y = self.y+20+Math.sin(t+Math.PI)*icon_s/2;
        ctx.drawImage(from_node.icon_img,x,y,icon_s,icon_s);
        x = self.x+self.w/2-icon_s/2+Math.cos(t)        *icon_s/2;
        y = self.y+20+Math.sin(t)        *icon_s/2;
        ctx.drawImage(to_node.icon_img,x,y,icon_s,icon_s);
*/
        if(chosen_card_i%2)
        {
          ctx.drawImage(from_node.icon_img,self.x+20,self.y+20,icon_s,icon_s);
          ctx.drawImage(to_node.icon_img,self.x+self.w-20-icon_s,self.y+20,icon_s,icon_s);
        }
        else
        {
          ctx.drawImage(to_node.icon_img,self.x+20,self.y+20,icon_s,icon_s);
          ctx.drawImage(from_node.icon_img,self.x+self.w-20-icon_s,self.y+20,icon_s,icon_s);
        }
      }

      //text (title/info/flavor)
      ctx.fillStyle = "#000000";
      ctx.font = "10px Open Sans";
      ctx.fillText(event.title,self.x+self.w/2,self.y+70);
      ctx.fillText(event.info,self.x+self.w/2,self.y+95);
      ctx.font = "italic 10px Open Sans";
      ctx.fillText(event.flavor,self.x+self.w/2,self.y+85);
      ctx.font = "10px Open Sans";

      if(turn_stage == TURN_CONFIRM_CARD || turn_stage == TURN_SUMMARY || turn_stage == TURN_ANIM_CARD)
      {
        //separator line
        if(g.player_turn == 1) ctx.strokeStyle = red;
        if(g.player_turn == 2) ctx.strokeStyle = blue;
        ctx.lineWidth = 0.5;
        dc.drawLine(self.x,self.y+self.h/2,self.x+self.w,self.y+self.h/2);
      }

      if(turn_stage == TURN_CONFIRM_CARD)
      {
        //play button (confirm)
        ctx.font = "italic 10px Open Sans";
        for(var i = 0; i < event.description_lines.length; i++)
        {
          ctx.fillText(event.description_lines[i],self.x+self.w/2,self.y+self.h/2+10*(i+2));
        }
        ctx.font = "10px Open Sans";
        if(g.player_turn == 1) ctx.fillStyle = red;
        if(g.player_turn == 2) ctx.fillStyle = blue;
        dc.fillRoundRect(self.x+self.play_x,self.y+self.play_y,self.play_w,self.play_h,10);
        ctx.fillStyle = white;
        ctx.fillText("SELECT CARD",self.x+self.play_x+self.play_w/2,self.y+self.play_y+self.play_h/2+4);
      }

      if(turn_stage == TURN_CHOOSE_TARGET || turn_stage == TURN_SUMMARY || turn_stage == TURN_ANIM_CARD)
      {
        //bottom-half bg
        if(chosen_target_p == 1) ctx.fillStyle = lred;
        else if(chosen_target_p == 2) ctx.fillStyle = lblue;
        if(chosen_target_p)
          ctx.fillRect(self.x,self.y+self.h/2,self.w,self.h/2);
        ctx.lineWidth = 1;

        //target (red)
          //stroke
        ctx.strokeStyle = red;
        dc.strokeRoundRect(self.x+self.target_1_x,self.y+self.target_1_y,self.target_1_w,self.target_1_h,5);
        if(chosen_target_p == 1)
        {
          //fill
          ctx.fillStyle = red;
          dc.fillRoundRect(self.x+self.target_1_x,self.y+self.target_1_y,self.target_1_w,self.target_1_h,5);
          //text (selected)
          ctx.fillStyle = white;
        }
        else ctx.fillStyle = red; //text (deselected)
          //text
        ctx.font = "10px Open Sans";
        ctx.fillText("RED",self.x+self.target_1_x+self.target_1_w/2,self.y+self.target_1_y+self.target_1_h-3);
          //icon
        ctx.drawImage(red_token_icon,self.x+self.target_1_x+self.target_1_w/2-8,self.y+self.target_1_y+8,16,12);

        //target (blue)
          //stroke
        ctx.strokeStyle = blue;
        dc.strokeRoundRect(self.x+self.target_2_x,self.y+self.target_2_y,self.target_2_w,self.target_2_h,5);
        if(chosen_target_p == 2)
        {
          //fill
          ctx.fillStyle = blue;
          dc.fillRoundRect(self.x+self.target_2_x,self.y+self.target_2_y,self.target_2_w,self.target_2_h,5);
          //text (selected)
          ctx.fillStyle = white;
        }
        else ctx.fillStyle = blue; //text (deselected)
          //text
        ctx.font = "10px Open Sans";
        ctx.fillText("BLUE",self.x+self.target_2_x+self.target_2_w/2,self.y+self.target_2_y+self.target_2_h-3);
          //icon
        ctx.drawImage(blue_token_icon,self.x+self.target_2_x+self.target_2_w/2-8,self.y+self.target_2_y+8,16,12);
      }

      if(turn_stage == TURN_CHOOSE_TARGET)
      {
        if(chosen_target_p == 1)
        {
          //play button (target)
          ctx.fillStyle = blue;
          dc.fillRoundRect(self.x+self.play_x,self.y+self.play_y,self.play_w,self.play_h,10);
          ctx.fillStyle = white;
          ctx.fillText("PLAY CARD",self.x+self.play_x+self.play_w/2,self.y+self.play_y+self.play_h/2+4);
        }
        if(chosen_target_p == 2)
        {
          //play button (target)
          ctx.fillStyle = red;
          dc.fillRoundRect(self.x+self.play_x,self.y+self.play_y,self.play_w,self.play_h,10);
          ctx.fillStyle = white;
          ctx.fillText("PLAY CARD",self.x+self.play_x+self.play_w/2,self.y+self.play_y+self.play_h/2+4);
        }
      }

      if(turn_stage == TURN_CHOOSE_TARGET)
      {
        //"choose carbon" banner
        ctx.textAlign = "center";
        ctx.fillStyle = gray;
        ctx.fillRect(self.x,self.y+self.h/2-10,self.w,20);
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2-10,self.y+self.h/2+5);
        ctx.lineTo(self.x+self.w/2,self.y+self.h/2+10+5);
        ctx.lineTo(self.x+self.w/2+10,self.y+self.h/2+5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = white;
        ctx.fillText("SELECT "+g.NOUN,self.x+self.w/2,self.y+self.h/2+5);
      }

      var thick = 5;
      ctx.lineWidth = thick;
      ctx.strokeStyle = white;
      dc.strokeRoundRect(self.x,self.y,self.w,self.h,5);
      ctx.lineWidth = 0.5;
      if(g.player_turn == 1) ctx.strokeStyle = red;
      if(g.player_turn == 2) ctx.strokeStyle = blue;
      dc.strokeRoundRect(self.x-thick/2,self.y-thick/2,self.w+thick,self.h+thick,5);
      ctx.lineWidth = 2;
    }

    self.click = function(evt)
    {
      if(input_state != INPUT_RESUME) return;
      if(hit_ui) return;
      if(
        turn_stage != TURN_CONFIRM_CARD &&
        turn_stage != TURN_CHOOSE_TARGET
        )
        return;
      hit_ui = true;

      if(turn_stage == TURN_CONFIRM_CARD)
      {
        if(ptWithin(evt.doX,evt.doY,self.x+self.play_x,self.y+self.play_y,self.play_w,self.play_h))
          turn_stage = TURN_CHOOSE_TARGET;
        else
        {
          hit_ui = false;
          abyss.click(evt);
        }
        return;
      }

      if(turn_stage == TURN_CHOOSE_TARGET)
      {
        if(ptWithin(evt.doX,evt.doY,self.x+self.target_1_x,self.y+self.target_1_y,self.target_1_w,self.target_1_h))
          chosen_target_p = 1;
        else if(ptWithin(evt.doX,evt.doY,self.x+self.target_2_x,self.y+self.target_2_y,self.target_2_w,self.target_2_h))
          chosen_target_p = 2;
        else if(chosen_target_p > 0 && ptWithin(evt.doX,evt.doY,self.x+self.play_x,self.y+self.play_y,self.play_w,self.play_h))
        {
          if(game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_NET_JOIN)
            cli.add(cli.id+" MOVE "+chosen_card_i+" "+chosen_target_p);
          genPreSummary();
          turn_stage = TURN_SUMMARY;
          hit_ui = false;
          ready_btn.hit({});
        }
        else
        {
          hit_ui = false;
          abyss.click(evt);
        }
        return;
      }
    }

    self.hovering = false;
    self.hover = function(evt)
    {
      if(turn_stage != TURN_CONFIRM_CARD && turn_stage != TURN_CHOOSE_TARGET) return;
      self.hovering = true;
      hovhit_ui = true;
    }
    self.unhover = function()
    {
      self.hovering = false;
    }
  }

};

