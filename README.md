# Backend Docker Setup

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone git@github.com:rhythmsaha/organivo-backend.git
cd organivo-backend
```

### 2. Create Environment File
```bash
cp .env.example .env
```
Edit `.env` with your actual values:
```env
PORT=3001
# Database Configuration
MONGO_PASSWORD=your_strong_password_here
MONGO_DB_NAME=your_database_name
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
# SMTP Configuration
SMTP_HOST=smtp.host.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
# Add other environment variables your backend needs
HASH_PW_SALT=your_hash_pw_salt
JWT_SECRET=your_jwt_secret
```

### 3. Run Setup
```bash
chmod +x setup.sh
./setup.sh
```

## 📦 What's Included

- **Backend Container**: Node.js Express app on port 3001
- **MongoDB Container**: Database on port 3002
- **Security**: Authentication, network isolation, non-root user
- **Health Checks**: Container health monitoring
- **Auto-restart**: Containers restart automatically

## 🔧 Configuration

### Ports
- **Backend**: `http://localhost:3001`
- **MongoDB**: `localhost:3002`

### Security Features
- MongoDB password protection
- Network isolation between containers
- Non-root user execution
- IP whitelisting ready

## 📋 Common Commands

```bash
# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild after code changes
docker-compose up --build -d

# Remove everything including volumes
docker-compose down -v
```

## 🔍 Troubleshooting

### MongoDB Connection Issues
Ensure your `.env` file has the correct MongoDB URI format and matching passwords.

### Container Won't Start
Check logs: `docker-compose logs <service-name>`

## 🌐 Frontend Integration

Your Vercel-deployed frontend should connect to:
```
https://your-backend-domain.com:3001
```

Make sure to update your frontend API base URL to point to your deployed backend.

## 📁 Project Structure

```
organivo-backend/
├── docker-compose.yml
├── Dockerfile
├── .env
├── .dockerignore
├── setup.sh
├── healthcheck.js
├── mongo-init/
│   └── init-mongo.js
└── src/
```

## 🔒 Production Notes

- Change default passwords in production
- Use environment-specific `.env` files
- Consider using Docker secrets for sensitive data
- Set up proper SSL/TLS certificates
- Configure firewall rules for port access

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `MONGO_PASSWORD` | MongoDB admin password | `strongPassword123` |
| `MONGO_DB_NAME` | Database name | `myapp` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `SMTP_HOST` | Email server host | `smtp.host.com` |
| `SMTP_PORT` | Email server port | `465` |
| `SMTP_SECURE` | Use SSL/TLS for email | `true` |
| `SMTP_USER` | Email username | `user@gmail.com` |
| `SMTP_PASS` | Email password/app password | `appPassword` |
| `HASH_PW_SALT` | Password hashing salt | `randomSaltString` |
| `JWT_SECRET` | JWT signing secret | `your_jwt_secret_key` |
