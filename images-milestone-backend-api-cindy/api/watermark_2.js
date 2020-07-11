const fs = require('fs');
const path = require('path');
const async = require('async');
const { promisify } = require('util');
const imageMagick = require('imagemagick');

const text2png = require('text2png');
//const merge_img = require('merge-img'); // OLD 
//const merge_images = require('merge-images');
const image_size = promisify(require('image-size'));
const watermark = require('dynamic-watermark');

const MAX_SIZE = 1400;

function getDimentionsHeight(dimensions) {
    const percent = dimensions.width * 100 / dimensions.oldWidth / 100;

    return Math.round(dimensions.height * percent);
}

const resize_image = async (filename, { width, height }) => {
    return new Promise(resolve => {
      imageMagick.resize({
        width,
        height,
        srcPath: __dirname + '/uploads/' + filename,
        dstPath: __dirname + '/uploads/tmp_' + filename,
        quality: 100,
      }, err => {
        if (err) {
          console.log('*** Create Thumbnail error ***', err);
        }
        resolve();
      });
    })
  }

exports.start = async (filename_ext, username, oldDimensions) => {
    const filename = filename_ext.split('.').slice(0, -1).join('.');
    const extension = filename_ext.split('.').slice(-1).join('.');

    const dimensions = { ...oldDimensions };

    dimensions.oldWidth = dimensions.width;
    dimensions.oldHeight = dimensions.height;
    dimensions.width = dimensions.width > MAX_SIZE ? MAX_SIZE : dimensions.width;
    dimensions.height = getDimentionsHeight(dimensions);

    await resize_image(filename_ext, dimensions);

    // 1. text to png
    return await name_to_png(filename, username).then(async () => {
        // 2. merge logo png and name image
        return await merge_logo_name(filename).then(async () => {
            // 3. watermarking
            return await merge_image_logo(filename, extension, dimensions).then(async () => {
                console.log("EVERYTHING MUST BE OK in stage 1");
                return await require('./watermark').run(filename_ext, username, dimensions).then(async (returned) => {
                    console.log('*** create watermark result ***', returned)
                    return returned;
                }).catch(err => console.log('1*** create watermark error ***', err));
            }).catch(err => console.log('*** merge_image_logo error ***', err));
        }).catch(err => console.log('*** merge_logo_name error ***', err));
    }).catch(err => console.log('*** name_to_png error ***', err));


};

const name_to_png = async (filename, name) => {
    return new Promise(async (resolve, reject) => {
        const options = {
            font: '30px Calibri',
            localFontPath: __dirname + '/watermark-second/config/CalibriRegular.ttf',
            localFontName: 'Calibri',
            color: '#FFFFFF',
            backgroundColor: 'transparent',
            lineSpacing: 1,
            padding: 10
        };
        // console.log(676,userData);

        console.log(name)

        await fs.writeFile(
            __dirname + '/watermark-second/' + filename + '_name.' + 'png',
            text2png(name.toUpperCase(), options), (err) => {
                if (err) { return reject(err); }
                else { return resolve(); }
            }
        );
    });
};


const merge_logo_name = async (filename) => {
    return new Promise(async (resolve, reject) => {
        // argument in image_size(..) does't work correctly with __dirname
        const dimensions_name = await image_size(`./api/watermark-second/${filename}_name.png`);

        const options = {
            type: "image",
            source: __dirname + '/watermark-second/config/bottom-right.png', // 641 x 198
            logo: '\"' + __dirname + `/watermark-second/${filename}_name.png\"`,
            destination: __dirname + `/watermark-second/${filename}_water.png`,
            position: {
                logoX: 210,
                logoY: 40,
                logoHeight: dimensions_name.height,
                logoWidth: dimensions_name.width
            }
        };
        watermark.embed(options, (status) => {
            if (status.status === 1) resolve(true);
            if (status.status !== 1) reject(true);
        });
    });
};

const merge_image_logo = async (filename, extension, dimensions) => {
    return new Promise(async (resolve, reject) => {

        const options = {
            type: "image",
            source: __dirname + `/uploads/tmp_${filename}.${extension}`,
            logo: '\"' + __dirname + `/watermark-second/${filename}_water.png\"`,
            destination: __dirname + `/watermark-second/${filename}.${extension}`,
            position: {
                logoX: dimensions.width - (dimensions.width / 4 * 1.5) + 30,
                logoY: dimensions.height - ((dimensions.width / 4) / 10 * 3 * 2),
                logoHeight: (dimensions.width / 4) / 10 * 3 * 1.5, // 30 % of width
                logoWidth: dimensions.width / 4 * 1.5
            }
        };
        watermark.embed(options, (status) => {
            if (status.status === 1) resolve(true);
            if (status.status !== 1) reject(true);
        });
    });
};

//this.start('moc.jpg', 'Хуйня Блять', { width: 1169, height: 781 });
