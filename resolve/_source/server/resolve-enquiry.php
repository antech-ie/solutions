<?php
/**
 * ReSolve enquiry receiver. Install next to antech.ie's wp-load.php.
 * Uses the site's existing WordPress mail transport; never accepts a recipient.
 * Rollback: remove this standalone file after restoring the frontend handler.
 */
define('DONOTCACHEPAGE', true);
define('WP_USE_THEMES', false);

function resolve_enquiry_reply($status, $body) {
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store, private, max-age=0');
    header('X-LiteSpeed-Cache-Control: no-cache');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed = array('https://solutions.antech.ie', 'https://antech.ie', 'https://www.antech.ie');
header('Vary: Origin');
if ($origin !== '' && !in_array($origin, $allowed, true)) {
    resolve_enquiry_reply(403, array('success' => false, 'code' => 'origin'));
}
if ($origin !== '') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
if ($method === 'OPTIONS') {
    resolve_enquiry_reply(204, array());
}
if ($method !== 'GET' && $method !== 'POST') {
    header('Allow: GET, POST, OPTIONS');
    resolve_enquiry_reply(405, array('success' => false, 'code' => 'method'));
}
if ($method === 'POST' && $origin === '') {
    resolve_enquiry_reply(403, array('success' => false, 'code' => 'origin'));
}
if ((int) (isset($_SERVER['CONTENT_LENGTH']) ? $_SERVER['CONTENT_LENGTH'] : 0) > 16384) {
    resolve_enquiry_reply(413, array('success' => false, 'code' => 'size'));
}
require_once __DIR__ . '/wp-load.php';
if (!function_exists('wp_mail')) {
    resolve_enquiry_reply(503, array('success' => false, 'code' => 'unavailable'));
}
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
$ip_key = hash_hmac('sha256', $ip, wp_salt('nonce'));
function resolve_enquiry_sign($issued, $id, $ip_key, $origin) {
    return hash_hmac('sha256', $issued . '.' . $id . '.' . $ip_key . '.' . $origin, wp_salt('nonce'));
}
function resolve_enquiry_limited($key, $limit) {
    $key = 'rv_mail_rate_' . hash('sha256', $key . gmdate('Y-m-d-H'));
    $count = (int) get_transient($key);
    if ($count >= $limit) {
        return true;
    }
    set_transient($key, $count + 1, 7200);
    return false;
}
if ($method === 'GET') {
    if ($origin === '') {
        resolve_enquiry_reply(200, array('service' => 'antech-resolve-enquiry', 'ready' => true, 'version' => '1.0.0'));
    }
    if (resolve_enquiry_limited('token:' . $ip_key, 120)) {
        resolve_enquiry_reply(429, array('success' => false, 'code' => 'rate'));
    }
    $issued = time();
    $id = bin2hex(random_bytes(16));
    $token = $issued . '.' . $id . '.' . resolve_enquiry_sign($issued, $id, $ip_key, $origin);
    resolve_enquiry_reply(200, array('success' => true, 'token' => $token, 'expires_in' => 3600));
}
$raw = file_get_contents('php://input', false, null, 0, 16385);
if (strlen($raw) > 16384) {
    resolve_enquiry_reply(413, array('success' => false, 'code' => 'size'));
}
$data = json_decode($raw, true);
if (!is_array($data)) {
    resolve_enquiry_reply(422, array('success' => false, 'code' => 'invalid'));
}
$parts = explode('.', isset($data['token']) && is_string($data['token']) ? $data['token'] : '');
if (count($parts) !== 3 || !ctype_digit($parts[0]) || !preg_match('/^[a-f0-9]{32}$/D', $parts[1]) ||
    !hash_equals(resolve_enquiry_sign($parts[0], $parts[1], $ip_key, $origin), $parts[2]) ||
    (int) $parts[0] > time() || time() - (int) $parts[0] > 3600) {
    resolve_enquiry_reply(403, array('success' => false, 'code' => 'expired'));
}
if (!empty($data['botcheck'])) {
    resolve_enquiry_reply(422, array('success' => false, 'code' => 'invalid'));
}
$fields = array('name' => 200, 'email' => 254, 'company' => 300, 'hplc_systems' => 100,
    'notes' => 4000, 'perspective' => 200, 'enquiry_cta' => 200, 'visitor_language' => 20);
$values = array();
foreach ($fields as $field => $limit) {
    $value = isset($data[$field]) ? $data[$field] : '';
    if (!is_string($value) || strlen($value) > $limit * 4) {
        resolve_enquiry_reply(422, array('success' => false, 'code' => 'invalid'));
    }
    $values[$field] = $field === 'notes' ? sanitize_textarea_field($value) : sanitize_text_field($value);
    if (strlen($values[$field]) > $limit * 4) {
        resolve_enquiry_reply(422, array('success' => false, 'code' => 'invalid'));
    }
}
if ($values['name'] === '' || $values['company'] === '' || !is_email($values['email']) ||
    preg_match('/[\r\n]/', isset($data['email']) ? $data['email'] : '')) {
    resolve_enquiry_reply(422, array('success' => false, 'code' => 'invalid'));
}
$id = $parts[1];
$reference = 'RV-' . strtoupper(substr($id, 0, 10));
$done_key = 'rv_mail_done_' . $id;
if (get_transient($done_key)) {
    resolve_enquiry_reply(200, array('success' => true, 'reference' => $reference, 'duplicate' => true));
}
if (resolve_enquiry_limited('submit:' . $ip_key, 10) ||
    resolve_enquiry_limited('email:' . strtolower($values['email']), 5) ||
    resolve_enquiry_limited('all', 100)) {
    resolve_enquiry_reply(429, array('success' => false, 'code' => 'rate'));
}
$lock = 'rv_mail_lock_' . $id;
$old_lock = (int) get_option($lock, 0);
if ($old_lock && time() - $old_lock > 120) {
    delete_option($lock);
}
if (!add_option($lock, time(), '', 'no')) {
    resolve_enquiry_reply(409, array('success' => false, 'code' => 'pending'));
}
$body = "ReSolve website enquiry\nReference: " . $reference . "\n\n";
$labels = array('name' => 'Name', 'email' => 'Email', 'company' => 'Company / site',
    'hplc_systems' => 'Isocratic HPLC systems', 'perspective' => 'Perspective',
    'enquiry_cta' => 'Button selected', 'visitor_language' => 'Website language', 'notes' => 'Message');
foreach ($labels as $field => $label) {
    $body .= $label . ': ' . $values[$field] . "\n\n";
}
$body .= "Submitted from https://solutions.antech.ie/resolve/\n";
$headers = array('Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $values['email']);
$sent = false;
try {
    $sent = wp_mail('info@antech.ie', 'ReSolve demonstration enquiry [' . $reference . ']', $body, $headers);
    if ($sent) {
        set_transient($done_key, true, 7200);
    }
} catch (Throwable $error) {
    // Do not expose transport details or customer fields in the response.
    $sent = false;
} finally {
    delete_option($lock);
}
if (!$sent) {
    resolve_enquiry_reply(503, array('success' => false, 'code' => 'mail'));
}
resolve_enquiry_reply(200, array('success' => true, 'reference' => $reference));
