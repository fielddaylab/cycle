var client = function(update_func,error_func)
{
  var self = this;

  self.id = Math.floor(Math.random()*100000000);
  self.server_url = "./src/serv/s.php";
  self.poll_rate = 3000; //ms between polls. 3000 = 3s
  self.db_i_begin = -1; //first known index of database
  self.database = [];
  var Entry = function(i,d) { this.i = i; this.data = d; this.user; this.event; this.args; }

  self.interval;
  self.q = [];
  self.sending = false;

  var getXHR = function() //to reduce code duplication out of laziness- not out of good practice
  {
    var xhr;
    xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
      switch(xhr.readyState)
      {
        case 0: //UNSENT
        case 1: //OPENED
        case 2: //HEADERS_RECEIVED
        case 3: //LOADING
          break;
        case 4: //DONE
          if(xhr.status != 200 || xhr.responseText == "" || xhr.responseText == "FAIL")
            error_func();
          else
          {
            self.got(xhr.responseText);
            if(self.q.length) self.q.splice(0,1);
            if(self.q.length) self.get();
          }
          self.sending = false;
          break;
      }
    }
    return xhr;
  }

  self.get = function()
  {
    if(self.sending) return;
    var xhr = getXHR();
    self.sending = true;
    if(self.q.length) xhr.open("GET",self.server_url+"?event="+self.q[0]);
    else              xhr.open("GET",self.server_url);
    xhr.send();
  }

  self.add = function(event)
  {
    self.q.push(event);
    if(self.sending) return;
    self.get();
  }

  var parseEntry = function(e)
  {
    var d = e.data.split(" ");
    if(d[0]) e.user = parseInt(d[0]);
    if(d[1]) e.event = d[1];
    if(d[2]) { d.splice(0,2); e.args = d; }
  }

  self.got = function(r)
  {
    //console.log(r);
    var merge_lines = r.split("\n");
    if(merge_lines.length == 0) { console.log("what"); console.log(r); return; }
    var merge_db = [];
    for(var i = 0; i < merge_lines.length; i++)
    {
      if(!merge_lines[i]) continue;
      merge_db[i] = new Entry( parseInt(merge_lines[i].substring(0,merge_lines[i].indexOf(" "))), merge_lines[i].substring(merge_lines[i].indexOf(" ")+1) );
    }
    var merge_i_begin = merge_db[0].i;

    //first population
    if(self.db_i_begin == -1)
    {
      for(var i = 0; i < merge_db.length; i++)
      {
        self.database[i] = merge_db[i];
        parseEntry(self.database[self.database.length-1]);
      }
      self.db_i_begin = self.database[0].i;
      update_func();
      return;
    }

    //check if gaps in knowledge, and fill with blank entries
    if(merge_i_begin > (self.db_i_begin + self.database.length))
    {
      while(self.db_i_begin+self.database.length < merge_i_begin)
        self.database[self.database.length] = new Entry(self.db_i_begin+self.database.length,"");
    }

    //perform the merge
    var updated = false;
    for(var i = 0; i < merge_db.length; i++)
    {
      if(merge_db[i].i > self.database[self.database.length-1].i)
      {
        self.database[self.database.length] = merge_db[i];
        parseEntry(self.database[self.database.length-1]);
        updated = true;
      }
    }
    if(updated) update_func();
  }

  self.begin = function()
  {
    self.id = Math.floor(Math.random()*100000000);
    self.interval = setInterval(self.get,self.poll_rate);
  }

  self.stop = function()
  {
    clearInterval(self.interval);
  }

}

