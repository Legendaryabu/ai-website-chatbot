<?php
// config.example.php 

define('GEMINI_API_KEY', 'PASTE_YOUR_GEMINI_API_KEY_HERE');
define('GEMINI_MODEL', 'gemini-3.5-flash'); 

define('BOT_NAME', 'your bot name');
define('WELCOME_MESSAGE', 'Hello! Thanks for visiting us today. How can I help you?');

$systemPrompt = "You are an official customer support agent for our website.
Role Rules:
- Identity: You represent " . BOT_NAME . ".
- Length Constraints: Maintain short replies (1-3 lines maximum).";
- Style: Professional, friendly, clear, and direct. No long paragraphs.
- Fallback: If you do not know an internal business answer, politely ask them to drop an email.";

define('SYSTEM_PROMPT', $systemPrompt);
?>