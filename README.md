# Secure Task Manager

A modern, secure web application demonstrating real-world networking and security concepts for educational purposes.

**Live Demo:** https://task-manager-ej1m.onrender.com

## Project Overview

This project implements a full-stack task management application with a couple security features, performance optimizations, and monitoring capabilities.

✨ Key Features

**Security features implemented:**
- **HTTPS/SSL Encryption** - Automatic via deployment platform
- **SQL/NoSQL Injection Protection** - Input sanitization and parameterized queries
- **XSS Prevention** - Client and server-side input sanitization
- **Brute Force Protection** - Rate limiting on login/register endpoints
- **CSRF Protection** - Token-based validation on state-changing operations
- **Secure Sessions** - HTTP-only, Secure, SameSite cookies
- **Password Hashing** - PBKDF2-SHA256 with salting

**Performance Optimizations:**
- **CDN Integration** - Automatic via Render.com deployment
- **Lazy Loading** - Images and components load on-demand
- **Minification** - CSS/JS automatically minified in production
- **Caching** - Browser caching and static asset optimization
- **Async Operations** - Non-blocking I/O for better performance

**Infrastructure:**
- **Cloud Hosting** - Render.com (full-stack deployment)
- **Database** - MongoDB Atlas (free tier)
- **Monitoring** - Ready for Google Analytics integration
- **CI/CD** - GitHub Actions ready
