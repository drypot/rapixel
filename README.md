# Rapixel

Image gallery running following sites.

* [https://rapixel.com](https://rapixel.com)
* [https://osoky.com](https://osoky.com)
* [https://drypot.com](https://drypot.com)

## Requirements

mongodb, redis, ImageMagick

## How to run

    bin/run

## History

2015.03.01 2 년만에 라이브러리 업데이트

2013.08.28 Drypot, Osoky 코드를 Rapixel 코드로 통합

2013.07.06 Drypot 개발 시작, 사이트 오픈.

2013.06.24 Osoky 개발 시작, 사이트 오픈.

2013.06.04 공식 오픈 공지

2013.05.15 Rapixel 첫 디자인을 입혔다.

2013.05.05 Rapixel 사진등록 시작.

2013.05.01 Rapixel 회원등록 시작.

2013.05.01 갑자기 개발 시작.

2011.04.06 rapixel.com 도메인 구매. 사진 한 장 올려두고 2 년간 방치.


## Nginx

개발환경용 Nginx 설정 예

    server {
      listen 8080;
      server_name rapixel.local;
      root /Users/drypot/projects/rapixel/website/public;

      client_max_body_size 10m;

      location / {
        proxy_pass http://localhost:8020;
        proxy_set_header Host $http_host;
      }

      location ~ /(?:css|image|js|lib)/ {
      }
    }

    server {
      listen 8080;
      server_name file.rapixel.local;
      root /Users/drypot/projects/rapixel/website/upload/rapixel/public;
    }


## License

[MIT](LICENSE)