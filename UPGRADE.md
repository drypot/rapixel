# Upgrade

## 전역 툴 업데이트

    $ npm install -g mocha
    $ npm install -g bower

## 서비스 중지

    $ sudo systemctl stop rapixel
    $ sudo systemctl stop osoky
    $ sudo systemctl stop drypot

## 코드 업데이트

    $ git pull
    $ npm install
    $ bower install

## 설정 업데이트

    ftp config files.

## 테스트 런

    $ node bin/run rapixel live

## 서비스 재실행

    $ sudo systemctl start rapixel
    $ sudo systemctl start osoky
    $ sudo systemctl start drypot
