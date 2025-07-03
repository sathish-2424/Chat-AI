<?php
// session_manager.php - Session management and user authentication functions

class SessionManager {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    // Check if user is logged in
    public function isLoggedIn() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
    
    // Get current user data
    public function getCurrentUser() {
        if (!$this->isLoggedIn()) {
            return null;
        }
        
        $stmt = $this->pdo->prepare("SELECT id, username, email, created_at, last_login FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Login user
    public function loginUser($userId, $username, $email) {
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;
        $_SESSION['login_time'] = time();
        
        // Update last login
        $stmt = $this->pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$userId]);
        
        return true;
    }
    
    // Logout user
    public function logoutUser() {
        $_SESSION = array();
        
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        session_destroy();
        return true;
    }
    
    // Require login (redirect if not logged in)
    public function requireLogin($redirectTo = 'auth.php') {
        if (!$this->isLoggedIn()) {
            header("Location: $redirectTo");
            exit;
        }
    }
    
    // Get user's display name
    public function getDisplayName() {
        if ($this->isLoggedIn()) {
            return $_SESSION['username'];
        }
        return 'Guest';
    }
}

// logout.php - Logout functionality
if (basename($_SERVER['PHP_SELF']) == 'logout.php') {
    // Database connection
    $host = 'localhost';
    $dbname = 'friend_ai_db';
    $username = 'root';
    $password = '';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $sessionManager = new SessionManager($pdo);
        $sessionManager->logoutUser();
        
        // Redirect to login page
        header('Location: auth.php?message=logged_out');
        exit;
        
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}

// profile.php - User profile page
if (basename($_SERVER['PHP_SELF']) == 'profile.php') {
    // Database connection
    $host = 'localhost';
    $dbname = 'friend_ai_db';
    $username = 'root';
    $password = '';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $sessionManager = new SessionManager($pdo);
        $sessionManager->requireLogin();
        
        $user = $sessionManager->getCurrentUser();
        
        echo json_encode([
            'status' => 'success',
            'user' => $user,
            'logged_in' => true
        ]);
        
    } catch(PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error'
        ]);
    }
    exit;
}
?>