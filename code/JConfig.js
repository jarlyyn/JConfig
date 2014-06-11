var fs = require('fs');
var util = require("util");
var path = require('path')
var events = require('events');
JConfig=function(path,data)
{
  events.EventEmitter.call(this);  
  this.path=path;
  this.data=data;
}
util.inherits(JConfig,events.EventEmitter);
JConfig.prototype.load=function(force)
{
  if (this.data==null || force)
  {
    var data=fs.readFileSync(this.path);
    try {
      this.data=JSON.parse(data);
    }
    catch (err)
    {
	this.data={};
	//this.emit('error',err)
	console.error(this.path+' is not a json file');
    }      
  }
}
JConfig.prototype.save=function()
{
    if (this.data!=null)
    {
      var data = JSON.stringify(this.data||{});
      fs.writeFile(this.path, data, function (err){
	if (err)
	{
	  this.emit('error',err)
	  console.error('Save file '+this.path+'fail.');
	  console.error(err.message);
	  return;
	}
      });
    }
}
JConfig.prototype.get=function(name,defaultValue)
{
  this.load();
  return this.data[name]==null?defaultValue:this.data[name];
}
JConfig.prototype.set=function(name,value)
{
  this.load();
  this.data[name]=value;
}


JConfigFolder=function(folder,configClass)
{
  events.EventEmitter.call(this);    
  this.folder=folder||'./config/';
  this.configClass=configClass||JConfig;
  this.data==null;
  this.suffix='.json';
}
util.inherits(JConfigFolder,events.EventEmitter);
JConfigFolder.prototype.loadAll=function(force)
{
  if (this.data==null ||force )
  {
    this.data={};    
    var files=fs.readdirSync(this.folder);
    for(var i in files)
    {
      var fullname=files[i]
      if (path.extname(fullname).toLowerCase()==this.suffix)
      {
	this.data[path.basename(fullname,this.suffix)] = new this.configClass(path.join(this.folder,fullname));
      }
    }
  }
  return this.data;
}
JConfigFolder.prototype.saveAll=function()
{
    if (this.data==null)
      this.data={};
    for(var name in this.data)
    {
      this.data[name].save();
    }
}

JConfigFolder.prototype.getConfig=function(name)
{
  this.loadAll();
  return this.data[name] || null;
}
JConfigFolder.prototype.deleteConfig=function(name)
{
  this.loadAll();
  try{
    fs.unlinkSync(path.join(this.folder,name+this.suffix));
    delete this.data[name];
    return true;
  }catch(e){
    return false;
  }
}
JConfigFolder.prototype.hasConfig=function(name)
{
  this.loadAll();
  return this.data[name]==null?false:true;
}
JConfigFolder.prototype.getConfigs=function(name)
{
 this.loadAll();
 return this.data;
}
JConfigFolder.prototype.setConfig=function(name,value)
{
  this.loadAll();
  this.data[name]=value;
}
JConfigFolder.prototype.addConfig=function(name)
{
  this.loadAll();
  if (this.data[name]==null)
  {
    var config=new this.configClass(path.join(this.folder,name+this.suffix),{});
    this.data[name]=config;
    return config;
  }
}
module.exports.Folder=JConfigFolder;
module.exports.Config=JConfig;