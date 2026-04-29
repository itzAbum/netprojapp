# 🔐 Secure Task Manager

A modern, secure web application demonstrating real-world networking and security concepts for educational purposes.

## 📋 Project Overview

This project implements a full-stack task management application with enterprise-grade security features, performance optimizations, and monitoring capabilities.

### ✨ Key Features

**Security (All Implemented):**
- ✅ **HTTPS/SSL Encryption** - Automatic via deployment platform
- ✅ **SQL/NoSQL Injection Protection** - Input sanitization and parameterized queries
- ✅ **XSS Prevention** - Client and server-side input sanitization
- ✅ **Brute Force Protection** - Rate limiting on login/register endpoints
- ✅ **CSRF Protection** - Token-based validation on state-changing operations
- ✅ **Secure Sessions** - HTTP-only, Secure, SameSite cookies
- ✅ **Password Hashing** - PBKDF2-SHA256 with salting

**Performance Optimizations:**
- ⚡ **CDN Integration** - Automatic via Vercel/Netlify
- ⚡ **Lazy Loading** - Images and components load on-demand
- ⚡ **Minification** - CSS/JS automatically minified in production
- ⚡ **Caching** - Browser caching and static asset optimization
- ⚡ **Async Operations** - Non-blocking I/O for better performance

**Infrastructure:**
- 🚀 **Cloud Hosting** - Render (backend) + Vercel (frontend option)
- 🗄️ **Database** - MongoDB Atlas (free tier)
- 📊 **Monitoring** - Ready for Google Analytics integration
- 🔄 **CI/CD** - GitHub Actions ready

## 🛠️ Tech Stack

**Backend:**
- Python 3.11
- Flask (Web framework)
- PyMongo (MongoDB driver)
- Flask-Limiter (Rate limiting)
- Flask-Talisman (Security headers)
- Werkzeug (Password hashing)

**Frontend:**
- Vanilla JavaScript (ES6+)
- Modern CSS3 (CSS Grid, Flexbox)
- HTML5

**Database:**
- MongoDB Atlas (Cloud NoSQL database)

**Hosting:**
- Render.com (Backend)
- Vercel/Netlify (Optional frontend hosting)

## 📦 Project Structure

```
secure-todo-app/
├── backend/
│   ├── app.py                 # Main Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── index.html            # Main HTML file
│   ├── styles.css            # Styles with performance optimizations
│   └── app.js                # Frontend logic with security features
├── docs/
│   └── (Technical report will go here)
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── Procfile                 # Deployment configuration
├── runtime.txt              # Python version specification
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- MongoDB Atlas account (free tier)
- Git
- Code editor (VS Code recommended)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd secure-todo-app
   ```

2. **Set up MongoDB Atlas**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a free cluster
   - Create a database user
   - Whitelist your IP address (or use 0.0.0.0/0 for development)
   - Get your connection string

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your MongoDB URI:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/secure_todo_db
   SECRET_KEY=generate-a-random-secret-key-here
   ```
   
   Generate a secret key with Python:
   ```python
   import secrets
   print(secrets.token_hex(32))
   ```

4. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

5. **Run the application**
   ```bash
   cd backend
   python app.py
   ```

6. **Access the application**
   - Open browser: `http://localhost:5000`

## 🌐 Deployment

### Deploy Backend to Render

1. **Create Render account** at [render.com](https://render.com)

2. **Create new Web Service**
   - Connect your GitHub repository
   - Choose "Python" environment
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `gunicorn --chdir backend app:app`

3. **Add environment variables** in Render dashboard:
   - `MONGO_URI`: Your MongoDB connection string
   - `SECRET_KEY`: Your secret key
   - `FLASK_ENV`: production

4. **Deploy** - Render will automatically deploy and provide HTTPS URL

### Optional: Deploy Frontend Separately to Vercel

1. **Create vercel.json**:
   ```json
   {
     "buildCommand": "echo 'No build needed'",
     "outputDirectory": "frontend"
   }
   ```

2. **Deploy**:
   - Connect GitHub repo to Vercel
   - Set root directory to `frontend`
   - Deploy

3. **Update CORS** in `app.py` with your Vercel domain

## 🔒 Security Features Explained

### 1. HTTPS Encryption
- Automatic SSL/TLS via hosting platform
- All traffic encrypted in transit
- Forces HTTPS redirect via Flask-Talisman

### 2. Input Sanitization (XSS Prevention)
```python
def sanitize_input(text):
    text = re.sub(r'<[^>]*>', '', text)  # Remove HTML tags
    text = re.sub(r'[<>"\']', '', text)  # Remove dangerous chars
    return text.strip()
```

### 3. NoSQL Injection Protection
- Input validation and sanitization
- No direct query concatenation
- PyMongo parameterized queries

### 4. Rate Limiting (Brute Force Prevention)
```python
@limiter.limit("10 per hour")  # Max 10 login attempts per hour
def login():
    # ...
```

### 5. CSRF Protection
- Token generation on login
- Validation on all POST/PUT/DELETE requests
- Tokens stored in secure session

### 6. Secure Sessions
```python
app.config['SESSION_COOKIE_HTTPONLY'] = True   # Not accessible via JavaScript
app.config['SESSION_COOKIE_SECURE'] = True     # HTTPS only
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
```

### 7. Password Security
- PBKDF2-SHA256 hashing with salt
- Minimum 8 characters enforced
- Never stored in plain text

## ⚡ Performance Optimizations

1. **Lazy Loading**: Images load only when scrolling into view
2. **CSS Minification**: Automatic in production builds
3. **CDN**: Static assets served via edge network
4. **Async Operations**: Non-blocking I/O with async/await
5. **Resource Hints**: DNS prefetch, preconnect for external resources
6. **Caching**: Browser caching headers set appropriately

## 📊 Monitoring Setup

### Google Analytics (Optional)

1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get tracking ID
3. Add to `index.html`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

### Network Monitoring

For the technical report, you can analyze:
- Browser DevTools Network tab
- Render.com logs and metrics
- MongoDB Atlas performance metrics

## 📝 Technical Report Checklist

Your 3-5 page report should include:

1. **Overview**
   - What you built and why
   - Technologies chosen

2. **Security Implementation**
   - How each security feature works
   - Code examples and screenshots

3. **Performance Optimization**
   - CDN setup and benefits
   - Lazy loading implementation
   - Performance metrics (PageSpeed Insights)

4. **Database Integration**
   - MongoDB schema design
   - How data flows through the app

5. **Deployment**
   - Hosting platform choice
   - Deployment process
   - HTTPS configuration

6. **Challenges & Solutions**
   - Problems encountered
   - How you solved them

7. **Traffic Analysis**
   - Google Analytics screenshots
   - User behavior insights
   - Performance metrics

8. **Screenshots**
   - Login/register page
   - Dashboard
   - Security headers (DevTools)
   - MongoDB Atlas
   - Deployment platform

## 🧪 Testing

### Manual Testing Checklist

- [ ] Registration with valid/invalid data
- [ ] Login with correct/incorrect credentials
- [ ] Rate limiting (try >10 logins in an hour)
- [ ] XSS attempts (try `<script>alert('XSS')</script>` in task title)
- [ ] CSRF validation (remove CSRF token in DevTools)
- [ ] Task CRUD operations
- [ ] Session persistence across page refreshes
- [ ] Logout functionality
- [ ] HTTPS enforcement
- [ ] Mobile responsiveness

## 🎓 Learning Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [MongoDB Atlas Tutorial](https://docs.atlas.mongodb.com/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Basics](https://developer.mozilla.org/en-US/docs/Web/Security)

## 🤝 Contributing

This is an educational project. Feel free to:
- Fork the repository
- Create feature branches
- Submit pull requests
- Report issues

## 📄 License

MIT License - Feel free to use for educational purposes

## 👥 Team Members

- [Your Name]
- [Team Member 2]
- [Team Member 3]

## 🙏 Acknowledgments

- Professor Roya Hosseini - Computer Networking Course
- Anthropic's Claude - Development assistance
- MongoDB Atlas - Free database hosting
- Render.com - Free backend hosting

---

**Questions?** Open an issue or contact the team!

Good luck with your project! 🚀
