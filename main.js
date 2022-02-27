var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

//refactoring


var app = http.createServer(function(request,response){
    var _url = request.url; //브라우저에서 url을 받음
    var queryData = url.parse(_url, true).query; // url에서 query string 추출
    var pathname = url.parse(_url, true).pathname;
    if(pathname==='/'){ //정상적인 페이지인 경우
        if(queryData.id === undefined){ //Home 페이지인 경우
            fs.readdir('./data/', (error,filelist) => {
            var title = 'Welcome';
            var description = 'Hello, Node.js';
            var list = template.list(filelist);
            var html = template.html(title,list,`<h2>${title}</h2><p>${description},</p>`,`<a href="/create">create</a>`)
            response.writeHead(200);
            response.end(html); //브라우저 화면에 출력
            });
            
            }
        else{ // Home 페이지가 아닌 경우
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
                    response.end(html); //브라우저 화면에 출력
                    });
            });
        }
    }
    else if(pathname==='/create'){
        fs.readdir('./data/', (error,filelist) => {
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.html(title,list,`
            <form action="/create_process" method="post"> <!-- 서버에 데이터를 보낼때는 method를 post로 반드시 설정-->
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
            response.end(html); //브라우저 화면에 출력
            });
    }
    else if(pathname === '/create_process'){
        var body = '';
        request.on('data',function(data){ //body에 전송된 데이터 넣기
            body+=data;
        });
        request.on('end',function(){
            var post = qs.parse(body); // post에 body내용을 parse
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
                <form action="/update_process" method="post"> <!-- 서버에 데이터를 보낼때는 method를 post로 반드시 설정-->
                <input type="hidden" name="id" value="${title}"> <!-- 파일의 이전 이름을 알기 위해서 이전 title값을 보내야함-->
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
                response.end(html); //브라우저 화면에 출력
                });
        });
    }
    else if(pathname ==='/update_process'){
        var body = '';
        request.on('data',function(data){ //body에 전송된 데이터 넣기
            body+=data;
        });
        request.on('end',function(){
            var post = qs.parse(body); // post에 body내용을 parse
            var id = post.id
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`,`data/${title}`,function(error){ //파일 rename과정
                fs.writeFile(`data/${title}`,description,'utf8',function(err){ //파일 redescription 과정
                    response.writeHead(302,{Location:`/?id=${title}`}); //redirecting
                    response.end();
                })
            })
        });
    }
    else if(pathname ==='/delete_process'){
        var body = '';
        request.on('data',function(data){ //body에 전송된 데이터 넣기
            body+=data;
        });
        request.on('end',function(){
            var post = qs.parse(body); // post에 body내용을 parse
            var id = post.id
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`,function(error){
                response.writeHead(302,{Location:`/`}); //redirecting
                response.end();
            })
        });
    }
    else{ // 비정상적인 페이지인 경우
        response.writeHead(404);
        response.end('Not found'); //브라우저 화면에 출력
      }
    });
    app.listen(3000); 