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

function & getData($what, $t)
{
  global $data;
  foreach ($data[$what] as &$d) {
    if ($d['t'] == $t) {
      return $d;
    }
  }
  return null;
}

function deleteData($what, $t)
{
  global $data;
  foreach ($data[$what] as $index => &$d) {
    if ($d['t'] == $t) {
      array_splice($data[$what], $index, 1);
      return;
    }
  }
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
      $p = &getData(PERSONS, $t);
      $p['x'] = urldecode($_GET['x']);
      $p['y'] = urldecode($_GET['y']);
    }
    break;
    case 'deletePerson':
    {
      $t = urldecode($_GET['t']);
      deleteData(PERSONS, $t);
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
    case 'deleteConnection':
    {
      $t = urldecode($_GET['t']);
      deleteData(CONNECTIONS, $t);
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
  <script src="linkurious/sigma.min.js"></script>
  <script src="linkurious/renderer/sigma.canvas.nodes.def.js"></script>
  <script src="linkurious/renderer/sigma.canvas.labels.def.js"></script>
  <script src="linkurious/renderer/sigma.canvas.hovers.def.js"></script>
  <script src="linkurious/renderer/sigma.canvas.edges.def.js"></script>
  <script src="linkurious/renderer/sigma.canvas.edges.arrow.js"></script>
  <script src="linkurious/renderer/sigma.canvas.edges.dashed.js"></script>
  <script src="linkurious/renderer/sigma.canvas.edges.dotted.js"></script>
  <script src="linkurious/renderer/sigma.canvas.edgehovers.def.js"></script>
  <script src="linkurious/renderer/sigma.canvas.edgehovers.arrow.js"></script>
  <script src="linkurious/renderer/sigma.canvas.edgehovers.dashed.js"></script>
  <script src="linkurious/renderer/sigma.canvas.edgehovers.dotted.js"></script>
  <script src="linkurious/activeState/sigma.plugins.activeState.js"></script>
  <script src="linkurious/dragNodes/sigma.plugins.dragNodes.js"></script>
  <script src="linkurious/edgeLabels/sigma.canvas.edges.labels.def.js"></script>
  <script src="linkurious/edgeLabels/sigma.canvas.edges.labels.curve.js"></script>
  <script src="linkurious/edgeLabels/sigma.canvas.edges.labels.curvedArrow.js"></script>
  <script src="linkurious/edgeLabels/settings.js"></script>
</head>
<body>
  <div id="graph"></div>
  <div id="modal-blocker"></div>
  <div id="person-action-menu" class="input-box">
    <h2>Person...</h2>
    <div class="box-info"></div>
    <button id="person-action-edit">Bearbeiten</button><br />
    <button id="person-action-delete">Löschen</button><br />
    <button id="person-action-cancel">Abbrechen</button>
  </div>
  <div id="connection-action-menu" class="input-box">
    <h2>Verbindung...</h2>
    <div class="box-info"></div>
    <button id="connection-action-edit">Bearbeiten</button><br />
    <button id="connection-action-delete">Löschen</button><br />
    <button id="connection-action-cancel">Abbrechen</button>
  </div>
  <div id="new-person-form" class="input-box">
    <h2>Neue Person</h2>
    <label for="new-person-name">Name: </label>
    <input id="new-person-name" type="text" /><br />
    <label for="new-person-birthday">Geburtstag: </label>
    <input id="new-person-birthday" type="text" placeholder="tt" />
    <input id="new-person-birthday-month" type="text" placeholder="mm" />
    <input id="new-person-birthday-year" type="text" placeholder="yyyy" /><br />
    <button id="new-person-add">Hinzufügen</button>
    <button id="new-person-cancel">Abbrechen</button>
  </div>
  <div id="new-connection-form" class="input-box">
    <h2>Neue Verbindung</h2>
    <label for="new-connection-desc">Art: </label>
    <input id="new-connection-desc" type="text" /><br />
    <button id="new-connection-add">Verbinden</button>
    <button id="new-connection-cancel">Abbrechen</button>
  </div>
  <script src="utils.js"></script>
  <script src="script.js"></script>
</body>
</html>
