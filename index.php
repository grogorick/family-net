<?php
//phpinfo();

// browser cache fix for scripts and styles
const V = 25.5;
const V_ = '?v=' . V;

const MAINTENANCE = false;

const RUNTIME_DIR = 'runtime';

const ACCOUNTS_FILE = RUNTIME_DIR . '/accounts.yml';
const LOGINS_FILE = RUNTIME_DIR . '/logins.txt';

const USER = 'user'; const USER_ = 'u';
const PASSWORD = 'password'; const PASSWORD_ = 'p';

const TYPE = 'type'; const TYPE_ = 't';
const ADMIN_ = 'a';
const NORMAL_ = 'n';
const VIEWER_ = 'v';
const GUEST_ = 'g';
const TYPES = [
  ADMIN_ => ['label' => 'Admin', 'level' => 0],
  NORMAL_ => ['label' => 'Normal', 'level' => 1],
  VIEWER_ => ['label' => 'Betrachter', 'level' => 2],
  GUEST_ => ['label' => 'Gast', 'level' => 3]
];

const FIRST_LOGIN_ = 'f';
const ACCOUNT_UPGRADED_ = 'a';

const EXTENDED_LOG = 'e';

const ACTION = 'action';
const ADMIN_ACTION = 'admin-action';
const EDITING = 'editing';

const CURRENT_EDITOR_FILE = RUNTIME_DIR . '/current_editor.yml';
const CURRENT_EDITOR_TIMEOUT = 10 * 60;

const SETTINGS_FILE = RUNTIME_DIR . '/settings.yml';
const CAMERA = 'camera';
const CAMERA_DESKTOP = 'd';
const CAMERA_MOBILE = 'm';
const PERSON_PREVIEW_DISPLAY_STRING = 'personPreviewDisplayString';

const STORAGE_DIR = 'storage';
const STORAGE_FILE = 'storage.yml';
const PERSONS = 'persons';
const CONNECTIONS = 'connections';

const SOURCES_UPLOAD_DIR = STORAGE_DIR . '/sources';
const SOURCES_META_FILE = 'sources.yml';
const SOURCES_MAX_FILE_SIZE = 10 /* MB */ * 1024 /* KB */ * 1024;
const SOURCES_THUMB_SIZE = 100 /* px */;
const SOURCES_THUMB_QUALITY = 40;

const COMMIT_MERGE_TIME_THRESH = 3600;
const CD_STORAGE_DIR = 'cd ' . STORAGE_DIR . '; ';

///////////////////////////////////////////////////////////////////////////////////////////////////

const PERMISSION_VIEW_PERSON_FIRST_NAMES = [ADMIN_, NORMAL_, VIEWER_];
const PERMISSION_VIEW_PERSON_LAST_NAMES = [ADMIN_, NORMAL_, VIEWER_, GUEST_];
const PERMISSION_VIEW_PERSON_BIRTH_NAMES = [ADMIN_, NORMAL_, VIEWER_, GUEST_];

const PERMISSION_VIEW_PERSON_BIRTH_DAY = [ADMIN_, NORMAL_, VIEWER_];
const PERMISSION_VIEW_PERSON_BIRTH_MONTH = [ADMIN_, NORMAL_, VIEWER_];
const PERMISSION_VIEW_PERSON_BIRTH_YEAR = [ADMIN_, NORMAL_, VIEWER_, GUEST_];

const PERMISSION_VIEW_PERSON_DEATH_DAY = [ADMIN_, NORMAL_, VIEWER_];
const PERMISSION_VIEW_PERSON_DEATH_MONTH = [ADMIN_, NORMAL_, VIEWER_];
const PERMISSION_VIEW_PERSON_DEATH_YEAR = [ADMIN_, NORMAL_, VIEWER_, GUEST_];

const PERMISSION_VIEW_PERSON_NOTES = [ADMIN_, NORMAL_, VIEWER_];

const PERMISSION_VIEW_CONNECTION_RELATION = [ADMIN_, NORMAL_, VIEWER_, GUEST_];
const PERMISSION_VIEW_CONNECTION_NOTE = [ADMIN_, NORMAL_, VIEWER_];


const PERMISSION_CREATE_PERSONS = [ADMIN_, NORMAL_];
const PERMISSION_EDIT_PERSONS = [ADMIN_, NORMAL_];
const PERMISSION_DELETE_PERSONS = [ADMIN_, NORMAL_];

const PERMISSION_CREATE_CONNECTIONS = [ADMIN_, NORMAL_];
const PERMISSION_EDIT_CONNECTIONS = [ADMIN_, NORMAL_];
const PERMISSION_DELETE_CONNECTIONS = [ADMIN_, NORMAL_];

const PERMISSION_UPLOAD_SOURCES = [ADMIN_, NORMAL_];
const PERMISSION_DELETE_SOURCES = [ADMIN_, NORMAL_];

const PERMISSION_LINK_SOURCE = [ADMIN_, NORMAL_];
const PERMISSION_UNLINK_SOURCE = [ADMIN_, NORMAL_];

const PERMISSION_CREATE_ANNOTATION = [ADMIN_, NORMAL_];
const PERMISSION_DELETE_ANNOTATION = [ADMIN_, NORMAL_];

define('PERMISSION_EDIT', array_intersect(
  PERMISSION_CREATE_PERSONS,
  PERMISSION_EDIT_PERSONS,
  PERMISSION_DELETE_PERSONS,

  PERMISSION_CREATE_CONNECTIONS,
  PERMISSION_EDIT_CONNECTIONS,
  PERMISSION_DELETE_CONNECTIONS ));

const PERMISSION_LOG_RESET_OWN = [ADMIN_, NORMAL_];
const PERMISSION_LOG_RESET_ALL = [ADMIN_];

const PERMISSION_ADMIN = [ADMIN_];

const NO_PERMISSION_VALUE = '•••••';

///////////////////////////////////////////////////////////////////////////////////////////////////

$accounts = []; $first_login = false; $account_upgraded = false; $account_not_found = false;
$settings = [ CAMERA => ['default' => [ 'x' => 0, 'y' => 0, 'z' => 1] ], PERSON_PREVIEW_DISPLAY_STRING => 'default' ];
$data = [ PERSONS => [], CONNECTIONS => [] ];

$server_url = substr($_SERVER["PHP_SELF"], 0, 1 + strrpos($_SERVER["PHP_SELF"], '/'));

$useLayout = isset($_GET['layout']);

$useragent = $_SERVER['HTTP_USER_AGENT'];
$is_mobile = preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i',substr($useragent,0,4));

///////////////////////////////////////////////////////////////////////////////////////////////////

if (!file_exists(RUNTIME_DIR)) {
  mkdir(RUNTIME_DIR);
}
if (!file_exists(STORAGE_DIR)) {
  mkdir(STORAGE_DIR);
}
if (!file_exists(SOURCES_UPLOAD_DIR)) {
  mkdir(SOURCES_UPLOAD_DIR);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

session_start();

$accounts_file_content = file_get_contents(ACCOUNTS_FILE);
if ($accounts_file_content) {
  $accounts = json_decode($accounts_file_content, true);
}

if ($accounts) {
  if (isset($_POST[ACTION]) && $_POST[ACTION] === 'login') {
    $a = get_account($_POST[USER]);
    if ($a && password_verify($_POST[PASSWORD], $a[PASSWORD_])) {
      $_SESSION[USER] = $a[USER_];
      $_SESSION[TYPE] = $a[TYPE_];
      $_SESSION[EDITING] = false;
      if (array_key_exists(FIRST_LOGIN_, $a)) {
        $first_login = true;
      }
      else if (array_key_exists(ACCOUNT_UPGRADED_, $a)) {
        $account_upgraded = true;
      }
    }
  }

  else if (isset($_GET['logout'])) {
    if ($_SESSION[EDITING]) {
      stopEditing();
    }
    session_unset();
    header('Location: ' . $server_url);
    exit;
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function & get_account($user)
{
  global $accounts;
  global $account_not_found;
  foreach ($accounts as &$a) {
    if ($a[USER_] === $user) {
      return $a;
    }
  }
  return $account_not_found;
}

function current_user_can($permission)
{
  return in_array($_SESSION[TYPE], $permission);
}

function get_permissions()
{
  return array_filter(get_defined_constants(),
    function($perm)
    {
      return strpos($perm, 'PERMISSION_') === 0;
    },
    ARRAY_FILTER_USE_KEY);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

define('BETA', current_user_can(PERMISSION_ADMIN));

///////////////////////////////////////////////////////////////////////////////////////////////////

if ((!$accounts || current_user_can(PERMISSION_ADMIN)) && isset($_POST[ADMIN_ACTION])) {
  switch ($_POST[ADMIN_ACTION]) {
    // admin
    case 'new': {
      $ist_first_account = !$accounts;
      $accounts[] = [
        USER_ => trim($_POST[USER]),
        PASSWORD_ => password_hash($_POST[PASSWORD], PASSWORD_BCRYPT),
        TYPE_ => $_POST[TYPE],
        FIRST_LOGIN_ => true];
      save_accounts();
      if ($ist_first_account) {
        init($accounts[0][USER_]);
        header('Location: ' . $server_url);
        exit;
      }
      $admin_msg = 'Neuer Account erstellt.';
    }
    break;
    case 'edit-type': {
      $i = $_POST[USER];
      if (TYPES[$accounts[$i][TYPE_]]['level'] < TYPES[$_POST[TYPE]]['level']) {
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

if (!$accounts) {
  html_min_start();
?>
  <form method="POST">
    <h1>Setup</h1>
    <input type="hidden" name="<?=ADMIN_ACTION?>" value="new" />
    <input type="text" name="<?=USER?>" placeholder="Name" autocomplete="off" autofocus />
    <input type="text" name="<?=PASSWORD?>" placeholder="Passwort" autocomplete="off" />
    <input type="hidden" name="<?=TYPE?>" value="<?=ADMIN_?>" />
    <input type="submit" class="button button-border-full" value="Admin-Account anlegen" />
  </form>
<?php
  html_min_end();
  exit;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

if (!isset($_SESSION[USER])) {
  html_min_start();
?>
    <form method="POST">
      <input type="hidden" name="<?=ACTION?>" value="login" />
      <input name="<?=USER?>" type="text" placeholder="Name" autofocus />
      <input name="<?=PASSWORD?>" type="password" placeholder="Passwort" />
      <input type="submit" value="Anmelden" />
    </form>
<?php
  html_min_end();
  exit;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

if (MAINTENANCE && !current_user_can(PERMISSION_ADMIN)) {
  $admins = array_filter($accounts, function($a) { return $a[TYPE_] === ADMIN_; });
  $admins = array_map(function($a) { return $a[USER_]; }, $admins);
  $admins = implode(', ', $admins);
  echo 'Im Moment laufen Umbauarbeiten. Schau\' bitte später nochmal vorbei.<br /><br /><i>' . $admins . '</i>';
  exit;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

$login_date = time();
if (!isset($_SESSION['last-login']) || $login_date > ($_SESSION['last-login'] + 12/*hours*/ * 60/*min*/ * 60/*sec*/)) {
  $_SESSION['last-login'] = $login_date;
  file_put_contents(LOGINS_FILE, date(DATE_RFC2822, $login_date) . ' | ' . $_SESSION[USER] . PHP_EOL, FILE_APPEND | LOCK_EX);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

if (isset($_GET['start-edit'])) {
  if (current_user_can(PERMISSION_EDIT)) {
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

else if ($_SESSION[EDITING]) {
  if (!current_user_can(PERMISSION_EDIT) || $useLayout || time() > ($_SESSION[EDITING] + CURRENT_EDITOR_TIMEOUT)) {
    stopEditing();
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function load_settings($default)
{
  $settings_file_content = file_get_contents(SETTINGS_FILE);
  if ($settings_file_content) {
    return array_merge($default, json_decode($settings_file_content, true));
  }
  return $default;
}

function prepare_user_settings($settings)
{
  global $is_mobile;
  $user_settings = $settings;
  $cam_client = $is_mobile ? CAMERA_MOBILE : CAMERA_DESKTOP;
  if (array_key_exists($_SESSION[USER], $user_settings[CAMERA]) && array_key_exists($cam_client, $user_settings[CAMERA][$_SESSION[USER]])) {
    $user_settings[CAMERA] = $user_settings[CAMERA][$_SESSION[USER]][$cam_client];
  }
  else {
    $user_settings[CAMERA] = $user_settings[CAMERA]['default'];
  }
  return $user_settings;
}

function load_graph_data($default)
{
  $data_file_content = file_get_contents(STORAGE_DIR . '/' . STORAGE_FILE);
  if ($data_file_content) {
    return filter_graph_data_by_permission(json_decode($data_file_content, true));
  }
  return $default;
}

function load_sources_meta($check_thumbs)
{
  $sources_meta_file_content = file_get_contents(STORAGE_DIR . '/' . SOURCES_META_FILE);
  $sources = $sources_meta_file_content ? json_decode($sources_meta_file_content, true) : [];

  if ($check_thumbs) {
    foreach ($sources as $id => &$source) {
      $sources[$id]['thumb'] = is_file(SOURCES_UPLOAD_DIR . '/' . $id . '.thumb.jpg');
    }
  }
  return $sources;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

$settings = load_settings($settings);
$user_settings = prepare_user_settings($settings);
$data = load_graph_data($data);
$sources_meta = null;

///////////////////////////////////////////////////////////////////////////////////////////////////

function save_settings()
{
  global $settings;
  $file_content = add_newlines_to_data_json_for_git_friendly_file_content($settings);
  file_put_contents(SETTINGS_FILE, $file_content, LOCK_EX);
}

function save_graph_data($git_commit)
{
  global $data;
  $file_content = add_newlines_to_data_json_for_git_friendly_file_content($data);
  file_put_contents(STORAGE_DIR . '/' . STORAGE_FILE, $file_content, LOCK_EX);
  exec('sh/update.sh ' .
    '"' . STORAGE_DIR . '" ' .
    '"' . STORAGE_FILE . '" ' .
    '"' . $_SESSION[USER] . '" ' .
    '"' . $git_commit . '" ' .
    COMMIT_MERGE_TIME_THRESH . ' ' .
    '2>&1', $out);
  return $out;
}

function save_sources_meta($git_commit)
{
  global $sources_meta;
  $file_content = add_newlines_to_source_json_for_git_friendly_file_content($sources_meta);
  file_put_contents(STORAGE_DIR . '/' . SOURCES_META_FILE, $file_content, LOCK_EX);
  exec('sh/update.sh ' .
    '"' . STORAGE_DIR . '" ' .
    '"' . SOURCES_META_FILE . '" ' .
    '"' . $_SESSION[USER] . '" ' .
    '"' . $git_commit . '" ' .
    COMMIT_MERGE_TIME_THRESH . ' ' .
    '2>&1', $out);
  return $out;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function split_date($str)
{
  $d = explode('-', $str);
  while (count($d) < 3) {
    $d[] = '';
  }
  return $d;
}
function date_replace($str, $elem, $new_val)
{
  $d = split_date($str);
  $d[$elem] = $new_val;
  return implode('-', $d);
}

function filter_graph_data_by_permission($data)
{
  $fn_no_permission_value = fn($v) => NO_PERMISSION_VALUE;
  $person_key_perm = [
    ['f', PERMISSION_VIEW_PERSON_FIRST_NAMES, $fn_no_permission_value],
    ['l', PERMISSION_VIEW_PERSON_LAST_NAMES, $fn_no_permission_value],
    ['m', PERMISSION_VIEW_PERSON_BIRTH_NAMES, $fn_no_permission_value],
    ['n', array_intersect(PERMISSION_VIEW_PERSON_FIRST_NAMES, PERMISSION_VIEW_PERSON_LAST_NAMES,PERMISSION_VIEW_PERSON_BIRTH_NAMES), $fn_no_permission_value], // old format (log compatibility)
    ['b', PERMISSION_VIEW_PERSON_BIRTH_YEAR, fn($v) => date_replace($v, 0, NO_PERMISSION_VALUE)],
    ['b', PERMISSION_VIEW_PERSON_BIRTH_MONTH, fn($v) => date_replace($v, 1, NO_PERMISSION_VALUE)],
    ['b', PERMISSION_VIEW_PERSON_BIRTH_DAY, fn($v) => date_replace($v, 2, NO_PERMISSION_VALUE)],
    ['d', PERMISSION_VIEW_PERSON_DEATH_YEAR, fn($v) => date_replace($v, 0, NO_PERMISSION_VALUE)],
    ['d', PERMISSION_VIEW_PERSON_DEATH_MONTH, fn($v) => date_replace($v, 1, NO_PERMISSION_VALUE)],
    ['d', PERMISSION_VIEW_PERSON_DEATH_DAY, fn($v) => date_replace($v, 2, NO_PERMISSION_VALUE)],
    ['o', PERMISSION_VIEW_PERSON_NOTES, $fn_no_permission_value]
  ];
  foreach($data[PERSONS] as $p_i => &$p) {
    foreach ($person_key_perm as $kp_i => &$kp) {
      if (!current_user_can($kp[1])) {
        $p[$kp[0]] = $kp[2]($p[$kp[0]]);
      }
    }
  }

  $connection_key_perm = [
    ['r', PERMISSION_VIEW_CONNECTION_RELATION, $fn_no_permission_value],
    ['d', PERMISSION_VIEW_CONNECTION_NOTE, $fn_no_permission_value]
  ];
  foreach($data[CONNECTIONS] as $c_i => &$c) {
    foreach ($connection_key_perm as $kc_i => &$kc) {
      if (!current_user_can($kc[1])) {
        $c[$kc[0]] = $kc[2]($c[$kc[0]]);
      }
    }
  }
  return $data;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

if (isset($_GET[ACTION])) {
  header('Content-Type: text/plain; charset=utf-8');
  $t = time();
  $retData = false;
  $retSources = false;
  $retSourcesExtra = '';
  $d = json_decode(urldecode($_GET['d']), true);
  switch ($_GET[ACTION]) {
    case 'get':
    {
      $retData = [];
      foreach (explode(',', $_GET['q']) as $q) {
        switch ($q) {
          case 'preview':
          {
            exec(CD_STORAGE_DIR . 'git show ' . $_GET['hash'] . ':' . STORAGE_FILE, $out);
            $retData['graph'] = filter_graph_data_by_permission(json_decode(implode(PHP_EOL, $out), true));
            break;
          }
          case 'graph':    $retData['graph'] = $data; break;
          case 'sources':  $retData['sources'] = load_sources_meta(true); break;
          case 'settings': $retData['settings'] = $user_settings; break;
          case 'log':      $retData['log'] = get_log(); break;
          case 'currentHash': $retData['currentHash'] = get_current_log_hash(); break;
        }
      }
      echo json_encode($retData);
      exit;
    }

    // accounts
    case 'tutorial-completed':
    {
      $a = &get_account($_SESSION[USER]);
      if ($a) {
        if (array_key_exists(FIRST_LOGIN_, $a)) { unset($a[FIRST_LOGIN_]); }
        if (array_key_exists(ACCOUNT_UPGRADED_, $a)) { unset($a[ACCOUNT_UPGRADED_]); }
        save_accounts();
      }
      exit;
    }

    case 'change-password':
    {
      $a = &get_account($_SESSION[USER]);
      if ($a) {
        $a[PASSWORD_] = password_hash($_POST[PASSWORD], PASSWORD_BCRYPT);
        save_accounts();
        echo 'true';
      }
      else {
        echo 'false';
      }
      exit;
    }

    case 'get-editor':
    {
      echo json_encode(getEditor());
      exit;
    }

    case 'toggle-extended-log':
    {
      if (current_user_can(PERMISSION_ADMIN)) {
        if (array_key_exists(EXTENDED_LOG, $_SESSION)) {
          unset($_SESSION[EXTENDED_LOG]);
          echo json_encode(false);
        }
        else {
          $_SESSION[EXTENDED_LOG] = true;
          echo json_encode(true);
        }
      }
      exit;
    }

    // settings
    case 'moveCamera':
    {
      $settings[CAMERA][$_SESSION[USER]][$is_mobile ? CAMERA_MOBILE : CAMERA_DESKTOP] = $d;
      save_settings();
      exit;
    }

  } // switch ACTION

  if ($_SESSION[EDITING]) {
    startEditing();

    switch ($_GET[ACTION]) {
      // restart edit timer
      case 'restart-edit-timer':
      {
        echo 'restarted ' . $_SESSION[EDITING];
        exit;
      }

      // log
      case 'reset':
      {
        if (current_user_can(PERMISSION_LOG_RESET_OWN)) {
          $hash = $_GET['hash'];
          exec(CD_STORAGE_DIR . 'git log --author-date-order --format=format:\'%an\' ' . $hash . '..', $out);
          $checkOwnCommits = function($ret, $name) { return $ret && ($name === $_SESSION[USER]); };
          if (current_user_can(PERMISSION_LOG_RESET_ALL) || array_reduce($out, $checkOwnCommits, true)) {
            exec(CD_STORAGE_DIR . 'git tag reset-to-' . $hash . '-by-' . preg_replace('/\\s/', '_', $_SESSION[USER]) . '-at-' . $t . ';');
            exec(CD_STORAGE_DIR . 'git reset --hard ' . $hash);
          }
          header('Location: ' . $server_url);
        }
        exit;
      }

      // data
      case 'addPerson':
      {
        if (current_user_can(PERMISSION_CREATE_PERSONS)) {
          $d['t'] = $t;
          $data[PERSONS][] = $d;
          $retData = 'p ' . $t;
        }
      }
      break;
      case 'editPerson':
      {
        if (current_user_can(PERMISSION_EDIT_PERSONS)) {
          $t = $d['t'];
          $p = &get_data(PERSONS, $t);
          $d['x'] = $p['x'];
          $d['y'] = $p['y'];
          $p = $d;
          $retData = 'p ' . $t;
        }
      }
      break;
      case 'deletePerson':
      {
        if (current_user_can(PERMISSION_DELETE_PERSONS)) {
          delete_data(PERSONS, $d);
          $retData = 'P ' . $d;
        }
      }
      break;
      case 'movePersons':
      {
        if (current_user_can(PERMISSION_EDIT_PERSONS)) {
          $ts = [];
          foreach ($d as $d_) {
            $p = &get_data(PERSONS, $d_['t']);
            $p['x'] = $d_['x'];
            $p['y'] = $d_['y'];
            $ts[] = $d_['t'];
          }
          $retData = 'm ' . implode(', ', $ts);
        }
      }
      break;

      case 'addConnection':
      {
        if (current_user_can(PERMISSION_CREATE_CONNECTIONS)) {
          $d['t'] = $t;
          $data[CONNECTIONS][] = $d;
          $retData = 'c ' . $t;
        }
      }
      break;
      case 'editConnection':
      {
        if (current_user_can(PERMISSION_EDIT_CONNECTIONS)) {
          $t = $d['t'];
          $c = &get_data(CONNECTIONS, $t);
          $d['p1'] = $c['p1'];
          $d['p2'] = $c['p2'];
          $c = $d;
          $retData = 'c ' . $t;
        }
      }
      break;
      case 'deleteConnection':
      {
        if (current_user_can(PERMISSION_DELETE_CONNECTIONS)) {
          delete_data(CONNECTIONS, $d);
          $retData = 'C ' . $d;
        }
      }
      break;

      case 'uploadSourceFiles':
      {
        if (current_user_can(PERMISSION_UPLOAD_SOURCES)) {
          $errors = [];
          $allowed_extensions = ['.jpg', '.jpeg', '.png', '.svg'];
          $sources_meta = load_sources_meta(false);
          $new_sources_meta = [];

          if (extension_loaded('imagick') && class_exists("Imagick")) {
            $do_thumbs = true;
          }
          else {
            $do_thumbs = false;
            $errors[] = 'Vorschau kann nicht erzeugt werden (Imagick nicht installiert).';
          }
          $time = time();

          foreach ($_FILES['files']['error'] as $i => $error_code) {
            $file_name = $_FILES['files']['name'][$i];
            if ($error_code !== UPLOAD_ERR_OK) {
              $errors[] = $file_name . ':<br />Speichern fehlgeschlagen (Fehlercode #' . $error_code . ').';
              continue;
            }
            $file_tmp = $_FILES['files']['tmp_name'][$i];
            $file_type = $_FILES['files']['type'][$i];
            $file_size = $_FILES['files']['size'][$i];
            $file_ext = strtolower(substr($file_name, strrpos($file_name, '.')));

            if (!in_array($file_ext, $allowed_extensions)) {
              $errors[] = $file_name . ':<br />Dateityp (' . $file_type . ') nicht erlaubt';
              continue;
            }
            if ($file_size > SOURCES_MAX_FILE_SIZE) {
              $errors[] = $file_name . ':<br />Maximale Dateigröße (' . SOURCES_MAX_FILE_SIZE . ') überschritten';
              continue;
            }

            $j = $i;
            do {
              $file_id = $time . '.' . $j++;
            } while(array_key_exists($file_id, $sources_meta));

            $storage_path = SOURCES_UPLOAD_DIR . '/' . $file_id;
            $storage_file_path = $storage_path . $file_ext;
            $storage_thumb_file_path = $storage_path . '.thumb.jpg';
            $upload_successful = move_uploaded_file($file_tmp, $storage_file_path);
            if (!$upload_successful) {
              $errors[] = $file_name . ':<br />Speichern fehlgeschlagen.';
            }
            else {
              $meta = [
                'e' /* extension */ => $file_ext,
                'f' /* original filename */ => $file_name,
                'd' /* description */ => $_POST['descriptions'][$i],
                'a' /* annotations */ => json_decode('{}')
              ];
              $sources_meta[$file_id] = $meta;
              $new_sources_meta[$file_id] = $meta;

              if ($do_thumbs) {
                try {
                  $thumb = new Imagick($storage_file_path);
                  $thumb->setImageFormat('jpeg');
                  $thumb->setImageCompression(Imagick::COMPRESSION_JPEG);
                  $thumb->setImageCompressionQuality(SOURCES_THUMB_QUALITY);
                  $thumb->thumbnailImage(SOURCES_THUMB_SIZE, SOURCES_THUMB_SIZE, true);
                  $thumb_saved_successful = $thumb->writeImage($storage_thumb_file_path);
                  if ($thumb_saved_successful) {
                    $new_sources_meta[$file_id]['thumb'] = true;
                  }
                  else {
                    $errors[] = $file_name . ':<br />Vorschau speichern fehlgeschlagen.';
                  }
                } catch (ImagickException $e) {
                  $errors[] = $file_name . ':<br />Vorschau erzeugen fehlgeschlagen: ' . $e->getMessage() . ' (' . $e->getCode() . ')';
                }
              }
            }
          }

          if ($new_sources_meta) {
            $retSources = 's ' . $time;
          }
          $retSourcesExtra = json_encode([
            'new_sources' => $new_sources_meta,
            'errors' => $errors
          ]);
        }
      }
      break;

      case 'deleteSource':
      {
        if (current_user_can(PERMISSION_DELETE_SOURCES)) {
          $sources_meta = load_sources_meta(false);
          if (array_key_exists($d, $sources_meta)) {
            unset($sources_meta[$d]);

            $image_files = glob(SOURCES_UPLOAD_DIR . '/' . $d . '*');
            foreach ($image_files as &$file) {
              unlink($file);
            }
            $retSources = 'S ' . $d;
          }
        }
      }
      break;

      case 'linkSource':
      {
        if (current_user_can(PERMISSION_LINK_SOURCE)) {
          $sources_meta = load_sources_meta(false);
          if (array_key_exists($d['source_id'], $sources_meta)) {
            $sources_meta[$d['source_id']]['a'][$d['person_or_connection_id']] = [];
            $retSources = 'l ' . $d['source_id'] . ' ' . $d['person_or_connection_id'];
          }
        }
      }
      break;

      case 'unlinkSource':
      {
        if (current_user_can(PERMISSION_UNLINK_SOURCE)) {
          $sources_meta = load_sources_meta(false);
          if (array_key_exists($d['source_id'], $sources_meta)) {
            unset($sources_meta[$d['source_id']]['a'][$d['person_or_connection_id']]);
            $retSources = 'L ' . $d['source_id'] . ' ' . $d['person_or_connection_id'];
          }
        }
      }
      break;

      case 'addAnnotation':
      {
        if (current_user_can(PERMISSION_CREATE_ANNOTATION)) {
          $d['a']['t'] = $t;

          $sources_meta = load_sources_meta(false);
          if (array_key_exists($d['source_id'], $sources_meta)) {
            if (array_key_exists($d['linked_id'], $sources_meta[$d['source_id']]['a'])) {
              $sources_meta[$d['source_id']]['a'][$d['linked_id']][] = $d['a'];
              $retSources = 'a ' . $t;
            }
          }
        }
      }
      break;

      case 'deleteAnnotation':
      {
        if (current_user_can(PERMISSION_DELETE_ANNOTATION)) {
          $sources_meta = load_sources_meta(false);
          if (array_key_exists($d['source_id'], $sources_meta)) {
            if (array_key_exists($d['linked_id'], $sources_meta[$d['source_id']]['a'])) {
              delete_from_array($sources_meta[$d['source_id']]['a'][$d['linked_id']], $d['t']);
              $retSources = 'A ' . $d['t'];
            }
          }
        }
      }
      break;

    } // switch ACTION
  } // if EDITING


  if ($retData) {
    $output = save_graph_data($retData);
    echo implode(' ;;; ', [
      $retData,
      json_encode(get_log(1)),
      implode('\n', $output)
    ]);
  }

  if ($retSources) {
    $output = save_sources_meta($retSources);
    echo implode(' ;;; ', [
      $retSources,
      $retSourcesExtra,
      json_encode(get_log(1)),
      implode('\n', $output)
    ]);
  }

  exit;

} // if ACTION

///////////////////////////////////////////////////////////////////////////////////////////////////

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
  <script src="js/linkurious/edgeLabels/settings.js<?=V_?>"></script>
  <script src="js/linkurious/lasso/sigma.plugins.lasso.js<?=V_?>"></script>
  <script src="js/edges.dashedarrow.js<?=V_?>"></script>
  <script src="js/edgehovers.dashedarrow.js<?=V_?>"></script>
  <script src="js/edges.extension.js<?=V_?>"></script>
  <script src="js/edgehovers.extension.js<?=V_?>"></script>
</head>
<body class="<?=$is_mobile ? 'mobile-client' : 'desktop-client'?>">
  <div id="graph"></div>

  <div id="modal-blocker-graph" class="modal-blocker backdrop-blur hidden"></div>

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////
?>

  <div id="mobile-actions" class="box mobile-only">
    <div id="mobile-menu-toggle" class="button hidden-toggle" data-hidden-toggle-target="#account" style="">&#9776;</div><!--
    <?php if ($_SESSION[EDITING]) {
      if (current_user_can(PERMISSION_CREATE_PERSONS)) { ?>
    --><div id="mobile-action-new-person" class="button mobile-action-new-person" style=""></div><!--
      <?php }
            if (current_user_can(PERMISSION_CREATE_CONNECTIONS)) { ?>
    --><div id="mobile-action-new-connection" class="button mobile-action-new-connection" style=""><span></span></div><!--
      <?php }
      if (current_user_can(PERMISSION_EDIT_PERSONS)) { ?>
    --><div id="mobile-action-move-person" class="button mobile-action-move-person" style=""></div><!--
      <?php }
    } ?>-->
  </div><!-- mobile-actions -->

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////
?>

  <div id="account" class="box mobile-inverse-hidden">
    <div id="mobile-menu-close" class="button mobile-only hidden-toggle" data-hidden-toggle-target="#account">X</div><!--
    --><span id="account-name"><?=$_SESSION[USER]?></span><!--
    --><hr class="mobile-only" /><!--
    --><div class="button mobile-menu-label mobile-only">Ansicht</div><!--
    --><div id="mobile-switch-layout-net" class="button mobile-only">Netz</div><!--
    --><div id="mobile-switch-layout-tree" class="button mobile-only">Baum</div><!--
    --><div id="mobile-switch-layout-treeYearBased" class="button mobile-only">Jahresbaum</div><!--
    --><hr class="mobile-only" /><!--
    <?php
      if (current_user_can(PERMISSION_EDIT) && !$useLayout) {
        if (!$_SESSION[EDITING]) {
    ?>
    --><a href="<?=$server_url?>?start-edit" class="button" id="start-edit" title="Bearbeitungsmodus starten">Bearbeiten</a><!--
    <?php } else { ?>
    --><a href="<?=$server_url?>?stop-edit" class="button" id="stop-edit" title="Bearbeitungsmodus beenden">Fertig<span id="stop-edit-timer"></span></a><!--
    <?php } } ?>
    --><div id="other-editor" class="button hidden"></div><!--
    --><div id="mobile-log" class="button mobile-only">Änderungsverlauf</div><!--
    --><div id="mobile-help" class="button mobile-only">Hilfe</div><!--
    --><hr class="mobile-only" /><!--
    --><div id="mobile-admin" class="button mobile-only">Admin</div><!--
    --><div id="mobile-settings" class="button mobile-only">Einstellungen</div><!--
    --><a id="logout" href="<?=$server_url?>?logout" class="button">Abmelden</a><!--

    --><div id="search-desktop" class="desktop-only">
        <span id="search-toggle-show" class="button search-button hidden-toggle focus-toggle" data-hidden-toggle-target="#search-toggle-show,#search-box" data-focus-toggle-target="#search-input" title="Suchen"></span>
        <div id="search-box" class="hidden" style="display: inline">
          <form>
            <input id="search-input" placeholder="Suchen nach..." type="search" autocomplete="off" />
            <span id="search-toggle-hide" class="button hidden-toggle" data-hidden-toggle-target="#search-toggle-show,#search-box" title="Suche schließen">&lt;</span>
          </form>
        </div>
    </div>
  </div><!-- account -->
<?php

///////////////////////////////////////////////////////////////////////////////////////////////////

$box_close_minimize_symbol = $is_mobile ? 'X' : '&mdash;';

$layout_class_netz = (!isset($_GET['layout']) || $_GET['layout'] === 'netz') ? ' selected-layout' : '';
$layout_class_tree = (isset($_GET['layout']) && $_GET['layout'] === 'tree' && !isset($_GET['yearBased'])) ? ' selected-layout' : '';
$layout_class_tree_yearBased = (isset($_GET['layout']) && $_GET['layout'] === 'tree' && isset($_GET['yearBased'])) ? ' selected-layout' : '';
$tmpLayout = isset($_GET['layout']) ? $_GET['layout'] . (isset($_GET['yearBased']) ? 'YearBased' : '') : false;
?>
  <div id="layouts" class="box box-minimized">
    <div class="box-minimize-buttons">
      <button class="box-restore desktop-only" title="Ansicht">A</button>
      <button class="box-minimize"><?=$box_close_minimize_symbol?></button>
    </div>
    <button id="switch-layout-net" class="<?=$layout_class_netz?>" data-url="<?=$server_url?>">Netz</button>
    <button id="switch-layout-tree" class="<?=$layout_class_tree?>" data-url="<?=$server_url?>?layout=tree">Baum</button>
    <button id="switch-layout-treeYearBased" class="<?=$layout_class_tree_yearBased?>" data-url="<?=$server_url?>?layout=tree&yearBased">Jahresbaum</button>
  </div><!-- layouts -->

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////

if (current_user_can(PERMISSION_ADMIN)) {
?>
  <div id="admin" class="box box-padding<?=isset($_POST[ADMIN_ACTION]) ? '' : ' box-minimized'?>">
    <div class="box-minimize-buttons negative-padding">
      <button class="box-restore desktop-only">Admin</button>
      <button class="box-minimize"><?=$box_close_minimize_symbol?></button>
    </div>
<?php
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
            <?=$a[FIRST_LOGIN_] ? '*' : ($a[ACCOUNT_UPGRADED_] ? '+' : '')?>
          </td>
          <td>
<?php
    $num_admins = count(array_filter($accounts, function($a) { return $a[TYPE_] === ADMIN_; }));
    $editable = ($a[TYPE_] !== ADMIN_ || $num_admins > 1) && $a[USER_] !== $_SESSION[USER];
    if ($editable) {
?>
            <form method="POST">
              <input type="hidden" name="<?=ADMIN_ACTION?>" value="edit-type" />
              <input type="hidden" name="<?=USER?>" value="<?=$i?>" />
              <select name="<?=TYPE?>" onchange="this.form.submit()">
<?php
              foreach (TYPES as $type_short => &$type) {
?>
                <option value="<?=$type_short?>" <?=$a[TYPE_] === $type_short ? 'selected' : ''?>><?=$type['label']?></option>
<?php
              }
?>
              </select>
            </form>
<?php
    }
    else {
      echo ' (' . TYPES[ADMIN_]['label'] . ')';
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
    </div>
    <hr />
    <h2 class="mobile-only">Neuer Account</h2>
    <form method="POST">
      <input type="hidden" name="<?=ADMIN_ACTION?>" value="new" />
      <input type="text" name="<?=USER?>" placeholder="Name" autocomplete="off" autofocus />
      <input type="text" name="<?=PASSWORD?>" placeholder="Passwort" autocomplete="off" />
      <select name="<?=TYPE?>">
<?php
      foreach (TYPES as $type_short => &$type) {
?>
        <option value="<?=$type_short?>" <?=$type_short === NORMAL_ ? 'selected' : ''?>><?=$type['label']?></option>
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
          $parts = explode(' | ', $line);
          $date = substr($parts[0], 0, 16);
          $parts[0] = ($date === $today ? 'heute' : ($date === $yesterday ? 'gestern' : $date)) . '</td><td>' . substr($parts[0], 17);
          return implode('</td><td>', $parts);
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
  </div><!-- admin -->
<?php
}

///////////////////////////////////////////////////////////////////////////////////////////////////
?>

  <a id="show-settings" class="box button desktop-only hidden-toggle" data-hidden-toggle-target="#settings" title="Einstellungen">&#9881;</a>

  <div id="settings" class="box box-padding hidden">
    <div class="box-minimize-buttons negative-padding">
      <button class="hidden-toggle" data-hidden-toggle-target="#settings"><?=$box_close_minimize_symbol?></button>
    </div>
    <h2>Einstellungen</h2>
    <div class="box-row">
      Passwort ändern:<br />
      <form>
        <input type="password" id="settings-change-password1" autocomplete="off" placeholder="Neues Passwort" /><br />
        <input type="password" id="settings-change-password2" autocomplete="off" placeholder="Neues Passwort wiederholen" /><br />
      </form>
      <div id="settings-change-password-info"></div>
      <button id="settings-change-password" class="button-border-full">Speichern</button>
    </div>
  </div><!-- settings -->

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////
?>

  <div id="log" class="box box-padding box-minimized">
    <div class="box-minimize-buttons negative-padding">
      <button class="box-restore desktop-only" title="Änderungsverlauf">&olarr;</button>
      <button class="box-minimize"><?=$box_close_minimize_symbol?></button>
    </div>
    <div id="log-content">
      <h2>Änderungsverlauf</h2>
      <div>
        <span class="log-play-button log-play-backward"></span><!--
        --><span class="log-play-button log-play-stop"></span><!--
        --><span class="log-play-button log-play-forward"></span>
      </div>
      <div>
        <form>
          <input type="checkbox" id="log-extended" <?=array_key_exists(EXTENDED_LOG, $_SESSION) ? 'checked' : ''?> />
          <label for="log-extended">Erweitert</label>
        </form>
      </div>
      <ul id="log-list"></ul>
    </div>
  </div><!-- log -->

  <a id="log-restore-selected-item" class="box button hidden">Das Netz auf diesen Zustand zurücksetzen</a>

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////
?>

  <div id="person-form" class="box no-shadow hidden">
    <div class="box-padding box-shadow">
      <div id="person-form-doppelganger" class="box-row opt opt-new">
        <h2>Doppelgänger</h2>
        <button id="person-form-doppelganger-add" class="button-border-full">Einen Doppelgänger von <span></span> erstellen</button>
      </div>
      <h2>
        <span class="opt opt-new">Neue Person</span>
        <span class="opt opt-edit"><?=($_SESSION[EDITING] && current_user_can(PERMISSION_EDIT_PERSONS)) ? 'Person bearbeiten' : 'Personendetails'?></span>
      </h2>
      <span id="person-form-person-url" class="box-row"></span>
      <form>
        <div class="box-row">
          <label for="person-form-first-name">Vorname/n: </label>
          <input id="person-form-first-name" type="text" autocomplete="off" placeholder="(Spitzname) Vorname/n" />
        </div><div class="box-row">
          <label for="person-form-last-name">Familienname/n: </label>
          <input id="person-form-last-name" type="text" autocomplete="off" placeholder="Nachname/n" />
          <input id="person-form-birth-name" type="text" autocomplete="off" placeholder="Geburtsname/n" />
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
      </form>
      <button id="person-form-add" class="button-border opt opt-new">Hinzufügen</button>
      <button id="person-form-edit" class="button-border opt opt-edit">Speichern</button>
      <button id="person-form-delete" class="button-border opt opt-edit">Entfernen</button>
      <button id="person-form-cancel" class="button-border"><?=$_SESSION[EDITING] ? 'Abbrechen' : 'Schließen'?></button>
    </div>
    <div class="box-padding box-shadow" style="margin-top: 10pt">
      <label style="vertical-align: top">Quellen: </label>
      <div id="person-form-sources-div">
        <div id="person-form-sources-list"></div>
<?php
if ($_SESSION[EDITING] && current_user_can(PERMISSION_LINK_SOURCE)) {
?>
        <button id="person-form-link-source" class="button-border-full">Neue Quelle verknüpfen</button>
<?php
}
?>
      </div>
    </div>
  </div><!-- person-form -->

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////
?>

  <div id="connection-form" class="box box-padding hidden">
    <h2>
      <span class="opt opt-new opt-new-child">Neue Verbindung</span>
      <span class="opt opt-edit"><?=($_SESSION[EDITING] && current_user_can(PERMISSION_EDIT_CONNECTIONS)) ? 'Verbindung bearbeiten' : 'Verbindungsdetails'?></span>
    </h2>
    <i id="connection-form-persons" class="opt opt-edit"></i>
    <form>
      <div class="box-row">
        <label for="connection-form-relation">Art: </label>
        <select id="connection-form-relation">
          <option value="Kind">Kind</option>
          <option value="adoptiert">adoptiert</option>
          <option disabled></option>
          <option value="verheiratet">verheiratet</option>
          <option value="geschieden">geschieden</option>
          <option value="verwitwet">verwitwet</option>
          <option value="unverheiratet">unverheiratet</option>
          <option value="???" selected>??? (unbekannt)</option>
        </select>
      </div>
      <div class="box-row">
        <label for="connection-form-desc">Info: </label>
        <textarea id="connection-form-desc" rows="3"></textarea>
      </div>
    </form>
    <button id="connection-form-add" class="button-border opt opt-new">Verbinden</button>
    <button id="connection-form-add-child" class="button-border opt opt-new-child">Verbinden</button>
    <button id="connection-form-edit" class="button-border opt opt-edit">Speichern</button>
    <button id="connection-form-delete" class="button-border opt opt-edit">Entfernen</button>
    <button id="connection-form-cancel" class="button-border"><?=$_SESSION[EDITING] ? 'Abbrechen' : 'Schließen'?></button>
  </div><!-- connection-form -->

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////
?>

<div id="sources" class="box box-padding box-minimized BETA">
    <div class="box-minimize-buttons negative-padding">
      <button class="box-restore desktop-only" title="Quellen">Q</button>
      <button class="box-minimize"><?=$box_close_minimize_symbol?></button>
    </div>
<?php
  if ($_SESSION[EDITING]) {
?>
    <form>
      <div class="box-row">
<?php
    if (is_dir(SOURCES_UPLOAD_DIR) && is_writable(SOURCES_UPLOAD_DIR)) {
?>
        <input id="upload-new-source" type="file" multiple /><label for="upload-new-source" class="button drag-drop-visual-area">Hier klicken oder eine Datei hierhin schieben</label>
<?php
    } else {
?>
        <i>Upload deaktiviert: Fehlende Schreibrechte für das Upload-Verzeichnis.</i>
<?php
    }
?>
      </div>
      <div id="new-source-preview-div-template" class="box-row hidden">
        <img class="new-source-preview-img" />
        <div class="new-source-details">
          <span class="new-source-size"></span><br />
          <input class="new-source-description" type="text" placeholder="Beschriftung" />
        </div>
      </div>
      <div id="new-source-invalid-div-template" class="box-row hidden"></div>
      <div id="new-source-buttons-div" class="box-row hidden">
        <input type="submit" class="button-border" value="Speichern" />
        <button type="button" class="button-border">Verwerfen</button>
      </div>
    </form>
    <ul id="source-upload-response" class="box-row">
    </ul>
    <hr />
<?php
  }
?>
    <div id="sources-list">
      <div id="source-div-template" class="box-row hidden">
        <img class="source-preview-img" />
        <span class="source-description"></span>
        <ul class="source-linked-persons"></ul>
      </div>
    </div>
    <div id="sources-uploading-wait" class="box-row hidden">Hochladen ...</div>
  </div>

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////
?>

  <div id="source-annotator" class="modal-blocker backdrop-blur message hidden">
    <div  class="box box-padding message-content">
      <div class="box-minimize-buttons negative-padding">
        <button class="hidden-toggle" data-hidden-toggle-target="#source-annotator"><?=$box_close_minimize_symbol?></button>
      </div>
      <div class="annotator">
        <div class="annotator-zoom-container">
          <div class="annotator-content">
            <img class="annotator-img" />
          </div>
        </div>
        <div class="annotator-controls">
          <b class="annotator-zoom-in" data-value="1">+</b>
          <b class="annotator-zoom-out" data-value="-1">-</b>
        </div>
      </div>
    </div>

    <div id="source-annotation-details" class="hidden">
      <input type="text" id="annotation-text" placeholder="Anmerkung" />
    </div>
  </div>

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////
?>

  <div id="help" class="box box-padding box-minimized">
    <div class="box-minimize-buttons negative-padding">
      <button class="box-restore desktop-only" title="Hilfe">?</button>
      <button class="box-minimize"><?=$box_close_minimize_symbol?></button>
    </div><?php
    $klickenTippen = !$is_mobile ? 'klicken' : 'tippen';
    $modKeys = '<i>Shift/Strg</i>';
    $bothModKeys = '<i>Shift &amp; Strg</i>'; ?>
    <div>
      <button id="restart-tutorial">(Die Anleitung noch einmal ansehen)</button>
      <h2 class="collapse-trigger<?=current_user_can(PERMISSION_EDIT) ? ' collapsed' : ''?>">Ansehen</h2>
      <ul>
        <li>Elemente des Netzes:
          <ul>
            <li>Personen
              <dl>
                <dd><div class="tutorial-person"></div> Normal</dd>
                <dd><div class="tutorial-person t-p-highlight"></div> Ausgewählt</dd>
                <dd><div class="tutorial-person t-p-warning"></div> Warnung (enthält '???')</dd>
                <dd><div class="tutorial-person t-p-doppelganger"></div> Doppelgänger ausgewählt</dd>
              </dl>
            </li>
            <li>Verbindungen
              <dl>
                <dd><div class="tutorial-connection t-c-arrow"></div> Eltern&mdash;Kind</dd>
                <dd><div class="tutorial-connection"></div> Verheiratet</dd>
                <dd><div class="tutorial-connection t-c-dashed"></div> Unverheiratet/geschieden/verwitwet</dd>
                <dd><div class="tutorial-connection t-c-dotted"></div> Unbekannt</dd>
                <br />
                <dd><div class="tutorial-connection"></div> Normal</dd>
                <dd><div class="tutorial-connection t-c-highlight"></div> Ausgewählt</dd>
                <dd><div class="tutorial-connection t-c-warning"></div> Warnung (enthält '???')</dd>
              </dl>
            </li>
          </ul>
        </li>
        <li>Sichtbaren Ausschnitt ändern:
          <ul>
          <?php if (!$is_mobile) { ?>
            <li>Auf dem Hintergrund klicken und halten und ziehen</li>
          <?php } else { ?>
            <li>Über den Hintergrund wischen</li>
          <?php } ?>
          </ul>
        </li>
        <li>Infos einer Personen anzeigen:
          <ul>
            <li>Person an<?=$klickenTippen?></li>
            <li>Das Detailfenster wird angezeigt</li>
          </ul>
        </li>
        <li>Infos einer Verbindung zwischen Personen anzeigen:
          <ul>
            <li>Verbindungslinie an<?=$klickenTippen?></li>
            <li>Das Detailfenster wird angezeigt</li>
          </ul>
        </li>
        <li>Darstellungen:
          <ul>
            <li>Netz
              <ul>
                <li>Zeigt alle eingetragenen Personen und die Verbindungen zwischen ihnen.</li>
                <li>Nur in dieser Darstellung kann das Netz bearbeitet werden.</li>
              </ul>
            </li>
            <li>Baum
              <ul>
                <li>Zeigt den Stammbaum einer Person, inklusive Partner der Kinder.</li>
                <li>Nicht dargestellte, weitere Personen werden durch angedeutete (graue) Verbindungen angezeigt.</li>
              </ul>
            </li>
            <li>Jahresbaum
              <ul>
                <li>Wie die <i>Baum</i>-Darstellung, aber die vertikale Position wird durch das Geburtsjahr bestimmt.</li>
              </ul>
            </li>
          </ul>
        </li>
        <li>Ansicht wechseln:
          <ul>
        <?php if (!$is_mobile) { ?>
            <li>Oben auf <span class="help-button">A</span> klicken, um die Auswahl zu öffnen</li>
            <li>Die gewünschte Ansicht auswählen</li>
          <?php } else { ?>
            <li>Oben aus dem Menü die gewünschte Ansicht auswählen</li>
          <?php } ?>
          </ul>
        </li>
        <li>Stammbaum einer Person auswählen/hervorheben:
          <ul>
            <li><i>Doppel<?=$klickenTippen?></i> auf die gewünschte Person</li>
            <li>In direkter Linie verwandte Personen werden angezeigt/markiert</li>
          </ul>
        </li>
      </ul>

      <?php if (current_user_can(PERMISSION_EDIT)) { ?>
      <h2 class="collapse-trigger collapsed">Bearbeiten</h2>
      <ul>
        <li>Bearbeitungsmodus de-/aktivieren:
          <ul>
            <li>Oben links <span class="help-button">Bearbeiten</span> <?=$klickenTippen?> zum aktivieren</li>
            <li>Anschließend <span class="help-button">Fertig</span> <?=$klickenTippen?> zum deaktivieren</li>
            <li>Es kann immer nur ein Nutzer im Bearbeitungsmodus sein</li>
          </ul>
        </li>
        <li>Eine Person hinzufügen:
          <ul>
          <?php if (!$is_mobile) { ?>
            <li><i>Doppelklick</i> dort, wo die Person hinzugefügt werden soll</li>
          <?php } else { ?>
            <li>Oben <span class="help-button mobile-action-new-person"></span> auswählen</li>
            <li>Dort hintippen, wo die Person hinzugefügt werden soll</li>
          <?php } ?>
            <li>Daten der Person im Eingabefenster eintragen
              <dl>
                <dd>
                  Bei mehreren Vornamen wird der erste automatisch als Rufname verwendet.<br />
                  Mit einem * kann ein anderer Vorname als Rufname gekennzeichnet werden.<br />
                  Zusätzlich kann ein Spitzname in Klammern angegeben werden.
                  <p>
                    Bsp.:<br />
                    &ndash; Maximilian Fritz<br />
                    &ndash; Maximilian *Fritz<br />
                    &ndash; (Maxi) Maximilian Fritz<br />
                    &ndash; (Fritzchen) Maximilian *Fritz
                  </p>
                </dd>
              </dl>
            </li>
            <li><span class="help-button">Hinzufügen</span> <?=$klickenTippen?></li>
          </ul>
        </li>
      <?php if (!$is_mobile) { ?>
        <li>Person/en auswählen:
          <ul>
            <li><?=$modKeys?> gedrückt halten</li>
            <li>Eine oder mehrere Personen nacheinander anklicken</li>
          </ul>
          oder
          <ul>
            <li><?=$bothModKeys?> gedrückt halten</li>
            <li>Personen mit gedrückter Maustaste einkreisen</li>
          </ul>
        </li>
      <?php } ?>
        <li>Person/en verschieben:
          <ul>
          <?php if (!$is_mobile) { ?>
            <li><?=$modKeys?> gedrückt halten</li>
            <li>Auf die Person klicken und halten und ziehen</li>
          <?php } else { ?>
            <li>Oben <span class="help-button mobile-action-move-person"></span> auswählen</li>
            <li>Auf die Person tippen</li>
            <li>Auf die neue Position tippen</li>
            <li>(Falls nötig erneut auf eine neue Position tippen)</li>
            <li>Oben <span class="help-button mobile-action-move-person"></span> wieder deaktivieren</li>
          <?php } ?>
          </ul>
        </li>
        <li>Zwei Personen verbinden:
          <ul>
          <?php if (!$is_mobile) { ?>
            <li><?=$modKeys?> gedrückt halten</li>
          <?php } else { ?>
            <li>Oben <span class="help-button mobile-action-new-connection"><span></span></span> auswählen</li>
          <?php } ?>
            <li>Die erste Person an<?=$klickenTippen?></li>
            <li>Die zweite Person an<?=$klickenTippen?></li>
            <li>Daten der Verbindung im Eingabefenster eintragen</li>
            <li><span class="help-button">Verbinden</span> <?=$klickenTippen?></li>
          </ul>
        </li>
        <li>Zwei Eltern und ein Kind verbinden:
          <ul>
          <?php if (!$is_mobile) { ?>
            <li><?=$modKeys?> gedrückt halten</li>
          <?php } else { ?>
            <li>Oben <span class="help-button mobile-action-new-connection"><span></span></span> auswählen</li>
          <?php } ?>
            <li>Die Verbindung zwischen den Eltern an<?=$klickenTippen?></li>
            <li>Das Kind an<?=$klickenTippen?></li>
            <li>Daten der Verbindung im Eingabefenster eintragen</li>
            <li><span class="help-button">Verbinden</span> <?=$klickenTippen?></li>
          </ul>
        </li>
        <li>Eine Person entfernen:
          <ul>
            <li>(Die Person darf keine Verbindungen haben)</li>
            <li>Die Person an<?=$klickenTippen?></li>
            <li>Im Detailfenster <span class="help-button">Entfernen</span> <?=$klickenTippen?>
            <?php if (!$is_mobile) { ?>
              <br />oder<br /><?=$modKeys?> gedrückt halten und <i>Entf</i> tippen</li>
            <?php } ?>
          </ul>
        </li>
        <li>Eine Verbindung entfernen:
          <ul>
            <li>(Die Verbindung darf keine Kind-Verbindungen haben)</li>
            <li>Die Verbindung an<?=$klickenTippen?></li>
            <li>Im Detailfenster <span class="help-button">Entfernen</span> <?=$klickenTippen?>
            <?php if (!$is_mobile) { ?>
              <br />oder<br /><?=$modKeys?> gedrückt halten und <i>Entf</i> tippen</li>
            <?php } ?>
          </ul>
        </li>
        <li>Änderungen rückgängig machen:
          <ul>
            <li>Oben rechts <span class="help-button">&olarr;</span> <?=$klickenTippen?></li>
            <li>Einen früheren Zustand auswählen</li>
            <li>Das Netz wird als Vorschau entsprechend angezeigt</li>
            <li><span class="help-button">Das Netz auf diesen Zustand zurücksetzen</span> <?=$klickenTippen?></li>
          </ul>
        </li>
      </ul>
      <?php } ?>
    </div>
  </div><!-- help -->

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////
?>

  <div id="message-template" class="modal-blocker backdrop-blur message hidden">
    <div class="box box-padding">
      <div class="message-content"></div>
      <button class="button-border"></button>
    </div>
  </div>

<?php
///////////////////////////////////////////////////////////////////////////////////////////////////

if (!BETA) {
?>
  <style type="text/css">
    .BETA { display: none !important; }
  </style>
<?php
}
?>
  <script>
    const serverURL = '<?=$server_url?>';
    const currentUser = '<?=$_SESSION[USER]?>';
    const BETA = <?=BETA ? 'true' : 'false'?>;
    const currentUserIsAdmin = <?=current_user_can(PERMISSION_ADMIN) ? 'true' : 'false'?>;
    const currentUserIsViewer = <?=!current_user_can(PERMISSION_EDIT) ? 'true' : 'false'?>;
    const currentUserIsEditing = <?=$_SESSION[EDITING] ? 'true' : 'false'?>;
    let editingTimeout = <?=$_SESSION[EDITING] ?: '0'?>;
    const editingTimeoutDuration = <?=CURRENT_EDITOR_TIMEOUT?>;
    const firstLogin = <?=$first_login ? 'true' : 'false'?>;
    const accountUpgraded = <?=$account_upgraded ? 'true' : 'false'?>;
    const modKeys = '<?=$modKeys?>';
    const isMobile = <?=$is_mobile ? 'true' : 'false'?>;
    const currentLayoutId = '<?=$_GET['layout'] ?? ''?>';
    const maxSourceFileSize = <?=SOURCES_MAX_FILE_SIZE?>;
    const sourcesPath = '<?=$server_url . SOURCES_UPLOAD_DIR?>/';

    let permissions = {
      <?php
      $perms = get_permissions();
      array_walk($perms, function(&$val, $key)
      {
        $val = substr($key, strlen('PERMISSION_')) . ': ' .
          (current_user_can($val) ? 'true' : 'false');
      });
      echo implode(",\n      ", $perms);
      ?>

    };
    const no_permission_value = '<?=NO_PERMISSION_VALUE?>';
    const no_permission_char = '<?=mb_substr(NO_PERMISSION_VALUE, 0, 1, 'utf-8')?>';
  </script>
  <script src="js/callbacks.js<?=V_?>"></script>
  <script src="js/utils.js<?=V_?>"></script>
  <script src="js/person.js<?=V_?>"></script>
  <script src="js/connection.js<?=V_?>"></script>
  <script src="js/source.js<?=V_?>"></script>
  <script src="js/script.js<?=V_?>"></script>
  <script src="js/tutorial.js<?=V_?>"></script>
<?php
if ($is_mobile) {
?>
  <script src="js/mobile.js<?=V_?>"></script>
<?php
}
else {
?>
  <script src="js/desktop.js<?=V_?>"></script>
<?php
}
if ($useLayout) {
?>
  <script src="js/layout_<?=$_GET['layout']?>.js<?=V_?>"></script>
<?php
}
if (BETA) {
?>
  <script src="js/BETA.js<?=V_?>"></script>
<?php
}
?>
</body>
</html>
<?php

///////////////////////////////////////////////////////////////////////////////////////////////////

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
?>
  <style type="text/css">
    html, body {
      height: 100%;
      margin: 0;
    }
    body {
      padding: 0 20pt;
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
<?php
  global $is_mobile;
  if ($is_mobile) {
?>
    input {
      margin: 30pt 0;
      padding: 20pt 30pt;
      display: block;
      font-size: 300%;
      width: 80vw;
    }
<?php
  }
?>
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

function init($admin_user)
{
  global $accounts;
  global $server_url;

  save_settings();

  exec('sh/init.sh ' .
    '"' . STORAGE_DIR . '" ' .
    '"' . STORAGE_FILE . '" ' .
    '"' . $admin_user . '" ' .
    '2>&1', $out);
}

function save_accounts()
{
  global $accounts;
  $file_content = add_newlines_to_data_json_for_git_friendly_file_content($accounts);
  file_put_contents(ACCOUNTS_FILE, $file_content, LOCK_EX);
}

function add_newlines_to_data_json_for_git_friendly_file_content($arr)
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
function add_newlines_to_source_json_for_git_friendly_file_content($arr)
{
  return str_replace([
    '}},'
  ], [
    '}}' . PHP_EOL . ','
  ], json_encode($arr));
}

function startEditing()
{
  $ret = false;
  if (!file_exists(CURRENT_EDITOR_FILE)) {
    fclose(fopen(CURRENT_EDITOR_FILE, 'a'));
  }
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
  if (!file_exists(CURRENT_EDITOR_FILE)) {
    fclose(fopen(CURRENT_EDITOR_FILE, 'a'));
  }
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
  if (!file_exists(CURRENT_EDITOR_FILE)) {
    fclose(fopen(CURRENT_EDITOR_FILE, 'a'));
  }
  $f = fopen(CURRENT_EDITOR_FILE, 'r+');
  if ($f) {
    if (flock($f, LOCK_EX | LOCK_NB)) {
      $other_editor = explode('|||', fread($f, 1000));
      if (count($other_editor) > 1 && $other_editor[1] === $_SESSION[USER]) {
        ftruncate($f, 0);
      }
      flock($f, LOCK_UN);
    }
    fclose($f);
  }
  $_SESSION[EDITING] = false;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function get_log($commit_count = 0)
{
  exec(CD_STORAGE_DIR . 'git log --author-date-order --format=format:\'%h|||%ai|||%an|||%s\'' . ((current_user_can(PERMISSION_ADMIN) && array_key_exists(EXTENDED_LOG, $_SESSION)) ? ' --all' : '') . ($commit_count > 0 ? ' -' . $commit_count : ''), $out);
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

function & get_from_array(&$arr, $t)
{
  foreach ($arr as &$d) {
    if ($d['t'] == $t) {
      return $d;
    }
  }
  die('ERROR | get_from_array(' . $t . ') | requested record not found.');
}
function & get_data($what, $t)
{
  global $data;
  return get_from_array($data[$what], $t);
}

function delete_from_array(&$arr, $t)
{
  foreach ($arr as $index => $d) {
    if ($d['t'] == $t) {
      array_splice($arr, $index, 1);
      return;
    }
  }
}
function delete_data($what, $t)
{
  global $data;
  delete_from_array($data[$what], $t);
}

function fileDebug($file, $msg)
{
  file_put_contents(RUNTIME_DIR . '/' . $file . '.txt', $msg . PHP_EOL, FILE_APPEND);
}
