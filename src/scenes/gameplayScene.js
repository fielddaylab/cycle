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

  ENUM = 0;
  var CHAR_BABY  = ENUM; ENUM++;
  var CHAR_ANNOY = ENUM; ENUM++;
  var CHAR_AXE   = ENUM; ENUM++;
  var CHAR_GIRL  = ENUM; ENUM++;
  var CHAR_TALL  = ENUM; ENUM++;
  var CHAR_BOY   = ENUM; ENUM++;
  var CHAR_DAD   = ENUM; ENUM++;

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
  var hover_node;
  var click_node;
  var abyss;
  var hover_pulse_t;
  var hover_pulse;

  var ready_btn;
  var done_btn;
  var menu_btn;
  var interrupt_canvdom;
  var tutorial_canvdom;
  var char_disp;
  var blurb_x;
  var blurb_y;
  var blurb_w;
  var blurb_h;
  var announce_x;
  var announce_y;
  var announce_w;
  var announce_h;
  var summary;
  var summary_font;

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

  self.mySlog = new slog(game_type, 1);

  self.numGamesPlayed = 0;

  //logging functions
  self.log_card_play = function(player, human, from, to, goal, nextGoal, color, numMoved, p1change, p2change, arrows) {
    var log_data =
    {
      event:"CARD_PLAY",
      event_data_complex:{
        playerNum:player,
        isHuman:human,
        fromTile:from,
        toTile:to,
        goalTile:goal,
        nextGoalTile:nextGoal,
        colorMoved:color,
        numPiecesMoved:numMoved,
        p1_scoreChange:p1change,
        p2_scoreChange:p2change,
        arrowsShown:arrows
      }
    };
    
    log_data.event_data_complex = JSON.stringify(log_data.event_data_complex);
    self.mySlog.log(log_data);
    //console.log(log_data);
  }

  self.log_game_complete = function(mode, scores, winner, numGames) {
    var log_data =
    {
      event:"COMPLETE",
      event_data_complex:{
        gamemode:mode,
        endScores:scores,
        gameWinner:winner,
        numGamesPlayed:numGames
      }
    };
    
    log_data.event_data_complex = JSON.stringify(log_data.event_data_complex);
    self.mySlog.log(log_data);
    //console.log(log_data);
  }

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

    for(var i = 0; i < g.nodes.length; i++)
    {
      var n = g.nodes[i];
      (function(i){
        g.nodes[i].hover = function(evt) { hover_node = g.nodes[i]; click_node = undefined; };
        g.nodes[i].unhover = function(evt) { if(hover_node == g.nodes[i]) hover_node = undefined; };
        g.nodes[i].click = function(evt) { if(click_node == g.nodes[i]) click_node = undefined; else click_node = g.nodes[i]; };
      })(i);
      clicker.register(g.nodes[i]);
      hoverer.register(g.nodes[i]);
    }

    var w = sidebar_w-20;
    var gap = score_header_y+15;
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
      x:sidebar_w,
      y:score_header_y-7,
      w:10,
      h:10,
    };

    p2_pts_bounds = {
      x:dc.width-sidebar_w,
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

        //self.log_card_play(player, human, from, to, goal, nextGoal, color, p1change, p2change, arrows);
        var playedCard = g.events[g.players[g.player_turn-1].hand[chosen_card_i]-1];
        var isHumanPlayer = ((game.multiplayer != MULTIPLAYER_AI && game.multiplayer != MULTIPLAYER_TUT) || g.player_turn == 1);
        var pieceColor = (chosen_target_p == 1) ? "RED" : "BLUE";
        var startScoreRed = g.nodes[g.goal_node-1].p1_tokens;
        var startScoreBlue = g.nodes[g.goal_node-1].p2_tokens;
        var nodeStartRedTokens = g.nodes[playedCard.from_id-1].p1_tokens;
        var nodeStartBlueTokens = g.nodes[playedCard.from_id-1].p2_tokens;
        var numPiecesMoved;

        if (pieceColor == "RED" && nodeStartRedTokens > 0) {
          numPiecesMoved = 1;
        } else if (pieceColor == "BLUE" && nodeStartBlueTokens > 0) {
          numPiecesMoved = 1;
        } else {
          numPiecesMoved = 0;
        }

        setTimeout(function() //oh god...
        {
          playCard(g,chosen_card_i,chosen_target_p,sr);
          genPostSummary();
          chosen_card_i = -1;
          chosen_target_p = 0;
          transition_t = 1;

          var deltaRed = g.nodes[g.goal_node-1].p1_tokens - startScoreRed;
          var deltaBlue = g.nodes[g.goal_node-1].p2_tokens - startScoreBlue;
          var player = g.player_turn == 1 ? 2 : 1;

          self.log_card_play(player, isHumanPlayer, playedCard.from_id, playedCard.to_id, g.nodes[g.goal_node-1].id,
            g.nodes[g.next_goal_node-1].id, pieceColor, numPiecesMoved, deltaRed, deltaBlue, direction_viz_enabled);

          if(g.turn == game.turns) {
            var winner;
            var redPts = g.players[0].pts;
            var bluePts = g.players[1].pts;
            if (redPts > bluePts) {
              winner = "RED";
            } else if (bluePts > redPts) {
              winner = "BLUE";
            } else {
              winner = "TIE";
            }
            self.log_game_complete(game.multiplayer, {red:redPts, blue:bluePts}, winner, self.numGamesPlayed);
            turn_stage = TURN_DONE;
          }
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
        game.setScene(3);
        hit_ui = true;
      }
    );
    menu_btn = new ButtonBox(10,topmost_bar_y-40,60,30,
      function(evt)
      {
        cli.stop();
        game.setScene(3);
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
    char_disp = [];
    for(var i = 0; i < char_imgs.length; i++)
      char_disp[i] = 0;
    blurb_w = dc.width-2*sidebar_w-20-200;
    blurb_h = 100;
    blurb_x = dc.width-sidebar_w-10-blurb_w;
    blurb_y = dc.height-22-20-blurb_h;
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
    summary_font = "16px Open Sans";
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
    summary = [textToLines(dc, summary_font, announce_w-10, text)];

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

    tutorial_lines.push("Can I play??");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_ANNOY);
    tutorial_lines.push("Sure! Right now we're playing the "+g.noun+" cycle game.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_GIRL);
    tutorial_lines.push(g.Noun+" cycle? What's that?");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_ANNOY);
    if(game_type != WATER_GAME)
    {
      tutorial_lines.push("The "+g.noun+" cycle is all about how "+g.noun+" changes form and moves through the world!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
      tutorial_lines.push("What's a "+g.Noun+"?");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_ANNOY);
      tutorial_lines.push("The "+g.noun+"s are the little blue and red tokens. Francis is kicking my butt right now with her blue ones.");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_BOY);
    }
    else //water
    {
      tutorial_lines.push("The "+g.noun+" cycle is all about how "+g.noun+" molecules change form and move through the world!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
      tutorial_lines.push("What's a "+g.noun+" molecule?");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_ANNOY);
      tutorial_lines.push("The "+g.noun+" molecules are the little blue and red tokens. Francis is kicking my butt right now with her blue ones.");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_BOY);
    }
    tutorial_lines.push("Um...");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_ANNOY);
    tutorial_lines.push("Oh, you mean in real life?");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("Yep.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_ANNOY);
    if(game_type == CARBON_GAME)
    {
      tutorial_lines.push(g.Noun+" is an atom, and sometimes part of a molecule. It's pretty much everywhere!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
      tutorial_lines.push(g.Noun+" might seem like it's burning up or getting washed away, but it never actually disappears... it just changes from one form to another.");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
      tutorial_lines.push("Wow... so "+g.noun+" is in everything??");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_ANNOY);
      tutorial_lines.push("Well, not everything, but a lot of things- in the air we breathe, in our oceans, plants, animals, the atmosphere- even in us! It's all over!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
    }
    if(game_type == WATER_GAME)
    {
      tutorial_lines.push(g.Noun+" molecules are essential to life on earth! They can take on three different forms: a solid, liquid, or gas!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
      tutorial_lines.push("Wait... so "+g.noun+" doesn't always look like "+g.noun+"?");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_ANNOY);
      tutorial_lines.push("Well, it's not always LIQUID water. Sometimes water freezes into ice, and sometimes it turns to vapor in the atmosphere. You can find it prety much everywhere!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
    }
    if(game_type == NITROGEN_GAME)
    {
      tutorial_lines.push(g.Noun+" is an atom, and sometimes part of a molecule. It's pretty much everywhere!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
      tutorial_lines.push(g.Noun+" might seem like it's getting used up, but it never actually disappears... it just changes from one form to another.");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
      tutorial_lines.push("Wow... so "+g.noun+" is in everything??");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_ANNOY);
      tutorial_lines.push("Well, not everything, but a lot of things- in the air we breathe, in our oceans, plants, animals, the atmosphere- even in us! It's all over!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
    }
    tutorial_lines.push("Yep, everywhere except my goal square...");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("What's a goal square?");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_ANNOY);
    tutorial_lines.push("Oh, that's part of the game. I'll show you!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("It's a two person game, between the red and the blue team.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("Here's red");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(function()
    {
      var y = 140 + Math.sin(n_ticks/10)*10;
      var w = 105;
      drawTip(sidebar_w+5,y,w,true,"RED TEAM");
    });
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("and here's blue.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(function()
    {
      var y = 140 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(dc.width-sidebar_w-w-5,y,w,false,"BLUE TEAM");
    });
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("The zones on the game board represent different parts of our environment. There is "+g.noun+" scattered all over the board- see those red and blue tokens?");
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
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("You play cards to move tokens -which represent "+g.noun+"- from one part of the environment to another. As this happens, the "+g.noun+" changes form, but it never actually goes away.");
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
    tutorial_chars.push(CHAR_BOY);
    if(game_type == CARBON_GAME)
    {
      tutorial_lines.push("Like when we burn "+g.noun+" as fossil fuel, the carbon doesn't disappear... it just gets released up into the atmosphere!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_BOY);
    }
    if(game_type == NITROGEN_GAME)
    {
      tutorial_lines.push("Like when plants die, the "+g.noun+" doesn't disappear... it just returns to the soil as the plant decays.");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_BOY);
    }
    if(game_type == WATER_GAME)
    {
      tutorial_lines.push("Like when "+g.noun+" evaporates, it doesn't disappear... it just becomes vapor in the air.");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_BOY);
    }
    tutorial_lines.push("Ooh... so the cards show how "+g.noun+" moves through the world!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_ANNOY);
    tutorial_lines.push("Exactly!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_GIRL);
    tutorial_lines.push("So how do I win??!!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_ANNOY);
    tutorial_lines.push("The goal is to get your "+g.noun+" into the goal zone- the flashing tile.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(function()
    {
      var y = g.nodes[g.goal_node-1].y+g.nodes[g.goal_node-1].h/2 + Math.sin(n_ticks/10)*10;
      var w = 115;
      drawTip(g.nodes[g.goal_node-1].x+g.nodes[g.goal_node-1].w,y,w,true,"GOAL ZONE");
    });
    tutorial_chars.push(CHAR_GIRL);
    tutorial_lines.push("After both players have taken a turn, each player gets points for each of their "+g.noun+"s in the goal zone.");
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
    tutorial_chars.push(CHAR_GIRL);
    tutorial_lines.push("Yeah, that's the part I'm having trouble with.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("You can apply your card to either team's "+g.noun+". Maybe you'll want to move your "+g.noun+" into the goal zone, or maybe you'll want to move your opponent's "+g.noun+" out of it.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_GIRL);
    tutorial_lines.push("Whoever's got the most points at the end wins!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("Oh, and look out... Francis is sneakier than she looks.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("Got it! Let's play!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_ANNOY);
    tutorial_lines.push("Ok, I'll be blue and you can be red. Why don't you pick a card and see what happens?");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_GIRL);
    tutorial_lines.push("Go for it, red! Pick a card!");
    tutorial_tests.push(function(){ return g.player_turn == 2; });
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push(function() { var delta = g.deltas[g.turn*2+(g.player_turn-1)-1]; var last_event = g.events[delta.event_id-1]; return "Cool, so you played \""+last_event.title+"\" to move "+g.noun+" to \""+g.nodes[last_event.to_id-1].title+"\"."; });
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_GIRL);
    tutorial_lines.push("That card is now discarded, and you'll draw a new card at the beginning of your next turn.");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_BOY);
    tutorial_lines.push("Now I'll go");
    tutorial_tests.push(function(){ return g.player_turn == 1; });
    tutorial_acts.push(function(){ ready_btn.click({});});
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_GIRL);
    tutorial_lines.push(function() { var delta = g.deltas[g.turn*2+(g.player_turn-1)-1]; var last_event = g.events[delta.event_id-1]; return "Ok, I played \""+last_event.title+"\" to move "+g.noun+" to \""+g.nodes[last_event.to_id-1].title+"\"."; });
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_GIRL);
    if(game_type == CARBON_GAME)
    {
      tutorial_lines.push("See how different actions make "+g.noun+" move throughout our environment? "+g.Noun+" affects just about every part of our planet!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
    }
    if(game_type == NITROGEN_GAME)
    {
      tutorial_lines.push("See how different actions make "+g.noun+" move throughout our environment? "+g.Noun+" affects just about every stage of agriculture (and more)!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
    }
    if(game_type == WATER_GAME)
    {
      tutorial_lines.push("See how different actions make "+g.noun+" move throughout our environment? "+g.Noun+" is constantly cycling through the air, the land, and the sea!");
      tutorial_tests.push(false);
      tutorial_acts.push(false);
      tutorial_draws.push(false);
      tutorial_chars.push(CHAR_GIRL);
    }
    tutorial_lines.push("Wow! Cool!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_ANNOY);
    tutorial_lines.push("In this game, the goal zone moves every three turns, so plan ahead! It's your turn!");
    tutorial_tests.push(false);
    tutorial_acts.push(false);
    tutorial_draws.push(false);
    tutorial_chars.push(CHAR_GIRL);

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
              summary = [textToLines(dc, summary_font, announce_w-10, "You are "+g.players[0].title+", and it's your turn!")];
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
    var bg_img_x = sidebar_w;
    var bg_img_y = topmost_bar_y+60;
    var bg_img_w = dc.width-sidebar_w*2;
    var bg_img_h = dc.height-topmost_bar_y-250;

    //free space to allow card height
    //ctx.fillStyle = gray;
    //ctx.fillRect(0,0,dc.width,topmost_bar_y);
    ctx.fillStyle = white;
    dc.roundRectOptions(0,topmost_bar_y,dc.width,dc.height-topmost_bar_y,5,1,1,1,1,0,1);
    ctx.drawImage(g.bg_img,bg_img_x,bg_img_y,bg_img_w,bg_img_h);

    ctx.fillStyle = "#FFFFFF";;
    dc.fillRoundRect(menu_btn.x,menu_btn.y,menu_btn.w,menu_btn.h,5);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.font = "12px Open Sans";
    ctx.fillText("MENU",menu_btn.x+10,menu_btn.y+menu_btn.h-10);

    //red section body
    ctx.fillStyle = red;
    dc.roundRectOptions(0,topmost_bar_y,sidebar_w,dc.height-topmost_bar_y,5,1,0,1,0,0,1);
    dc.fillCircle(sidebar_w,(topmost_bar_y+score_header_y)/2.,(score_header_y-topmost_bar_y)/2.);
    ctx.fillStyle = white;
    ctx.font = "18px Open Sans";
    ctx.textAlign = "left";
    ctx.fillText("RED TEAM",10,score_header_y-6);
    ctx.textAlign = "left";
    ctx.drawImage(red_token_icon,sidebar_w-20+10,score_header_y-22,20,15);
    ctx.fillStyle = white;
    ctx.font = "10px Open Sans";
    var s = 70;
    var yoff = 30;
    ctx.textAlign = "center";
    if(g.player_turn == 1)
    {
      switch(game.multiplayer)
      {
        case MULTIPLAYER_AI:
        case MULTIPLAYER_TUT:
        case MULTIPLAYER_NET_CREATE:
          ctx.fillStyle = red;
          dc.fillRoundRect(dc.width/2-s/2,topmost_bar_y/2-10+yoff,s,20,5);
          ctx.beginPath();ctx.moveTo(dc.width/2-s/2-10,topmost_bar_y/2+yoff);ctx.lineTo(dc.width/2-s/2+5,10+yoff);ctx.lineTo(dc.width/2-s/2+5,topmost_bar_y-10+yoff);ctx.fill();
          ctx.fillStyle = white;
          ctx.fillText("YOUR TURN",dc.width/2,topmost_bar_y/2+6+yoff);
          break;
        case MULTIPLAYER_LOCAL:
        case MULTIPLAYER_NET_JOIN:
          ctx.fillStyle = red;
          dc.fillRoundRect(dc.width/2-s/2,topmost_bar_y/2-10+yoff,s,20,5);
          ctx.beginPath();ctx.moveTo(dc.width/2-s/2-10,topmost_bar_y/2+yoff);ctx.lineTo(dc.width/2-s/2+5,10+yoff);ctx.lineTo(dc.width/2-s/2+5,topmost_bar_y-10+yoff);ctx.fill();
          ctx.fillStyle = white;
          ctx.fillText("RED'S TURN",dc.width/2,topmost_bar_y/2+6+yoff);
          break;
      }
    }

    //blue section body
    ctx.fillStyle = blue;
    dc.roundRectOptions(dc.width-sidebar_w,topmost_bar_y,sidebar_w,dc.height-topmost_bar_y,5,0,1,0,1,0,1);
    dc.fillCircle(dc.width-sidebar_w,(topmost_bar_y+score_header_y)/2.,(score_header_y-topmost_bar_y)/2.);
    ctx.fillStyle = white;
    ctx.font = "18px Open Sans";
    ctx.textAlign = "right";
    ctx.fillText("BLUE TEAM",dc.width-10,score_header_y-6);
    ctx.textAlign = "left";
    ctx.drawImage(blue_token_icon,dc.width-sidebar_w-10,score_header_y-22,20,15);
    ctx.fillStyle = white;
    ctx.font = "10px Open Sans";
    ctx.textAlign = "center";
    if(g.player_turn == 2)
    {
      switch(game.multiplayer)
      {
        case MULTIPLAYER_LOCAL:
        case MULTIPLAYER_AI:
        case MULTIPLAYER_TUT:
        case MULTIPLAYER_NET_CREATE:
          ctx.fillStyle = blue;
          dc.fillRoundRect(dc.width/2-s/2,topmost_bar_y/2-10+yoff,s,20,5);
          ctx.beginPath();ctx.moveTo(dc.width/2+s/2+10,topmost_bar_y/2+yoff);ctx.lineTo(dc.width/2+s/2-5,10+yoff);ctx.lineTo(dc.width/2+s/2-5,topmost_bar_y-10+yoff);ctx.fill();
          ctx.fillStyle = white;
          ctx.fillText("BLUE'S TURN",dc.width/2,topmost_bar_y/2+6+yoff);
          break;
        case MULTIPLAYER_NET_JOIN:
          ctx.fillStyle = blue;
          dc.fillRoundRect(dc.width/2-s/2,topmost_bar_y/2-10+yoff,s,20,5);
          ctx.beginPath();ctx.moveTo(dc.width/2+s/2+10,topmost_bar_y/2+yoff);ctx.lineTo(dc.width/2+s/2-5,10+yoff);ctx.lineTo(dc.width/2+s/2-5,topmost_bar_y-10+yoff);ctx.fill();
          ctx.fillStyle = white;
          ctx.fillText("YOUR TURN",dc.width/2,topmost_bar_y/2+6+yoff);
          break;
      }
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

      // draw hex manually
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(n.x+n.w*0.015,n.y+n.h*0.5 );
      ctx.lineTo(n.x+n.w*0.26,n.y+n.h*0.0875);
      ctx.lineTo(n.x+n.w*0.74,n.y+n.h*0.0875);
      ctx.lineTo(n.x+n.w*0.985,n.y+n.h*0.5 );
      ctx.lineTo(n.x+n.w*0.74,n.y+n.h*0.9125);
      ctx.lineTo(n.x+n.w*0.26,n.y+n.h*0.9125);
      ctx.closePath();
      ctx.stroke();

      // draw hex from image
      //ctx.drawImage(n.img,n.x,n.y,n.w,n.h);
    }

    ctx.drawImage(g.fg_img,bg_img_x,bg_img_y,bg_img_w,bg_img_h);

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

    for(var i = 0; i < g.nodes.length; i++)
    {
      var n = g.nodes[i];
      ctx.textAlign = "center";
      if(n == click_node || n == hover_node)
      {
        dc.outlineText(n.TITLE,n.x+n.w/2,n.y+n.h/2+10+Math.sin(n_ticks/9)*5);
      }
    }

    //hand
    var player;
    player = g.players[0];
    ctx.fillStyle = white;
    ctx.textAlign = "right";
    ctx.font = "14px Open Sans";
    ctx.fillText(player.disp_pts,sidebar_w-12,score_header_y-10);
    ctx.fillStyle = "#000000";
    for(var i = 0; i < player.hand.length; i++)
    {
      if(g.player_turn == 1 && chosen_card_i == i)
        hover_card.draw(player,g.events[player.hand[chosen_card_i]-1]);
      else
        p1_cards[i].draw();
    }
    player = g.players[1];
    ctx.fillStyle = white;
    ctx.textAlign = "left";
    ctx.font = "14px Open Sans";
    ctx.fillText(player.disp_pts,dc.width-sidebar_w+12,score_header_y-10);
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
    ctx.fillText("TURN: "+g.turn,dc.width/2,topmost_bar_y+24);
    player = g.players[g.player_turn-1];

    if (input_state != INPUT_TUTORIAL) {
      ctx.drawImage(grad_img,sidebar_w,announce_y-30,dc.width-(sidebar_w*2),dc.height-(announce_y-30));
      ctx.drawImage(char_imgs[CHAR_TALL],sidebar_w-50,dc.height-150-50,200,400);
      ctx.fillStyle = white;
      dc.fillRoundRect(announce_x,announce_y,announce_w,announce_h,5);
      ctx.fillStyle = "#000000";
      ctx.textAlign = "left";
      ctx.font = summary_font;
      var yoff = 0;
      for(var i = 0; i < summary.length; i++)
      {
        for(var j = 0; j < summary[i].length; j++)
        {
          yoff += 20;
          ctx.fillText(summary[i][j],announce_x+10,announce_y+yoff);
        }
      }
    }

    ctx.textAlign = "left";
    ctx.font = "12px Open Sans";
    ctx.fillStyle = gray;
    ctx.fillText("CURRENT ZONE: "+g.nodes[g.goal_node-1].TITLE,sidebar_w+24,topmost_bar_y+15);
    ctx.textAlign = "right";
    var turns_left = 3-(g.turn%g.turns_per_goal_shift);
    ctx.fillText("IN "+turns_left+" TURNS: "+g.nodes[g.next_goal_node-1].TITLE,dc.width-sidebar_w-24,topmost_bar_y+15);

    if(input_state == INPUT_INTERRUPT)
    {
      ctx.drawImage(grad_img,sidebar_w,blurb_y-20,dc.width-(2*sidebar_w),dc.height-(blurb_y-20));
      ctx.fillStyle = white;
      dc.fillRoundRect(blurb_x,blurb_y,blurb_w,blurb_h,5);

      var w = 127/2;
      var h = 45/2;
      ctx.drawImage(next_button_img,dc.width-sidebar_w-w-10,dc.height-h-10,w,h);

      ctx.font = "12px Open Sans";
      interrupt_canvdom.draw(12,dc);
    }

    if(input_state == INPUT_TUTORIAL)
    {
      ctx.drawImage(grad_img,sidebar_w,blurb_y-20,dc.width-(2*sidebar_w),dc.height-(blurb_y-20));
      ctx.fillStyle = white;
      dc.fillRoundRect(blurb_x,blurb_y,blurb_w,blurb_h,5);

      var w = 127/2;
      var h = 45/2;
      ctx.drawImage(next_button_img,dc.width-sidebar_w-w-10,dc.height-h-10,w,h);

      ctx.font = "12px Open Sans";
      tutorial_canvdom.draw(12,dc);
    }

    if(input_state == INPUT_INTERRUPT)
    {
      for(var i = 0; i < char_disp.length; i++)
      {
        if(i == CHAR_TALL) char_disp[i] = lerp(char_disp[i],1,0.1);
        else               char_disp[i] = lerp(char_disp[i],-.1,0.1);
      }
    }
    else if(input_state == INPUT_TUTORIAL)
    {
      var c = tutorial_chars[tutorial_n];
      for(var i = 0; i < char_disp.length; i++)
      {
        if(i == c) char_disp[i] = lerp(char_disp[i],1,0.1);
        else       char_disp[i] = lerp(char_disp[i],-.1,0.1);
      }
    }
    else
    {
      for(var i = 0; i < char_disp.length; i++)
        char_disp[i] = lerp(char_disp[i],-.1,0.1);
    }

    var w = 200;
    var h = 400;
    for(var i = 0; i < char_imgs.length; i++)
      ctx.drawImage(char_imgs[i], sidebar_w, dc.height-h/2+(1-char_disp[i])*h/2, w, h);

    switch(turn_stage)
    {
      case TURN_WAIT_FOR_JOIN: break;
      case TURN_WAIT: break;
      case TURN_CHOOSE_CARD:
        if(g.turn == 0 && (game.multiplayer != MULTIPLAYER_TUT || input_state == INPUT_RESUME))
        {
          var y = dc.height-140 + Math.sin(n_ticks/10)*10;
          var w = 170;
          if(g.player_turn == 1)
            drawTip(sidebar_w+5,y,w,true,"CHOOSE A CARD!");
          if(g.player_turn == 2 && (game.multiplayer == MULTIPLAYER_LOCAL || game.multiplayer == MULTIPLAYER_NET_JOIN))
            drawTip(dc.width-sidebar_w-w-5,y,w,false,"CHOOSE A CARD!");
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
    summary = [textToLines(dc, summary_font, announce_w-10, text)];
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

    summary = [textToLines(dc, summary_font, announce_w-10, text)];
    if(delta.pts_red_delta_n > 0 && delta.pts_blue_delta_n == 0)
      summary.push(textToLines(dc, summary_font, announce_w-10, "RED TEAM gained "+delta.pts_red_delta_n+" pts!"));
    else if(delta.pts_red_delta_n == 0 && delta.pts_blue_delta_n > 0)
      summary.push(textToLines(dc, summary_font, announce_w-10, "BLUE TEAM gained "+delta.pts_blue_delta_n+" pts!"));
    else if(delta.pts_red_delta_n > 0 && delta.pts_blue_delta_n > 0)
      summary.push(textToLines(dc, summary_font, announce_w-10, "RED TEAM gained "+delta.pts_red_delta_n+" pts, and BLUE TEAM gained "+delta.pts_blue_delta_n+" pts!"));

    var who = g.players[g.player_turn-1].title+"'s";
    if(
      ((game.multiplayer == MULTIPLAYER_NET_CREATE || game.multiplayer == MULTIPLAYER_AI) && g.player_turn == 1) ||
      ((game.multiplayer == MULTIPLAYER_NET_JOIN)                                         && g.player_turn == 2)
    )
      who = "your";
    summary.push(textToLines(dc, summary_font, announce_w-10, "It's now "+who+" turn!"));
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
        ctx.drawImage(arrow_icon,self.x+self.w/2-(icon_s/4),self.y+20+icon_s/3,icon_s/2,icon_s/3);
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
        ctx.drawImage(arrow_icon,self.x+self.w/2-(icon_s/4),self.y+20+icon_s/3,icon_s/2,icon_s/3);
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

