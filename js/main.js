//smooth scroll start
function initSmoothScroll() {
  let html = document.documentElement;
  let body = document.body;

  let scroller = {
    target: document.querySelector("#scroll-container"),
    ease: 0.05, // <= scroll speed
    endY: 0,
    y: 0,
    resizeRequest: 1,
    scrollRequest: 0,
  };

  let requestId = null;

  TweenLite.set(scroller.target, {
    rotation: 0.0,
    force3D: true,
  });

  window.addEventListener("load", onLoad);

  function onLoad() {
    updateScroller();
    window.focus();
    window.addEventListener("resize", onResize);
    document.addEventListener("scroll", onScroll);
  }

  function updateScroller() {
    let resized = scroller.resizeRequest > 0;

    if (resized) {
      let height = scroller.target.clientHeight;
      body.style.height = height + "px";
      scroller.resizeRequest = 0;
    }

    let scrollY = window.pageYOffset || html.scrollTop || body.scrollTop || 0;

    scroller.endY = scrollY;
    scroller.y += (scrollY - scroller.y) * scroller.ease;

    if (Math.abs(scrollY - scroller.y) < 0.05 || resized) {
      scroller.y = scrollY;
      scroller.scrollRequest = 0;
    }

    TweenLite.set(scroller.target, {
      y: -scroller.y,
    });

    requestId =
      scroller.scrollRequest > 0 ? requestAnimationFrame(updateScroller) : null;
  }

  function onScroll() {
    scroller.scrollRequest++;
    if (!requestId) {
      requestId = requestAnimationFrame(updateScroller);
    }
  }

  function onResize() {
    scroller.resizeRequest++;
    if (!requestId) {
      requestId = requestAnimationFrame(updateScroller);
    }
  }
}

initSmoothScroll();

//smooth scroll end

//skew effect start
function skewEffect() {
  let proxy = { skew: 0 },
    skewSetter = gsap.quickSetter(".skew-elem", "skewY", "deg"),
    clamp = gsap.utils.clamp(-10, 10);

  ScrollTrigger.create({
    trigger: "#scroll-container",
    onUpdate: (self) => {
      let skew = clamp(self.getVelocity() / -1600);
      if (Math.abs(skew) > Math.abs(proxy.skew)) {
        proxy.skew = skew;
        gsap.to(proxy, {
          skew: 0,
          duration: 0.8,
          ease: "power3",
          overwrite: true,
          onUpdate: () => skewSetter(proxy.skew),
        });
      }
    },
  });

  gsap.set(".skew-elem", { transformOrigin: "right center", force3D: true });
}

skewEffect();

//skew effect end

//parallax start
function initParallax() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#scroll-container",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });

  gsap.utils.toArray(".parallax").forEach((layer) => {
    const depth = layer.dataset.depth;
    const movement = -(layer.offsetHeight * depth);
    tl.to(layer, { y: movement, ease: "none" }, 0);
  });

  gsap.utils.toArray(".text-parallax").forEach((layer) => {
    const depth = layer.dataset.depth;
    const movement = -(layer.offsetHeight * depth);
    tl.to(layer, { y: movement, ease: "none" }, 0);
  });
}

initParallax();

//parallax end

//intro-canvas start

const canvas = document.querySelector("#intro-canvas");
const container = document.getElementById("canvas-holder");
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/images/samira_photo.jpg");
texture.crossOrigin = "anonymous";
const geometry = new THREE.PlaneBufferGeometry(1.04, 1.534, 32, 32);
const material = new THREE.ShaderMaterial({
  uniforms: {
    picture: { value: texture },
    hasTexture: { value: 1 },
    scale: { value: 0 },
    shift: { value: 0 },
    opacity: { value: 1 },
  },
  vertexShader: rgbShiftVertexShader,
  fragmentShader: rgbShiftFragmentShader,
});

const picture = new THREE.Mesh(geometry, material);
scene.add(picture);

const sizes = {
  width: container.clientWidth,
  height: container.clientHeight,
};

window.addEventListener("resize", () => {
  sizes.width = container.clientWidth;
  sizes.height = container.clientHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 1;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const tick = () => {
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

const shiftClamp = gsap.utils.clamp(-0.1, 0.1);
const shiftProxy = { shift: 0 };
ScrollTrigger.create({
  trigger: "#scroll-container",
  start: "top top",
  onUpdate: (self) => {
    let amount = shiftClamp(self.getVelocity() / 20000);
    if (Math.abs(amount) > Math.abs(shiftProxy.shift)) {
      shiftProxy.shift = amount;
      gsap.to(shiftProxy, {
        shift: 0,
        duration: 1,
        ease: "power3",
        overwrite: true,
        onUpdate: () => {
          material.uniforms.shift.value = shiftProxy.shift;
        },
      });
    }
  },
});

//intro canvas end

//preloader start
function initPreload() {
  let startTime = new Date().getTime();
  let latency = startTime - performance.timing.navigationStart;
  console.log(latency);
  let preloader = document.querySelector(".preloader");
  let showPercentage = document.getElementById("percentage");
  let indicator = document.getElementById("indicator");
  let viewport = document.getElementById("viewport");
  let cont = { val: 0 }, newVal = 100;
  let isLoaded = false;

  TweenLite.to(cont, latency / 1000, {
    val: newVal,
    roundProps: "val",
    onStart: () => {
      document.body.style.overflowY = "hidden";
    },
    onUpdate: () => {
      showPercentage.innerHTML = cont.val + " %";
      indicator.style.height = cont.val + "%";
    },
    onComplete: () => {
      let intervalId = window.setInterval(function () {
        console.log("checking")
        if (isLoaded == true) {
          clearInterval(intervalId);
          runIntroAnimation();
          preloader.style.opacity = 0;
          setTimeout(() => {
            viewport.style.opacity = 1;
            preloader.style.display = "none";
            document.body.style.overflowY = "auto";
          }, 500);
        }
      }, 10);
    }
  });

  document.onreadystatechange = function () {
    if (document.readyState == "complete") {
      isLoaded = true;
    }
  }
}

initPreload();
//preloader end

//intro image animation
function runIntroAnimation() {
  const introImage = gsap.timeline();
  introImage.from(".rgb-holder", 1.8, {
    ease: "power4.out",
    delay: 1,
    height: "0",
  });
  zomProxy = { zoom: -0.5 };
  gsap.to(zomProxy, {
    zoom: 0,
    duration: 4,
    ease: "power3",
    overwrite: true,
    onUpdate: () => {
      material.uniforms.scale.value = zomProxy.zoom;
    },
  });

  //intro title animation
  function introTitleAnimation() {
    const introTitleSplit = new SplitType('.intro-title', { types: 'words', lineClass: 'split-child' });

    const introTitleAnim = gsap.timeline();

    introTitleAnim.from(introTitleSplit.words, 1.8, {
      ease: "power4.out",
      delay: 1.5,
      y: 300,
      skewY: "10deg",
      stagger: {
        amount: 0.2,
      },
    });
  }

  introTitleAnimation();
  //intro post title animation
  function introPostTitleAnimation() {
    const introPostTitleSplit = new SplitType('.intro-sub-title', { types: 'lines', lineClass: 'split-child' });

    const introPostTitleAnim = gsap.timeline();

    introPostTitleAnim.from(introPostTitleSplit.lines, 1.8, {
      ease: "power4.out",
      delay: 1.5,
      opacity: 0,
      y: 100,
      stagger: {
        amount: 0.2,
      },
    });
  }

  introPostTitleAnimation();
  //description intro animation

  function descriptionIntroAnimation() {
    const descriptionSplit = new SplitType('.description', { types: 'lines', lineClass: 'split-child' });

    const descriptionAnim = gsap.timeline({ paused: true });

    descriptionAnim.from(descriptionSplit.lines, 1.8, {
      ease: "power4.out",
      delay: 2,
      opacity: 0,
      y: 100,
      stagger: {
        amount: 0.4,
      },
    });

    ScrollTrigger.create({
      trigger: ".description",
      start: "bottom bottom",
      animation: descriptionAnim
    });
  }
  descriptionIntroAnimation();
  //my works animation
  function myWorksIntroAnimation() {
    const myWorksSplit = new SplitType('.work-inner-title span', { types: 'lines', lineClass: 'split-child' });

    const myWorksAnim = gsap.timeline({ paused: true });

    myWorksAnim.from(myWorksSplit.lines, 1.8, {
      ease: "power4.out",
      y: 100,
      stagger: {
        amount: 0.2,
      },
    });

    ScrollTrigger.create({
      trigger: ".work-inner-title",
      start: "top center",
      animation: myWorksAnim
    });
  }

  myWorksIntroAnimation();
  //contact description animation
  function contactDescIntroAnimation() {
    const contactDescSplit = new SplitType('.contact-description', { types: 'lines', lineClass: 'split-child' });

    const contactDescAnim = gsap.timeline({ paused: true });

    contactDescAnim.from(contactDescSplit.lines, 1.8, {
      ease: "power4.out",
      opacity: 0,
      y: 150,
      stagger: {
        amount: 0.4,
      },
    });

    ScrollTrigger.create({
      trigger: ".contact-description",
      start: "top center",
      animation: contactDescAnim
    });
  }
  contactDescIntroAnimation();
}

//move text on scroll
function movetextOnScroll() {
  const moveTextAnim = gsap.timeline({
    defaults: { ease: 'powe4.out' },
    scrollTrigger: {
      trigger: "#scroll-container",
      start: "top top",
      scrub: 1.5,
    },
  });

  gsap.utils.toArray(".horizontal-move").forEach((layer) => {
    const speed = layer.dataset.speed;
    const movement = -(layer.offsetWidth * speed);
    moveTextAnim.to(layer, { x: movement }, 0);
  });
}

movetextOnScroll();








