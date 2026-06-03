<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Header configurations to safely handle JSON parsing and browser requests
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

include "config.php";

// Fetch and decode inbound asynchronous stream payload
$data = json_decode(file_get_contents("php://input"), true);
$message = $data["message"] ?? "";

if (!$message) {
    echo json_encode(["reply" => "Empty message received."]);
    exit;
}

/*
SYSTEM PROMPT (controls behavior)
*/
$systemPrompt = "You are a website customer support chatbot.
Rules:
- Reply very short (1-3 lines max)
- No long paragraphs
- No explanations unless asked
- Be clear and direct";

/*
GEMINI API ENDPOINT
UPDATED: Swapped deprecated endpoints to the active free-tier workhorse
*/
$url = "https://generativelanguage.googleapis.com/v1beta/models/" . GEMINI_MODEL . ":generateContent?key=" . GEMINI_API_KEY;
/*
PAYLOAD
UPDATED: Properly isolating user payload from systemic administrative behavior
*/
$payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => $message]
            ]
        ]
    ],
    "systemInstruction" => [
        "parts" => [
            ["text" => $systemPrompt]
        ]
    ]
];

/*
cURL REQUEST EXECUTION
*/
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(["reply" => "cURL Connectivity Error: " . curl_error($ch)]);
    exit;
}

curl_close($ch);

$result = json_decode($response, true);

/*
SAFE RESPONSE PARSING & FALLBACK HANDLING
*/
$reply = "Sorry, no response from AI.";

if (isset($result["candidates"][0]["content"]["parts"][0]["text"])) {
    $reply = $result["candidates"][0]["content"]["parts"][0]["text"];
} 
elseif (isset($result["error"]["message"])) {
    $reply = "API Error: " . $result["error"]["message"];
} 
elseif (isset($result["promptFeedback"]["blockReason"])) {
    $reply = "Content Blocked: " . $result["promptFeedback"]["blockReason"];
}

/*
RETURN RESPONSE TO FRONTEND
*/
echo json_encode(["reply" => $reply]);
?>