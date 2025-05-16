const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const User = require('./models/User');
const Rating = require('./models/Rating');
const Report = require('./models/Report');
const Problem = require('./models/Problem');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Enhanced error handling for environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Error: Environment variable ${envVar} is not set`);
    process.exit(1);
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB Connection with enhanced error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  console.log('Database URL:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//')); // Hide credentials in logs
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Route de test pour vérifier la connexion
app.get('/api/test', async (req, res) => {
  try {
    // Vérifier la connexion à MongoDB
    const dbStatus = mongoose.connection.readyState;
    const statusMessages = {
      0: 'Déconnecté',
      1: 'Connecté',
      2: 'Connexion en cours',
      3: 'Déconnexion en cours'
    };

    // Tester la création et la lecture dans la base de données
    const testUser = new User({
      firstName: 'Test',
      lastName: 'Connection',
      email: `test${Date.now()}@test.com`,
      password: 'testpassword',
      role: 'user'
    });

    await testUser.save();
    await User.findByIdAndDelete(testUser._id);

    res.json({
      status: 'success',
      message: 'Test de connexion réussi',
      databaseStatus: statusMessages[dbStatus],
      mongodbConnected: dbStatus === 1,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erreur lors du test:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors du test de connexion',
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer un nouvel utilisateur
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // Créer un token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Créer un token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Veuillez vous authentifier' });
  }
};

// Route protégée exemple
app.get('/api/profile', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Ratings Routes
app.post('/api/ratings', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const newRating = new Rating({
      user: req.user._id,
      rating,
      comment
    });
    await newRating.save();
    res.status(201).json(newRating);
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({ message: 'Error creating rating' });
  }
});

app.get('/api/ratings', auth, async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

// Reports Routes
app.post('/api/reports', auth, async (req, res) => {
  try {
    console.log('Tentative de création de rapport par:', req.user);
    console.log('Données reçues:', req.body);

    if (req.user.role !== 'meteorologist') {
      console.log('Accès refusé: utilisateur non météorologue');
      return res.status(403).json({ message: 'Seuls les météorologues peuvent créer des rapports' });
    }

    const { title, content, location, type } = req.body;
    
    if (!content) {
      console.log('Erreur: contenu manquant');
      return res.status(400).json({ message: 'Le contenu du rapport est requis' });
    }

    const newReport = new Report({
      title,
      content,
      author: req.user._id,
      location,
      type
    });

    console.log('Tentative de sauvegarde du rapport:', newReport);
    await newReport.save();
    console.log('Rapport sauvegardé avec succès');
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Erreur détaillée lors de la création du rapport:', error);
    res.status(500).json({ message: 'Error creating report', error: error.message });
  }
});

app.get('/api/reports', auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

app.delete('/api/reports/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Rapport non trouvé' });
    }

    // Vérifier que l'utilisateur est l'auteur ou un admin
    if (report.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce rapport' });
    }

    // Supprimer le fichier PDF si existe
    if (report.fileUrl) {
      const filePath = path.join(__dirname, report.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rapport supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

// Servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Problems Routes
app.post('/api/problems', auth, async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const newProblem = new Problem({
      title,
      description,
      type,
      author: req.user._id
    });
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (error) {
    console.error('Error creating problem report:', error);
    res.status(500).json({ message: 'Error creating problem report' });
  }
});

app.get('/api/problems', auth, async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ message: 'Error fetching problems' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API is accessible at http://localhost:${PORT}`);
  console.log(`CORS is enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}); 