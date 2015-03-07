# To-Do


* 세션 끝났는데 업로드하면 에러 난다.

* connect-mulitparty 를 https://github.com/andrewrk/node-multiparty/ 직접 사용으로 교체.
근데 이게 무슨 필요?

* multiparty 를 필요한 곳으로 한정

    var multipart = require('connect-multiparty');
    var multipartMiddleware = multipart();
    app.post('/upload', multipartMiddleware, function(req, resp) {

* 클릭시 자동으로 풀 화면

## Done

* about 등 사용불가능한 유저명을 처리하고 있나?

  홈페이지에서 User Profile 페이지로의 접근은 유저 번호로 한다.

