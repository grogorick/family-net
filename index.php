<?php
//phpinfo();

define('STORAGE_FILE', 'storage.yml');
define('PERSONS', 'persons');
define('CONNECTIONS', 'connections');

$data = [PERSONS => [], CONNECTIONS => []];

$file_content = file_get_contents(STORAGE_FILE);
if ($file_content) {
  $data = json_decode($file_content, true);
}

function save()
{
  global $data;
  $file_content = json_encode($data);
  file_put_contents(STORAGE_FILE, $file_content);
}

if (isset($_GET['action'])) {
  header('Content-Type: text/plain; charset=utf-8');
  switch ($_GET['action']) {
    case 'add':
    {
      $t = time();
      $data[PERSONS][] = [
        't' => $t,
        'x' => urldecode($_GET['x']),
        'y' => urldecode($_GET['y']),
        'n' => urldecode($_GET['n']),
        'b' => urldecode($_GET['b'])
      ];
      save();
      echo $t;
    }
    break;
  }
  exit;
}

header('Content-Type:text/html');
?>
<!DOCTYPE html>
<html lang="de" xml:lang="de">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>sb</title>
  <meta name="description" content="private website" />
  <link rel="icon" type="image/png" href="favicon.png" />
  <link rel="stylesheet" type="text/css" href="style.css" />
  <script src="sigma.min.js"></script>
</head>
<body>
  <div id="graph"></div>
  <div id="new-node-form">
    <label for="name">Name: </label><input id="new-node-name" type="text" /><br />
    <label for="name">Geburtstag: </label><input id="new-node-birthday" type="date" /><br />
    <button id="new-node-add">Hinzufügen</button>
    <button id="new-node-cancel">Verwerfen</button>
  </div>
  <script src="script.js"></script>
</body>
</html>