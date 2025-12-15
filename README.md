
# Pick Your Pickle - Full Stack E-commerce App

A premium e-commerce platform for authentic Indian pickles, snacks, and groceries. Built with **React (Vite) + TypeScript** for the frontend and **Python (Flask)** for the backend, using **MongoDB Atlas** for the database.

---

## 🚀 Hosting Guide: Contabo VPS (Ubuntu 20.04 / 22.04)

Follow these steps to host this application on a fresh Contabo VPS.

### Prerequisites
1.  **Contabo VPS** (Cloud VPS S is sufficient).
2.  **Domain Name** (optional, but recommended) pointing to your VPS IP Address.
3.  **MongoDB Atlas Connection String** (ready to copy).
4.  **Google Gemini API Key** (for AI features).

---

### Step 1: Connect to your Server
Open your terminal (Command Prompt/PowerShell on Windows, Terminal on Mac) and SSH into your server:
```bash
ssh root@YOUR_VPS_IP_ADDRESS
# Enter your password when prompted
```

### Step 2: Update & Install Dependencies
Update the system and install Python, Nginx, and Git.
```bash
apt update && apt upgrade -y
apt install python3-pip python3-venv nginx git curl -y
```

**Install Node.js (Version 18+):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

### Step 3: Clone the Project
Navigate to the web directory and clone your code.
```bash
cd /var/www
git clone <YOUR_GITHUB_REPO_URL> pick-your-pickle
cd pick-your-pickle
```
*(If you haven't pushed code to GitHub yet, you can upload files using FileZilla via SFTP).*

### Step 4: Backend Setup (Flask)

1.  **Create Virtual Environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Install Requirements:**
    ```bash
    pip install -r requirements.txt
    pip install gunicorn
    ```

3.  **Create Environment Variables:**
    Create a `.env` file to store your secrets.
    ```bash
    nano .env
    ```
    Paste the following inside (Right-click to paste):
    ```env
    MONGO_URI="your_mongodb_atlas_connection_string_here"
    API_KEY="your_google_gemini_api_key_here"
    FLASK_ENV=production
    SECRET_KEY=super_secret_key_change_this
    ```
    *Press `Ctrl+X`, then `Y`, then `Enter` to save.*

4.  **Test Backend:**
    Run this briefly to check for errors:
    ```bash
    gunicorn --bind 0.0.0.0:5000 app:app
    ```
    *If it starts without errors, press `Ctrl+C` to stop it.*

### Step 5: Configure Backend as a Service
We need the backend to run in the background automatically.

1.  **Create Systemd Service:**
    ```bash
    nano /etc/systemd/system/pickle_backend.service
    ```

2.  **Paste Configuration:**
    ```ini
    [Unit]
    Description=Gunicorn instance to serve Pick Your Pickle
    After=network.target

    [Service]
    User=root
    Group=www-data
    WorkingDirectory=/var/www/pick-your-pickle
    Environment="PATH=/var/www/pick-your-pickle/venv/bin"
    ExecStart=/var/www/pick-your-pickle/venv/bin/gunicorn --workers 3 --bind unix:app.sock -m 007 app:app

    [Install]
    WantedBy=multi-user.target
    ```
    *Press `Ctrl+X`, then `Y`, then `Enter` to save.*

3.  **Start the Service:**
    ```bash
    systemctl start pickle_backend
    systemctl enable pickle_backend
    ```

### Step 6: Frontend Setup (React)

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Build the Project:**
    This compiles the React code into static HTML/CSS/JS files.
    ```bash
    npm run build
    ```
    *This will create a `dist` folder.*

### Step 7: Configure Nginx (Web Server)

Nginx will serve the React frontend and pass API requests to the Flask backend.

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

        # Proxy API requests to Flask Backend
        location /api {
            include proxy_params;
            proxy_pass http://unix:/var/www/pick-your-pickle/app.sock;
        }
    }
    ```
    *Press `Ctrl+X`, then `Y`, then `Enter` to save.*

3.  **Enable the Site:**
    ```bash
    ln -s /etc/nginx/sites-available/pickles /etc/nginx/sites-enabled/
    rm /etc/nginx/sites-enabled/default
    ```

4.  **Restart Nginx:**
    ```bash
    nginx -t
    systemctl restart nginx
    ```

### Step 8: Final Firewall Setup
Allow traffic to your web server.
```bash
ufw allow 'Nginx Full'
ufw allow ssh
ufw enable
```

---

### 🎉 You are done!
Visit `http://YOUR_VPS_IP` in your browser. Your website should be live.

### (Optional) Add SSL / HTTPS
If you have a domain connected:
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

### 🛠 Troubleshooting
*   **Backend Logs:** `journalctl -u pickle_backend -f`
*   **Nginx Logs:** `tail -f /var/log/nginx/error.log`
*   **Database Error:** Ensure you whitelisted `0.0.0.0/0` (Allow from Anywhere) in MongoDB Atlas Network Access settings.
