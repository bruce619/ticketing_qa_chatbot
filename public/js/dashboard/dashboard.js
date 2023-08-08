const sidebar = document.querySelector('.sidebar')
const toggleSidebarBtn = document.getElementById('toggleSidebar')

// Toggle Sidebar

toggleSidebarBtn.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open')

    toggleSidebarBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`
  } else {
    sidebar.classList.add('open')

    toggleSidebarBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`
  }
})
