document.addEventListener("DOMContentLoaded", function () {

  // footer
  document.getElementById("year").textContent = new Date().getFullYear();

  // 404
  lottie.loadAnimation({
    container: document.getElementById('error-img'), 
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/static/404.json' 
  });

});

const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    document.querySelector('.menu-item.active')?.classList.remove('active');
    item.classList.add('active');
  });
});
  