<?php

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get input values from client-side
    $username = $_POST['username'];
    $pass = $_POST['password'];
    $email = $_POST['email'];

    require_once 'connect.php';

    // Hash the password using the default algorithm
    $hashed_password = password_hash($pass, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (username, password, email, size, counter, timeout, theme) VALUES ('$username', '$hashed_password', '$email', 1, 0, 15, 1)";

    if (mysqli_query($conn, $sql)) {
//         $result["success"] = "1";
//         $result["message"] = "success";
        echo '<script>window.location.href="http://localhost:3000/index.html";</script>';

//         echo json_encode($result);

        mysqli_close($conn);
    } else {
//         $result["success"] = "0";
//         $result["message"] = "failed";
        echo '<script>window.location.href="http://localhost:3000/index.html";</script>';
//         echo json_encode($result);

        mysqli_close($conn);
    }
}

?>
