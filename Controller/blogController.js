const Blog = require('../Models/blogModel');
const User = require('../Models/userModel');
const mime = require("mime-types");
const uploadFileToFirebase = require("../Utils/firebaseUpload");
const asyncErrorHandler = require("../Utils/errorHandler");

// Create a blog
exports.createBlog = asyncErrorHandler(async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    // Upload thumbnail to Firebase
    const getImageUrl = req.file ? await uploadFileToFirebase(req.file) : null;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!['employee', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'You do not have permission to publish blogs' });
    }

    // Create the blog
    const newBlog = new Blog({
      title,
      content,
      thumbnail: getImageUrl || null,
      author: userId,
    });

    await newBlog.save();

    res.status(201).json({
      status: "success",
      data: {
        blog: newBlog,
      },
    });
  } catch (error) {
    console.error('Error creating blog:', error.message);
    res.status(500).json({ error: 'An unexpected error occurred while creating the blog.' });
  }
});

// Get all blogs with pagination
exports.getAllBlogs = asyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const blogs = await Blog.find()
    .populate('author', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalBlogs = await Blog.countDocuments();

  res.status(200).json({
    totalBlogs,
    currentPage: page,
    totalPages: Math.ceil(totalBlogs / limit),
    blogs,
  });
});

// Get a single blog by ID
exports.getBlogById = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id).populate('author', 'name email role');

  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }

  res.status(200).json({
    status: "success",
    data: blog,
  });
});

// Update a blog
exports.updateBlog = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;

  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }

  if (blog.author.toString() !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to update this blog' });
  }

  // Update fields
  blog.title = title || blog.title;
  blog.content = content || blog.content;

  // Upload thumbnail if a new file was uploaded
  if (req.file) {
    blog.thumbnail = await uploadFileToFirebase(req.file);
  }

  await blog.save();

  res.status(200).json({
    status: "success",
    data: blog,
  });
});

// Delete a blog
exports.deleteBlog = asyncErrorHandler(async (req, res) => {
  const { id } = req.params; // Retrieve the blog id from URL params
  const userId = req.user.id; // User ID from authentication (token)

  const blog = await Blog.findById(id); // Find the blog by its ID
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' }); // If blog not found
  }

  // Check if the logged-in user is the author of the blog or an admin
  if (blog.author.toString() !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to delete this blog' });
  }

  await blog.deleteOne(); // Delete the blog

  // Respond with success message
  res.status(200).json({
    status: "success",
    message: 'Blog deleted successfully',
  });
});
