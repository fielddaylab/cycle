var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var nodes;
  var edges;
  var events;

  var players;
  var tokens;

  var deck;
  var turn;
  var player_turn;

  self.ready = function()
  {
    self.constructGame(GameTemplate);
  };

  self.tick = function()
  {
  };

  self.draw = function()
  {
    dc.context.strokeStyle = "#000000";
    for(var i = 0; i < edges.length; i++)
    {
      dc.context.beginPath();
      dc.context.moveTo(edges[i].start_x,edges[i].start_y);
      dc.context.lineTo(edges[i].end_x,edges[i].end_y);
      dc.context.stroke();
    }

    for(var i = 0; i < nodes.length; i++)
    {
      dc.context.drawImage(nodes[i].img,nodes[i].x,nodes[i].y,nodes[i].w,nodes[i].h);
    }
  };

  self.cleanup = function()
  {

  };

  self.constructGame = function(game_data)
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

      tokens.push(token);
    }

    deck = [];
    var tmp;
    var swap;
    for(var i = 0; i < 100; i++)
      deck.push((i%events.length)+1);
    //shuffle
    for(var i = 0; i < deck.length-1; i++)
    {
      swap = i+Math.floor((Math.random()*(events.length-i)));
      tmp = deck[i];
      deck[i] = deck[swap];
      deck[swap] = tmp;
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

    self.id = 0;
    self.player_id = 0;
    self.node_id = 0;
    self.transitions = 0;
  }

  var Player = function()
  {
    var self = this;

    self.id = 0;
    self.title = "Player";
  }

  var circle_icon = GenIcon();
  circle_icon.context.fillStyle = "#555555";
  circle_icon.context.beginPath();
  circle_icon.context.arc(circle_icon.width/2,circle_icon.height/2,circle_icon.width/2,0,2*Math.PI);
  circle_icon.context.fill();

  //TEMPLATE

  var GameTemplate =
  {
    players:
      [
        {
          title:"PlayerA",
        },
        {
          title:"PlayerB",
        },
      ],
    nodes:
      [
        {
          title:"A",
          x:0.2,
          y:0.2,
          w:0.1,
          h:0.1,
        },
        {
          title:"B",
          x:0.4,
          y:0.1,
          w:0.1,
          h:0.1,
        },
        {
          title:"C",
          x:0.6,
          y:0.8,
          w:0.1,
          h:0.1,
        },
        {
          title:"D",
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

