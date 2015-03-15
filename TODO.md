# To-Do

* connect-mulitparty 를 https://github.com/andrewrk/node-multiparty/ 직접 사용으로 교체.
근데 이게 무슨 필요?

* 클릭시 자동으로 풀 화면

## Done

* about 등 사용불가능한 유저명을 처리하고 있나?

    해결: 홈페이지에서 User Profile 페이지로의 접근은 유저 번호로 한다.

* multiparty 를 필요한 곳으로 한정

    해결: 안 하는 것으로.

        var multipart = require('connect-multiparty');
        var multipartMiddleware = multipart();
        app.post('/upload', multipartMiddleware, function(req, resp) {

* api 리퀘스트 처리 시에는 자동 로그인이 작동하지 않는다.

    해결: api url 을 자동 로그인에서 예외로 만들던 if 구문 삭제.
    api 호출시 세션 쿠키를 보내지 않아 세션 디비가 무한히 커지는 상황을 걱정해서 이리 했던 듯.