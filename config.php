<?php
// config.php - Configuration file
class Config {
    // Database configuration
    const DB_HOST = 'localhost';
    const DB_NAME = 'friend_ai_db';
    const DB_USER = 'root';
    const DB_PASS = '';
    
    // Application configuration
    const APP_NAME = 'FRIEND AI';
    const APP_VERSION = '1.0';
    const SITE_URL = 'http://localhost';
    
    // Security configuration
    const PASSWORD_MIN_LENGTH = 6;
    const USERNAME_MIN_LENGTH = 3;
    const SESSION_TIMEOUT = 3600; // 1 hour
    
    // Email configuration (if needed)
    const SMTP_HOST = 'smtp.gmail.com';
    const SMTP_PORT = 587;
    const SMTP_USER = '';
    const SMTP_PASS = '';
    
    public static function getDBConnection() {
        try {
            $pdo = new PDO(
                "mysql:host=" . self::DB_HOST . ";dbname=" . self::DB_NAME,
                self::DB_USER,
                self::DB_PASS
            );
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $pdo;
        } catch(PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
}

// chat_auth.php - Authentication check for chat page
if (basename($_SERVER['PHP_SELF']) == 'chat_auth.php') {
    header('Content-Type: application/json');
    
    require_once 'session_manager.php';
    
    try {
        $pdo = Config::getDBConnection();
        $sessionManager = new SessionManager($pdo);
        
        if ($sessionManager->isLoggedIn()) {
            $user = $sessionManager->getCurrentUser();
            echo json_encode([
                'authenticated' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email']
                ]
            ]);
        } else {
            echo json_encode([
                'authenticated' => false,
                'redirect' => 'auth.php'
            ]);
        }
    } catch(Exception $e) {
        echo json_encode([
            'authenticated' => false,
            'error' => 'Authentication error'
        ]);
    }
    exit;
}

// user_api.php - API for user operations
if (basename($_SERVER['PHP_SELF']) == 'user_api.php') {
    header('Content-Type: application/json');
    
    require_once 'session_manager.php';
    
    $action = $_GET['action'] ?? '';
    
    try {
        $pdo = Config::getDBConnection();
        $sessionManager = new SessionManager($pdo);
        
        switch($action) {
            case 'get_user':
                if ($sessionManager->isLoggedIn()) {
                    $user = $sessionManager->getCurrentUser();
                    echo json_encode([
                        'success' => true,
                        'user' => $user
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Not logged in'
                    ]);
                }
                break;
                
            case 'update_profile':
                if ($sessionManager->isLoggedIn()) {
                    $username = $_POST['username'] ?? '';
                    $email = $_POST['email'] ?? '';
                    
                    if (strlen($username) >= Config::USERNAME_MIN_LENGTH) {
                        $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
                        $stmt->execute([$username, $email, $_SESSION['user_id']]);
                        
                        $_SESSION['username'] = $username;
                        $_SESSION['email'] = $email;
                        
                        echo json_encode([
                            'success' => true,
                            'message' => 'Profile updated successfully'
                        ]);
                    } else {
                        echo json_encode([
                            'success' => false,
                            'message' => 'Username too short'
                        ]);
                    }
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Not logged in'
                    ]);
                }
                break;
                
            case 'change_password':
                if ($sessionManager->isLoggedIn()) {
                    $currentPassword = $_POST['current_password'] ?? '';
                    $newPassword = $_POST['new_password'] ?? '';
                    
                    // Get current password hash
                    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
                    $stmt->execute([$_SESSION['user_id']]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if (password_verify($currentPassword, $user['password'])) {
                        if (strlen($newPassword) >= Config::PASSWORD_MIN_LENGTH) {
                            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                            $stmt->execute([$hashedPassword, $_SESSION['user_id']]);
                            
                            echo json_encode([
                                'success' => true,
                                'message' => 'Password changed successfully'
                            ]);
                        } else {
                            echo json_encode([
                                'success' => false,
                                'message' => 'Password too short'
                            ]);
                        }
                    } else {
                        echo json_encode([
                            'success' => false,
                            'message' => 'Current password is incorrect'
                        ]);
                    }
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Not logged in'
                    ]);
                }
                break;
                
            default:
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid action'
                ]);
        }
        
    } catch(Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Server error'
        ]);
    }
    exit;
}

// install.php - Installation script
if (basename($_SERVER['PHP_SELF']) == 'install.php') {
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>FRIEND AI - Installation</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 50px; }
            .success { color: green; }
            .error { color: red; }
            .info { color: blue; }
        </style>
    </head>
    <body>
        <h1>FRIEND AI Installation</h1>";
    
    try {
        $pdo = Config::getDBConnection();
        
        // Create tables
        $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            is_active BOOLEAN DEFAULT TRUE,
            profile_image VARCHAR(255) DEFAULT NULL
        );
        
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_token VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        ";
        
        $pdo->exec($sql);
        echo "<p class='success'>✓ Database tables created successfully!</p>";
        
        // Create demo user
        $hashedPassword = password_hash('password123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT IGNORE INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->execute(['demo', 'demo@example.com', $hashedPassword]);
        
        echo "<p class='success'>✓ Demo user created (demo@example.com / password123)</p>";
        echo "<p class='info'>Installation completed successfully!</p>";
        echo "<p><a href='auth.php'>Go to Login Page</a></p>";
        
    } catch(Exception $e) {
        echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
    }
    
    echo "</body></html>";
    exit;
}