var os=require('os');
var fs=require('fs');
JConfig=require('../code/JConfig');
var util = require("util");

exports.base=function(test){ 
  var testName='test';
  var testValue='value';
  var defaultValue='default';
  var testValue2='value2';
  var testName2='test2';  
  var defaultValue2='default2';
  var presetData={};  
  var model=new JConfig.BaseConfig(presetData);
  test.ok(model.data==presetData);  
  test.ok(model.get(testName)==null);
  test.ok(model.get(testName,defaultValue)==defaultValue);
  model.set(testName,testValue);
  model.set(testName2,testValue2);
  test.ok(model.get(testName)==testValue);
  test.ok(model.get(testName2)==testValue2);
  test.done();
};
exports.file=function(test)
{
  var path=os.tmpdir()+'/JConfigTest'+(new Date().valueOf());
  var presetData={};    
  var model=new JConfig.ConfigFile(path,presetData);
  var model2=new JConfig.ConfigFile(path);
  var model3=new JConfig.ConfigFile(path);
  var testName='test';
  var testValue='value';  
  var defaultValue='default';  
  test.ok(model.data==presetData);  
  test.ok(model.get(testName)==null);
  test.ok(model.get(testName,defaultValue)==defaultValue);
  model.set(testName,testValue);
  test.ok(model.get(testName)==testValue);  
  model.save(function(){
    test.ok(model2.get(testName)==testValue);    
    model.set(testName,null);
    model.save();
    test.ok(model3.get(testName)==null);
    fs.unlinkSync(path);
    test.done();  
  });
  //model.save();
}
var CustomerConfig=function(path,data)
{
  JConfig.ConfigFile.call(this,path,data);
}
util.inherits(CustomerConfig,JConfig.ConfigFile);
CustomerConfig.prototype.newMethod=function()
{
  return true;
}
exports.folder=function(test)
{
   var path=os.tmpdir()+'/JConfigTest'+(new Date().valueOf());
   var folder=new JConfig.ConfigFolder(path,CustomerConfig);
   var folder2=new JConfig.ConfigFolder(path);
   var configName='test';
   var unusedConfigName='unused';
  var testName='test';
  var testValue='value';     
   fs.mkdirSync(path);
   
   folder.addConfig(configName);
   test.ok(folder.hasConfig(configName))
   test.ok(folder.hasConfig(unusedConfigName)==false);
   test.ok(folder.getConfig(unusedConfigName)==null);
   var model=folder.getConfig(configName);
   test.ok(model.newMethod());
   model.set(testName,testValue);
   model.save();
   var model2=folder2.getConfig(configName);
   test.ok(model2.get(testName)==testValue)
   test.ok(folder.deleteConfig(configName));
   fs.rmdirSync(path);
   test.done();
}