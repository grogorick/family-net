<?php
//phpinfo();

// browser cache fix for scripts and styles
define('V', 7);
define('V_', '?v=' . V);

$server_url = substr($_SERVER["PHP_SELF"], 0, 1 + strrpos($_SERVER["PHP_SELF"], '/'));

$useragent = $_SERVER['HTTP_USER_AGENT'];
$is_mobile = preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i',substr($useragent,0,4));

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

define('RUNTIME_DIR', 'runtime');

define('ACCOUNTS_FILE', RUNTIME_DIR . '/accounts.yml');
define('LOGINS_FILE', RUNTIME_DIR . '/logins.txt');

define('USER', 'user'); define('USER_', 'u');
define('PASSWORD', 'password'); define('PASSWORD_', 'p');

define('TYPE', 'type'); define('TYPE_', 't');
define('ADMIN_', 'a'); define('ADMIN__', 'Admin');
define('NORMAL_', 'n'); define('NORMAL__', 'Normal');
define('VIEWER_', 'v'); define('VIEWER__', 'Betrachter');

define('FIRST_LOGIN_', 'f');
define('ACCOUNT_UPGRADED_', 'a');

define('ACTION', 'action');
define('ADMIN_ACTION', 'admin-action');
define('EDITING', 'editing');

define('CURRENT_EDITOR_FILE', RUNTIME_DIR . '/current_editor.yml');
define('CURRENT_EDITOR_TIMEOUT', 10 * 60);

define('SETTINGS_FILE', RUNTIME_DIR . '/settings.yml');
define('CAMERA', 'camera');

define('STORAGE_DIR', 'storage');
define('STORAGE_FILE', 'storage.yml');
define('PERSONS', 'persons');
define('CONNECTIONS', 'connections');

define('CD_STORAGE_DIR', 'cd ' . STORAGE_DIR . '; ');

$accounts = []; $first_login = false; $account_upgraded = false;
$settings = [ CAMERA => [ 'x' => 0, 'y' => 0, 'z' => 1] ];
$data = [ PERSONS => [], CONNECTIONS => [] ];

///////////////////////////////////////////////////////////////////////////////////////////////////

if (!file_exists(RUNTIME_DIR)) {
  mkdir(RUNTIME_DIR);
}
if (!file_exists(STORAGE_DIR)) {
  mkdir(STORAGE_DIR);
}

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
  global $server_url;
  if (!file_exists(SETTINGS_FILE)) {
    save_settings();
  }
  if (!file_exists(STORAGE_DIR . '/' . STORAGE_FILE) || !file_exists(STORAGE_DIR . '/.git')) {
    exec('sh/init.sh ' .
      '"' . STORAGE_DIR . '" 2>&1', $output, $ret);
	  $_SESSION[USER] = $accounts[0][USER_];
	  save_data('init');
	  unset($_SESSION[USER]);
	  header('Location: ' . $server_url);
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
        $first_login = true;
      }
      else if (array_key_exists(ACCOUNT_UPGRADED_, $a)) {
        $account_upgraded = true;
      }
      break;
    }
  }
}

else if (isset($_GET['logout'])) {
  if ($_SESSION[EDITING]) {
    stopEditing();
  }
  session_unset();
  header('Location: ' . $server_url);
}

if (!isset($_SESSION[USER]) && $accounts) {
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
    input {
      border: 1px solid #aaa;
      border-radius: 3pt;
      padding: 3pt;
    }
    @media only screen and (max-width: 767px) {
      input {
        margin: 10pt 0;
        display: block;
        font-size: 120%;
        width: 70vw;
      }
    }
  </style>
</head>
<body>
  <div>
    <form method="POST">
      <input type="hidden" name="<?=ACTION?>" value="login" />
      <input name="<?=USER?>" type="text" placeholder="Name" autofocus />
      <input name="<?=PASSWORD?>" type="password" placeholder="Passwort" />
      <input type="submit" value="Anmelden" />
    </form>
  </div>
</body>
</html>
<?php
  exit;
}

$login_date = time();
if (!isset($_SESSION['last-login']) || $login_date > ($_SESSION['last-login'] + 12/*hours*/ * 60/*min*/ * 60/*sec*/)) {
  $_SESSION['last-login'] = $login_date;
  file_put_contents(LOGINS_FILE, date(DATE_RFC2822, $login_date) . ' | ' . $_SESSION[USER] . PHP_EOL, FILE_APPEND | LOCK_EX);
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
  header('Location: ' . $server_url);
  exit;
}

else if (isset($_GET['stop-edit'])) {
  stopEditing();
  header('Location: ' . $server_url);
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
  exec('sh/update.sh ' .
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
      if ($accounts[$i][TYPE_] === VIEWER_ && $_POST[TYPE] === NORMAL_) {
        $accounts[$i][ACCOUNT_UPGRADED_] = true;
      }
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
          if (array_key_exists(FIRST_LOGIN_, $a)) { unset($a[FIRST_LOGIN_]); }
          if (array_key_exists(ACCOUNT_UPGRADED_, $a)) { unset($a[ACCOUNT_UPGRADED_]); }
          save_accounts();
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
        header('Location: ' . $server_url);
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
  <link rel="stylesheet" type="text/css" href="css/style.css<?=V_?>" />
  <script src="js/linkurious/sigma.min.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.nodes.def.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.labels.def.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.hovers.def.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.edges.def.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.edges.arrow.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.edges.dashed.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.edges.dotted.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.edgehovers.def.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.edgehovers.arrow.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.edgehovers.dashed.js<?=V_?>"></script>
  <script src="js/linkurious/renderer/sigma.canvas.edgehovers.dotted.js<?=V_?>"></script>
  <script src="js/linkurious/activeState/sigma.plugins.activeState.js<?=V_?>"></script>
  <script src="js/linkurious/dragNodes/sigma.plugins.dragNodes.js<?=V_?>"></script>
  <script src="js/linkurious/edgeLabels/sigma.canvas.edges.labels.def.js<?=V_?>"></script>
  <script src="js/linkurious/edgeLabels/sigma.canvas.edges.labels.curve.js<?=V_?>"></script>
  <script src="js/linkurious/edgeLabels/sigma.canvas.edges.labels.curvedArrow.js<?=V_?>"></script>
  <script src="js/linkurious/edgeLabels/settings.js<?=V_?>"></script>
  <script src="js/edges.dashedarrow.js<?=V_?>"></script>
  <script src="js/edgehovers.dashedarrow.js<?=V_?>"></script>
</head>
<body class="<?=$is_mobile ? 'mobile-client' : 'desktop-client'?>">
  <div id="graph"></div>

  <div id="modal-blocker-graph" class="modal-blocker backdrop-blur hidden"></div>

  <div id="mobile-menu-toggle" class="box button hidden-toggle mobile-only" data-hidden-toggle-target="#account">&#9776;</div>

  <div id="account" class="box mobile-inverse-hidden">
    <div id="mobile-menu-close" class="button mobile-only hidden-toggle" data-hidden-toggle-target="#account">X</div><!--
    --><span id="account-name"><?=$_SESSION[USER]?></span><!--
    --><hr class="mobile-only" /><!--
    <?php if (!$_SESSION[EDITING]) { ?>
    --><a href="<?=$server_url?>?start-edit" class="button" id="start-edit" title="Bearbeitungsmodus starten">Bearbeiten</a><!--
    --><div id="other-editor" class="button hidden"></div><!--
    <?php } else { ?>
    --><a href="<?=$server_url?>?stop-edit" class="button" id="stop-edit" title="Bearbeitungsmodus beenden">Fertig<span id="stop-edit-timer"></span></a><!--
    <?php } ?>
    --><div id="mobile-log" class="button mobile-only">Änderungsverlauf</div><!--
    --><div id="mobile-help" class="button mobile-only">Hilfe</div><!--
    --><hr class="mobile-only" /><!--
    --><div id="mobile-admin" class="button mobile-only">Admin</div><!--
    --><a href="<?=$server_url?>?logout" class="button" id="logout">Abmelden</a>
  </div>
<?php

///////////////////////////////////////////////////////////////////////////////////////////////////

$box_close_minimize_symbol = $is_mobile ? 'X' : '&mdash;';

if ($_SESSION[TYPE] === ADMIN_ || !$accounts) {
?>
  <div id="admin" class="box box-padding<?=isset($_POST[ADMIN_ACTION]) ? '' : ' box-minimized'?>">
    <div class="box-minimize-buttons">
      <button class="box-restore desktop-only">A</button>
      <button class="box-minimize"><?=$box_close_minimize_symbol?></button>
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
    <h2>Accounts</h2>
    <div id="accounts-list">
      <table>
<?php
    foreach ($accounts as $i => $a) {
?>
        <tr>
          <td>
            <?=$a[USER_]?>
            <?=$a[FIRST_LOGIN_] ? '*' : ''?>
            <?=$a[ACCOUNT_UPGRADED_] ? '+' : ''?>
          </td>
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
    </div>
    <hr />
    <h2 class="mobile-only">Neuer Account</h2>
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
    <hr />
    <h2>Logins</h2>
    <div id="login-log">
      <table>
        <tr><td>
<?php
  $today = substr(date(DATE_RFC2822), 0, 16);
  $yesterday = substr(date(DATE_RFC2822, time() - 24 * 60 * 60), 0, 16);
  echo implode(
    '</td></tr><tr><td>',
    array_reverse(
      array_map(
        function($line) use ($today, $yesterday) {
          return implode('</td><td>',
            array_map(
              function($part) use ($today, $yesterday)
              {
                $date = substr($part, 0, 16);
                return ($date === $today ? 'heute' : ($date === $yesterday ? 'gestern' : $date)) . '</td><td>' . substr($part, 16); },
              explode(' | ', $line)));
        },
        preg_split(
          '/' . PHP_EOL . '/',
          file_get_contents(LOGINS_FILE),
          0,
          PREG_SPLIT_NO_EMPTY))));
?>
        </td></tr>
      </table>
    </div>
  </div>
<?php
}

///////////////////////////////////////////////////////////////////////////////////////////////////

?>
  <div id="log" class="box box-padding box-minimized">
    <div class="box-minimize-buttons">
      <button class="box-restore desktop-only" title="Änderungsverlauf">&olarr;</button>
      <button class="box-minimize"><?=$box_close_minimize_symbol?></button>
    </div>
    <div>
      <h2>Änderungsverlauf</h2>
      <ul id="log-list"></ul>
    </div>
  </div>

  <a id="log-restore-selected-item" class="box button hidden">Das Netz auf diesen Zustand zurücksetzen</a>

  <div id="help" class="box box-padding box-minimized">
    <div class="box-minimize-buttons">
      <button class="box-restore desktop-only" title="Hilfe">?</button>
      <button class="box-minimize"><?=$box_close_minimize_symbol?></button>
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
                <dd><div class="tutorial-connection"></div> Verheiratet</dd>
                <dd><div class="tutorial-connection t-c-dashed"></div> Geschieden/verwitwet</dd>
                <dd><div class="tutorial-connection t-c-dotted"></div> Andere</dd>
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
                <dd>
                  Vorname(n) und Nachname(n) mit einem Komma trennen.<br />
                  Rufname mit einem * kennzeichnen, sonst der erste Vorname.<br />
                  Spitzname in Klammern angegeben.
                  <p>
                    Bsp.:<br />
                    &ndash; Maximilian Fritz Mustermann<br />
                    &ndash; Maximilian *Fritz Mustermann<br />
                    &ndash; (Maxi) Maximilian Fritz Mustermann<br />
                    &ndash; (Maxi) Maximilian *Fritz Mustermann
                  </p>
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
    let firstLogin = <?=$first_login ? 'true' : 'false'?>;
    let accountUpgraded = <?=$account_upgraded ? 'true' : 'false'?>;
    let modKeys = '<?=$modKeys?>';
    let boxPos = '<?=$boxPos?>';
    let isMobile = <?=$is_mobile ? 'true' : 'false'?>;
  </script>
  <script src="js/mobile.js<?=V_?>"></script>
  <script src="js/utils.js<?=V_?>"></script>
  <script src="js/script.js<?=V_?>"></script>
  <script src="js/tutorial.js<?=V_?>"></script>
</body>
</html>
