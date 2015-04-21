# To-Do

* /users 신규 가입자 목록


## Done

* connect-mulitparty 를 https://github.com/andrewrk/node-multiparty/ 직접 사용으로 교체.

    완료

* 클릭시 자동으로 풀 화면

    페이지 변경되면 브라우저 창이 원상복귀되는 한계가 있다.

* about 등 사용불가능한 유저명을 처리하고 있나?

    홈페이지에 있는 User Profile 링크는 유저 번호를 사용한다.

* multiparty 를 필요한 곳으로 한정

    완료

* api 리퀘스트 처리 시에는 자동 로그인이 작동하지 않는다.

    api url 을 자동 로그인에서 예외로 만들던 if 구문 삭제.
    api 호출시 세션 쿠키를 보내지 않아 세션 디비가 무한히 커지는 상황을 걱정해서 이리 했던 듯.
