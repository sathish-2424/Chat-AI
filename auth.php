<?php
// auth.php - Main Authentication Page
session_start();

// Database configuration
$host = 'localhost';
$dbname = 'friend_ai_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Initialize variables
$error = '';
$success = '';
$action = isset($_POST['action']) ? $_POST['action'] : '';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'login') {
        $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
        $password = $_POST['password'];
        
        if (empty($email) || empty($password)) {
            $error = 'Please fill in all fields';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Please enter a valid email address';
        } else {
            // Check user credentials
            $stmt = $pdo->prepare("SELECT id, username, email, password FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($password, $user['password'])) {
                // Login successful
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                
                // Update last login
                $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
                $stmt->execute([$user['id']]);
                
                header('Location: chat.php'); // Changed from chat.html to chat.php
                exit;
            } else {
                $error = 'Invalid email or password';
            }
        }
    } elseif ($action === 'signup') {
        $username = trim($_POST['username']);
        $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
        $password = $_POST['password'];
        
        // Validation
        if (empty($username) || empty($email) || empty($password)) {
            $error = 'Please fill in all fields';
        } elseif (strlen($username) < 3) {
            $error = 'Username must be at least 3 characters long';
        } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            $error = 'Username can only contain letters, numbers, and underscores';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Please enter a valid email address';
        } elseif (strlen($password) < 6) {
            $error = 'Password must be at least 6 characters long';
        } else {
            // Check if user already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
            $stmt->execute([$email, $username]);
            
            if ($stmt->rowCount() > 0) {
                $error = 'User with this email or username already exists';
            } else {
                // Create new user
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())");
                
                if ($stmt->execute([$username, $email, $hashedPassword])) {
                    $success = 'Account created successfully! Please login.';
                } else {
                    $error = 'Error creating account. Please try again.';
                }
            }
        }
    }
}

// Check if user is already logged in
if (isset($_SESSION['user_id'])) {
    header('Location: chat.php'); // Changed from chat.html to chat.php
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication - FRIEND AI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            line-height: 1.6;
        }

        .auth-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            width: 100%;
            max-width: 400px;
            overflow: hidden;
        }

        .auth-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 2rem;
        }

        .auth-header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .auth-header p {
            opacity: 0.9;
            font-size: 0.875rem;
        }

        .form-container {
            padding: 2rem;
        }

        .form-toggle {
            display: flex;
            background: #f1f5f9;
            border-radius: 8px;
            padding: 4px;
            margin-bottom: 2rem;
        }

        .toggle-btn {
            flex: 1;
            padding: 0.75rem;
            text-align: center;
            border: none;
            background: transparent;
            color: #64748b;
            font-weight: 500;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s ease;
            font-size: 0.875rem;
        }

        .toggle-btn.active {
            background: white;
            color: #1e293b;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .form {
            display: none;
        }

        .form.active {
            display: block;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #374151;
            font-weight: 500;
            font-size: 0.875rem;
        }

        input[type="text"], 
        input[type="email"], 
        input[type="password"] {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
            transition: all 0.2s ease;
            background: white;
        }

        input[type="text"]:focus, 
        input[type="email"]:focus, 
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn {
            width: 100%;
            padding: 0.75rem 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 0.5rem;
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .alert {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.875rem;
        }

        .alert-success {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }

        .form-footer {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .form-footer a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }

        .form-footer a:hover {
            text-decoration: underline;
        }

        .input-group {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
            font-size: 1.125rem;
        }

        .input-group input {
            padding-left: 2.5rem;
        }

        @media (max-width: 480px) {
            .auth-container {
                margin: 1rem;
            }
            
            .form-container {
                padding: 1.5rem;
            }
            
            .auth-header {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-header">
            <h1>FRIEND AI</h1>
            <p>Please sign in to your account or create a new one</p>
        </div>

        <div class="form-container">
            <div class="form-toggle">
                <button class="toggle-btn active" onclick="showLogin()">Sign In</button>
                <button class="toggle-btn" onclick="showSignup()">Sign Up</button>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>

            <!-- Login Form -->
            <form class="form active" id="loginForm" method="POST">
                <input type="hidden" name="action" value="login">
                
                <div class="form-group">
                    <label for="loginEmail">Email Address</label>
                    <div class="input-group">
                        <span class="input-icon">✉</span>
                        <input type="email" id="loginEmail" name="email" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <div class="input-group">
                        <span class="input-icon">🔒</span>
                        <input type="password" id="loginPassword" name="password" required>
                    </div>
                </div>

                <button type="submit" class="btn">Sign In</button>

                <div class="form-footer">
                    <a href="#">Forgot your password?</a> | <a href="chat.php">Skip to Chat</a>
                </div>
            </form>

            <!-- Sign Up Form -->
            <form class="form" id="signupForm" method="POST">
                <input type="hidden" name="action" value="signup">
                
                <div class="form-group">
                    <label for="signupUsername">Username</label>
                    <div class="input-group">
                        <span class="input-icon">👤</span>
                        <input type="text" id="signupUsername" name="username" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="signupEmail">Email Address</label>
                    <div class="input-group">
                        <span class="input-icon">✉</span>
                        <input type="email" id="signupEmail" name="email" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="signupPassword">Password</label>
                    <div class="input-group">
                        <span class="input-icon">🔒</span>
                        <input type="password" id="signupPassword" name="password" required>
                    </div>
                </div>

                <button type="submit" class="btn">Create Account</button>

                <div class="form-footer">
                    By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Form switching functions
        function showLogin() {
            document.getElementById('loginForm').classList.add('active');
            document.getElementById('signupForm').classList.remove('active');
            
            const toggleBtns = document.querySelectorAll('.toggle-btn');
            toggleBtns[0].classList.add('active');
            toggleBtns[1].classList.remove('active');
        }

        function showSignup() {
            document.getElementById('signupForm').classList.add('active');
            document.getElementById('loginForm').classList.remove('active');
            
            const toggleBtns = document.querySelectorAll('.toggle-btn');
            toggleBtns[1].classList.add('active');
            toggleBtns[0].classList.remove('active');
        }

        // Show login form if there's a success message
        <?php if ($success): ?>
        showLogin();
        <?php endif; ?>
    </script>
</body>
</html>