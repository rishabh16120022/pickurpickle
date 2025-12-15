
# Pick Your Pickle - Full Stack E-commerce App

A premium e-commerce platform for authentic Indian pickles, snacks, and groceries. Built with **React (Vite) + TypeScript** for the frontend and **Node.js (Express)** for the backend, using **MongoDB Atlas** for the database.

---

## 🚀 Hosting Guide: Contabo VPS (Ubuntu 20.04 / 22.04)

Follow these steps to host this application on a fresh Contabo VPS.

### Prerequisites
1.  **Contabo VPS** (Cloud VPS S is sufficient).
2.  **Domain Name** (optional, but recommended) pointing to your VPS IP Address.
3.  **MongoDB Atlas Connection String** (ready to copy).
4.  **OpenAI API Key** (for PickleBot).

---

### Step 1: Connect to your Server
Open your terminal and SSH into your server:
```bash
ssh root@YOUR_VPS_IP_ADDRESS
```

### Step 2: Update & Install Dependencies
Update the system and install Node.js, Nginx, and Git.
```bash
apt update && apt upgrade -y
apt install nginx git curl -y
```

**Install Node.js (Version 18+):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
```

**Install PM2 (Process Manager):**
```bash
npm install -g pm2
```

### Step 3: Clone the Project
Navigate to the web directory and clone your code.
```bash
cd /var/www
git clone <YOUR_GITHUB_REPO_URL> pick-your-pickle
cd pick-your-pickle
```

### Step 4: Backend Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Create Environment Variables:**
    Create a `.env` file.
    ```bash
    nano .env
    ```
    Paste the following inside:
    ```env
    MONGO_URI="your_mongodb_atlas_connection_string_here"
    VITE_OPENAI_API_KEY="sk-your_openai_api_key_here"
    EMAIL_USER="your_email@gmail.com"
    EMAIL_PASS="your_app_password"
    JWT_SECRET="secure_random_string"
    PORT=5000
    ```
    *Press `Ctrl+X`, then `Y`, then `Enter` to save.*

3.  **Start Backend with PM2:**
    ```bash
    pm2 start server/index.js --name "pickle-backend"
    pm2 save
    pm2 startup
    ```

### Step 5: Frontend Build

1.  **Build the Project:**
    This compiles the React code into static files.
    ```bash
    npm run build
    ```
    *This creates a `dist` folder.*

### Step 6: Configure Nginx

Nginx will serve the React frontend and pass API requests to the Node backend.

1.  **Create Config File:**
    ```bash
    nano /etc/nginx/sites-available/pickles
    ```

2.  **Paste Configuration:**
    Replace `your_domain_or_IP` with your actual Domain or IP.

    ```nginx
    server {
        listen 80;
        server_name your_domain_or_IP;

        # Serve React Frontend
        location / {
            root /var/www/pick-your-pickle/dist;
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        # Proxy API requests to Node Backend
        location /api {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    *Press `Ctrl+X`, then `Y`, then `Enter` to save.*

3.  **Enable the Site:**
    ```bash
    ln -s /etc/nginx/sites-available/pickles /etc/nginx/sites-enabled/
    rm /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart nginx
    ```

### Step 7: Final Firewall Setup
```bash
ufw allow 'Nginx Full'
ufw allow ssh
ufw enable
```

### 🎉 You are done!
Visit `http://YOUR_VPS_IP` in your browser.

---

### 🛠 Troubleshooting
*   **Backend Logs:** `pm2 logs pickle-backend`
*   **Nginx Logs:** `tail -f /var/log/nginx/error.log`
