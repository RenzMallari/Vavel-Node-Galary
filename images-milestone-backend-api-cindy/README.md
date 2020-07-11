# README #

# VERSIONS #

MONGO VERSION: 4.0.3

NODE VERSION: 12.2.0

**ELASTIC SEARCH VERSION 6.8.3**

wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.8.3.deb

sudo dpkg -i elasticsearch-6.8.3.deb

/etc/init.d/elasticsearch start

# INSTALLATION #

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm &&  nvm install 12.2.0 &&  sudo apt update &&  sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 4B7C549A058F8B6B &&  echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb.list &&  sudo apt update &&  sudo apt install mongodb-org &&  wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.8.3.deb &&  sudo apt-get install default-jre &&  sudo apt-get install default-jdk &&  sudo dpkg -i elasticsearch-6.8.3.deb &&  /etc/init.d/elasticsearch start && sudo apt install redis-server &&  sudo apt install nginx && sudo apt-get install graphicsmagick &&  sudo apt install imagemagick && cd imgs-andrew &&  mongorestore --db img 78/img && npm i grunt -g        

BACKUP OF DATABASE IN folder 67/

**after mongorestore run this > populate from mongo to ES**
node tasks/es-reindex.js

Install Redis

**To build sources**
sudo grunt dev --force
sudo start -c nodemon bin/www


# NO NEED FOR INSTALL, JUST DOC #

**Where fix max size of upload?**
/public/js/app/controllers/uploadimg-ctrl.js 100 row

**Where fix resize**
useralbums.js 175 row
176 row is max width size

https://gist.github.com/witooh/089eeac4165dfb5ccf3d

run this command to install the mongoose redis cache

sudo npm install mongoose-redis-cache --save


netstat -anv | grep 8085
netstat -lutpn | grep 8085

docker-compose up
docker exec -it mongo /bin/bash
mongorestore --drop -d img /home/img-dump/img

redis-cli
FLUSHALL
FLUSHDB

ps -aef | grep elasticsearch 

**for watermarks need to install**

imagemagick and graphicsmagick