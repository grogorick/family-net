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
    case 'movePersons':
    {
      $t = [];
      $ds = json_decode(urldecode($_GET['d']), true);
      foreach ($ds as &$d) {
        $t[] = $d['t'];
        $p = &getData(PERSONS, $d['t']);
        $p['x'] = $d['x'];
        $p['y'] = $d['y'];
      }
      $t = '[' . implode(', ', $t) . ']';
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
  <title>Familiennetz</title>
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
  <div id="help" class="box box-visible box-minimized">
    <div class="box-minimize-buttons">
      <button class="box-restore">?</button>
      <button class="box-minimize">X</button>
    </div>
<?php $boxPos = '(unten rechts)'; ?>
    <ul>
      <li>
        Eine Person hinzufügen
        <ul>
          <li><i>Doppelklick</i> dort, wo die Person hinzugefügt werden soll</li>
          <li>Daten der Person im Eingabefenster <?=$boxPos?> eintragen</li>
          <li><i>Hinzufügen</i> klicken</li>
        </ul>
      </li>
      <li>
        Zwei Personen verbinden
        <ul>
          <li><i>Shift oder Strg</i> gedrückt halten</li>
          <li>Die erste Person anklicken</li>
          <li>Die zweite Person anklicken</li>
          <li>Daten der Verbindung im Eingabefenster <?=$boxPos?> eintragen</li>
          <li><i>Verbinden</i> klicken</li>
        </ul>
      </li>
      <li>
        Eine Person entfernen
        <ul>
          <li>(Die Person darf nicht mit anderen verbunden sein)</li>
          <li>Die Person anklicken</li>
          <li>Im Detailfenster <?=$boxPos?> <i>Entfernen</i> klicken</li>
        </ul>
      </li>
      <li>
        Eine Verbindung entfernen
        <ul>
          <li>Die Verbindung anklicken</li>
          <li>Im Detailfenster <?=$boxPos?> <i>Entfernen</i> klicken</li>
        </ul>
      </li>
    </ul>
  </div>
  <div id="person-form" class="box">
    <h2 class="opt opt-new">Neue Person</h2>
    <h2 class="opt opt-edit">Person bearbeiten</h2>
    <label for="person-form-name">Name: </label>
    <input id="person-form-name" type="text" /><br />
    <label for="person-form-birthday">Geburtstag: </label>
    <input id="person-form-birthday" type="text" placeholder="tt" />
    <input id="person-form-birthday-month" type="text" placeholder="mm" />
    <input id="person-form-birthday-year" type="text" placeholder="yyyy" /><br />
    <button id="person-form-add" class="opt opt-new">Hinzufügen</button>
    <button id="person-form-edit" class="opt opt-edit">Speichern</button>
    <button id="person-form-delete" class="opt opt-edit">Entfernen</button>
    <button id="person-form-cancel">Abbrechen</button>
  </div>
  <div id="connection-form" class="box">
    <h2 class="opt opt-new">Neue Verbindung</h2>
    <h2 class="opt opt-edit">Verbindung bearbeiten</h2>
    <i id="connection-form-persons" class="opt opt-edit"></i>
    <label for="connection-form-desc">Info: </label>
    <input id="connection-form-desc" type="text" /><br />
    <button id="connection-form-add" class="opt opt-new">Verbinden</button>
    <button id="connection-action-edit" class="opt opt-edit">Bearbeiten</button>
    <button id="connection-action-delete" class="opt opt-edit">Entfernen</button>
    <button id="connection-form-cancel">Abbrechen</button>
  </div>
  <script src="utils.js"></script>
  <script src="script.js"></script>
</body>
</html>
