const PageContent = require('../models/PageContent');

// @desc    Get content for a specific page
// @route   GET /api/page-content/:slug
// @access  Public
exports.getPageContent = async (req, res) => {
    try {
        const { slug } = req.params;
        console.log(`Fetching content for slug: ${slug}`);

        let content = await PageContent.findOne({ pageSlug: slug });

        if (!content) {
            // Return empty structure if not found
            return res.status(200).json({ success: true, data: { pageSlug: slug, faqs: [] } });
        }

        res.status(200).json({ success: true, data: content });
    } catch (error) {
        console.error('Error fetching page content:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update content for a specific page
// @route   PUT /api/page-content/:slug
// @access  Private (Admin/Manager)
exports.updatePageContent = async (req, res) => {
    try {
        const { slug } = req.params;
        const { faqs, description, metaTitle, metaDescription, keywords } = req.body;

        console.log(`Updating content for slug: ${slug}`);

        let content = await PageContent.findOne({ pageSlug: slug });

        const updateData = {};
        if (faqs !== undefined) updateData.faqs = faqs;
        if (description !== undefined) updateData.description = description;
        if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
        if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
        if (keywords !== undefined) updateData.keywords = keywords;

        updateData.updatedAt = Date.now();

        if (content) {
            content = await PageContent.findOneAndUpdate(
                { pageSlug: slug },
                { $set: updateData },
                { new: true }
            );
        } else {
            content = await PageContent.create({
                pageSlug: slug,
                faqs: faqs || [],
                description: description || '',
                metaTitle: metaTitle || '',
                metaDescription: metaDescription || '',
                keywords: keywords || ''
            });
        }

        res.status(200).json({ success: true, data: content, message: 'Page content updated successfully' });
    } catch (error) {
        console.error('Error updating page content:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
