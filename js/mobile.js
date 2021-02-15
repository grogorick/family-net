
let mainMenu = document.getElementById('account');

document.getElementById('mobile-help').addEventListener('click', () =>
{
  console.log('mobile-help');
  mainMenu.classList.toggle('hidden');
  document.querySelector('#help .box-restore').click();
});

document.getElementById('mobile-log').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#log .box-restore').click();
});

document.getElementById('mobile-admin').addEventListener('click', () =>
{
  mainMenu.classList.toggle('hidden');
  document.querySelector('#admin .box-restore').click();
});
