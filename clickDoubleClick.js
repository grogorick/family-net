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
            cbClick(e);
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
      cbDoubleClick(e);
    }
  };
  return cdc;
}
