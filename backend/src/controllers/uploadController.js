// backend/src/controllers/uploadController.js
// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
export const uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // The CloudinaryStorage engine automatically uploads the file and attaches the URL to `req.file.path`
        res.status(200).json({
            message: 'Image uploaded successfully',
            url: req.file.path,
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
};
