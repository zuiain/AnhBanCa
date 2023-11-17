import 'dotenv/config';
import cloudinary from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY,
});

const cloudinaryUploadImg = async function (fileToUploads) {
    return new Promise((resolve) => {
        cloudinary.uploader.upload(fileToUploads, (result) => {
            resolve(
                {
                    url: result.secure_url,
                    asset_id: result.asset_id,
                    public_id: result.public_id,
                    upload_preset: 'fish_shop',
                },
                {
                    resource_type: 'auto',
                },
            );
        });
    });
};

export default cloudinaryUploadImg;
