//旧版本已经停用，注意版本更新
//var mongodb = require('mongodb').Db,
var settings = require('../settings'),
    markdown = require('markdown').markdown;
var mongodb = require('mongodb');
//开始漏了function Post(name, title, post,tags)中的tags,直接报错tags is not defined,修改后注意清空数据库重新加载，不然会报ejs页面无法返回的错误
function Post(name, title,tags, post) {
    this.name = name;
    this.title = title;
    //var post中没有变不会显示紫色，代表没有经过编译

    this.post = post;
    this.tags = tags;
}

module.exports = Post;

//一次获取十篇文章
Post.getTen = function(name, page, callback) {
    //打开数据库
    //TypeError: mongodb.MongoClient.connect is not a function
    //Cannot read property 'connect' of undefined
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            //使用 count 返回特定查询的文档数 total
            collection.count(query, function (err, total) {
                //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
                collection.find(query, {
                    skip: (page - 1)*5,
                    limit: 5
                }).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    db.close();
                    if (err) {
                        return callback(err);
                    }
                    //解析 markdown 为 html
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs, total);
                });
            });
        });
    });
};
//返回某一标签全部文章，返回的post包含全部时间内容评论等数据
Post.getAllTag = function(tag, callback) {
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //查询所有 tags 数组内包含 tag 的文档
            //并返回只含有 name、time、title 组成的数组
            collection.find({
                "tags": tag
            }, {
                "name": 1,
                "time": 1,
                "post": 1,
                "comments": 1,
                "tags": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                db.close();
                if (err) {
                    return callback(err);
                }
                //解析 markdown 为 html
                docs.forEach(function (doc) {
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);
            });
        });
    });
};
/*这个仅返回标签个数*/
Post.getTagNum = function(tag, callback) {
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //查询所有 tags 数组内包含 tag 的文档
            collection.find({
                "tags": tag
            }, {
                "name": 1,
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                db.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

Post.getTenTag = function(tag,page, callback) {
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //查询所有 tags 数组内包含 tag 的文档
            //并返回只含有 name、time、title 组成的数组
            //collection.count(tag, function (err，total) {
                collection.find({
                    "tags": tag
                }, {
                    skip: (page - 1) * 5,
                    limit: 5,
                    "name": 1,
                    "time": 1,
                    "post": 1,
                    "comments": 1,
                    "tags": 1,
                    "title": 1
                }).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    db.close();
                    if (err) {
                        return callback(err);
                    }
                    //解析 markdown 为 html
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs);//callback(null, docs, total);
                });
            //});
        });
    });
};
//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        tags: this.tags,
        post: this.post,
        comments: []
    };
    //打开数据库
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(post, {
                safe: true
            }, function (err) {
                db.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null);//返回 err 为 null
            });
        });
    });
};

//读取全部文章文章及其相关信息
//Post.getAll = function(name, callback) {
//
//    //打开数据库
//    mongodb.MongoClient.connect(settings.url, function (err, db) {
//        if (err) {
//            return callback(err);
//        }
//        //读取 posts 集合
//        db.collection('posts', function(err, collection) {
//            if (err) {
//                db.close();
//                return callback(err);
//            }
//            var query = {};
//            if (name) {
//                query.name = name;
//            }
//            //根据 query 对象查询文章
//            collection.find(query).sort({
//                time: -1
//            }).toArray(function (err, docs) {
//                db.close();
//                if (err) {
//                    return callback(err);//失败！返回 err
//                }
//                //解析 markdown 为 html
//                docs.forEach(function (doc) {
//                    if (doc) {
//                        doc.post = markdown.toHTML(doc.post);
//                        doc.comments.forEach(function (comment) {
//                            comment.content = markdown.toHTML(comment.content);
//                        });
//                    }
//                });
//                callback(null, docs);//成功！以数组形式返回查询的结果
//            });
//        });
//    });
//};

//获取一篇文章
Post.getOne = function(name, day, title, callback) {
    //打开数据库
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //根据用户名、发表日期及文章名进行查询
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                db.close();
                if (err) {
                    return callback(err);
                }
                //解析 markdown 为 html
                doc.post = markdown.toHTML(doc.post);
                callback(null, doc);//返回查询的一篇文章
            });
        });
    });
};
//返回原始发表的内容（markdown 格式）
Post.edit = function(name, day, title, callback) {
    //打开数据库
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //根据用户名、发表日期及文章名进行查询
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                db.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);//返回查询的一篇文章（markdown 格式）
            });
        });
    });
};
//更新一篇文章及其相关信息
Post.update = function(name, day, title, post, callback) {
    //打开数据库
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                $set: {post: post}
            }, function (err) {
                db.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
//删除一篇文章
Post.remove = function(name, day, title, callback) {
    //打开数据库
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //根据用户名、日期和标题查找并删除一篇文章
            collection.remove({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                w: 1
            }, function (err) {
                db.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
//返回所有文章存档信息 https://github.com/nswbmw/N-blog/wiki/第8章--增加存档页面
Post.getArchive = function(callback) {
    //打开数据库
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //返回只包含 name、time、title 属性的文档组成的存档数组
            collection.find({}, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                db.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};
//返回所有标签
Post.getTags = function(callback) {
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //distinct 用来找出给定键的所有不同值
            collection.distinct("tags", function (err, docs) {
                db.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
            //查询所有 tags 数组内包含 tag 的文档
            //并返回只含有 name、time、title 组成的数组
            collection.find({
                "tags": tag
            }, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                db.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};