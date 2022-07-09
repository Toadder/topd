const header = document.querySelector(".header");

function updateCounter(index, mode) {
  const counterNumber = document.querySelector(".counter__number");
  counterNumber.textContent = index > 9 ? index : `0${index}`;
  counterNumber.style.color = mode === "light" ? "#fff" : "#232323";
}

function loadImage(img) {
  if (img.dataset.src) {
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  } else if (img.dataset.srcset) {
    img.srcset = img.dataset.srcset;
    img.removeAttribute("data-srcset");
  }

  img.onload = () => {
    const parent = img.parentElement;
    img.classList.add("lazy-image--loaded");
    parent.classList.add("lazy-wrapper--loaded");
  };
}

// Header Handler
const headerHandler = () => {
  const burger = document.querySelector(".header__burger");
  const menu = document.querySelector(".header__menu");

  burger.addEventListener("click", () => {
    burger.classList.toggle("clicked");
    menu.classList.toggle("clicked");
    document.body.classList.toggle("lock");
  });

  if (window.scrollY > 0) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
};

// Sliders
const sliders = () => {
  const getSliderConfig = (className) => ({
    slidesPerView: 1,
    speed: 850,
    loop: true,
    autoHeight: true,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    navigation: {
      nextEl: `.${className}__next`,
    },
    pagination: {
      el: `.${className}__pagination`,
      type: "bullets",
      clickable: true,
    },
    preloadImages: false,
    lazy: {
      loadPrevNext: true,
    },
  });
  if (document.querySelector(".project")) {
    new Swiper(".project__slider", getSliderConfig("project"));
  }
  if (document.querySelector(".feedback")) {
    new Swiper(".feedback__slider", getSliderConfig("feedback"));
  }
  if (document.querySelector(".page")) {
    const wrapper = document.querySelector(".wrapper");
    let pageSlider = new Swiper(".page", {
      wrapperClass: "page__wrapper",
      slideClass: "page__screen",
      direction: "vertical",
      slidesPerView: "auto",
      speed: 900,
      init: false,
      loop: false,
      mousewheel: {
        sensitivity: 1,
      },

      keyboard: {
        enabled: true,
        onlyInViewport: true,
        pageUpDown: true,
      },
      watchOverflow: true,
      observer: true,
      observeParents: true,
      observeSlideChildren: true,

      scrollbar: {
        el: ".page__scroll",
        dragClass: "page__drag-scroll",
        draggable: true,
      },
      preloadImages: false,
      lazy: {
        loadPrevNext: true,
      },
      on: {
        init: (slider) => {
          setScrollType();
          scrollProgress(slider);

          const activeSlide = slider.slides[slider.realIndex];
          const images = activeSlide.querySelectorAll(
            "img[data-src], source[data-srcset]"
          );
          images.forEach((img) => loadImage(img));
          header
            .querySelectorAll("[data-src], [data-srcset]")
            .forEach((img) => loadImage(img));
        },
        slideChange: (slider) => {
          const currentIndex = slider.realIndex;
          const currentSlide = slider.slides[currentIndex];
          const prevIndex = slider.previousIndex;

          if (currentIndex > prevIndex) {
            header.classList.add("scrolled");
          } else if (currentIndex === 0) {
            setTimeout(() => {
              header.classList.remove("scrolled");
            }, slider.params.speed * 0.8);
          }

          const mode = currentSlide.getAttribute("data-section");
          setTimeout(() => {
            updateCounter(currentIndex + 1, mode);
          }, slider.params.speed / 2);

          const images = currentSlide.querySelectorAll(
            "img[data-src], source[data-srcset]"
          );
          images.forEach((img) => loadImage(img));
        },
        resize: () => {
          setScrollType();
        },
      },
    });

    pageSlider.init();

    function setScrollType() {
      if (wrapper.classList.contains("freeMode")) {
        wrapper.classList.remove("freeMode");
        pageSlider.enable();
      }
      for (let index = 0; index < pageSlider.slides.length; index++) {
        const pageSlide = pageSlider.slides[index];
        const pageSlideContent = pageSlide.querySelector(".page__body");

        if (pageSlideContent) {
          const pageSlideContentHeight = pageSlideContent.clientHeight;

          if (
            pageSlideContentHeight + header.clientHeight >
            window.innerHeight
          ) {
            lazyload();
            wrapper.classList.add("freeMode");
            scrollProgress(pageSlider);
            pageSlider.disable();
            break;
          }
        }
      }
    }
  } else {
    lazyload();
  }
};

// Ymap
const ymap = () => {
  let sectionMap = document.querySelector(".contacts");

  if (!sectionMap) return;

  function ymapInit() {
    if (typeof ymaps === "undefined") return;
    let ymap = document.getElementById("ymap");

    ymaps.ready(function () {
      let map = new ymaps.Map("ymap", {
        center: [55.75010809089388, 37.542542742533165],
        zoom: 17,
        controls: ["zoomControl"],
        behaviors: ["drag"],
      });

      // Placemark
      let placemark = new ymaps.Placemark(
        [55.75010809089388, 37.542542742533165],
        {
          // Hint
          hintContent: "Top Design",
          balloonContent:
            "г.Москва, Выставочная набережная 45, 10 этаж, помм. 1003",
        },
        {
          preset: "islands#icon",
          iconColor: "#F18B39",
        }
      );

      map.geoObjects.add(placemark);
    });
  }

  window.addEventListener("scroll", checkYmapInit);
  checkYmapInit();

  function checkYmapInit() {
    let sectionMapTop = sectionMap.getBoundingClientRect().top;
    let scrollTop = window.pageYOffset;
    let sectionMapOffsetTop = sectionMapTop + scrollTop;

    if (scrollTop + window.innerHeight > sectionMapOffsetTop) {
      ymapLoad();
      window.removeEventListener("scroll", checkYmapInit);
    }
  }

  function ymapLoad() {
    let script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
    document.body.appendChild(script);
    script.onload = ymapInit;
  }
};

// Scroll Progress
const scrollProgress = (pageSlider) => {
  const sections = Array.from(pageSlider.slides);

  if (sections.length <= 0) return;
  const sectionsPositions = [];
  let start = 0;
  for (let index = 0; index < sections.length; index++) {
    sectionsPositions.push({
      section: sections[index],
      coordinates: [start, start + sections[index].offsetHeight],
    });
    start += sections[index].offsetHeight;
  }

  window.addEventListener("scroll", scrollHandler);
  scrollHandler();

  function scrollHandler() {
    const currentPosition = window.scrollY + window.innerHeight / 2;
    const currentSection = getCurrentSection(currentPosition);
    if (currentSection) {
      const index = sections.indexOf(currentSection) + 1;
      const mode = currentSection.getAttribute("data-section");

      updateCounter(index, mode);
    }
  }

  function getCurrentSection(currentPosition) {
    for (let index = 0; index < sectionsPositions.length; index++) {
      const data = sectionsPositions[index];
      if (
        currentPosition >= data.coordinates[0] &&
        currentPosition < data.coordinates[1]
      ) {
        return data.section;
      }
    }
    return 0;
  }
};

const lazyload = () => {
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;

        loadImage(img);
        observer.unobserve(img);
      }
    });
  }, options);

  const lazyImages = document.querySelectorAll(
    "img[data-src], source[data-srcset]"
  );
  lazyImages.forEach((img) => observer.observe(img));
};

window.onload = () => {
  headerHandler();
  sliders();
  ymap();

  // Parallax --> index.html
  const scene = document.getElementById("scene");
  if (scene) new Parallax(scene);
};
