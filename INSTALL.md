# Install

아래는 Arch Linux 를 가정.


## Nginx

Mac 개발환경용 Nginx 설정 예

    server {
      listen 8080;
      server_name rapixel.local;
      root /Users/drypot/projects/rapixel/website/public;

      client_max_body_size 10m;

      location / {
        proxy_pass http://localhost:8020;
        proxy_set_header Host $http_host;
      }

      location /modules/ {
      }

      location /modules/bower/ {
        alias /Users/drypot/projects/rapixel/website/bower_components/;
      }
    }

    server {
      listen 8080;
      server_name file.rapixel.local;
      root /Users/drypot/projects/rapixel/website/upload/rapixel/public;
    }

## Requirements

mongodb, redis, imagemagick.


## ImageMagick

libpng 는 svg 지원 설치하면서 설치되는 것 같다.

    $ pacman -S imagemagick
    $ pacman -S librsvg <-- svg 지원을 위해 필요


## Clone Source

프로젝트 클론.

    $ mkdir /data/web
    $ cd /data/web

    $ git clone https://github.com/drypot/rapixel.git
    $ cd rapixel

    $ npm install

설정파일 생성.

    config/rapixel-live.json

실행.

    bin/run rapixel live


## 서비스로 등록

/usr/lib/systemd 디렉토리는 패키지의 유닛 파일들만 들어간다.
사용자 추가 유닛들은 /etc/systemd/system 에 생성.

    /etc/systemd/system/rapixel.serivce

    [Unit]
    Description=Rapixel
    Requires=nginx.service mongodb.service redis.service
    After=nginx.service mongodb.service redis.service

    [Service]
    User=drypot
    Restart=always
    RestartSec=15
    WorkingDirectory=/data/web/rapixel
    ExecStart=/usr/bin/node lib/app/app.js --config config/rapixel-live.json
    Environment=NODE_ENV=production

    [Install]
    WantedBy=multi-user.target

* Group 을 지정하지 않으면 유저 기본 그룹을 사용.
* StandardOutput 을 지정하지 않으면 journal 을 사용.
* syslog 를 지정하면 syslog 에도 쌓이고 journal 에도 쌓인다. journal 에는 기본적으로 쌓임.
* [Install] 파트는 enable, disable 명령에서 사용한다.
