document.addEventListener("DOMContentLoaded", function () {

  // footer
  document.getElementById("year").textContent = new Date().getFullYear();

  // 404
  lottie.loadAnimation({
    container: document.getElementById('error-img'), 
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/public/static/404.json' 
  });

  const popup = document.getElementById("popup");
  const popup_message = document.getElementById("popup-message");
  const close_btn = document.getElementById("close-btn");


  function showPopup(message) {
      popup_message.textContent = message; 
      popup.style.display = "flex"; 
  }

  close_btn.addEventListener("click", () => {
      popup.style.display = "none"; 
  });

  window.addEventListener("click", (event) => {
      if (event.target === popup) {
          popup.style.display = "none";
      }
  });

});

const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    document.querySelector('.menu-item.active')?.classList.remove('active');
    item.classList.add('active');
  });
});
  