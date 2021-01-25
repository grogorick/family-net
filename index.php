<?php
//phpinfo();

$server_dir = substr($_SERVER["PHP_SELF"], 0, 1 + strrpos($_SERVER["PHP_SELF"], '/'));

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

function html_min_start()
{
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
    body > div {
      margin: auto;
    }
    form {
      display: inline-block;
    }
  </style>
</head>
<body>
  <div>
<?php
}

function html_min_end()
{
?>
  </div>
</body>
</html>
<?php
}

function prepare_json_for_storage($arr)
{
  return str_replace([
    '[{',
    '},',
    '}]',

    '[[',
    '],',
    ']]'
  ], [
    '[' . PHP_EOL . '{',
    '}' . PHP_EOL . ',',
    '}' . PHP_EOL . ']',

    '[' . PHP_EOL . '[',
    ']' . PHP_EOL . ',',
    ']' . PHP_EOL . ']'
  ], json_encode($arr));
}


define('ACCOUNTS_FILE', 'accounts.yml');
define('USER', 'user'); define('USER_', 'u');
define('PASSWORD', 'password'); define('PASSWORD_', 'p');
define('TYPE', 'type'); define('TYPE_', 't');
define('ADMIN_', 'a');
define('NORMAL_', 'n');
define('VIEWER_', 'v');
define('ANONYMOUS_USER', 'Anonym');

define('ACTION', 'action');

define('SETTINGS_FILE', 'settings.yml');
define('CAMERA', 'camera');

define('STORAGE_DIR', 'storage');
define('STORAGE_FILE', 'storage.yml');
define('PERSONS', 'persons');
define('CONNECTIONS', 'connections');

define('CD_STORAGE_DIR', 'cd ' . STORAGE_DIR . '; ');

$accounts = [];
$settings = [ CAMERA => [ 'x' => 0, 'y' => 0, 'z' => 1] ];
$data = [ PERSONS => [], CONNECTIONS => [] ];

///////////////////////////////////////////////////////////////////////////////////////////////////

session_start();

$accounts_file_content = file_get_contents(ACCOUNTS_FILE);
if ($accounts_file_content) {
  $accounts = json_decode($accounts_file_content, true);
}

function save_accounts()
{
  global $accounts;
  $file_content = prepare_json_for_storage($accounts);
  file_put_contents(ACCOUNTS_FILE, $file_content);
}

function init()
{
  global $accounts;
  global $server_dir;
  if ($_SESSION[USER] == ANONYMOUS_USER) {
    $_SESSION[USER] = $accounts[0][USER_];
  }
  if (!file_exists(SETTINGS_FILE)) {
    save_settings();
  }
  if (!file_exists(STORAGE_DIR)) {
    exec('init.sh ' .
      '"' . STORAGE_DIR . '" 2>&1', $output, $ret);
    save_data('init');
  }
  header('Location: ' . $server_dir);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

if (!$accounts) {
  $_SESSION[USER] = ANONYMOUS_USER;
  $_SESSION[TYPE] = ADMIN_;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

else if (isset($_POST[ACTION]) && $_POST[ACTION] === 'login') {
  foreach ($accounts as $a) {
    if ($a[USER_] === $_POST[USER] && password_verify($_POST[PASSWORD], $a[PASSWORD_])) {
      $_SESSION[USER] = $a[USER_];
      $_SESSION[TYPE] = $a[TYPE_];
      break;
    }
  }
}

else if (isset($_GET['logout'])) {
  session_unset();
  header('Location: ' . $server_dir);
}

if (!isset($_SESSION[USER])) {
  html_min_start();
?>
    <form method="POST">
      <input type="hidden" name="<?=ACTION?>" value="login" />
      <input name="<?=USER?>" type="text" placeholder="Name" autofocus />
      <input name="<?=PASSWORD?>" type="password" placeholder="Passwort" />
      <input type="submit" value="Weiter" />
    </form>
<?php
  html_min_end();
  exit;
}

if ((isset($_GET['accounts']) && $_SESSION[TYPE] === ADMIN_) || !$accounts) {
  if (isset($_POST[ACTION])) {
    switch ($_POST[ACTION]) {
      case 'new': {
        $accounts[] = [
          USER_ => trim($_POST[USER]),
          PASSWORD_ => password_hash($_POST[PASSWORD], PASSWORD_BCRYPT),
          TYPE_ => $_POST[TYPE]];
        save_accounts();
        init();
      }
      break;
      case 'delete': {
        $i = $_POST[USER];
        array_splice($accounts, $i, 1);
        save_accounts();
      }
      break;
    }
  }

  html_min_start();

  if (!$accounts) {
    echo '<i>Erstelle einen Account, um zu starten.</i>';
  }
  else {
?>
    <a href="<?=$server_dir?>" style="float: right;" title="Zurück zum Netz">X</a>
    <hr style="clear: both;" />
    <ul>
<?php
    foreach ($accounts as $i => $a) {
?>
      <li>
        <?=$a[USER_] . ($a[TYPE_] === ADMIN_ ? ' (Admin)' : ($a[TYPE_] === VIEWER_ ? ' (Zuschauer)' : ''))?>
<?php
      $num_admins = count(array_filter($accounts, function($a) { return $a[TYPE_] === ADMIN_; }));
      if (($accounts[$i][TYPE_] !== ADMIN_ || $num_admins > 1) && $accounts[$i][USER_] !== $_SESSION[USER]) {
?>
        <form method="POST">
          <input type="hidden" name="<?=ACTION?>" value="delete" />
          <input type="hidden" name="<?=USER?>" value="<?=$i?>" />
          <input type="submit" value="X" />
        </form>
      </li>
<?php
      }
    }
?>
    </ul>
<?php
  }
?>
    <hr />
    <form method="POST">
      <input type="hidden" name="<?=ACTION?>" value="new" />
      <input type="text" name="<?=USER?>" placeholder="Name" autocomplete="off" autofocus />
      <input type="text" name="<?=PASSWORD?>" placeholder="Passwort" autocomplete="off" />
      <select name="<?=TYPE?>">
        <option value="<?=ADMIN_?>">Admin</option>
<?php
  if ($accounts) {
?>
        <option value="<?=NORMAL_?>" selected>Normal</option>
        <option value="<?=VIEWER_?>">Zuschauer</option>
<?php
  }
?>
      </select>
      <input type="submit" value="Account hinzufügen" />
    </form>
<?php
  html_min_end();
  exit;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

$settings_file_content = file_get_contents(SETTINGS_FILE);
if ($settings_file_content) {
  $settings = json_decode($settings_file_content, true);
}
else {
  $settings_file_content = json_encode($settings);
}

function save_settings()
{
  global $settings;
  $file_content = prepare_json_for_storage($settings);
  file_put_contents(SETTINGS_FILE, $file_content);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function get_log($commit_count = 0)
{
  exec(CD_STORAGE_DIR . 'git log --author-date-order --format=format:\'%h|||%ai|||%an|||%s\'' . ($commit_count > 0 ? ' -' . $commit_count : ''), $out);
  $out = array_map(function($line) {
    $line = explode('|||', $line);
    $line[1] = preg_replace('/ [+-]\d{4}/', '', $line[1]);
    return $line;
  }, $out);
  if ($commit_count === 1) {
    return $out[0];
  }
  return $out;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

$data_file_content = file_get_contents(STORAGE_DIR . '/' . STORAGE_FILE);
if ($data_file_content) {
  $data = json_decode($data_file_content, true);
}
else {
  $data_file_content = json_encode($data);
}

//// update old data
//foreach ($data[PERSONS] as &$p) {
//  $p['b'] = '--';
//}
//save_data('manual update');

function save_data($git_commit)
{
  global $data;
  $file_content = prepare_json_for_storage($data);
  file_put_contents(STORAGE_DIR . '/' . STORAGE_FILE, $file_content);
  exec('update.sh ' .
    '"' . STORAGE_DIR . '" ' .
    '"' . STORAGE_FILE . '" ' .
    '"' . $_SESSION[USER] . '" ' .
    '"' . $git_commit . '" 2>&1', $out);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function & get_data($what, $t)
{
  global $data;
  foreach ($data[$what] as &$d) {
    if ($d['t'] == $t) {
      return $d;
    }
  }
  die('ERROR | get_data(' . $what . ', ' . $t . ') | requested record not found.');
}

function delete_data($what, $t)
{
  global $data;
  foreach ($data[$what] as $index => $d) {
    if ($d['t'] == $t) {
      array_splice($data[$what], $index, 1);
      return;
    }
  }
}

if (isset($_GET[ACTION])) {
  header('Content-Type: text/plain; charset=utf-8');
  $t = time();
  $ret = $t;
  $d = json_decode(urldecode($_GET['d']), true);
  $data_str = $data_file_content;
  switch ($_GET[ACTION]) {
    case 'preview':
    {
      exec(CD_STORAGE_DIR . 'git show ' . $_GET['hash'] . ':' . STORAGE_FILE, $out);
      $data_str = implode(PHP_EOL, $out);
    }
    // no break here, to continue preview like init but with different data
    case 'init':
    {
      echo '{' .
          '"settings":' . $settings_file_content . PHP_EOL . ',' .
          '"graph":' . $data_str . PHP_EOL . ',' .
          '"log":' . prepare_json_for_storage(get_log()) .
        '}';
      exit;
    }

    case 'reset':
    {
      $hash = $_GET['hash'];
      exec(CD_STORAGE_DIR . 'git tag reset-to-' . $hash . '-at-' . $t . '; git reset --hard ' . $hash);
      header('Location: ' . $server_dir);
      exit;
    }

    case 'moveCamera':
    {
      $settings[CAMERA] = $d;
      save_settings();
      exit;
    }

    case 'addPerson':
    {
      $d['t'] = $t;
      $data[PERSONS][] = $d;
      $ret = 'p ' . $t;
    }
    break;
    case 'editPerson':
    {
      $t = $d['t'];
      $p = &get_data(PERSONS, $t);
      $d['x'] = $p['x'];
      $d['y'] = $p['y'];
      $p = $d;
      $ret = 'p ' . $t;
    }
    break;
    case 'deletePerson':
    {
      delete_data(PERSONS, $d);
      $ret = 'p ' . $d;
    }
    break;
    case 'movePersons':
    {
      $ts = [];
      foreach ($d as $d_) {
        $p = &get_data(PERSONS, $d_['t']);
        $p['x'] = $d_['x'];
        $p['y'] = $d_['y'];
        $ts[] = $d_['t'];
      }
      $ret = 'p ' . implode(', ', $ts);
    }
    break;

    case 'addConnection':
    {
      $d['t'] = $t;
      $data[CONNECTIONS][] = $d;
      $ret = 'c ' . $t;
    }
    break;
    case 'editConnection':
    {
      $t = $d['t'];
      $c = &get_data(CONNECTIONS, $t);
      $d['p1'] = $c['p1'];
      $d['p2'] = $c['p2'];
      $c = $d;
      $ret = 'c ' . $t;
    }
    break;
    case 'deleteConnection':
    {
      delete_data(CONNECTIONS, $d);
      $ret = 'c ' . $d;
    }
    break;
  }
  save_data('update :: ' . $ret);
  echo $ret . ' ;; ' . prepare_json_for_storage(get_log(1));
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
  <div id="log-preview-blocker">
    <a id="log-restore-selected-item" class="box box-visible button">Das Netzwerk auf diesen Zustand zurücksetzen</a>
  </div>
  <div id="modal-blocker"></div>
  <div id="account" class="box box-visible">
    <span><?=$_SESSION[USER]?></span>
<?php
  if ($_SESSION[TYPE] === ADMIN_) {
?>
  <a href="<?=$server_dir?>?accounts"><button>Accounts</button></a><?php
  }
?><a href="<?=$server_dir?>?logout"><button>Logout</button></a>
  </div>
  <div id="help" class="box box-visible box-minimized">
    <div class="box-minimize-buttons">
      <button class="box-restore">?</button>
      <button class="box-minimize">&mdash;</button>
    </div><?php
    $boxPos = 'unten rechts';
    $modKeys = '<i>Shift/Strg</i>'; ?>
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
            <li>Daten der Person im Eingabefenster (<?=$boxPos?>) eintragen:
              <dl>
                <dt><i>Name</i></dt>
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
  <div id="log" class="box box-visible box-minimized">
    <div class="box-minimize-buttons">
      <button class="box-restore">&olarr;</button>
      <button class="box-minimize">&mdash;</button>
    </div>
    <div>
      <h2>Änderungesverlauf</h2>
      <ul id="log-list"></ul>
    </div>
  </div>
  <div id="person-form" class="box">
    <h2 class="opt opt-new">Neue Person</h2>
    <h2 class="opt opt-edit">Person bearbeiten</h2>
    <div class="box-row">
      <label for="person-form-name">Name: </label>
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
