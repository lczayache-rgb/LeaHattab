// IntersectionObserver for scroll animations
const animatedElements = document.querySelectorAll('.animate-on-scroll');

if (animatedElements.length > 0) {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.getAttribute('data-delay') || 0;
        setTimeout(() => {
          el.classList.add('is-visible');
        }, parseInt(delay));
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

// Stagger children with data-stagger attribute
document.querySelectorAll('[data-stagger]').forEach(container => {
  const children = container.children;
  Array.from(children).forEach((child, index) => {
    child.classList.add('animate-on-scroll');
    child.setAttribute('data-delay', index * 100);
  });
});
