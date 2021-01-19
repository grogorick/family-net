<?php
//phpinfo();

function html_start()
{
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
<?php
}

define('ACCOUNTS_FILE', 'accounts.yml');
define('USER', 'login-user');
define('PASSWORD', 'login-password');

session_start();
if (isset($_POST[USER]) && isset($_POST[PASSWORD])) {
  $accounts = file_get_contents(ACCOUNTS_FILE);
  if ($accounts) {
    $accounts = json_decode($accounts, true);
  }
  foreach ($accounts as $a) {
    if ($a['u'] === $_POST[USER] && $a['p'] === $_POST[PASSWORD]) {
      $_SESSION[USER] = $_POST[USER];
      break;
    }
  }
}
if (isset($_GET['logout'])) {
  session_unset();
  header('Location: /');
}
if (!isset($_SESSION[USER])) {
  html_start();
?>
  <style type="text/css">
    html, body {
      height: 100%;
    }
    body {
      margin: 0;
      display: flex;
    }
    form {
      margin: auto;
    }
  </style>
</head>
<body>
  <form method="POST">
    <input name="<?=USER?>" type="text" placeholder="Name" />
    <input name="<?=PASSWORD?>" type="password" placeholder="Passwort" />
    <input type="submit" value="Weiter" />
  </form>
</body>
</html>
<?php

exit;
}


define('STORAGE_FILE', 'storage.yml');
define('CAMERA', 'camera');
define('PERSONS', 'persons');
define('CONNECTIONS', 'connections');

$data = [CAMERA => [ 'x' => 0, 'y' => 0, 'z' => 1], PERSONS => [], CONNECTIONS => []];

$file_content = file_get_contents(STORAGE_FILE);
if ($file_content) {
  $data = json_decode($file_content, true);
}

//// update old data
//foreach ($data[PERSONS] as &$p) {
//  $p['b'] = '--';
//}
//save();

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

function getDataIndex($what, $t)
{
  global $data;
  foreach ($data[$what] as $idx => &$d) {
    if ($d['t'] == $t) {
      return $idx;
    }
  }
  return -1;
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
  $d = json_decode(urldecode($_GET['d']), true);
  switch ($_GET['action']) {
    case 'moveCamera':
    {
      $data[CAMERA] = $d;
    }
    break;
    case 'addPerson':
    {
      $d['t'] = $t;
      $data[PERSONS][] = $d;
    }
    break;
    case 'editPerson':
    {
      $t = $d['t'];
      $p = &getData(PERSONS, $t);
      $d['x'] = $p['x'];
      $d['y'] = $p['y'];
      $p = $d;
    }
    break;
    case 'deletePerson':
    {
      $t = $d;
      deleteData(PERSONS, $d);
    }
    break;
    case 'movePersons':
    {
      $t = [];
      foreach ($d as &$d_) {
        $t[] = $d_['t'];
        $p = &getData(PERSONS, $d_['t']);
        $p['x'] = $d_['x'];
        $p['y'] = $d_['y'];
      }
      $t = '[' . implode(', ', $t) . ']';
    }
    break;

    case 'addConnection':
    {
      $d['t'] = $t;
      $data[CONNECTIONS][] = $d;
    }
    break;
    case 'editConnection':
    {
      $t = $d['t'];
      $c = &getData(CONNECTIONS, $t);
      $d['p1'] = $c['p1'];
      $d['p2'] = $c['p2'];
      $c = $d;
    }
    break;
    case 'deleteConnection':
    {
      $t = $d;
      deleteData(CONNECTIONS, $t);
    }
    break;
  }
  save();
  echo $t;
  exit;
}


html_start();
?>
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
      <button class="box-minimize">&mdash;</button>
    </div>
<?php $boxPos = 'unten rechts'; ?>
<?php $modKeys = '<i>Shift/Strg</i>'; ?>
    <div>
      <h2 class="collapse-trigger collapsed">Ansehen</h2>
      <ul>
        <li>Sichtbaren Ausschnitt ändern:
          <ul>
            <li>Auf dem Hintergrund klicken und halten und ziehen</li>
          </ul>
        </li>
        <li>Infos einer Personen anzeigen:
          <ul>
            <li>Person anklicken</li>
            <li>Das Detailfenster wird <?=$boxPos?> angezeigt</li>
          </ul>
        </li>
        <li>Infos einer Verbindung zwischen Personen anzeigen:
          <ul>
            <li>Verbindungslinie anklicken</li>
            <li>Das Detailfenster wird <?=$boxPos?> angezeigt</li>
          </ul>
        </li>
        <li>Direkte Verwandte einer Person hervorheben:
          <ul>
            <li><i>Doppelklick</i> auf die gewünschte Person</li>
            <li>In direkter Linie verwandte Personen werden markiert</li>
          </ul>
        </li>
      </ul>
      <h2 class="collapse-trigger collapsed">Bearbeiten</h2>
      <ul>
        <li>Eine Person hinzufügen:
          <ul>
            <li><i>Doppelklick</i> dort, wo die Person hinzugefügt werden soll</li>
            <li>Daten der Person im Eingabefenster (<?=$boxPos?>) eintragen
              <dl>
                <dt><i>Namen:</i></dt>
                <dd>Vorname(n) und Nachname(n) mit einem Komma trennen.<br />
                    Der erste Vorname wird als Rufname im Netz angezeigt.<br />
                    Ein Sternchen (*) markiert andere Vornamen als Rufname.
                </dd>
              </dl>
            </li>
            <li><i>Hinzufügen</i> klicken</li>
          </ul>
        </li>
        <li>Zwei Personen verbinden:
          <ul>
            <li><?=$modKeys?> gedrückt halten</li>
            <li>Die erste Person anklicken</li>
            <li>Die zweite Person anklicken</li>
            <li>Daten der Verbindung im Eingabefenster (<?=$boxPos?>) eintragen</li>
            <li><i>Verbinden</i> klicken</li>
          </ul>
        </li>
        <li>Eine Person entfernen:
          <ul>
            <li>(Die Person darf keine Verbindungen haben)</li>
            <li>Die Person anklicken</li>
            <li>Im Detailfenster (<?=$boxPos?>) <i>Entfernen</i> klicken<br />oder<br /><?=$modKeys?> gedrückt halten und <i>Entf</i> tippen</li>
          </ul>
        </li>
        <li>Eine Verbindung entfernen:
          <ul>
            <li>(Die Verbindung darf keine Kind-Verbindungen haben)</li>
            <li>Die Verbindung anklicken</li>
            <li>Im Detailfenster (<?=$boxPos?>) <i>Entfernen</i> klicken<br />oder<br /><?=$modKeys?> gedrückt halten und <i>Entf</i> tippen</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
  <div id="person-form" class="box">
    <h2 class="opt opt-new">Neue Person</h2>
    <h2 class="opt opt-edit">Person bearbeiten</h2>
    <div class="box-row">
      <label for="person-form-name">Namen: </label>
      <input id="person-form-name" type="text" placeholder="Vorname(n), Nachname(n)" />
    </div><div class="box-row">
      <label for="person-form-birth-day">Geburtstag: </label>
      <input id="person-form-birth-day" type="text" autocomplete="off" placeholder="tt" />
      <input id="person-form-birth-month" type="text" autocomplete="off" placeholder="mm" />
      <input id="person-form-birth-year" type="text" autocomplete="off" placeholder="yyyy" />
    </div><div class="box-row">
      <label for="person-form-death-day">Todestag: </label>
      <input id="person-form-death-day" type="text" autocomplete="off" placeholder="tt" />
      <input id="person-form-death-month" type="text" autocomplete="off" placeholder="mm" />
      <input id="person-form-death-year" type="text" autocomplete="off" placeholder="yyyy" />
    </div><div class="box-row">
      <label for="person-form-note">Notiz: </label>
      <textarea id="person-form-note" rows="3"></textarea>
    </div>
    <button id="person-form-add" class="opt opt-new">Hinzufügen</button>
    <button id="person-form-edit" class="opt opt-edit">Speichern</button>
    <button id="person-form-delete" class="opt opt-edit">Entfernen</button>
    <button id="person-form-cancel">Abbrechen</button>
  </div>
  <div id="connection-form" class="box">
    <h2 class="opt opt-new opt-new-child">Neue Verbindung</h2>
    <h2 class="opt opt-edit">Verbindung bearbeiten</h2>
    <i id="connection-form-persons" class="opt opt-edit"></i>
    <div class="box-row">
      <label for="connection-form-relation">Art: </label>
      <input id="connection-form-relation" list="connection-form-relation-suggestions">
      <datalist id="connection-form-relation-suggestions">
        <option value="Kind">
        <option value="adoptiert">
        <option value="verheiratet">
        <option value="geschieden">
        <option value="verwitwet">
      </datalist>
    </div>
    <div class="box-row">
      <label for="connection-form-desc">Info: </label>
      <textarea id="connection-form-desc" rows="3"></textarea>
    </div>
    <button id="connection-form-add" class="opt opt-new">Verbinden</button>
    <button id="connection-form-add-child" class="opt opt-new-child">Verbinden</button>
    <button id="connection-form-edit" class="opt opt-edit">Speichern</button>
    <button id="connection-form-delete" class="opt opt-edit">Entfernen</button>
    <button id="connection-form-cancel">Abbrechen</button>
  </div>
  <script src="utils.js"></script>
  <script src="script.js"></script>
</body>
</html>
