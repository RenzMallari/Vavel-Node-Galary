const fs = require('fs');
const path = require('path');
const async = require('async');
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));
const imageMagick = require('imagemagick');
const text2png = require('text2png');
const merge_img = require('merge-img');
const watermark = require('dynamic-watermark');

require('bluebird')

const check_dirs = async () => {
  //console.log(11, 'Checking dirs existance');

  const dir1 = __dirname + '/uploads/';
  const dir2 = __dirname + '/uploads/watermark-conf/';
  const dir3 = __dirname + '/uploads/watermarked_1/';
  const dir4 = __dirname + '/uploads/watermarked_2/';
  const dir5 = __dirname + '/uploads/watermarks/';
  const dir6 = __dirname + '/uploads/watermarks_2/';

  // console.log(1, !fs.existsSync(dir1));
  // console.log(2, !fs.existsSync(dir2));
  // console.log(3, !fs.existsSync(dir3));
  // console.log(4, !fs.existsSync(dir4));
  // console.log(5, !fs.existsSync(dir5));
  // console.log(6, !fs.existsSync(dir6));

  if (!fs.existsSync(dir1)) fs.mkdirSync(dir1);
  if (!fs.existsSync(dir2)) fs.mkdirSync(dir2);
  if (!fs.existsSync(dir3)) fs.mkdirSync(dir3);
  if (!fs.existsSync(dir4)) fs.mkdirSync(dir4);
  if (!fs.existsSync(dir5)) fs.mkdirSync(dir5);
  if (!fs.existsSync(dir6)) fs.mkdirSync(dir6);
};

exports.run = async (filename, fullname, dimensions_n) => {
  //console.log('DIMENSIONS: ' + JSON.stringify(dimensions_n) );

  await check_dirs();

  //const path_file = __dirname + '/uploads/' + filename;

  console.log(555, 'DIMENSIONS: ', dimensions_n);

  const dimensions = dimensions_n;

  try {
    // text to watermark
    return await text_to_watermark(filename, fullname)
      .then(async () => {
        // console.log(666,userData)
        // concat watermarks

        await resize_thumbnail(filename);

        return await concat_watermarks(filename)
          .then(async () => {

            return await logo_percentage(filename)
              .then(async (percentage) => {
                // watermarking 2
                return await watermarking_2(filename, dimensions, percentage)
                  .then(async (status) => {
                    return 1;
                  }).catch(err => console.log(err));
              }).catch(err => console.log(err));
          }).catch(err => console.log(err));
      }).catch(err => console.log(err));
  } catch (err) {
    console.log(555555, err);
  };
};

const resize_thumbnail = async (filename) => {
  return new Promise(resolve => {
    imageMagick.resize({
      width: 1000,
      height: 300,
      srcPath: __dirname + '/uploads/' + filename,
      dstPath: __dirname + '/uploads/thumbnail/' + filename,
      customArgs: ['-auto-orient']
    }, err => {
      if (err) {
        console.log('*** Create Thumbnail error ***', err);
      }
      resolve();
    });
  })
}


// for promises

const text_to_watermark = async (filename, fullname) => {
  // console.log(27, __dirname + '/uploads/watermarks/' + filename.split('.').slice(0, -1).join('.') + '.' + 'png');
  return new Promise(async (resolve, reject) => {
    const options_text_2_png = {
      font: '40px BrianBecker',
      localFontPath: __dirname + '/uploads/watermark-conf/BrianBecker.ttf',
      localFontName: 'BrianBecker',
      color: '#FFFFFF70',
      backgroundColor: 'transparent',
      lineSpacing: 1,
      padding: 18
    };
    // console.log(676,userData);
    await fs.writeFile(
      __dirname + '/uploads/watermarks/' + filename.split('.').slice(0, -1).join('.') + '.' + 'png',
      text2png(fullname, options_text_2_png),
      (err) => {
        if (err) { return reject(err); }
        else { return resolve(); }
      }
    );
  });
};

const concat_watermarks = async (filename) => {
  return new Promise((resolve, reject) => {
    const watermark_logo = __dirname + '/uploads/watermark-conf/medium_croped.png';
    const watermark_gen = __dirname + '/uploads/watermarks/' + filename.split('.').slice(0, -1).join('.') + '.' + 'png';
    const destination = __dirname + '/uploads/watermarks_2/' + filename.split('.').slice(0, -1).join('.') + '.' + 'png';
    //Old file extension spliter
    // filename.substring(0, filename.length - 3)
    merge_img([watermark_logo, watermark_gen, watermark_logo, watermark_gen, watermark_logo])
      .then(async (img) => {
        // Save image as file
        await img.write(destination, () => {
          console.log('Concat image done !!!!!');
          return resolve(true);
        });

        // }).then(() => {
        //     return resolve(true);
      }).catch(err => {
        console.log(err);
        return reject(true);
      });
  });
};

// watermarkin of bottom right corner

// const watermarking_1 =  (filename, dimensions) => {
//     return new Promise((resolve, reject)=> {
//         const options_image_watermark_1 = {
//             type: "image",
//             source: __dirname + '/watermark-second/' + filename, 
//             logo: __dirname + '/uploads/watermark-conf/medium_croped_old.png', 
//             destination: __dirname + '/uploads/watermarked_1/' + filename, 
//             position: {
//                 logoX : dimensions.width -  (dimensions.width /5) - 10,
//                 logoY : dimensions.height -  (dimensions.width/ 5 / 3) - 10,
//                 logoHeight: (dimensions.width/ 5 / 3),
//                 logoWidth: (dimensions.width /5)
//             }
//         };
//         watermark.embed(options_image_watermark_1, (status) => {
//             if( status.status === 1 ) resolve(true); 
//             if( status.status !== 1 ) reject(true); 
//         });       
//     });
// };

const logo_percentage = async (filename) => {

  return new Promise(async (resolve, reject) => {
    // ---------------------------------------------------------------

    const logo_source = '\"' + __dirname + '/uploads/watermarks_2/' + filename.split('.').slice(0, -1).join('.') + '.' + 'png' + '\"';
    const logo_source_shorted = logo_source.substring(1, logo_source.length - 1);
    console.log(145, logo_source.substring(1, logo_source.length - 1));
    const logo_dimensions = await sizeOf(logo_source_shorted);
    // const logo_dimensions = await sizeOf(logo_source.substring(1, logo_source.length - 1), (err, dimensions) => {
    //     if(err) {
    //         console.error(149, err);
    //         return;
    //     }
    //     else return dimensions;
    // });
    console.log('LOGO DIMENSSIONS', logo_dimensions);
    const logo_height_percentage = logo_dimensions.height / (logo_dimensions.width / 100);

    console.log('LOGO height percentage: ', logo_height_percentage);
    if (logo_height_percentage) resolve(logo_height_percentage);
    else reject(-1);
  });
};

// watermarking medium of image
const watermarking_2 = async (filename, dimensions, logo_height_percentage) => {

  return new Promise(async (resolve, reject) => {
    const logo_source = '\"' + __dirname + '/uploads/watermarks_2/' + filename.split('.').slice(0, -1).join('.') + '.' + 'png' + '\"';
    const options_image_watermark_2 = {
      type: "image",
      source: __dirname + '/watermark-second/' + filename,
      logo: logo_source,
      destination: __dirname + '/uploads/watermarked_2/' + filename,
      position: {
        logoX: dimensions.width / 2 - ((dimensions.width / 100) * 90 / 2),
        logoY: dimensions.height / 2 - (dimensions.height / 10 / 2), //dimensions.height
        logoHeight: (dimensions.width / 100) * logo_height_percentage,
        logoWidth: (dimensions.width / 100) * 90
      }
    };

    console.log('LOGO HEIGHT: ', options_image_watermark_2.position.logoHeight);
    console.log('LOGO WIDTH: ', options_image_watermark_2.position.logoWidth);
    watermark.embed(options_image_watermark_2, (status) => {
      console.log('STATUS: ===-=== ' + JSON.stringify(status));
      if (status.status === 1) resolve(true);
      if (status.status !== 1) reject(true);
    });
  });
};


//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
// NEEDED IN CASE WE DETECT ASPECT RATIO OF IMAGE
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------

// const calc_ratio = async (width, height) => {
//     const gcd = await gcd_calc(width, height);
//     console.log(`GCD: ${gcd}`);
//     delete gcd;
//     const ratio_1 = width / gcd;
//     const ratio_2 = height / gcd;

//     return `${ratio_1}:${ratio_2}`;
// };

// const gcd_calc = async (width, height) => {

//     const min = width >= height ? height : width;
//     const max = width >= height ? width : height;
//     let result;
//     for (let i = min; i > 1; i--) {
//         if(  max % i === 0 && min % i === 0) {
//             result = i;
//             break;
//         }
//     }
//     return result;
// };

// async function check_ratio() {
//     console.log(await calc_ratio(10, 5));
// };

// check_ratio();
