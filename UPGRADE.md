# Upgrade

## 서비스 중지

    sudo systemctl stop rapixel
    sudo systemctl stop osoky
    sudo systemctl stop drypot

## 디비 백업

    sudo systemctl stop mongodb
    cp ...

## Arch Linux 업데이트

    sudo pacman -Syu

invalid or corrupted package 오류나면 키 업데이트

    sudo pacman-key --refresh-keys

Arch 서비스 Fail 나면

    pacman -Rs ... 로 패키지 삭제했다가
    pacman -S ... 로 재설치.

## 전역 툴 업데이트

    sudo npm install -g mocha
    sudo npm install -g bower

## 코드 업데이트

    git pull
    
    npm install
    bower install

## 설정 업데이트

    config/...

## 테스트 런

    node bin/run rapixel live

## 재부팅

    reboot

## 필요하면 서비스 재실행

    sudo systemctl restart rapixel
    sudo systemctl restart osoky
    sudo systemctl restart drypot
