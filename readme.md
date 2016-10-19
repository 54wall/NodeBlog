##N-blog-WalkingDead
使用Node+Express+Bootsrap实现的多人博客，参考github：<a href="https://github.com/nswbmw/N-blog">nswbmw/N-blog:使用 Express + MongoDB 搭建多人博客</a>.
因为MongoHQ已经不再能使用，我的项目使用的是<a href="https://mlab.com">Mlab</a>。
完整项目已经部署到<a href="https://dashboard.heroku.com/">Heroku</a>。
完整项目请浏览
<a href="https://my-walkingdead.herokuapp.com/">54wall-WalkingDead</a>。

桌面01

![桌面01](https://github.com/54wall/N-blog-WalkingDead/blob/master/readme_resouce/N-Blog-WalkingDeading_01.jpg)

桌面02

![桌面02](https://github.com/54wall/N-blog-WalkingDead/blob/master/readme_resouce/N-Blog-WalkingDeading_02.jpg)

手机端03

![手机端03](https://github.com/54wall/N-blog-WalkingDead/blob/master/readme_resouce/N-Blog-WalkingDeading_03.jpg)

目前的问题是部署到Heroku上的对于未登陆用户，直接post新增内容，直接会报错，然后必须注册才不会报错，对于已经登陆的用户，则是如果选择注册选项，则也是报错，必须先登出logout！
