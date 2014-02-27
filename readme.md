# Rapixel

Image gallery powering the following sites.

* [https://rapixel.com](https://rapixel.com)
* [https://osoky.com](https://osoky.com)
* [https://drypot.com](https://drypot.com)

## How to run

	node lib/app/app.js --config config/rapixel-dev.json

## History

2013.08.28 Drypot, Osoky 코드를 Rapixel 코드로 통합

2013.07.06 Drypot 개발 시작, 사이트 오픈.

2013.06.24 Osoky 개발 시작, 사이트 오픈.

2013.06.04 공식 오픈 공지

2013.05.15 Rapixel 첫 디자인을 입혔다.

2013.05.05 Rapixel 사진등록 시작.

2013.05.01 Rapixel 회원등록 시작.

2013.05.01 갑자기 사이트를 오픈하고 싶어졌다. 개발 시작.

2011.04.06 rapixel.com 도메인 구매. 사진 한 장 올려두고 2 년간 방치.


## Nginx

개발환경용 Nginx 설정 예

	server {
		listen 8080;
		server_name rapixel;
		root /Users/drypot/projects/rapixel/website/public;

		client_max_body_size 10m;

		location / {
			proxy_pass http://localhost:8802;
			proxy_set_header Host $http_host;
		}

		location ~ /(?:css|image|js|lib)/ {
		}
	}

	server {
		listen 8080;
		server_name rapixel-file;
		root /Users/drypot/projects/rapixel/website/upload-rapixel/public;
	}


## License

The MIT License (MIT)

Copyright (c) 2013 Kyuhyun Park

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
