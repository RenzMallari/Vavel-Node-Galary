# Preparation

1. Install docker

`brew install docker docker-compose docker-machine kubectl`

2. Install `n` node module globaly

`npm install -g n`

or

`sudo npm install -g n`

3. Install grunt

`npm install -g grunt-cli`

or 

`sudo npm install -g grunt-cli`

4. Install nodemon

`npm install -g nodemon`

or

`sudo npm install -g nodemon` 

5. Install redis-cli

`sudo npm install -g redis-cli`

6. Install (download and run) elasticsearch 2.2.0

`https://download.elasticsearch.org/elasticsearch/release/org/elasticsearch/distribution/zip/elasticsearch/2.2.0/elasticsearch-2.2.0.zip`

and unpack it anywhere,
after unpack go to it's directory to `bin/` folder and run

`./elasticsearch`

let it running when you installing and serving project.

# Clone project to your directory

`git clone https://NikitaKompanetc@bitbucket.org/fran_cande/images-vvl.git`


# Make your node to be 8.0.0 with n

`sudo n 8.0.0` - version we needed

`sudo n lts` - version to choose

In menu of n module choose needed version and hit enter

`sudo n` -> choose (arrow keys) -> `Enter`

Check version of node

`node -v`


# Installing docker image/container

`docker-compose up`

`docker exec -it mongo /bin/bash` (`docker exec -it img /bin/bash`, `docker exec -it mongo_img /bin/bash`)

`mongorestore --drop -d img /home/img-dump/img`
# Installing everything



In project directory try to run:

`sudo node components/import_mongo_elasticsearch.js`

`sudo ./install`

`sudo grunt dev --force`

`sudo npm install mongoose-redis-cache --save`

# Finita la comedia

`./s`