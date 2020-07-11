// // Main purpose of this scrip is to 
// // 1. Get image from ftp connection
// // 2. Watermark image
// // 3. Save on ftp to h4_FILENAME.EXT
const fetch = require('node-fetch');
const fs = require('fs');

const ftpClient = require('ftp');
const ftpAccess = require('../../../../config/ftp_access');

const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const watermark = require('dynamic-watermark');

 exports.runh4 = async (filename) => {
    const c = new ftpClient();
    c.on('ready', () => {
        c.list('photoImages/bunch', async (err, list) =>{
            if (err) throw err;
            const list_filtered = list.filter(obj => {
                if(
                    !obj.name.includes('logo-') &&
                    !obj.name.includes('h4_')   &&
                    !obj.name.includes('image-')
                ) return obj.name;
            });
            
            for(const entity of list) console.log(entity.name);

            // console.log(list_filtered.length);
            // console.log(list);
            
            
            
               console.log(1, await check_is_h4(filename, list.map(o => o.name))) // 5d77b4c4314bf35719e6ff45.jpg
              
            c.end();
        });
    });

    // connect to localhost:21 as anonymous
    c.connect(ftpAccess);

    return await download_image(filename)
    .then(async () => {
        return await watermarking_1(filename)
        .then(async ()=> {
            return await watermarking_2(filename)
            .then(async ()=> {
                return await upload_image(filename)
                .then(async ()=> {
                    fs.unlink(__dirname + '/stage1/' + filename, (err) => {
        if (err) throw err;
        console.log('File was deleted');
    });
    fs.unlink(__dirname + '/stage2/' + filename, (err) => {
        if (err) throw err;
        console.log('File was deleted');
    });
    fs.unlink(__dirname + '/stage3/' + filename, (err) => {
        if (err) throw err;
        console.log('File was deleted');
    });
                    return true;
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

};

// checking is corrent processing image have its watermarked copy (h4_...)
const check_is_h4 = async (filename, list) => {
    const h4_name = 'h4_' + filename;
    console.log(h4_name);
    //console.log('h4_5d77b4c4314bf35719e6ff45.jpg');
    //console.log(h4_name === 'h4_5d77b4c4314bf35719e6ff45.jpg');
    //console.log(list);
    
    if(await list.includes(h4_name)) return true;
    else return false;
    //return list.includes(h4_name) ?  true : false;
}

const download_image = async (filename) => {
    console.log(36,filename)
    console.log(38,__dirname)
    return new Promise((resolve, reject)=> {
        fetch('https://stock.vavel.com/s/photoImages/bunch/' + filename)
        .then( img => {
            console.log(43,img);
            const dest = fs.createWriteStream(__dirname + '/stage1/'+ filename);
            console.log(33,dest)
            img.body.pipe(dest);
            img.body.on("error", (err) => {
                fileStream.close();
                reject(err);
            });
            dest.on("finish", () => {
                dest.close();
                resolve();
            });
        }).catch(err => console.log(err) );
    });
};

// this.runh4('5d5b17e944a9a625d8fe4b2d.png');


// download_image('5d1b881cd8b8515ac098ac93.jpg');

const watermarking_1 =  async (filename) => {
    dimensions = await sizeOf(__dirname + '/stage1/' + filename);
    return new Promise((resolve, reject)=> {
        //console.log(__dirname);

        console.log(83, dimensions);
        const options_image_watermark_1 = {
            type: "image",
            source: __dirname + '/stage1/' + filename, 
            logo: __dirname + '/../medium_croped.png', 
            destination: __dirname + '/stage2/' + filename, 
            position: {
                logoX : dimensions.width -  (dimensions.width /5) - 10,
                logoY : dimensions.height -  (dimensions.width/ 5 / 3) - 10,
                logoHeight: (dimensions.width/ 5 / 3),
                logoWidth: (dimensions.width /5)
            }
        };
        watermark.embed(options_image_watermark_1, (status) => {
            if( status.status === 1 ) resolve(true); 
            if( status.status !== 1 ) reject(true); 
        });       
    });
};

// watermarking_1('5d1b881cd8b8515ac098ac93.jpg');

const watermarking_2 =  async (filename) => {
    console.log(3,filename)
    dimensions = await sizeOf(__dirname + '/stage2/' + filename);
    return new Promise((resolve, reject) => {
        const options_image_watermark_2 = {
            type: "image",
            source: __dirname + '/stage2/' + filename, 
            logo: __dirname + '/../medium.png', 
            destination: __dirname + '/stage3/' + filename, 
            position: {
                logoX : dimensions.width / 2 - ((dimensions.width / 100) * 80 / 2),
                logoY : dimensions.height / 2 - (dimensions.height / 10 / 2), //dimensions.height
                logoHeight:  (dimensions.width / 100) * 6,
                logoWidth: (dimensions.width / 100) * 80
            }
        };

        watermark.embed(options_image_watermark_2, (status) => {
            if( status.status === 1 ) resolve(true); 
            if( status.status !== 1 ) reject(true); 
        });
    });
};

// watermarking_2('5d1b881cd8b8515ac098ac93.jpg');

const upload_image = async (filename) => {
    const c = new ftpClient();
    c.on('ready', () => {
        c.put(__dirname + '/stage3/' + filename, '/photoImages/bunch/h5_' + filename, async (err) => {
            console.log('callback 1.1: ', err);
            //callback(err, "ok");
            c.end();
        });

    });

    // connect to localhost:21 as anonymous
    c.connect(ftpAccess);

    // DELETE IMAGE FILES FUNCTIONS
    // fs.unlink(__dirname + '/stage1/' + filename, (err) => {
    //     if (err) throw err;
    //     console.log('File was deleted');
    // });
    // fs.unlink(__dirname + '/stage2/' + filename, (err) => {
    //     if (err) throw err;
    //     console.log('File was deleted');
    // });
    // fs.unlink(__dirname + '/stage3/' + filename, (err) => {
    //     if (err) throw err;
    //     console.log('File was deleted');
    // });
};

// upload_image('5d1b881cd8b8515ac098ac93.jpg');

