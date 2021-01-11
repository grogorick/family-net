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

function & getPerson($t)
{
  global $data;
  foreach ($data[PERSONS] as &$d) {
    if ($d['t'] == $t) {
      return $d;
    }
  }
  return null;
}
function & getConnection($t)
{
  global $data;
  foreach ($data[CONNECTIONS] as &$d) {
    if ($d['t'] == $t) {
      return $d;
    }
  }
  return null;
}

if (isset($_GET['action'])) {
  header('Content-Type: text/plain; charset=utf-8');
  $t = time();
  switch ($_GET['action']) {
    case 'addPerson':
    {
      $data[PERSONS][] = [
        't' => $t,
        'x' => urldecode($_GET['x']),
        'y' => urldecode($_GET['y']),
        'n' => urldecode($_GET['n']),
        'b' => urldecode($_GET['b'])
      ];
    }
    break;
    case 'movePerson':
    {
      $t = urldecode($_GET['t']);
      $p = &getPerson($t);
      $p['x'] = urldecode($_GET['x']);
      $p['y'] = urldecode($_GET['y']);
    }
    break;
    case 'addConnection':
    {
      $data[CONNECTIONS][] = [
        't' => $t,
        'p1' => urldecode($_GET['p1']),
        'p2' => urldecode($_GET['p2']),
        'd' => urldecode($_GET['d'])
      ];
    }
    break;
  }
  save();
  echo $t;
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
  <script src="sigma.js"></script>
  <script src="sigma.plugins.dragNodes.js"></script>
</head>
<body>
  <div id="graph"></div>
  <div id="new-node-form" class="input-box">
    <h2>Neue Person</h2>
    <label for="new-node-name">Name: </label><input id="new-node-name" type="text" /><br />
    <label for="new-node-birthday">Geburtstag: </label><input id="new-node-birthday" type="date" /><br />
    <button id="new-node-add">Hinzufügen</button>
    <button id="new-node-cancel">Abbrechen</button>
  </div>
  <div id="new-connection-form" class="input-box">
    <h2>Neue Verbindung</h2>
    <label for="new-connection-desc">Art: </label><input id="new-connection-desc" type="text" /><br />
    <button id="new-connection-add">Verbinden</button>
    <button id="new-connection-cancel">Abbrechen</button>
  </div>
  <script src="script.js"></script>
</body>
</html>
