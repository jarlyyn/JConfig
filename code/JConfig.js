var fs = require('fs');
var util = require("util");
var path = require('path')
var events = require('events');
var BaseConfig=function(data)
{
   events.EventEmitter.call(this);
   this.data=data;
}
util.inherits(BaseConfig,events.EventEmitter);
BaseConfig.prototype.load=function(force)
{
  if (this.data==null || force)
  {
    this.data=this.loadData();
  }
}
BaseConfig.prototype.loadData=function()
{
  return {};
}
BaseConfig.prototype.get=function(name,defaultValue)
{
  this.load();
  return this.data[name]==null?defaultValue:this.data[name];
}
BaseConfig.prototype.set=function(name,value)
{
  this.load();
  this.data[name]=value;
}
BaseConfig.prototype.save=function(callback){
  if (callback==null)
  {
    return this.saveSync();
  }
  return this.saveAsync(callback);
}
BaseConfig.prototype.saveSync=function()
{
  return true;
}
BaseConfig.prototype.saveAsync=function(callback)
{
  callback(null);
}
var ConfigFile=function(path,data)
{
  BaseConfig.call(this,data);  
  this.path=path;
}
util.inherits(ConfigFile,BaseConfig);
ConfigFile.prototype.loadData=function()
{
  var data=fs.readFileSync(this.path);
    try {
      return JSON.parse(data);
    }
    catch (err)
    {
	console.error(this.path+' is not a json file');      
	return {};
    }        
}
ConfigFile.prototype.saveAsync=function(callback)
{
      var data = JSON.stringify(this.data||{});
      fs.writeFile(this.path, data, function (err){
	if (err)
	{
	  this.emit('error',err)
	  console.error('Save file '+this.path+'fail.');
	  console.error(err.message);
	}
	callback(err);
	return;	
      });
}
ConfigFile.prototype.saveSync=function()
{
      var data = JSON.stringify(this.data||{});
      fs.writeFileSync(this.path, data);
}
var ConfigFolder=function(folder,configClass)
{
  events.EventEmitter.call(this);    
  this.folder=folder||'./config/';
  this.configClass=configClass||ConfigFile;
  this.data==null;
  this.suffix='.json';
}
util.inherits(ConfigFolder,events.EventEmitter);
ConfigFolder.prototype.loadAll=function(force)
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
ConfigFolder.prototype.saveAll=function()
{
    if (this.data==null)
      this.data={};
    for(var name in this.data)
    {
      this.data[name].save();
    }
}

ConfigFolder.prototype.getConfig=function(name)
{
  this.loadAll();
  return this.data[name] || null;
}
ConfigFolder.prototype.deleteConfig=function(name)
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
ConfigFolder.prototype.hasConfig=function(name)
{
  this.loadAll();
  return this.data[name]==null?false:true;
}
ConfigFolder.prototype.getConfigs=function(name)
{
 this.loadAll();
 return this.data;
}
ConfigFolder.prototype.setConfig=function(name,value)
{
  this.loadAll();
  this.data[name]=value;
}
ConfigFolder.prototype.addConfig=function(name)
{
  this.loadAll();
  if (this.data[name]==null)
  {
    var config=new this.configClass(path.join(this.folder,name+this.suffix),{});
    this.data[name]=config;
    return config;
  }
}
module.exports.ConfigFolder=ConfigFolder;
module.exports.ConfigFile=ConfigFile;
module.exports.BaseConfig=BaseConfig;