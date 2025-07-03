<?php
// logout.php - Handle user logout
session_start();

// Destroy all session data
session_destroy();

// Clear the session cookie
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Redirect to authentication page
header('Location: auth.php');
exit;
?>