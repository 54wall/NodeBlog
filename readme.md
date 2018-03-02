## 使用Heroku+Mlab，部署Node+Express+Bootsrap实现的多人博客
使用Node+Express+Bootsrap实现的多人博客，参考github：<a href="https://github.com/nswbmw/N-blog">nswbmw/N-blog:使用 Express + MongoDB 搭建多人博客</a>.
因为MongoHQ已经不再能使用，我的项目使用的是<a href="https://mlab.com">Mlab</a>。
完整项目已经部署到<a href="https://dashboard.heroku.com/">Heroku</a>。
完整项目请浏览
<a href="https://my-walkingdead.herokuapp.com/">54wall-WalkingDead</a>。
目前的问题是部署到Heroku上的对于未登陆用户，直接post新增内容，直接会报错，然后必须注册才不会报错，对于已经登陆的用户，则是如果选择注册选项，则也是报错，必须先登出logout！
## 使用Heroku+mLab 部署Node应用

最近尝试了一下node.js，迷迷糊糊，不太懂，所以干脆找一个基于node.js平台的小项目做一下，我大概扫了一眼javascript的基础和node.js的介绍，然后在GitHub上找到了一个非常详实的项目：[nswbmw/N-blog](https://github.com/nswbmw/N-blog)，根据他的讲解，一步一步实现了多人博客的基础雏形，之后我使用Bootstrap进行了美化，做了一个关于行尸走肉的多人博客网页，利用标签的特性，实现了各个频道的检索。
![N-Blog-WalkingDeading_01.jpg](http://upload-images.jianshu.io/upload_images/2467798-3bb7ea73c1b71a1c.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
真打算布置到nswbmw所使用的Heroku和MongoHQ，但是MongoHQ目前好像已经不能使用了，于是在网上找到了他的替代品[mLab](https://mlab.com/home),看了下相关的教程几乎和已经消失的MongoHQ的使用步骤是一致的，但是网上教程大多使用的Ubuntu系统，我这里使用的Windows,并且多数使用mongoose来进行MongoDB数据库操作，看的我云里雾里，正好刚刚部署成功。这里简单介绍下，使用[mLab](https://mlab.com/home)和[Heroku](https://www.heroku.com/)分别进行MongoDB和node部署的过程。
这里还是参照[nswbmw/N-blog的wiki](https://github.com/nswbmw/N-blog/wiki/番外篇之——部署到-Heroku)上的例子的顺序，首先将本地MongoDB切换到mLab上。

#### 使用mLab

![mLab登陆.jpg](http://upload-images.jianshu.io/upload_images/2467798-2b7f3ad316f736fb.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
SignUp注册，我使用的是网易126邮箱，可以进行申请，申请后需要发送一个确认的邮件，进入你的邮件去找到，然后访问返回的连接。

![注册.jpg](http://upload-images.jianshu.io/upload_images/2467798-ee913a48869cd381.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
注意注册时，这里分别有Account name和Username，一定要注意了，一会Log In登陆的时候，使用的Username。
![登陆后.jpg](http://upload-images.jianshu.io/upload_images/2467798-3bfa4605a84e61af.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
我因为已经注册了，直接进入时这个样子，选择MongoDB Deployments（数据库部署）下的Create New，创建新的数据库。
![选择数据库大小.jpg](http://upload-images.jianshu.io/upload_images/2467798-6663233d6a88c274.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里选择你需要的云服务商和区域，本来打算选择新加坡的服务区域，但是在Region中选择Amazon's Asia Pacific(Singapore)Region(ap-southeast-1),会发现没有免费的，大概看了下，只有美国区选择Plan中的Single—node，才可以选择免费的0.5GB的Sandbox。
![选择已经建好的数据库.jpg](http://upload-images.jianshu.io/upload_images/2467798-4e855406a755cfc6.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
选择已经建好的进入数据库，需要新建使用数据库的用户名和密码，然后是非常关键的问题，就是如下：

![新建数据库使用者用户.jpg](http://upload-images.jianshu.io/upload_images/2467798-f38d1f14b50a89c4.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
提示你了，如何切换数据库到mLab，我这里使用的To connect using a driver via the standard MongoDB URI (what's this?):这个选项

直接点击what's this?进入帮助文档，然后向下找到下面的MongoDB driver(可以Ctrl+F)选择其中的 **driver examples in many of the major languages**
```
MongoDB driver

In order to provide your application a means to communicate with your MongoDB database, you will need a driver in a language appropriate to your application.

You can go to MongoDB, Inc.’s site to read about the official MongoDB drivers, but we also provide driver examples in many of the major languages: C#, Java, Node.js, PHP, Python, Ruby, etc.. These examples should run out-of-the-box after you install the appropriate driver(s) and update your MongoDB URI.

You may find our troubleshooting guide helpful if you continue to experience problems trying to connect to your deployment using a compatible driver.
```
之后进入语言中心，这里的语言中心不是指设置中英文，而是指的是编程语言
```
Language Center

Node.js

The officially supported Node.js Native driver for MongoDB:

CRUD example
Mongoose, an Object Document Mapper (ODM) for MongoDB:

Mongoose CRUD example
Mongoose Tips & Tricks (from mLab’s blog)
```
点击链接CRUD example，就可以看到node.js如何连接数据库了，下边就是CRUD example点击后的全部文档，讲了如何在node中使用mLab数据库作为外部数据库的方法：
```
/*
 * Copyright (c) 2016 ObjectLabs Corporation
 * Distributed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Written with: mongodb@2.1.3
 * Documentation: http://mongodb.github.io/node-mongodb-native/
 * A Node script connecting to a MongoDB database given a MongoDB Connection URI.
*/

var mongodb = require('mongodb');

// Create seed data

var seedData = [
  {
    decade: '1970s',
    artist: 'Debby Boone',
    song: 'You Light Up My Life',
    weeksAtOne: 10
  },
  {
    decade: '1980s',
    artist: 'Olivia Newton-John',
    song: 'Physical',
    weeksAtOne: 10
  },
  {
    decade: '1990s',
    artist: 'Mariah Carey',
    song: 'One Sweet Day',
    weeksAtOne: 16
  }
];

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname

var uri = 'mongodb://user:pass@host:port/db';

mongodb.MongoClient.connect(uri, function(err, db) {
  
  if(err) throw err;
  
  /*
   * First we'll add a few songs. Nothing is required to create the 
   * songs collection; it is created automatically when we insert.
   */

  var songs = db.collection('songs');

   // Note that the insert method can take either an array or a dict.

  songs.insert(seedData, function(err, result) {
    
    if(err) throw err;

    /*
     * Then we need to give Boyz II Men credit for their contribution
     * to the hit "One Sweet Day".
     */

    songs.update(
      { song: 'One Sweet Day' }, 
      { $set: { artist: 'Mariah Carey ft. Boyz II Men' } },
      function (err, result) {
        
        if(err) throw err;

        /*
         * Finally we run a query which returns all the hits that spend 10 or
         * more weeks at number 1.
         */

        songs.find({ weeksAtOne : { $gte: 10 } }).sort({ decade: 1 }).toArray(function (err, docs) {

          if(err) throw err;

          docs.forEach(function (doc) {
            console.log(
              'In the ' + doc['decade'] + ', ' + doc['song'] + ' by ' + doc['artist'] + 
              ' topped the charts for ' + doc['weeksAtOne'] + ' straight weeks.'
            );
          });
         
          // Since this is an example, we'll clean up after ourselves.
          songs.drop(function (err) {
            if(err) throw err;
           
            // Only close the connection when your app is terminating.
            db.close(function (err) {
              if(err) throw err;
            });
          });
        });
      }
    );
  });
});
```
我们主要使用的是如何连接数据库，所以下边的这个尤其重要：
```
var uri = 'mongodb://user:pass@host:port/db';
mongodb.MongoClient.connect(uri, function(err, db) {
……
}
```

这里开始就不再与[nswbmw/部署到Heroku](https://github.com/nswbmw/N-blog/wiki/番外篇之——部署到-Heroku)的wiki上一致，其余参照[nswbmw/部署到Heroku](https://github.com/nswbmw/N-blog/wiki/番外篇之——部署到-Heroku)，
修改 settings.js 为：
module.exports = { 
  cookieSecret: 'myblog', 
  url: 'your_Mongo_URI'
};
将 your_Mongo_URI 替换为你自己创建的数据库的 URL ，将 <user> 和 <password> 分别替换为刚才添加的用户的名字和密码。
我的是
```
module.exports = {
    cookieSecret: 'myblog',
    url: 'mongodb://54wallis_a_good_man:haha@ds015869.mlab.com:15869/walkingdead'
};
```
需要注意
```
mongodb://<dbuser>:<dbpassword>@ds015869.mlab.com:15869/walkingdead
```
这里的两个<>都是要去掉的。
nswbmw/N-blog讲的如下：
打开 app.js ，将 app.use(express.session(...)); 修改为：
app.use(express.session({
  secret: settings.cookieSecret,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  url: settings.url
}));
删除 db.js ，打开 post.js 、 user.js 和 comment.js ，均作以下修改：
将 mongodb = require('./db') 修改为 mongodb = require('mongodb').Db
添加 var settings = require('../settings');
将所有 mongodb.open(function (err, db) { 修改为 mongodb.connect(settings.url, function (err, db) {
将所有 mongodb.close(); 修改为 db.close();

这里不能完全参照改教程了，需要按最新的mLab要求进行修改，
将 上边所有的mongodb = require('./db') 修改为 mongodb = require('mongodb')；
就是将所有 mongodb.open(function (err, db) { 修改为 mongodb.MongoClient.connect(settings.url, function (err, db) {
其余同nswbmw/N-blog，这里就可以完成了。
现在，无需启动你的mongo本地数据库，直接启动你的多人博客或者其他node应用，会比较慢，就可以看到了，像一起一样可以增加修改，而在mlab可以看到你的数据库。
![mLab数据库.jpg](http://upload-images.jianshu.io/upload_images/2467798-e6efedc2f25e8f01.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 部署到 Heroku

Heroku 支持很多语言的部署，下面使用 Heroku 部署我们的博客。我这里完全没有安装Heroku Toolbelt，也没有用到git bash，直接全部在网页中执行。过程与nswbmw/N-blog稍有不同。
### 新建Procfile

在工程的根目录下新建一个 **Procfile** 文件，添加如下内容：
```
    web: node app.js
```
**Procfile** 文件告诉了服务器该使用什么命令启动一个 web 服务，这里通过 `node app.js` 执行 Node 脚本。

### 上传到github
上传项目到github上，注意在硬盘上的node完整项目的目录如下：
![项目结构.jpg](http://upload-images.jianshu.io/upload_images/2467798-9155050c243ed5f1.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

注意图中上边的文件夹时完整的，只需要上传下边的，上传到github时把bin和node_modules这两个文件夹除外，这两文件较大，不需要上传，bin是运行node时生成的，而node_modules则是运行node应用时下载的依赖。

### 注册Heroku
![heroku首页.jpg](http://upload-images.jianshu.io/upload_images/2467798-9b13ddb3da297ebe.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

进入[Heroku](https://www.heroku.com/),注册注意我的126不能通过，qq倒是可以。

### 创建一个应用
注册成功后，就进入了控制面板页面，如图所示：

![heroku新建app.jpg](http://upload-images.jianshu.io/upload_images/2467798-69c14e01bf399544.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击 **New** ，填写独一无二的应用名称后，点击 **Create App** 即创建成功 。

![heroku新建app2.jpg](http://upload-images.jianshu.io/upload_images/2467798-b7c7d570c7cb9139.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击你的新建的这个app，然后选择deploy（部署）这一项，会遇到下边的

![heroku新建app3.jpg](http://upload-images.jianshu.io/upload_images/2467798-ee4b9c3fb5f1e51e.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

因为项目已经上传到GitHub上，所以，直接选择GitHub，会进行相应的授权操作，然后在你的账户中选择你要部署的项目所在的GitHub路径，我这里是我的[N-blog-WalkingDead](https://github.com/54wall/N-blog-WalkingDead)

下边仅跟着的就是两种部署方式：


![heroku新建app7自动部署和一般部署.jpg](http://upload-images.jianshu.io/upload_images/2467798-eded1c73f2d6faab.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Automatic deploys 就是自动部署，部署放生在更新你的GitHub，Heroku就会自动部署，但是现在点击它不会立刻马上部署，可能会过几分钟之后，Manual deploy 就是一般性部署，点击图中的Deploy to Heroku就会立刻马上部署。
这里在Manual deploy中进行直接部署，点击Show build log，就可以看到构建的日志了，若果node项目(我这里是多人博客项目)没有问题，就可以你就可以访问 **http://yourAppName.herokuapp.com/** 进行查看了。
我的项目结果如下：
![N-Blog-WalkingDeading_02.jpg](http://upload-images.jianshu.io/upload_images/2467798-ada1c76d7b19899b.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

手机端：

![N-Blog-WalkingDeading_03.jpg](http://upload-images.jianshu.io/upload_images/2467798-4b78a370ec34d255.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 参考
[利用heroku+mongoLab 部署Node 运用](http://www.cnblogs.com/djlxs/p/5506403.html)
[nswbmw/N-blog:番外篇之——部署到 Heroku](https://github.com/nswbmw/N-blog/wiki/番外篇之——部署到-Heroku)
其余自行百度或谷歌。
