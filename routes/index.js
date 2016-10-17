var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js'),
    multer  = require('multer');
//原版本使用方法
//app.use(multer({
//  dest: './public/images',
//  rename: function (fieldname, filename) {
//    return filename;
//  }
//}));
//新的使用方法
var storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, './public/images')
  },
  filename: function (req, file, cb){
    cb(null, file.originalname)
  }
});
var upload = multer({
  storage: storage
});
module.exports = function(app) {
  //与post.js中的Post.getAll = function(name, callback)结合使用，返回全部文章不分页
  //app.get('/', function (req, res) {
  //  Post.getAll(null, function (err, posts) {
  //    if (err) {
  //      posts = [];
  //    }
  //    res.render('index', {
  //      title: '主页',
  //      user: req.session.user,
  //      posts: posts,
  //      success: req.flash('success').toString(),
  //      error: req.flash('error').toString()
  //    });
  //  });
  //});

  app.get('/', function (req, res) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
    var page = parseInt(req.query.p) || 1;
    //查询并返回第 page 页的 10 篇文章
    Post.getTen(null, page, function (err, posts, total) {
      if (err) {
        posts = [];
      }
      //bootcss carousel
      res.render('index_carousel', {
        title: '主页',
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 5 + posts.length) == total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/reg');//返回注册页
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
    });
    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg');//返回注册页
      }
      //如果不存在则新增用户
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');//注册失败返回主册页
        }
        req.session.user = newUser;//用户信息存入 session
        req.flash('success', '注册成功!');
        res.redirect('/');//注册成功后返回主页
      });
    });
  });
  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()});
  });
  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/login');//用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        req.flash('error', '密码错误!');
        return res.redirect('/login');//密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/');//登陆成功后跳转到主页
    });
  });
  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
    //含有标签
    //var currentUser = req.session.user,
    //    post = new Post(currentUser.name, req.body.title, req.body.post);
    //含有标签
    var currentUser = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3],
        post = new Post(currentUser.name, req.body.title, tags, req.body.post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '发布成功!');
      res.redirect('/');//发表成功跳转到主页
    });
  });

  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');//登出成功后跳转到主页
  });
  app.get('/upload', checkLogin);
  app.get('/upload', function (req, res) {
    res.render('upload', {
      title: '文件上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/upload', checkLogin);
  app.post('/upload', upload.array('field1', 5), function (req, res) {
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
  });
  //与post.js中的Post.getAll = function(name, callback)结合使用，返回全部文章不分页
  //app.get('/u/:name', function (req, res) {
  //  //检查用户是否存在
  //  User.get(req.params.name, function (err, user) {
  //    if (!user) {
  //      req.flash('error', '用户不存在!');
  //      return res.redirect('/');//用户不存在则跳转到主页
  //    }
  //    //查询并返回该用户的所有文章
  //    Post.getAll(user.name, function (err, posts) {
  //      if (err) {
  //        req.flash('error', err);
  //        return res.redirect('/');
  //      }
  //      res.render('user', {
  //        title: user.name,
  //        posts: posts,
  //        user : req.session.user,
  //        success : req.flash('success').toString(),
  //        error : req.flash('error').toString()
  //      });
  //    });
  //  });
  //});
//每页返回10篇文章
  app.get('/u/:name', function (req, res) {
    var page = parseInt(req.query.p) || 1;
    //检查用户是否存在
    User.get(req.params.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/');
      }
      //查询并返回该用户第 page 页的 10 篇文章
      Post.getTen(user.name, page, function (err, posts, total) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        res.render('user_carousel', {
          title: user.name,
          posts: posts,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 5 + posts.length) == total,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });
  });
  /*但会*/
  app.get('/u/:name/:day/:title', function (req, res) {
    Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('article', {
        title: req.params.title,
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  /*添加留言相应*/
  app.post('/u/:name/:day/:title', function (req, res) {
    var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var comment = {
      name: req.body.name,
      email: req.body.email,
      website: req.body.website,
      time: time,
      content: req.body.content
    };
    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
    newComment.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '留言成功!');
      res.redirect('back');
    });
  });
  app.get('/edit/:name/:day/:title', checkLogin);
  app.get('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.post('/edit/:name/:day/:title', checkLogin);
  app.post('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
      var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err);
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect(url);//成功！返回文章页
    });
  });
  app.get('/remove/:name/:day/:title', checkLogin);
  app.get('/remove/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
      res.redirect('/');
    });
  });
  //获取存档目录
  app.get('/archive', function (req, res) {
    Post.getArchive(function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('archive', {
        title: '存档',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //返回标签页
  app.get('/tags', function (req, res) {
    Post.getTags(function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('tags', {
        title: '标签',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //返回某一标签全部列表
  app.get('/tags/:tag', function (req, res) {
    Post.getTag("req.params.tag", function (err, posts) {
      if (err) {
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('tag', {
        title: 'TAG:' + req.params.tag,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //54wall:返回各个专栏
  //app.get('/roles', function (req, res) {
  //  //Post.getTag(req.params.tag, function (err, posts) {
  //  //  if (err) {
  //  //    req.flash('error',err);
  //  //    return res.redirect('/');
  //  //  }
  //  //判断是否是第一页，并把请求的页数转换成 number 类型
  //  var page = parseInt(req.query.p) || 1;
  //  Post.getTenTag("角色介绍", page, function (err, posts, total) {
  //    if (err) {
  //      req.flash('error',err);
  //      return res.redirect('/');
  //    }
  //    //res.render('tag', {
  //    //  title: 'TAG:' + req.params.tag,
  //    //  posts: posts,
  //    //  user: req.session.user,
  //    //  success: req.flash('success').toString(),
  //    //  error: req.flash('error').toString()
  //    //});
  //    console.log("54wall-index.js");
  //    console.log(posts);
  //    res.render('index_carousel', {
  //      title: '主页',
  //      posts: posts,
  //      page: page,
  //      isFirstPage: (page - 1) == 0,
  //      isLastPage: ((page - 1) * 5 + posts.length) == total,
  //      user: req.session.user,
  //      success: req.flash('success').toString(),
  //      error: req.flash('error').toString()
  //    });
  //  });
  //});
  app.get('/roles_all', function (req, res) {
    //Post.getTag(req.params.tag, function (err, posts) {
    //  if (err) {
    //    req.flash('error',err);
    //    return res.redirect('/');
    //  }
    //判断是否是第一页，并把请求的页数转换成 number 类型
    var page = parseInt(req.query.p) || 1;
    Post.getAllTag("角色介绍", function (err, posts) {
      if (err) {
        req.flash('error',err);
        return res.redirect('/');
      }
      //res.render('tag', {
      //  title: 'TAG:' + req.params.tag,
      //  posts: posts,
      //  user: req.session.user,
      //  success: req.flash('success').toString(),
      //  error: req.flash('error').toString()
      //});
      console.log("54wall-index.js");
      console.log(posts);
      res.render('index_carousel', {
        title: '主页',
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: false,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.get('/roles', function (req, res) {
    //Post.getTag(req.params.tag, function (err, posts) {
    //  if (err) {
    //    req.flash('error',err);
    //    return res.redirect('/');
    //  }
    //判断是否是第一页，并把请求的页数转换成 number 类型
    //判断是否是第一页，并把请求的页数转换成 number 类型
    /*这里是两个嵌套，第一层负责查询标签总数量，第二个负责返回数据，因为只要用total就是总数量比较烦人*/
    Post.getTagNum("角色介绍", function (err, posts_all) {
      if (err) {
        req.flash('error',err);
        return res.redirect('/');
      }
      //res.render('tag', {
      //  title: 'TAG:' + req.params.tag,
      //  posts: posts,
      //  user: req.session.user,
      //  success: req.flash('success').toString(),
      //  error: req.flash('error').toString()
      //});
      console.log("54wall-index.js");
      console.log(posts_all);
      var page = parseInt(req.query.p) || 1;

      //Post.getTenTag("角色介绍", page,function (err, posts,total) {
        Post.getTenTag("角色介绍", page,function (err, posts) {
        if (err) {
          req.flash('error',err);
          return res.redirect('/');
        }
        //res.render('tag', {
        //  title: 'TAG:' + req.params.tag,
        //  posts: posts,
        //  user: req.session.user,
        //  success: req.flash('success').toString(),
        //  error: req.flash('error').toString()
        //});
        //console.log("roles");
        //console.log(total);

        res.render('index_carousel', {
          title: '主页',
          posts: posts,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 5 + posts.length) == posts_all.length,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });

    });

    //var page = parseInt(req.query.p) || 1;
    //
    //Post.getTenTag("角色介绍", page,function (err, posts,total) {
    ////Post.getTenTag("角色介绍", page,function (err, posts) {
    //  if (err) {
    //    req.flash('error',err);
    //    return res.redirect('/');
    //  }
    //  //res.render('tag', {
    //  //  title: 'TAG:' + req.params.tag,
    //  //  posts: posts,
    //  //  user: req.session.user,
    //  //  success: req.flash('success').toString(),
    //  //  error: req.flash('error').toString()
    //  //});
    //  console.log("roles");
    //  console.log(total);
    //
    //  res.render('index_carousel', {
    //    title: '主页',
    //    posts: posts,
    //    page: page,
    //    isFirstPage: (page - 1) == 0,
    //    isLastPage: ((page - 1) * 5 + posts.length) == posts_all.length,
    //    user: req.session.user,
    //    success: req.flash('success').toString(),
    //    error: req.flash('error').toString()
    //  });
    //});
  });
  //评行尸走肉

  app.get('/news', function (req, res) {
    Post.getTagNum("行尸走闻", function (err, posts_all) {
      if (err) {
        req.flash('error',err);
        return res.redirect('/');
      }
      var page = parseInt(req.query.p) || 1;
      Post.getTenTag("行尸走闻", page,function (err, posts) {
        if (err) {
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('news', {
          title: '主页',
          posts: posts,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 5 + posts.length) == posts_all.length,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });
  });
  app.get('/review', function (req, res) {
    Post.getTagNum("评行尸走肉", function (err, posts_all) {
      if (err) {
        req.flash('error',err);
        return res.redirect('/');
      }
      var page = parseInt(req.query.p) || 1;
      Post.getTenTag("评行尸走肉", page,function (err, posts) {
        if (err) {
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('review', {
          title: '主页',
          posts: posts,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 5 + posts.length) == posts_all.length,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });
  });
  app.get('/', function (req, res) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
    var page = parseInt(req.query.p) || 1;
    //查询并返回第 page 页的 10 篇文章
    Post.getTen(null, page, function (err, posts, total) {
      if (err) {
        posts = [];
      }
      //bootcss carousel
      res.render('index_carousel', {
        title: '主页',
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 5 + posts.length) == total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  //Android与Node.js的http数据交互 https://segmentfault.com/a/1190000004957088
  app.post('/ad/',function(req,res,next){
    for (var i=0;i<req.body.length;++i){
      var man=req.body[i];
      console.log('name:'+man.name+'\n'+'age:'+man.age+'\n');
    }
  });

  app.get('/ad/', function (req, res, next) {
    //var index = req.query.index;
    var index = req.params.index;
    console.log('req:'+req);
    console.log('index:'+req.query.index);
    var mans = [
        {
          name: '0flypie',
          age: 20,
          art: "数据0",
        },
        {
          name: '1大飞哥',
          age: 21,
          art: "数据1",

        },
      {
        name: '2flypie',
        age: 20,
        art: "数据2",

      },
      {
        name: '3大飞哥',
        age: 21,
        art: "数据3",

      }
    ];
    //var mans = [
    //  [
    //    {
    //      name: 'flypie',
    //      age: 20
    //    },
    //    {
    //      name: '大飞哥',
    //      age: 21
    //    }
    //  ],
    //  [
    //    {
    //      name: 'flypie2',
    //      age: 20
    //    },
    //    {
    //      name: '大飞哥2',
    //      age: 21
    //    }
    //  ]
    //];
    res.json(mans[2]);
    console.log('mans'+mans.size);
    console.log('name:'+res);
    console.log('name:'+mans);
  });
  app.post('/wall_index/',function(req,res,next){
    for (var i=0;i<req.body.length;++i){
      var man=req.body[i];
      console.log('name:'+man.name+'\n'+'age:'+man.age+'\n');
    }
  });

  app.get('/wall_index/', function (req, res, next) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
    var page = parseInt(req.query.p) || 1;
    //查询并返回第 page 页的 10 篇文章
    Post.getTen(null, page, function (err, posts, total) {
      if (err) {
        posts = [];
      }
      //res就是response回应，这里用json返回给客户端，我这里就是我的手机
      res.json(posts[2]);
      //bootcss carousel
      //res.render('index_carousel', {
      //  title: '主页',
      //  posts: posts,
      //  page: page,
      //  isFirstPage: (page - 1) == 0,
      //  isLastPage: ((page - 1) * 5 + posts.length) == total,
      //  user: req.session.user,
      //  success: req.flash('success').toString(),
      //  error: req.flash('error').toString()
      //});

    });
    console.log('req:'+req);
    console.log('name:'+res);
  });
  app.get('/news_node/', function (req, res) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
    var page = parseInt(req.query.p) || 1;
    //查询并返回第 page 页的 10 篇文章
    Post.getTen(null, page, function (err, posts, total) {
      if (err) {
        posts = [];
      }

      res.json(posts);
      //for (var i=0;i<req.body.length;++i){
      //  res.json(posts[i]);
      //  console.log('name:'+res);
      //}
    });
  });
  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!');
      res.redirect('/login');
    }
    next();
  }
  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!');
      res.redirect('back');
    }
    next();
  }
};