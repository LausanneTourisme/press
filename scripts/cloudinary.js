import { v2 as cloudinary } from 'cloudinary';
import { config } from "dotenv";
import 'dotenv/config';
import fs from 'fs';
import { glob } from "glob";
import ora from 'ora';

const env = config().parsed;
const cacheFilepath = './.app/cache/uploaded_files.json';
const availableExtensions = ['jpeg', 'jpg', 'png', 'svg', 'mp4']

cloudinary.config({
    cloud_name: env.PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * @param {string} path cache file containing all uploaded files
 * @throws Error when can't read cache file
 * @returns {string[]}
 */
const getUploadedFiles = (path) => {
    try {
        if (!fs.existsSync(path)) {
            fs.writeFile(path, '');
            return [];
        } else {
            const data = fs.readFileSync(path, 'utf8');
            return data.split('\n').filter(x => x?.length > 0);
        }
    } catch (err) {
        throw new Error(`Failed to read "${path}"`);
    }
}

/**
 * @param {string} path 
 * @param {'mb'|'gb'|'tb'|'kb'} unit 
 * @returns {number}
 */
const getFileSize = (path, unit = 'mb') => {
    let resolution = 1;

    switch (unit) {
        case 'mb':
            resolution = 2;
            break;
        case 'gb':
            resolution = 3;
            break;
        case 'tb':
            resolution = 4;
            break;
        default:
        case 'kb':
            resolution = 1;
            break;
    }

    const stats = fs.statSync(path);
    const fileSizeInBytes = stats.size;

    return fileSizeInBytes / (Math.pow(1024, resolution));
}

/**
 * @param {string} path full Filepath
 * @returns {[path: string, extension: 'jpeg'|'jpg'|'png'|'svg'|'mp4']} path without extension and extension
 */
const getFileInformations = (path) => {
    const cleannedFilepath = path.slice('static/'.length);
    const lastDot = cleannedFilepath.lastIndexOf(".");

    const nameWithoutExt = cleannedFilepath.slice(0, lastDot);
    const extension = cleannedFilepath.slice(lastDot + 1);

    return [`${nameWithoutExt}`, extension];
}

/**
 * @param {'jpeg'|'jpg'|'png'|'svg'|'mp4'} extension 
 * @returns {'image','video'}
 */
const cloudinaryRessourceType = (extension) => {
    return extension === 'mp4' ? 'video' : 'image';
}

/**
 * @param {string} path cache filepath
 * @returns {Promise<boolean>} delete successfully
 */
const deleteFromCloudinary = async (path) => {
    const [cloudinaryPath, extension] = getFileInformations(path);
    const filepath = `${env.PUBLIC_CLOUDINARY_UPLOAD_PRESET}/${cloudinaryPath}`;

    try {
        await cloudinary.uploader.destroy(filepath, {
            resource_type: cloudinaryRessourceType(extension),
        });
        return true;
    } catch (err) {
        console.error(`Error on deleting '${cloudinaryPath}': `);
        console.error(err);
        return false;
    }
}

/**
 * @param {string} path cache filepath
 * @returns {Promise<boolean>} upload successfully
 */
const uploadToCloudinary = async (path) => {
    const [cloudinaryPath, extension] = getFileInformations(path);
    const type = cloudinaryRessourceType(extension);

    const options = {
        public_id: cloudinaryPath,
        format: extension,
        upload_preset: env.PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: type,
    };

    try {
        if (type === 'video') {
            if (getFileSize(path, 'mb') >= 100.0) {
                return false;
            }
            await cloudinary.uploader.upload_large(`./${path}`, options);
        } else {
            await cloudinary.uploader.upload(`./${path}`, options);
        }
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

/**
 * @param {string[]} files 
 * @param {string} cacheFilepath
 */
const process = async (files, cacheFilepath) => {
    let filesUploaded = [];
    let filesDeleted = [];

    const cachedFiles = getUploadedFiles(cacheFilepath);

    const spinner = ora().start();

    //delete old files
    if (cachedFiles.length) {
        spinner.info('Deleting files from Cloudinary...');
        spinner.prefixText = ' ';
        for (const file of cachedFiles) {
            if (!files.includes(file)) {
                const result = await deleteFromCloudinary(file);
                if (result) {
                    filesDeleted.push(file);
                    spinner.color = 'green';
                    spinner.succeed(`'${file}' deleted.`);
                } else {
                    spinner.color = 'red';
                    spinner.warn(`'${file}' failed...`);
                }
            }
        }
        spinner.prefixText = '';
        spinner.info(`${filesDeleted.length} file${filesDeleted.length === 1 ? '' : 's'} ${filesDeleted.length === 1 ? 'was' : 'were'} deleted`);

        console.log();
    }

    //remove files from chache
    if (filesDeleted.length) {
        spinner.start();
        spinner.info(`Deleting files from the cache : '${cacheFilepath}'`);
        for (const file of filesDeleted) {
            cachedFiles.splice(cachedFiles.indexOf(file), 1);
        }
        spinner.succeed('Deletes completed.');
        console.log();
    }

    //upload new files
    if (files.length) {
        spinner.start();
        spinner.info('Uploading files to Cloudinary...')
        spinner.prefixText = ' ';
        for (const file of files) {
            if (!cachedFiles.includes(file)) {
                const result = await uploadToCloudinary(file);
                if (result) {
                    filesUploaded.push(file);
                    cachedFiles.push(file);
                    spinner.color = 'green';
                    spinner.succeed(`'${file}' uploaded.`);
                } else {
                    spinner.color = 'red';
                    spinner.warn(`'${file}' failed...`);
                }
            }
        }
        spinner.prefixText = '';
        spinner.info(`${filesUploaded.length} file${filesUploaded.length === 1 ? '' : 's'} ${filesUploaded.length === 1 ? 'was' : 'were'} uploaded.`);
    }

    fs.writeFileSync(cacheFilepath, cachedFiles.join('\n'));
    spinner.stop().clear();
}

////////////////////////////////////////////
//                                        //
//                MAIN CODE               //
//                                        //
////////////////////////////////////////////

const files = await glob(`./static/**/*.{${availableExtensions.join(',')}}`);
await process(files, cacheFilepath);
