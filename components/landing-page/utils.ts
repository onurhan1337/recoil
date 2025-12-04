export function smoothScrollTo(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const navbarHeight =
    window.innerWidth >= 1024 ? 84 : window.innerWidth >= 768 ? 64 : 56;
  const elementPosition =
    element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - navbarHeight - 20;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}

