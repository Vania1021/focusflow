interface AppSettings {
  enabled?: boolean;
  interval?: number;
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleExtension') as HTMLInputElement;
  const intervalInput = document.getElementById('interval') as HTMLInputElement;
  const statusLabel = document.getElementById('status') as HTMLElement;

  chrome.storage.local.get(['enabled', 'interval'], (data: AppSettings) => {
    toggle.checked = data.enabled || false;
    intervalInput.value = (data.interval || 5).toString();
  });

  document.getElementById('saveBtn')?.addEventListener('click', () => {
    const enabled = toggle.checked;
    const interval = parseInt(intervalInput.value);

    chrome.storage.local.set({ enabled, interval }, () => {
      statusLabel.innerText = "Status: Settings Updated";
      setTimeout(() => { statusLabel.innerText = "Status: Idle"; }, 2000);
    });
  });
});
