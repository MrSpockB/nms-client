const electron = require('electron');
const storage = require('electron-json-storage');
const chokidar = require('chokidar');
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;
var Client = require('ftp');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;
var watcher;

function createWindow ()
{
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on('closed', function ()
  {
    mainWindow = null;
  });
}
app.on('ready', createWindow);


app.on('window-all-closed', function ()
{
  if (process.platform !== 'darwin')
  {
    app.quit();
  }
})

app.on('activate', function () 
{
  if (mainWindow === null)
  {
    createWindow();
  }
})

ipcMain.on('open-dialog', function(event, arg)
{
  var dirPath = dialog.showOpenDialog({properties:['openDirectory']});
  dirPath = dirPath[0];
  console.log(dirPath);
  storage.set(arg, {path: dirPath, files: [], direcs: []}, function(err){
    if(err) throw err;
    event.sender.send('obtained-path', dirPath);
  });
});

ipcMain.on('start-watching', function(e, p, id)
{
  watcher = chokidar.watch(p, {ignored: ['node_modules', 'bower_components', 'vendor'], cwd: p}).on('all', (event, path) =>
  {
    console.log(event, path);
    e.sender.send('file-modified', path, event);
  });
});

ipcMain.on('stop-watching', function(event, arg)
{
  watcher.close();
  console.log("Watch stopped");
  console.log(arg);
});

ipcMain.on('set-login-data', function(event, arg)
{
  storage.set('login-data', arg, function(err){
    if(err) throw err;
  });
});

ipcMain.on('get-login-data', function(event, arg)
{
  storage.get('login-data',  function(err, data){
    if(err) throw err;
    event.sender.send('sentLoginData', data);
  });
});

ipcMain.on('get-saved-path', function(event, arg)
{
  storage.get(arg, function(err, data){
    if(err) throw err;
    console.log(data);
    event.sender.send('sentPath', data);
  });
});

ipcMain.on('sendPaths', function(event, data)
{
  var c = new Client();
  c.on('ready', function(){
    c.cwd(data.remotePath, function(){
      data.direcs.forEach(function(dir){
        if(dir.upload)
        {
          var finalDir = dir.path.replace(/\\/g, "/");
          c.mkdir(finalDir, function(err){
            if(err) throw err;
          });
        }
      });
      var remotePath = data.remotePath;
      console.log(remotePath);
      data.files.forEach(function(file){
        if(file.upload)
        {
          var localFile = data.localPath+'\\'+file.path;
          var remoteFile = data.remotePath+ '/'+ file.path.replace(/\\/g, '/');
          c.put(localFile, remoteFile, function(err){
            if(err) throw err;
          });
        }
      });
      event.sender.send('finishedUpload', true);
      c.end();
    });
  });
  c.connect({ host: data.host.replace("http://", ""), user: 'root', password: 'nodems' });
  console.log(data);
});