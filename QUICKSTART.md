# 🚀 Quick Start Guide

Get your secure task manager up and running in 15 minutes!

## Prerequisites Checklist

- [ ] Python 3.11 or higher installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] MongoDB Atlas account (create at mongodb.com/cloud/atlas)
- [ ] GitHub account
- [ ] Render.com account (for deployment)

## Step-by-Step Setup

### 1. Clone and Setup Project (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd secure-todo-app

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. MongoDB Atlas Setup (5 minutes)

1. **Go to** [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Click** "Build a Database" → Choose FREE tier
3. **Create** cluster (use default settings)
4. **Create Database User:**
   - Click "Database Access" → "Add New Database User"
   - Choose password authentication
   - Username: `admin` (or your choice)
   - Password: Generate a secure password
   - Save credentials!
5. **Allow Network Access:**
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, restrict to specific IPs
6. **Get Connection String:**
   - Click "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 3. Configure Environment Variables (1 minute)

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
# On Windows: notepad .env
# On macOS/Linux: nano .env
```

Add your values:
```
MONGO_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/secure_todo_db?retryWrites=true&w=majority
SECRET_KEY=your-generated-secret-key-here
FLASK_ENV=development
```

Generate a secret key in Python:
```python
import secrets
print(secrets.token_hex(32))
```

### 4. Run the Application (1 minute)

```bash
# Navigate to backend
cd backend

# Run Flask app
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

### 5. Test the Application (2 minutes)

1. Open browser: `http://localhost:5000`
2. Click "Register here"
3. Create an account with:
   - Name: Test User
   - Email: test@example.com
   - Password: testpass123
4. Login with your credentials
5. Create a task to test functionality!

✅ **Success!** Your app is running locally.

---

## Deployment to Render (Production)

### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Secure Task Manager"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/secure-todo-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Render

1. **Go to** [render.com](https://render.com) and sign up
2. **Click** "New +" → "Web Service"
3. **Connect** your GitHub repository
4. **Configure:**
   - Name: `secure-task-manager` (or your choice)
   - Environment: `Python 3`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `gunicorn --chdir backend app:app`
5. **Add Environment Variables:**
   - Click "Advanced" → "Add Environment Variable"
   - Add:
     - `MONGO_URI`: Your MongoDB connection string
     - `SECRET_KEY`: Your secret key
     - `FLASK_ENV`: `production`
6. **Click** "Create Web Service"

⏳ Wait 2-3 minutes for deployment...

✅ **Live!** Your app is now accessible at `https://your-app-name.onrender.com`

---

## Testing Checklist

Once deployed, test these features:

### Security Features
- [ ] HTTPS is working (check for padlock icon)
- [ ] Register new account
- [ ] Login with correct credentials
- [ ] Login fails with wrong password
- [ ] Try 11+ rapid login attempts (should get rate limited)
- [ ] Try XSS: Create task with title `<script>alert('test')</script>` (should be sanitized)
- [ ] Session persists after page refresh
- [ ] Logout works correctly

### Functionality
- [ ] Create a new task
- [ ] Edit a task
- [ ] Mark task as complete
- [ ] Delete a task
- [ ] All tasks display correctly
- [ ] Task statistics update properly

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Mobile responsive design works
- [ ] No console errors in browser

---

## Common Issues & Solutions

### Issue: "Module not found" error
**Solution:** Make sure you're in the backend directory and have installed requirements:
```bash
cd backend
pip install -r requirements.txt
```

### Issue: "Connection refused" to MongoDB
**Solution:** 
- Check your MONGO_URI in .env
- Ensure you replaced `<password>` with actual password
- Check MongoDB Atlas network access allows your IP

### Issue: "Secret key not set"
**Solution:** Generate and add SECRET_KEY to .env:
```python
import secrets
print(secrets.token_hex(32))
```

### Issue: Rate limit blocking during development
**Solution:** Increase limits in development mode or clear rate limit cache by restarting server

### Issue: CORS errors
**Solution:** Check that frontend is served from same domain as backend, or configure CORS origins in app.py

---

## Next Steps

1. **Add Google Analytics** (optional)
   - Create GA4 property
   - Add tracking code to index.html

2. **Enable Google reCAPTCHA** (optional)
   - Get reCAPTCHA keys from google.com/recaptcha
   - Add to frontend and backend

3. **Write Technical Report**
   - Use template in `docs/TECHNICAL_REPORT_TEMPLATE.md`
   - Take screenshots of all features
   - Document challenges and solutions

4. **Create GitHub README**
   - Already provided in README.md
   - Update with your team names and URLs

---

## Getting Help

**Resources:**
- Flask Docs: https://flask.palletsprojects.com/
- MongoDB Docs: https://docs.mongodb.com/
- Render Docs: https://render.com/docs
- OWASP Security: https://owasp.org/

**Team Communication:**
- Use GitHub Issues for tracking bugs
- Document all decisions in commit messages
- Share credentials securely (use password manager)

---

## Submission Checklist

Before submitting, ensure you have:

- [ ] Live website URL (from Render)
- [ ] GitHub repository with complete code
- [ ] README.md with setup instructions
- [ ] Technical report (3-5 pages PDF)
- [ ] Screenshots of all features
- [ ] Security features documented
- [ ] Performance metrics captured
- [ ] All team member names in report

---

**Good luck with your project! 🎉**

Need help? Check the README.md or review the technical report template for detailed explanations.
