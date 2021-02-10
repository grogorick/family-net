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
define('LOGINS_FILE', 'logins.txt');

define('USER', 'user'); define('USER_', 'u');
define('PASSWORD', 'password'); define('PASSWORD_', 'p');

define('TYPE', 'type'); define('TYPE_', 't');
define('ADMIN_', 'a'); define('ADMIN__', 'Admin');
define('NORMAL_', 'n'); define('NORMAL__', 'Normal');
define('VIEWER_', 'v'); define('VIEWER__', 'Betrachter');

define('FIRST_LOGIN_', 'f');

define('ACTION', 'action');
define('ADMIN_ACTION', 'admin-action');
define('EDITING', 'editing');

define('CURRENT_EDITOR_FILE', 'current_editor.yml');
define('CURRENT_EDITOR_TIMEOUT', 10 * 60);

define('SETTINGS_FILE', 'settings.yml');
define('CAMERA', 'camera');

define('STORAGE_DIR', 'storage');
define('STORAGE_FILE', 'storage.yml');
define('PERSONS', 'persons');
define('CONNECTIONS', 'connections');

define('CD_STORAGE_DIR', 'cd ' . STORAGE_DIR . '; ');

$accounts = []; $firstLogin = false;
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
  file_put_contents(ACCOUNTS_FILE, $file_content, LOCK_EX);
}

function init()
{
  global $accounts;
  global $server_dir;
  if (!file_exists(SETTINGS_FILE)) {
    save_settings();
  }
  if (!file_exists(STORAGE_DIR) || !file_exists(STORAGE_DIR . '/' . STORAGE_FILE) || !file_exists(STORAGE_DIR . '/.git')) {
    exec('init.sh ' .
      '"' . STORAGE_DIR . '" 2>&1', $output, $ret);
	  $_SESSION[USER] = $accounts[0][USER_];
	  save_data('init');
	  unset($_SESSION[USER]);
	  header('Location: ' . $server_dir);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

if (isset($_POST[ACTION]) && $_POST[ACTION] === 'login') {
  foreach ($accounts as &$a) {
    if ($a[USER_] === $_POST[USER] && password_verify($_POST[PASSWORD], $a[PASSWORD_])) {
      $_SESSION[USER] = $a[USER_];
      $_SESSION[TYPE] = $a[TYPE_];
      $_SESSION[EDITING] = false;
      if (array_key_exists(FIRST_LOGIN_, $a)) {
        $firstLogin = true;
      }
      file_put_contents(LOGINS_FILE, date(DATE_RFC822) . ' | ' . $a[USER_] . PHP_EOL, FILE_APPEND | LOCK_EX);
      break;
    }
  }
}

else if (isset($_GET['logout'])) {
  if ($_SESSION[EDITING]) {
    stopEditing();
  }
  session_unset();
  header('Location: ' . $server_dir);
}

if (!isset($_SESSION[USER]) && $accounts) {
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

///////////////////////////////////////////////////////////////////////////////////////////////////

function startEditing()
{
  $ret = false;
  fclose(fopen(CURRENT_EDITOR_FILE, 'a'));
  $f = fopen(CURRENT_EDITOR_FILE, 'r+');
  if ($f) {
    if (flock($f, LOCK_EX /*| LOCK_NB*/)) {
      $time = time();
      $current_user_str = $time . '|||' . $_SESSION[USER];
      $other_editor = explode('|||', fread($f, 1000));
      $other_editor = (count($other_editor) === 2) ? [intval($other_editor[0]), $other_editor[1]] : false;
      if (($other_editor === false) // no other editor
       || ($other_editor[1] === $_SESSION[USER]) // renew timeout
       || ($time > ($other_editor[0] + CURRENT_EDITOR_TIMEOUT))) // other editor timed out
      {
        ftruncate($f, 0);
        rewind($f);
        fwrite($f, $current_user_str);
        fflush($f);
        $ret = true;
        $_SESSION[EDITING] = $time;
      }
      flock($f, LOCK_UN);
    }
    fclose($f);
  }
  return $ret;
}

function getEditor()
{
  $ret = false;
  fclose(fopen(CURRENT_EDITOR_FILE, 'a'));
  $f = fopen(CURRENT_EDITOR_FILE, 'r+');
  if ($f) {
    if (flock($f, LOCK_SH /*| LOCK_NB*/)) {
      $time = time();
      $other_editor = explode('|||', fread($f, 1000));
      $other_editor = (count($other_editor) === 2) ? [intval($other_editor[0]), $other_editor[1]] : false;
      if ($other_editor !== false) {
        if ($time < ($other_editor[0] + CURRENT_EDITOR_TIMEOUT)) {
          $ret = $other_editor;
        }
      }
      flock($f, LOCK_UN);
    }
    fclose($f);
  }
  return $ret;
}

function stopEditing()
{
  fclose(fopen(CURRENT_EDITOR_FILE, 'a'));
  $f = fopen(CURRENT_EDITOR_FILE, 'r+');
  if ($f) {
    if (flock($f, LOCK_EX | LOCK_NB)) {
      $other_editor = explode('|||', fread($f, 1000));
      $other_editor = (count($other_editor) === 2) ? [intval($other_editor[0]), $other_editor[1]] : false;
      if ($other_editor[1] === $_SESSION[USER]) {
        ftruncate($f, 0);
      }
      flock($f, LOCK_UN);
    }
    fclose($f);
  }
  $_SESSION[EDITING] = false;
}

if (isset($_GET['start-edit'])) {
  if ($_SESSION[TYPE] !== VIEWER_) {
    startEditing();
  }
  header('Location: ' . $server_dir);
  exit;
}

else if (isset($_GET['stop-edit'])) {
  stopEditing();
  header('Location: ' . $server_dir);
  exit;
}

else if (isset($_SESSION[EDITING])) {
  if (time() > $_SESSION[EDITING] + CURRENT_EDITOR_TIMEOUT) {
    stopEditing();
  }
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
  file_put_contents(SETTINGS_FILE, $file_content, LOCK_EX);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function get_log($commit_count = 0)
{
  exec(CD_STORAGE_DIR . 'git log --author-date-order --format=format:\'%h|||%ai|||%an|||%s\'' . ($_SESSION[TYPE] === ADMIN_ ? ' --all' : '') . ($commit_count > 0 ? ' -' . $commit_count : ''), $out);
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

function get_current_log_hash()
{
  exec(CD_STORAGE_DIR . 'git log -1 --format=format:\'%h\'', $out);
  return $out[0];
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
  file_put_contents(STORAGE_DIR . '/' . STORAGE_FILE, $file_content, LOCK_EX);
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

if (($_SESSION[TYPE] === ADMIN_ || !$accounts) && isset($_POST[ADMIN_ACTION])) {
  switch ($_POST[ADMIN_ACTION]) {
    // admin
    case 'new': {
      $accounts[] = [
        USER_ => trim($_POST[USER]),
        PASSWORD_ => password_hash($_POST[PASSWORD], PASSWORD_BCRYPT),
        TYPE_ => $_POST[TYPE],
        FIRST_LOGIN_ => true];
      save_accounts();
      init();
      $admin_msg = 'Neuer Account erstellt.';
    }
    break;
    case 'edit-type': {
      $i = $_POST[USER];
      $accounts[$i][TYPE_] = $_POST[TYPE];
      save_accounts();
      $admin_msg = 'Accounttyp geändert.';
    }
    break;
    case 'edit-password': {
      $i = $_POST[USER];
      $accounts[$i][PASSWORD_] = password_hash($_POST[PASSWORD], PASSWORD_BCRYPT);
      save_accounts();
      $admin_msg = 'Passwort geändert.';
    }
    break;
    case 'delete': {
      $i = $_POST[USER];
      array_splice($accounts, $i, 1);
      save_accounts();
      $admin_msg = 'Account gelöscht.';
    }
    break;
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
          '"log":' . prepare_json_for_storage(get_log()) . ',' .
          '"currentHash":"' . get_current_log_hash() . '"' .
        '}';
      exit;
    }

    case 'tutorial-completed':
    {
      foreach ($accounts as &$a) {
        if ($a[USER_] === $_SESSION[USER]) {
          if (array_key_exists(FIRST_LOGIN_, $a)) {
            unset($a[FIRST_LOGIN_]);
            save_accounts();
          }
          break;
        }
      }
      exit;
    }

    case 'get-editor':
    {
      echo json_encode(getEditor());
      exit;
    }
  }

  if ($_SESSION[EDITING]) {
    startEditing();

    switch ($_GET[ACTION]) {
      // log
      case 'reset':
      {
        $hash = $_GET['hash'];
        exec(CD_STORAGE_DIR . 'git log --author-date-order --format=format:\'%an\' ' . $hash . '..', $out);
        $checkOwnCommits = function($ret, $name) { return $ret && ($name === $_SESSION[USER]); };
        if ($_SESSION[TYPE] === ADMIN_ || array_reduce($out, $checkOwnCommits, true)) {
          exec(CD_STORAGE_DIR . 'git tag reset-to-' . $hash . '-by-' . preg_replace('/\\s/', '_', $_SESSION[USER]) . '-at-' . $t . ';');
          exec(CD_STORAGE_DIR . 'git reset --hard ' . $hash);
        }
        header('Location: ' . $server_dir);
        exit;
      }

      // settings
      case 'moveCamera':
      {
        $settings[CAMERA] = $d;
        save_settings();
        exit;
      }

      // data
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

      default:
        exit;
    }
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

  <div id="modal-blocker-graph" class="modal-blocker backdrop-blur hidden"></div>

  <div id="account" class="box">
    <span id="account-name"><?=$_SESSION[USER]?></span><!--
    <?php if (!$_SESSION[EDITING]) { ?>
    --><a href="<?=$server_dir?>?start-edit" class="button" id="start-edit" title="Bearbeitungsmodus starten">Bearbeiten</a><div class="button hidden"></div><!--
    <?php } else { ?>
    --><a href="<?=$server_dir?>?stop-edit" class="button" id="stop-edit" title="Bearbeitungsmodus beenden">Fertig<span id="stop-edit-timer"></span></a><!--
    <?php } ?>
    --><a href="<?=$server_dir?>?logout" class="button" id="logout">Abmelden</a>
  </div>
<?php

///////////////////////////////////////////////////////////////////////////////////////////////////

if ($_SESSION[TYPE] === ADMIN_ || !$accounts) {
?>
  <div id="admin" class="box box-padding<?=isset($_POST[ADMIN_ACTION]) ? '' : ' box-minimized'?>">
    <div class="box-minimize-buttons">
      <button class="box-restore">A</button>
      <button class="box-minimize">&mdash;</button>
    </div>
<?php
  if (!$accounts) {
    echo '<i>Erstelle einen Account, um zu starten.</i>';
  }
  else {
		if (isset($admin_msg)) {
			echo '<i>' . $admin_msg . '</i><hr />';
		}
?>
    <div>
      <table>
<?php
    foreach ($accounts as $i => $a) {
?>
        <tr>
          <td><?=$a[USER_]?></td>
          <td>
<?php
      $num_admins = count(array_filter($accounts, function($a) { return $a[TYPE_] === ADMIN_; }));
			$editable = ($accounts[$i][TYPE_] !== ADMIN_ || $num_admins > 1) && $accounts[$i][USER_] !== $_SESSION[USER];
      if ($editable) {
?>
            <form method="POST">
              <input type="hidden" name="<?=ADMIN_ACTION?>" value="edit-type" />
              <input type="hidden" name="<?=USER?>" value="<?=$i?>" />
              <select name="<?=TYPE?>" onchange="this.form.submit()">
              <option value="<?=ADMIN_?>" <?=$a[TYPE_] === ADMIN_ ? 'selected' : ''?>><?=ADMIN__?></option>
                <option value="<?=NORMAL_?>" <?=$a[TYPE_] === NORMAL_ ? 'selected' : ''?>><?=NORMAL__?></option>
                <option value="<?=VIEWER_?>" <?=$a[TYPE_] === VIEWER_ ? 'selected' : ''?>><?=VIEWER__?></option>
              </select>
            </form>
<?php
      }
			else {
				echo ' (' . ADMIN__ . ')';
			}
?>
          </td>
          <td>
            <form method="POST">
              <input type="hidden" name="<?=ADMIN_ACTION?>" value="edit-password" />
              <input type="hidden" name="<?=USER?>" value="<?=$i?>" />
              <input type="text" name="<?=PASSWORD?>" placeholder="Neues Passwort" autocomplete="off" />
              <input type="submit" style="display: none" />
            </form>
          </td>
          <td>
<?php
			if ($editable) {
?>
            <form method="POST">
              <input type="hidden" name="<?=ADMIN_ACTION?>" value="delete" />
              <input type="hidden" name="<?=USER?>" value="<?=$i?>" />
              <input type="submit" class="button button-border-full" value="X" title="Löschen" onclick="return confirm('Sicher?')" />
            </form>
<?php
      }
?>
          </td>
        </tr>
<?php
    }
?>
      </table>
<?php
  }
?>
      <hr />
      <form method="POST">
        <input type="hidden" name="<?=ADMIN_ACTION?>" value="new" />
        <input type="text" name="<?=USER?>" placeholder="Name" autocomplete="off" autofocus />
        <input type="text" name="<?=PASSWORD?>" placeholder="Passwort" autocomplete="off" />
        <select name="<?=TYPE?>">
          <option value="<?=ADMIN_?>"><?=ADMIN__?></option>
<?php
  if ($accounts) {
?>
          <option value="<?=NORMAL_?>" selected><?=NORMAL__?></option>
          <option value="<?=VIEWER_?>"><?=VIEWER__?></option>
<?php
  }
?>
        </select>
        <input type="submit" class="button button-border-full" value="Account hinzufügen" />
      </form>
    </div>
    <hr />
    <h2 class="collapse-trigger collapsed">Logins</h2>
    <div class="login-log">
      <?=implode('<br />', array_reverse(explode(PHP_EOL, file_get_contents(LOGINS_FILE))));?>
    </div>
  </div>
<?php
}

///////////////////////////////////////////////////////////////////////////////////////////////////

?>
  <div id="log" class="box box-padding box-minimized">
    <div class="box-minimize-buttons">
      <button class="box-restore" title="Änderungsverlauf">&olarr;</button>
      <button class="box-minimize">&mdash;</button>
    </div>
    <div>
      <h2>Änderungsverlauf</h2>
      <ul id="log-list"></ul>
    </div>
  </div>

  <a id="log-restore-selected-item" class="box button hidden">Das Netz auf diesen Zustand zurücksetzen</a>

  <div id="help" class="box box-padding box-minimized">
    <div class="box-minimize-buttons">
      <button class="box-restore" title="Hilfe">?</button>
      <button class="box-minimize">&mdash;</button>
    </div><?php
    $boxPos = 'unten rechts';
    $modKeys = '<i>Shift/Strg</i>'; ?>
    <div>
      <button id="restart-tutorial">(Die Anleitung noch einmal ansehen)</button>
      <h2 class="collapse-trigger<?=($_SESSION[TYPE] !== VIEWER_) ? ' collapsed' : ''?>">Ansehen</h2>
      <ul>
        <li>Elemente des Netzes:
          <ul>
            <li>Personen
              <dl>
                <dd><div class="tutorial-person"></div> Normal</dd>
                <dd><div class="tutorial-person t-p-highlight"></div> Ausgewählt</dd>
                <dd><div class="tutorial-person t-p-warning"></div> Warnung (wenn die Details '???' enthalten)</dd>
              </dl>
            </li>
            <li>Verbindungen
              <dl>
                <dd><div class="tutorial-connection t-c-arrow"></div> Eltern&mdash;Kind</dd>
                <dd><div class="tutorial-connection t-c-dashed"></div> Verheiratet</dd>
                <dd><div class="tutorial-connection t-c-dotted"></div> Geschieden/verwitwet</dd>
                <br />
                <dd><div class="tutorial-connection"></div> Normal</dd>
                <dd><div class="tutorial-connection t-c-highlight"></div> Ausgewählt</dd>
                <dd><div class="tutorial-connection t-c-warning"></div> Warnung (wenn die Details '???' enthalten)</dd>
              </dl>
            </li>
          </ul>
        </li>
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
        <li>Stammbaum einer Person hervorheben:
          <ul>
            <li><i>Doppelklick</i> auf die gewünschte Person</li>
            <li>In direkter Linie verwandte Personen werden markiert</li>
          </ul>
        </li>
      </ul>
      <?php if ($_SESSION[TYPE] !== VIEWER_) { ?>
      <h2 class="collapse-trigger collapsed">Bearbeiten</h2>
      <ul>
        <li>Bearbeitungsmodus de-/aktivieren:
          <ul>
            <li>Oben links <span class="help-button">Bearbeiten</span> klicken zum aktivieren</li>
            <li>Anschließend <span class="help-button">Fertig</span> klicken zum deaktivieren</li>
            <li>Es kann immer nur ein Nutzer im Bearbeitungsmodus sein</li>
          </ul>
        </li>
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
            <li><span class="help-button">Hinzufügen</span> klicken</li>
          </ul>
        </li>
        <li>Eine Person verschieben:
          <ul>
            <li><?=$modKeys?> gedrückt halten</li>
            <li>Auf die Person klicken und halten und ziehen</li>
          </ul>
        </li>
        <li>Zwei Personen verbinden:
          <ul>
            <li><?=$modKeys?> gedrückt halten</li>
            <li>Die erste Person anklicken</li>
            <li>Die zweite Person anklicken</li>
            <li>Daten der Verbindung im Eingabefenster (<?=$boxPos?>) eintragen</li>
            <li><span class="help-button">Verbinden</span> klicken</li>
          </ul>
        </li>
        <li>Zwei Eltern und ein Kind verbinden:
          <ul>
            <li><?=$modKeys?> gedrückt halten</li>
            <li>Die Verbindung zwischen den Eltern anklicken</li>
            <li>Das Kind anklicken</li>
            <li>Daten der Verbindung im Eingabefenster (<?=$boxPos?>) eintragen</li>
            <li><span class="help-button">Verbinden</span> klicken</li>
          </ul>
        </li>
        <li>Eine Person entfernen:
          <ul>
            <li>(Die Person darf keine Verbindungen haben)</li>
            <li>Die Person anklicken</li>
            <li>Im Detailfenster (<?=$boxPos?>) <span class="help-button">Entfernen</span> klicken<br />oder<br /><?=$modKeys?> gedrückt halten und <i>Entf</i> tippen</li>
          </ul>
        </li>
        <li>Eine Verbindung entfernen:
          <ul>
            <li>(Die Verbindung darf keine Kind-Verbindungen haben)</li>
            <li>Die Verbindung anklicken</li>
            <li>Im Detailfenster (<?=$boxPos?>) <span class="help-button">Entfernen</span> klicken<br />oder<br /><?=$modKeys?> gedrückt halten und <i>Entf</i> tippen</li>
          </ul>
        </li>
        <li>Änderungen rückgängig machen:
          <ul>
            <li>Oben rechts <span class="help-button">&olarr;</span> klicken</li>
            <li>Einen früheren Zustand auswählen</li>
            <li>Das Netz wird als Vorschau entsprechend angezeigt</li>
            <li>Oben mittig <span class="help-button">Das Netz auf diesen Zustand zurücksetzen</span> klicken</li>
          </ul>
        </li>
      </ul>
      <?php } ?>
    </div>
  </div>

  <div id="person-form" class="box box-padding hidden">
    <h2 class="opt opt-new">Neue Person</h2>
    <h2 class="opt opt-edit"><?=($_SESSION[EDITING] ? 'Person bearbeiten' : 'Personendetails')?></h2>
    <div class="box-row">
      <label for="person-form-name">Name: </label>
      <input id="person-form-name" type="text" autocomplete="off" placeholder="(Spitzname) Vorname/n, Nachname/n" <?=($_SESSION[EDITING] ? '' : 'disabled')?> />
    </div><div class="box-row">
      <label for="person-form-birth-day">Geburtstag: </label>
      <input id="person-form-birth-day" type="text" autocomplete="off" placeholder="tt" <?=($_SESSION[EDITING] ? '' : 'disabled')?> />
      <input id="person-form-birth-month" type="text" autocomplete="off" placeholder="mm" <?=($_SESSION[EDITING] ? '' : 'disabled')?> />
      <input id="person-form-birth-year" type="text" autocomplete="off" placeholder="yyyy" <?=($_SESSION[EDITING] ? '' : 'disabled')?> />
    </div><div class="box-row">
      <label for="person-form-death-day">Todestag: </label>
      <input id="person-form-death-day" type="text" autocomplete="off" placeholder="tt" <?=($_SESSION[EDITING] ? '' : 'disabled')?> />
      <input id="person-form-death-month" type="text" autocomplete="off" placeholder="mm" <?=($_SESSION[EDITING] ? '' : 'disabled')?> />
      <input id="person-form-death-year" type="text" autocomplete="off" placeholder="yyyy" <?=($_SESSION[EDITING] ? '' : 'disabled')?> />
    </div><div class="box-row">
      <label for="person-form-note">Notiz: </label>
      <textarea id="person-form-note" rows="3" <?=($_SESSION[EDITING] ? '' : 'disabled')?>></textarea>
    </div>
    <button id="person-form-add" class="button-border opt opt-new">Hinzufügen</button>
    <button id="person-form-edit" class="button-border opt opt-edit">Speichern</button>
    <button id="person-form-delete" class="button-border opt opt-edit">Entfernen</button>
    <button id="person-form-cancel" class="button-border"><?=($_SESSION[EDITING] ? 'Abbrechen' : 'Schließen')?></button>
  </div>

  <div id="connection-form" class="box box-padding hidden">
    <h2 class="opt opt-new opt-new-child">Neue Verbindung</h2>
    <h2 class="opt opt-edit"><?=($_SESSION[EDITING] ? 'Verbindung bearbeiten' : 'Verbindungsdetails')?></h2>
    <i id="connection-form-persons" class="opt opt-edit"></i>
    <div class="box-row">
      <label for="connection-form-relation">Art: </label>
      <input id="connection-form-relation" list="connection-form-relation-suggestions" autocomplete="off" <?=($_SESSION[EDITING] ? '' : 'disabled')?>>
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
      <textarea id="connection-form-desc" rows="3" <?=($_SESSION[EDITING] ? '' : 'disabled')?>></textarea>
    </div>
    <button id="connection-form-add" class="button-border opt opt-new">Verbinden</button>
    <button id="connection-form-add-child" class="button-border opt opt-new-child">Verbinden</button>
    <button id="connection-form-edit" class="button-border opt opt-edit">Speichern</button>
    <button id="connection-form-delete" class="button-border opt opt-edit">Entfernen</button>
    <button id="connection-form-cancel" class="button-border"><?=($_SESSION[EDITING] ? 'Abbrechen' : 'Schließen')?></button>
  </div>

  <div id="message-template" class="modal-blocker backdrop-blur message hidden">
    <div class="box box-padding">
      <div class="message-content"></div>
      <button class="button-border"></button>
    </div>
  </div>

  <script>
    let currentUser = '<?=$_SESSION[USER]?>';
    let currentUserIsAdmin = <?=($_SESSION[TYPE] === ADMIN_) ? 'true' : 'false'?>;
    let currentUserIsViewer = <?=($_SESSION[TYPE] === VIEWER_) ? 'true' : 'false'?>;
    let currentUserIsEditing = <?=$_SESSION[EDITING] ? 'false' : 'true'?>;
    let editingTimeout = <?=$_SESSION[EDITING] ?: '0'?>;
    let editingTimeoutDuration = <?=CURRENT_EDITOR_TIMEOUT?>;
    let firstLogin = <?=$firstLogin ? 'true' : 'false'?>;
    let modKeys = '<?=$modKeys?>';
    let boxPos = '<?=$boxPos?>';
  </script>
  <script src="utils.js"></script>
  <script src="script.js"></script>
  <script src="tutorial.js"></script>
</body>
</html>
