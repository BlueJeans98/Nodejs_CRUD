module.exports = {
    html:function(title,list,body,control){
        return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>${title}</title>
            </head>
            <body>
                <h1><a href="/">WEB</a></h1>
                ${list}
                ${control}
                ${body}
            </body>
        </html>
        `;
    }, //전체적인 html을 만드는 코드
    list:function(filelist){
        var list = '<ul>'; // 출력할 HTML 코드를 동적으로 만들기 위한 문자열.
        for(var i=0;i<filelist.length;i++){
            list+=`<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        }
        list+='<ul>'
        return list;
    } // file list의 html을 동적으로 만드는 코드
}