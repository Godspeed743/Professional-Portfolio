<?php
// CONFIG: Set the email address that receives portfolio contact submissions.
$recipient_email = 'mohdhammad743@gmail.com';

// Set headers to allow AJAX requests and return JSON
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!empty($_POST['website'])) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Thank you! Your message has been sent successfully."]);
        exit;
    }
    
    // 1. Collect and Sanitize Input
    // htmlspecialchars prevents XSS
    // trim removes unnecessary whitespace
    $name = isset($_POST['name']) ? htmlspecialchars(trim(preg_replace('/[\r\n]+/', '', $_POST['name'])), ENT_QUOTES, 'UTF-8') : '';
    $email_input = isset($_POST['email']) ? trim(preg_replace('/[\r\n]+/', '', $_POST['email'])) : '';
    $email = filter_var($email_input, FILTER_SANITIZE_EMAIL);
    $subject = isset($_POST['subject']) ? htmlspecialchars(trim(preg_replace('/[\r\n]+/', '', $_POST['subject'])), ENT_QUOTES, 'UTF-8') : '';
    $message = isset($_POST['message']) ? htmlspecialchars(trim($_POST['message']), ENT_QUOTES, 'UTF-8') : '';

    // 2. Validate Input
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Please fill in all required fields."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Please provide a valid email address."]);
        exit;
    }

    // 3. Prepare Email
    $email_subject = "Portfolio Contact: $subject";
    
    // Build the email body
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Message:\n$message\n";

    // Build the email headers
    $email_headers = "From: $name <$email>\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "X-Mailer: PHP/" . phpversion();

    // 4. Send Email
    // NOTE: This requires a properly configured mail server (like Postfix, Sendmail, or a local server configured to route emails).
    try {
        if (mail($recipient_email, $email_subject, $email_content, $email_headers)) {
            // Success
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Thank you! Your message has been sent successfully."]);
        } else {
            // Failure
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Oops! Something went wrong and we couldn't send your message."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Mail server error: " . $e->getMessage()]);
    }

} else {
    // Not a POST request
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "There was a problem with your submission, please try again."]);
}
?>
