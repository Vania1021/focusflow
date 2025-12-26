console.log('NeuroSync Background Service Worker Running');

chrome.runtime.onInstalled.addListener(() => {
  console.log('NeuroSync Extension Installed');
});
