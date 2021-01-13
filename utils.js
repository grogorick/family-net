function clickDoubleClick(cbClick, cbDoubleClick)
{
  let cdc = {
    check: 0,
    click: function(e)
    {
      console.log('click');
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
      console.log('doubleClick');
      cdc.check = 2;
      if (cbDoubleClick) {
        cbDoubleClick(e);
      }
    }
  };
  return cdc;
}

function approveOrCancelKeys(inputField, approveButtonToClick, cancelButtonToClick)
{
  inputField.addEventListener('keydown', e =>
  {
    switch (e.key) {
      case 'Enter': approveButtonToClick.click(); break;
      case 'Escape': cancelButtonToClick.click(); break;
    }
  });
}

function twoDigits(v)
{
  if (v === '0')
    return '';
  if (v.length === 1)
    return '0' + v;
  return v;
}

document.querySelectorAll('.input-box input[placeholder="tt"]').forEach(tt =>
{
  tt.pattern = '0|0?[1-9]|[12]\\d|3[01]';
  tt.addEventListener('input', e =>
  {
    while (!tt.checkValidity()) { tt.value = tt.value.slice(0, -1); }
    let mm = document.getElementById(tt.id + '-month');
    let yyyy = document.getElementById(tt.id + '-year');
    tt.setAttribute('data-value', yyyy.value + '-' + twoDigits(mm.value) + '-' + twoDigits(tt.value));
  });
  tt.setAttribute('data-value', '--');
});

document.querySelectorAll('.input-box input[placeholder="mm"]').forEach(mm =>
{
  mm.pattern = '0|0?[1-9]|1[012]';
  mm.addEventListener('input', e =>
  {
    while (!mm.checkValidity()) { mm.value = mm.value.slice(0, -1); }
    let id = mm.id.substr(0, mm.id.length - '-month'.length);
    let tt = document.getElementById(id);
    let yyyy = document.getElementById(id + '-year');
    tt.setAttribute('data-value', yyyy.value + '-' + twoDigits(mm.value) + '-' + twoDigits(tt.value));
  });
});

document.querySelectorAll('.input-box input[placeholder="yyyy"]').forEach(yyyy =>
{
  yyyy.pattern = '\\d{1,4}';
  yyyy.addEventListener('input', e =>
  {
    while (!yyyy.checkValidity()) { yyyy.value = yyyy.value.slice(0, -1); }
    let id = yyyy.id.substr(0, yyyy.id.length - '-year'.length);
    let tt = document.getElementById(id);
    let mm = document.getElementById(id + '-month');
    tt.setAttribute('data-value', yyyy.value + '-' + twoDigits(mm.value) + '-' + twoDigits(tt.value));
  });
});
