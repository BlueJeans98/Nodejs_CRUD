var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

//refactoring


var app = http.createServer(function(request,response){
    var _url = request.url; //���������� url�� ����
    var queryData = url.parse(_url, true).query; // url���� query string ����
    var pathname = url.parse(_url, true).pathname;
    if(pathname==='/'){ //�������� �������� ���
        if(queryData.id === undefined){ //Home �������� ���
            fs.readdir('./data/', (error,filelist) => {
            var title = 'Welcome';
            var description = 'Hello, Node.js';
            var list = template.list(filelist);
            var html = template.html(title,list,`<h2>${title}</h2><p>${description},</p>`,`<a href="/create">create</a>`)
            response.writeHead(200);
            response.end(html); //������ ȭ�鿡 ���
            });
            
            }
        else{ // Home �������� �ƴ� ���
            fs.readdir('./data/', (error,filelist) => {
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8' , (err, description) => {
                    var title = queryData.id
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description,{
                        allowedTags:['h1']
                    });
                    var list = template.list(filelist);
                    var html = template.html(sanitizedTitle,list,`<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,`
                    <a href="/create">create</a> 
                    <a href ="/update?id=${sanitizedTitle}">update</a> 
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete">
                    </form>`)
                    response.writeHead(200);
                    response.end(html); //������ ȭ�鿡 ���
                    });
            });
        }
    }
    else if(pathname==='/create'){
        fs.readdir('./data/', (error,filelist) => {
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.html(title,list,`
            <form action="/create_process" method="post"> <!-- ������ �����͸� �������� method�� post�� �ݵ�� ����-->
            <p><input type='text' name="title" placeholder = "title"></p>
            <p>
                <textarea name="description"  placeholder ="description"></textarea>
            </p>
            <p>
                <input type='submit'>
            </p>
            </form>
            `,'')
            response.writeHead(200);
            response.end(html); //������ ȭ�鿡 ���
            });
    }
    else if(pathname === '/create_process'){
        var body = '';
        request.on('data',function(data){ //body�� ���۵� ������ �ֱ�
            body+=data;
        });
        request.on('end',function(){
            var post = qs.parse(body); // post�� body������ parse
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`,description,'utf8',function(err){
                response.writeHead(301,{Location:`/?id=${title}`});
                response.end();
            })
        });
    }
    else if(pathname == '/update'){
        fs.readdir('./data/', (error,filelist) => {
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8' , (err, description) => {
                var title = queryData.id
                var list = template.list(filelist);
                var html = template.html(title,list,`
                <form action="/update_process" method="post"> <!-- ������ �����͸� �������� method�� post�� �ݵ�� ����-->
                <input type="hidden" name="id" value="${title}"> <!-- ������ ���� �̸��� �˱� ���ؼ� ���� title���� ��������-->
                <p><input type='text' name="title" value = "${title}"></p>
                <p>
                    <textarea name="description">${description}</textarea>
                </p>
                <p>
                    <input type='submit'>
                </p>
                </form>
                `,`<a href="/create">create</a> <a href ="/update?id=${title}">update</a>`)
                response.writeHead(200);
                response.end(html); //������ ȭ�鿡 ���
                });
        });
    }
    else if(pathname ==='/update_process'){
        var body = '';
        request.on('data',function(data){ //body�� ���۵� ������ �ֱ�
            body+=data;
        });
        request.on('end',function(){
            var post = qs.parse(body); // post�� body������ parse
            var id = post.id
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`,`data/${title}`,function(error){ //���� rename����
                fs.writeFile(`data/${title}`,description,'utf8',function(err){ //���� redescription ����
                    response.writeHead(302,{Location:`/?id=${title}`}); //redirecting
                    response.end();
                })
            })
        });
    }
    else if(pathname ==='/delete_process'){
        var body = '';
        request.on('data',function(data){ //body�� ���۵� ������ �ֱ�
            body+=data;
        });
        request.on('end',function(){
            var post = qs.parse(body); // post�� body������ parse
            var id = post.id
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`,function(error){
                response.writeHead(302,{Location:`/`}); //redirecting
                response.end();
            })
        });
    }
    else{ // ���������� �������� ���
        response.writeHead(404);
        response.end('Not found'); //������ ȭ�鿡 ���
      }
    });
    app.listen(3000); 