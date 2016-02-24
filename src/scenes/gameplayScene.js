var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var clicker;

  var nodes;
  var edges;
  var events;

  var players;
  var tokens;

  var deck;
  var discard;
  var turn;
  var player_turn;

  //ui only
  var cards;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    constructGame(GameTemplate);

    var card;
    cards = [];
    var size = ((dc.width-10)/players[0].hand.length)-10;
    for(var i = 0; i < players[0].hand.length; i++)
    {
      card = new Card();
      card.index = i;

      card.x = 10+i*(size+10);
      card.y = dc.height-10-size;
      card.w = size;
      card.h = size;

      cards.push(card);
      clicker.register(card);
    }
  };

  self.tick = function()
  {
    clicker.flush();

    var token;
    for(var i = 0; i < tokens.length; i++)
    {
      token = tokens[i];
      token.x = lerp(token.x,token.target_x,0.1);
      token.y = lerp(token.y,token.target_y,0.1);
    }
  };

  self.draw = function()
  {
    dc.context.fillStyle = "#000000";
    dc.context.strokeStyle = "#000000";

    //edges
    dc.context.strokeStyle = "#000000";
    for(var i = 0; i < edges.length; i++)
    {
      dc.context.beginPath();
      dc.context.moveTo(edges[i].start_x,edges[i].start_y);
      dc.context.lineTo(edges[i].end_x,edges[i].end_y);
      dc.context.stroke();
    }
    //nodes
    for(var i = 0; i < nodes.length; i++)
      dc.context.drawImage(nodes[i].img,nodes[i].x,nodes[i].y,nodes[i].w,nodes[i].h);
    //tokens
    for(var i = 0; i < tokens.length; i++)
      dc.context.drawImage(players[tokens[i].player_id-1].token_img,tokens[i].x,tokens[i].y,tokens[i].w,tokens[i].h);
    //hand
    var player = players[player_turn-1];
    for(var i = 0; i < player.hand.length; i++)
    {
      var event = events[player.hand[i]-1];
      dc.context.strokeRect(cards[i].x,cards[i].y,cards[i].w,cards[i].h);
      dc.context.fillText(event.title,cards[i].x+10,cards[i].y+20);
    }

    //info
    dc.context.fillText("Turn: "+turn,10,30);
    dc.context.fillText("Player: "+player_turn,10,50);
  };

  self.cleanup = function()
  {

  };

  var playCard = function(index)
  {
    var event = events[players[player_turn-1].hand[index]-1];
    var edge = edges[event.edge_id-1];
    var eligibletoks = [];
    for(var i = 0; i < tokens.length; i++)
    {
      if(tokens[i].node_id == edge.from_id) eligibletoks.push(i);
    }
    for(var i = 0; i < edge.amt && eligibletoks.length > 0; i++)
    {
      var ei = Math.floor(Math.random()*eligibletoks.length);
      var t = eligibletoks[ei];
      tokens[t].node_id = edge.to_id;
      tokens[t].transitions++;

      tokens[t].target_x = nodes[tokens[t].node_id-1].x+Math.random()*(nodes[tokens[t].node_id-1].w-tokens[t].w);
      tokens[t].target_y = nodes[tokens[t].node_id-1].y+Math.random()*(nodes[tokens[t].node_id-1].h-tokens[t].h);

      eligibletoks.splice(ei,1);
    }

    players[player_turn-1].hand.splice(index,1);
    players[player_turn-1].hand.push(deck[0]);
    deck.splice(0,1);

    player_turn = (player_turn%players.length)+1;
    if(player_turn == 1) turn++;
  }

  var constructGame = function(game_data)
  {
    var player;
    var node;
    var edge;
    var event;

    var token;

    players = [];
    for(var i = 0; i < game_data.players.length; i++)
    {
      player = new Player();
      player.id = i+1;
      player.title = game_data.players[i].title;

      if(i == 0) player.token_img = red_circle_icon;
      if(i == 1) player.token_img = blue_circle_icon;

      players.push(player);
    }

    nodes = [];
    for(var i = 0; i < game_data.nodes.length; i++)
    {
      node = new Node();
      node.id = i+1;
      node.title = game_data.nodes[i].title;

      node.w = dc.width*game_data.nodes[i].w;
      node.h = dc.height*game_data.nodes[i].h;
      node.mid_x = dc.width*game_data.nodes[i].x;
      node.mid_y = dc.height*game_data.nodes[i].y;
      node.x = node.mid_x-node.w/2;
      node.y = node.mid_y-node.h/2;

      node.img = circle_icon;

      //inject id into edge data
      for(var j = 0; j < game_data.edges.length; j++)
      {
        if(game_data.edges[j].from == node.title) game_data.edges[j].from_id = node.id;
        if(game_data.edges[j].to   == node.title) game_data.edges[j].to_id   = node.id;
      }

      nodes.push(node);
    }

    edges = [];
    for(var i = 0; i < game_data.edges.length; i++)
    {
      edge = new Edge();
      edge.id = i+1;
      edge.title   = game_data.edges[i].title;
      edge.from_id = game_data.edges[i].from_id;
      edge.to_id   = game_data.edges[i].to_id;
      edge.amt     = game_data.edges[i].amt;

      edge.start_x = nodes[edge.from_id-1].mid_x;
      edge.start_y = nodes[edge.from_id-1].mid_y;
      edge.end_x = nodes[edge.to_id-1].mid_x;
      edge.end_y = nodes[edge.to_id-1].mid_y;
      edge.mid_x = (edge.start_x+edge.end_x)/2;
      edge.mid_y = (edge.start_y+edge.end_y)/2;

      //inject id into event data
      for(var j = 0; j < game_data.events.length; j++)
      {
        if(game_data.events[j].edge == edge.title) game_data.events[j].edge_id = edge.id;
      }

      edges.push(edge);
    }

    events = [];
    for(var i = 0; i < game_data.events.length; i++)
    {
      event = new Event();
      event.id = i+1;
      event.title = game_data.events[i].title;
      event.edge_id = game_data.events[i].edge_id;

      events.push(event);
    }

    tokens = [];
    for(var i = 0; i < 10; i++)
    {
      token = new Token();
      token.id = i+1;
      token.player_id = (i%players.length)+1;
      token.node_id = Math.floor(Math.random()*nodes.length)+1;
      token.transitions = 0;

      token.w = dc.width*0.01;
      token.h = dc.height*0.01;
      token.x = nodes[token.node_id-1].x+Math.random()*(nodes[token.node_id-1].w-token.w);
      token.y = nodes[token.node_id-1].y+Math.random()*(nodes[token.node_id-1].h-token.h);

      token.target_x = token.x;
      token.target_y = token.y;

      tokens.push(token);
    }

    deck = [];
    discard = [];
    var tmp;
    var swap;
    for(var i = 0; i < game_data.deck; i++)
      deck.push((i%events.length)+1);
    //shuffle
    for(var i = 0; i < deck.length-1; i++)
    {
      swap = i+Math.floor((Math.random()*(events.length-i)));
      tmp = deck[i];
      deck[i] = deck[swap];
      deck[swap] = tmp;
    }
    //deal
    for(var i = 0; i < players.length; i++)
    {
      players[i].hand = [];
      for(var j = 0; j < game_data.hand; j++)
        { players[i].hand.push(deck[0]); deck.splice(0,1); }
    }

    turn = 0;
    player_turn = 1;
  }

  var Node = function()
  {
    var self = this;

    self.x;
    self.y;
    self.w;
    self.h;
    self.mid_x;
    self.mid_y;

    self.img;

    self.id = 0;
    self.title = "Node";
  }

  var Edge = function()
  {
    var self = this;

    self.start_x;
    self.start_y;
    self.mid_x;
    self.mid_y;
    self.end_x;
    self.end_y;

    self.id = 0;
    self.title = "Edge";
    self.from_id = 0;
    self.to_id = 0;
    self.amt = 0;
  }

  var Event = function()
  {
    var self = this;

    self.id = 0;
    self.title = "Event";
    self.edge_id = 0;
  }

  var Token = function()
  {
    var self = this;

    self.x;
    self.y;
    self.w;
    self.h;

    self.target_x;
    self.target_y;

    self.id = 0;
    self.player_id = 0;
    self.node_id = 0;
    self.transitions = 0;
  }

  var Player = function()
  {
    var self = this;

    self.token_img;

    self.id = 0;
    self.title = "Player";

    self.hand = [];
  }

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
      playCard(self.index);
    }
  }

  var circle_icon = GenIcon();
  circle_icon.context.fillStyle = "#555555";
  circle_icon.context.beginPath();
  circle_icon.context.arc(circle_icon.width/2,circle_icon.height/2,circle_icon.width/2,0,2*Math.PI);
  circle_icon.context.fill();

  var red_circle_icon = GenIcon();
  red_circle_icon.context.fillStyle = "#FF0000";
  red_circle_icon.context.beginPath();
  red_circle_icon.context.arc(red_circle_icon.width/2,red_circle_icon.height/2,red_circle_icon.width/2,0,2*Math.PI);
  red_circle_icon.context.fill();

  var blue_circle_icon = GenIcon();
  blue_circle_icon.context.fillStyle = "#0000FF";
  blue_circle_icon.context.beginPath();
  blue_circle_icon.context.arc(blue_circle_icon.width/2,blue_circle_icon.height/2,blue_circle_icon.width/2,0,2*Math.PI);
  blue_circle_icon.context.fill();

  //TEMPLATE

  var GameTemplate =
  {
    deck:100,
    hand:5,
    players:
      [
        {
          title:"PlayerA",
          token_img:"red_circle",
        },
        {
          title:"PlayerB",
          token_img:"blue_circle",
        },
      ],
    nodes:
      [
        {
          title:"A",
          img:"circle",
          x:0.2,
          y:0.2,
          w:0.1,
          h:0.1,
        },
        {
          title:"B",
          img:"circle",
          x:0.4,
          y:0.1,
          w:0.1,
          h:0.1,
        },
        {
          title:"C",
          img:"circle",
          x:0.6,
          y:0.8,
          w:0.1,
          h:0.1,
        },
        {
          title:"D",
          img:"circle",
          x:0.7,
          y:0.4,
          w:0.1,
          h:0.1,
        },
      ],
    edges:
      [
        {
          title:"EA",
          from:"A",
          to:"B",
          amt:1,
        },
        {
          title:"EB",
          from:"B",
          to:"C",
          amt:1,
        },
        {
          title:"EC",
          from:"C",
          to:"D",
          amt:1,
        },
        {
          title:"ED",
          from:"D",
          to:"B",
          amt:1,
        },
        {
          title:"EE",
          from:"A",
          to:"C",
          amt:1,
        },
        {
          title:"EE",
          from:"D",
          to:"B",
          amt:1,
        },
      ],
    events:
      [
        {
          title:"EvA",
          edge:"EA",
        },
        {
          title:"EvB",
          edge:"EB",
        },
        {
          title:"EvC",
          edge:"EC",
        },
        {
          title:"EvD",
          edge:"ED",
        },
        {
          title:"EvE",
          edge:"EE",
        },
      ],
  }

};

