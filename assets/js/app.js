/**
 * Evently App Initialization
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Mobile sidebar toggle
  const menuButton = document.getElementById('menuButton');
  const sidebar = document.getElementById('sidebar');
  if (menuButton && sidebar) {
    menuButton.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Initial render (shows initial loading/state)
  renderView();

  // Load live data from API (port 3000)
  try {
    await syncDataFromApi();
  } catch (e) {
    console.warn('[App] Error in initial data sync:', e);
  }

  // Re-render with live data
  renderView();
});