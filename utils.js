function clickDoubleClick(cbClick, cbDoubleClick)
{
  let cdc = {
    check: 0,
    click: function(e)
    {
      console.log('(click)');
      if (!cdc.check)
        setTimeout(() =>
        {
          if (!cdc.check) {
            if (cbClick) {
              cbClick(e);
            }
          } else
            cdc.check--;
        }, s.settings('doubleClickTimeout') + 100);
      else
        cdc.check--;
    },
    doubleClick: function(e)
    {
      console.log('(doubleClick)');
      cdc.check = 2;
      if (cbDoubleClick) {
        cbDoubleClick(e);
      }
    }
  };
  return cdc;
}

function approveDeleteOrCancelKeys(inputFields, approveButtonsToClick, deleteButtonToClick, cancelButtonToClick)
{
  inputFields.forEach(i => {
    i.addEventListener('keydown', e =>
    {
      // console.log(e);
      let isMultipleKeyPressed = multipleKeyPressed(e);
      switch (e.key) {
        case 'Enter':
        {
          if (i.tagName !== 'TEXTAREA' || isMultipleKeyPressed) {
            approveButtonsToClick.forEach(b => {
              if (b) {
                let isNewForm = b.classList.contains('opt-new') && b.parentNode.classList.contains('opt-new');
                let isNewChildForm = b.classList.contains('opt-new-child') && b.parentNode.classList.contains('opt-new-child');
                let isEditForm = b.classList.contains('opt-edit') && b.parentNode.classList.contains('opt-edit');
                if (isNewForm || isNewChildForm || isEditForm) {
                  b.click();
                }
              }
            });
          }
        }
        break;
        case 'Delete':
        {
          if (deleteButtonToClick && isMultipleKeyPressed && deleteButtonToClick.parentNode.classList.contains('opt-edit')) {
            deleteButtonToClick.click();
          }
        }
        break;
        case 'Escape':
        {
          if (cancelButtonToClick) {
            cancelButtonToClick.click();
          }
        }
        break;
      }
    });
  });
}

function multipleKeyPressed(e)
{
  return e.data ? (e.data.captor.ctrlKey || e.data.captor.shiftKey) : (e.ctrlKey || e.shiftKey);
}

function twoDigits(v)
{
  if (v === '0')
    return '';
  if (v.length === 1)
    return '0' + v;
  return v;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toServerDataGraph(action, d, cb = { toServer: null, toData: null, toGraph: null, refreshGraph: false, doneCallback: null }, log = true)
{
  console.log(log ? [action, d, 'toServer:', cb.toServer, 'toData:', cb.toData, 'toGraph:', cb.toGraph, 'refreshGraph:', cb.refreshGraph] : '...');
  let continueWhenServerIsDone = function()
  {
    if (cb.toData) {
      cb.toData(d);
    }
    if (cb.toGraph) {
      cb.toGraph(d);
      if (cb.refreshGraph) {
        s.refresh();
      }
    }
    if (cb.doneCallback) {
      cb.doneCallback(d);
    }
  };
  if (cb.toServer) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText);
        if (cb.toServer !== true) {
          cb.toServer(this.responseText, d);
        }
        continueWhenServerIsDone();
      }
    };
    xhttp.open('GET', '?action=' + action
      + '&d=' + encodeURIComponent(JSON.stringify(d))
      , true);
    xhttp.send();
  }
  else {
    continueWhenServerIsDone();
  }
}

let modalBlocker = document.getElementById('modal-blocker');
let boxWithModalBlocker = null;
function showForm(f, opt = null)
{
  modalBlocker.classList.remove('hidden');
  boxWithModalBlocker = f;

  f.classList.remove('opt-new');
  f.classList.remove('opt-new-child');
  f.classList.remove('opt-edit');
  if (opt) {
    f.classList.add(opt);
  }

  moveBoxToForeground(f);
  f.classList.remove('hidden');

  let firstInput = f.querySelector('input:not([disabled]), textarea:not([disabled])');
  if (firstInput) {
    console.log(firstInput);
    firstInput.focus();
  }
  else {
    let cancelButton = f.querySelector('button[id$="cancel"]').focus();
  }
}
function hideForm(f)
{
  f.classList.add('hidden');
  modalBlocker.classList.add('hidden');
}

modalBlocker.addEventListener('click', e =>
{
  let cancelButton = document.querySelector('.box:not(.hidden) button[id$="cancel"]');
  if (cancelButton) {
    cancelButton.click();
  }
  else if (boxWithModalBlocker) {
    hideForm(boxWithModalBlocker);
    boxWithModalBlocker = null;
  }
});

let zIndex = 1;
function moveBoxToForeground(box)
{
  box.style.zIndex = (++zIndex).toString();
}
function moveBoxToBackground(box)
{
  box.style.zIndex = '';
}

document.querySelectorAll('.box-message').forEach(box =>
{
  document.getElementById('modal-blocker').classList.remove('hidden');
  box.querySelector('button').addEventListener('click', e => hideForm(box));
});

document.querySelectorAll('.box-minimize, .box-restore').forEach(el =>
{
  el.addEventListener('click', e =>
  {
    let box = el.parentNode.parentNode;
    if (box.classList.toggle('box-minimized')) {
      moveBoxToBackground(box);
    }
    else {
      moveBoxToForeground(box);
    }
  });
});

document.querySelectorAll('.collapse-trigger').forEach(el =>
{
  el.addEventListener('click', e =>
  {
    el.classList.toggle('collapsed');
  });
});

function updateDateValue(dayInput, monthInput, yearInput)
{
  dayInput.setAttribute('data-value', yearInput.value + '-' + twoDigits(monthInput.value) + '-' + twoDigits(dayInput.value));
}

document.querySelectorAll('.box input[placeholder="tt"]').forEach(tt =>
{
  tt.pattern = '0|0?[1-9]|[12]\\d|3[01]';
  tt.addEventListener('input', e =>
  {
    while (!tt.checkValidity()) { tt.value = tt.value.slice(0, -1); }
    let id = tt.id.substr(0, tt.id.length - '-day'.length);
    let mm = document.getElementById(id + '-month');
    let yyyy = document.getElementById(id + '-year');
    updateDateValue(tt, mm, yyyy);

    if (tt.value.length === 2) {
      tt.nextElementSibling.focus();
    }
  });
  tt.setAttribute('data-value', '--');
});

document.querySelectorAll('.box input[placeholder="mm"]').forEach(mm =>
{
  mm.pattern = '0|0?[1-9]|1[012]';
  mm.addEventListener('input', e =>
  {
    while (!mm.checkValidity()) { mm.value = mm.value.slice(0, -1); }
    let id = mm.id.substr(0, mm.id.length - '-month'.length);
    let tt = document.getElementById(id + '-day');
    let yyyy = document.getElementById(id + '-year');
    updateDateValue(tt, mm, yyyy);

    if (mm.value.length === 2) {
      mm.nextElementSibling.focus();
    }
  });
});

document.querySelectorAll('.box input[placeholder="yyyy"]').forEach(yyyy =>
{
  yyyy.pattern = '\\d{1,4}';
  yyyy.addEventListener('input', e =>
  {
    while (!yyyy.checkValidity()) { yyyy.value = yyyy.value.slice(0, -1); }
    let id = yyyy.id.substr(0, yyyy.id.length - '-year'.length);
    let tt = document.getElementById(id + '-day');
    let mm = document.getElementById(id + '-month');
    updateDateValue(tt, mm, yyyy);
  });
});
