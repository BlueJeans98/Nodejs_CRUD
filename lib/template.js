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
    }, //��ü���� html�� ����� �ڵ�
    list:function(filelist){
        var list = '<ul>'; // ����� HTML �ڵ带 �������� ����� ���� ���ڿ�.
        for(var i=0;i<filelist.length;i++){
            list+=`<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        }
        list+='<ul>'
        return list;
    } // file list�� html�� �������� ����� �ڵ�
}