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

function approveOrCancelKeys(inputField, approveButtonsToClick, cancelButtonToClick)
{
  inputField.addEventListener('keydown', e =>
  {
    switch (e.key) {
      case 'Enter':
      {
        approveButtonsToClick.forEach(b => {
          let isNewForm = b.classList.contains('opt-new') && b.parentNode.classList.contains('opt-new');
          let isEditForm = b.classList.contains('opt-edit') && b.parentNode.classList.contains('opt-edit');
          if (isNewForm || isEditForm) {
            b.click();
          }
        });
      }
      break;
      case 'Escape':
      {
        cancelButtonToClick.click();
      }
      break;
    }
  });
}

function multipleKeyPressed(e)
{
  return e.data.captor.ctrlKey || e.data.captor.shiftKey;
}

function twoDigits(v)
{
  if (v === '0')
    return '';
  if (v.length === 1)
    return '0' + v;
  return v;
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

document.querySelectorAll('.box-minimize, .box-restore').forEach(el =>
{ el.addEventListener('click', e =>
  {
    el.parentNode.parentNode.classList.toggle('box-minimized');
  });
});

document.querySelectorAll('.box input[placeholder="tt"]').forEach(tt =>
{
  tt.pattern = '0|0?[1-9]|[12]\\d|3[01]';
  tt.addEventListener('input', e =>
  {
    while (!tt.checkValidity()) { tt.value = tt.value.slice(0, -1); }
    let id = tt.id.substr(0, tt.id.length - '-day'.length);
    let mm = document.getElementById(id + '-month');
    let yyyy = document.getElementById(id + '-year');
    tt.setAttribute('data-value', yyyy.value + '-' + twoDigits(mm.value) + '-' + twoDigits(tt.value));
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
    tt.setAttribute('data-value', yyyy.value + '-' + twoDigits(mm.value) + '-' + twoDigits(tt.value));
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
    tt.setAttribute('data-value', yyyy.value + '-' + twoDigits(mm.value) + '-' + twoDigits(tt.value));
  });
});
